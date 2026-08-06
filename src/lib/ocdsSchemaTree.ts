import type { OcdsSchemaRow } from "../types";

export interface SchemaNode {
  /** Stable id (full path with /extensions prefix when applicable). */
  id: string;
  /** Full dotted path (no leading slash). */
  path: string;
  /** Last path segment. */
  name: string;
  depth: number;
  kind: "container" | "leaf";
  /** Source row when this node is a leaf (or a container that also has its own row, e.g. an object field). */
  row?: OcdsSchemaRow;
  isExtension: boolean;
  /** Extension name for grouping, when this node came from the extensions schema. */
  extension?: string;
  children: SchemaNode[];
}

export interface BuildOptions {
  /** When true, a top-level "extensions" parent is synthesised to hold all extension rows. */
  groupExtensions?: boolean;
}

/**
 * Build a nested schema tree from flat `OcdsSchemaRow[]`.
 *
 * - Core rows (section + path) become nested nodes by splitting `path` on "/".
 * - Extension rows are placed under an "extensions/{extension}" parent so the
 *   official core tree stays clean and extensions can be toggled on/off.
 * - Intermediate path segments without their own row become `container` nodes.
 */
export function buildSchemaTree(
  rows: OcdsSchemaRow[],
  options: BuildOptions = {},
): SchemaNode[] {
  const groupExtensions = options.groupExtensions ?? true;

  const root: SchemaNode = {
    id: "",
    path: "",
    name: "",
    depth: -1,
    kind: "container",
    isExtension: false,
    children: [],
  };
  const extensionsRoot: SchemaNode = {
    id: "extensions",
    path: "extensions",
    name: "extensions",
    depth: 0,
    kind: "container",
    isExtension: true,
    children: [],
  };

  const containerAt = (parent: SchemaNode, segments: string[]): SchemaNode => {
    let cursor = parent;
    let acc = parent.path ? `${parent.path}/` : "";
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      acc += seg;
      let next = cursor.children.find((c) => c.name === seg);
      if (!next) {
        next = {
          id: `${parent.isExtension ? "extensions/" : ""}${acc}`,
          path: acc,
          name: seg,
          depth: cursor.depth + 1,
          kind: "container",
          isExtension: parent.isExtension,
          extension: parent.extension,
          children: [],
        };
        cursor.children.push(next);
      }
      acc += "/";
      cursor = next;
    }
    return cursor;
  };

  const insertRow = (parent: SchemaNode, row: OcdsSchemaRow, isExtension: boolean) => {
    const path = row.path.replace(/^\/+/, "");
    const segments = path.split("/").filter(Boolean);
    if (!segments.length) return;
    const parentSegments = segments.slice(0, -1);
    const leafSeg = segments[segments.length - 1];
    const container = containerAt(parent, parentSegments);

    // Match by name regardless of current kind — a node may exist as a container
    // (created by a child path) and the row attaches metadata without changing
    // whether it has children.
    const existing = container.children.find((c) => c.name === leafSeg);
    if (existing) {
      existing.row = row;
      existing.isExtension = isExtension;
      existing.extension = parent.extension;
      return;
    }

    const fullPath = container.path ? `${container.path}/${leafSeg}` : leafSeg;
    // Newly-created node starts as a leaf; if a later row inserts children under
    // it, `containerAt` will populate `children` and the final pass flips kind.
    container.children.push({
      id: `${parent.isExtension ? "extensions/" : ""}${fullPath}`,
      path: fullPath,
      name: leafSeg,
      depth: container.depth + 1,
      kind: "leaf",
      row,
      isExtension,
      extension: parent.extension,
      children: [],
    });
  };

  // Core rows: respect the empty-section release envelope (ocid, id, date, tag, …).
  for (const row of rows) {
    if (row.extension) continue;
    insertRow(root, row, false);
  }

  // Extension rows: group by extension name under an "extensions" parent.
  if (groupExtensions) {
    const byExt = new Map<string, OcdsSchemaRow[]>();
    for (const row of rows) {
      const ext = row.extension;
      if (!ext) continue;
      const list = byExt.get(ext) ?? [];
      list.push(row);
      byExt.set(ext, list);
    }
    for (const [ext, extRows] of byExt) {
      const extParent: SchemaNode = {
        id: `extensions/${ext}`,
        path: `extensions/${ext}`,
        name: ext,
        depth: 1,
        kind: "container",
        isExtension: true,
        extension: ext,
        children: [],
      };
      for (const row of extRows) {
        insertRow(extParent, { ...row, path: row.path }, true);
      }
      extensionsRoot.children.push(extParent);
    }
    extensionsRoot.children.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Final pass: a node with children is a container regardless of whether it
  // has its own row. Done after all inserts so we don't fight insertRow.
  const reconcileKind = (node: SchemaNode) => {
    if (node.children.length > 0) node.kind = "container";
    else node.kind = "leaf";
    for (const c of node.children) reconcileKind(c);
  };
  for (const c of root.children) reconcileKind(c);
  reconcileKind(extensionsRoot);

  // Release envelope (top-level rows without a section) sit directly under root.
  const out = root.children
    .sort((a, b) => a.name.localeCompare(b.name));
  if (groupExtensions) out.push(extensionsRoot);
  return out;
}

/** Flatten the tree to a stable, depth-first list (for table view). */
export function flattenSchemaTree(tree: SchemaNode[]): SchemaNode[] {
  const out: SchemaNode[] = [];
  const walk = (nodes: SchemaNode[]) => {
    for (const n of nodes) {
      out.push(n);
      if (n.children.length) walk(n.children);
    }
  };
  walk(tree);
  return out;
}

/** All node ids that have children and can be expanded/collapsed. */
export function collectExpandableIds(nodes: SchemaNode[]): string[] {
  const ids: string[] = [];
  const walk = (list: SchemaNode[]) => {
    for (const n of list) {
      if (n.children.length > 0) {
        ids.push(n.id);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return ids;
}

/** Does this subtree contain any leaf matching the predicate? */
export function subtreeMatches(node: SchemaNode, pred: (n: SchemaNode) => boolean): boolean {
  if (node.kind === "leaf" && pred(node)) return true;
  return node.children.some((c) => subtreeMatches(c, pred));
}

/** Node ids from root to target (exclusive of target) that must be expanded. */
export function findAncestorIds(tree: SchemaNode[], targetId: string): string[] | null {
  const walk = (nodes: SchemaNode[], chain: string[]): string[] | null => {
    for (const n of nodes) {
      if (n.id === targetId) return chain;
      if (!n.children.length) continue;
      const found = walk(n.children, [...chain, n.id]);
      if (found) return found;
    }
    return null;
  };
  return walk(tree, []);
}

/** Build the canonical OCDS 1.1.5 docs URL for a path. */
export function ocdsDocsUrl(path: string, isExtension: boolean): string | null {
  const cleaned = path.replace(/^\/+/, "").replace(/^extensions\//, "");
  if (!cleaned) return null;
  if (isExtension) {
    return `https://standard.open-contracting.org/1.1.5/en/extensions/`;
  }
  return `https://standard.open-contracting.org/1.1.5/en/schema/reference/#${cleaned.replace(
    /\//g,
    "",
  )}`;
}

/** Whether a `values` field references an OCDS codelist (heuristic). */
export function codelistName(values: string): string | null {
  const v = (values || "").trim();
  if (!v) return null;
  // Common OCDS codelist suffixes; ignore JSON-schema format hints like "date-time".
  const CodelistSuffixes = ["Type", "Scheme", "Status", "Classification", "Method", " codelist"];
  if (CodelistSuffixes.some((s) => v.endsWith(s.replace(" codelist", "")))) return v;
  // Multi-word codelist names commonly found in OCDS reference docs
  if (/^[a-z][a-zA-Z]+$/.test(v) && v.length > 3) return null;
  return null;
}

/** JSON pointer style pointer for a path (e.g. /tender/items/0/id for illustrative use). */
export function jsonPointer(path: string): string {
  const cleaned = path.replace(/^\/+/, "").replace(/^extensions\//, "");
  if (!cleaned) return "/";
  // Insert a 0 index for array segments (heuristic: arrays in OCDS are plural-ish)
  return (
    "/" +
    cleaned
      .split("/")
      .map((seg) => (isPluralish(seg) ? `${seg}/0` : seg))
      .join("/")
  );
}

function isPluralish(seg: string): boolean {
  // OCDS array segments typically end with 's' and aren't primitive wrappers.
  // Keep this conservative to avoid marking e.g. "address" as plural.
  const PLURAL_KNOWN = new Set([
    "items",
    "tenderers",
    "suppliers",
    "documents",
    "milestones",
    "amendments",
    "changes",
    "transactions",
    "classifications",
    "additionalIdentifiers",
    "additionalClassifications",
    "contactPoints",
    "relatedProcesses",
    "awards",
    "contracts",
    "parties",
    "budgets",
    "bids",
    "lots",
    "targets",
    "milestoneWindows",
  ]);
  return PLURAL_KNOWN.has(seg);
}

/** Type label combining type + range, e.g. "array<object>" with range "1..n". */
export function typeLabel(node: SchemaNode): string {
  if (!node.row) return "";
  const t = (node.row.type || "").trim();
  const range = (node.row.range || "").trim();
  if (!t && !range) return "";
  if (!range) return t || "";
  if (!t) return range;
  return `${t} (${range})`;
}
