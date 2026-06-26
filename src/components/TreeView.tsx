import { useEffect, useMemo, useRef, useState } from "react";
import type { MappingNode, StageKey } from "../types";
import { isContainerNode } from "../lib/mappingNodes";
interface Props {
  tree: MappingNode[];
  selectedId: string | null;
  /** When set, expand ancestor branches so this node is visible in the tree. */
  revealNodeId?: string | null;
  onSelect: (stage: StageKey, node: MappingNode) => void;
  stage: StageKey;
  query: string;
  filter: "all" | "mapped" | "partial" | "unmapped";
  modifiedPaths: Set<string>;
}

/** Highlights the last segment of a path (the field name). */
function renderPath(path: string, node: MappingNode) {
  if (node.row_type === "ref_span") {
    return (
      <>
        <span className="seg-name">{path}</span>
        <span className="seg-dim"> → parties</span>
      </>
    );
  }
  const idx = path.lastIndexOf("/");
  if (idx < 0) return <span className="seg-name">{path}</span>;
  return (
    <>
      <span className="seg-dim">{path.slice(0, idx + 1)}</span>
      <span className="seg-name">{path.slice(idx + 1)}</span>
    </>
  );
}

function CategoryBadge({ node }: { node: MappingNode }) {
  if (node.category === "required")
    return <span className="badge required">required</span>;
  if (node.category === "extension")
    return <span className="badge extension">ext</span>;
  if (node.category === "reference")
    return <span className="badge reference">ref</span>;
  if (node.category === "additional")
    return <span className="badge additional">add</span>;
  if (node.category === "span") return <span className="badge span">object</span>;
  return null;
}

function StatusBadge({ status }: { status: MappingNode["mapped"] }) {
  return <span className={`badge status-${status}`}>{status}</span>;
}

function defaultExpanded(node: MappingNode): boolean {
  // Container groups start collapsed so large blocks (buyer, parties refs) are togglable.
  if (node.row_type === "span" || node.row_type === "ref_span") return false;
  return node.depth <= 1;
}

/** Does this subtree contain any node matching the query/filter? */
function subtreeMatches(
  node: MappingNode,
  pred: (n: MappingNode) => boolean,
): boolean {
  if (pred(node)) return true;
  return (node.children || []).some((c) => subtreeMatches(c, pred));
}

/** Node ids from root to target (exclusive of target) that must be expanded. */
function findAncestorIds(tree: MappingNode[], targetId: string): string[] | null {
  const walk = (nodes: MappingNode[], chain: string[]): string[] | null => {
    for (const n of nodes) {
      if (n.id === targetId) return chain;
      const kids = n.children ?? [];
      if (!kids.length) continue;
      const found = walk(kids, [...chain, n.id]);
      if (found) return found;
    }
    return null;
  };
  return walk(tree, []);
}

/** All node ids that have children and can be expanded/collapsed. */
function collectExpandableIds(nodes: MappingNode[]): string[] {
  const ids: string[] = [];
  const walk = (list: MappingNode[]) => {
    for (const n of list) {
      const kids = n.children ?? [];
      if (kids.length > 0) {
        ids.push(n.id);
        walk(kids);
      }
    }
  };
  walk(nodes);
  return ids;
}

export function TreeView({
  tree,
  selectedId,
  revealNodeId = null,
  onSelect,
  stage,
  query,
  filter,
  modifiedPaths,
}: Props) {
  const q = query.trim().toLowerCase();
  const pred = useMemo(() => {
    return (n: MappingNode): boolean => {
      if (n.row_type === "section" || n.row_type === "subtitle" || n.row_type === "extension_intro")
        return false;
      if (isContainerNode(n)) return false;
      if (filter !== "all" && n.mapped !== filter) return false;
      if (!q) return true;
      const blob = `${n.path} ${n.title} ${n.description} ${n.mapping} ${n.notes}`.toLowerCase();
      return blob.includes(q);
    };
  }, [q, filter]);

  const hasFilter = q !== "" || filter !== "all";
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const treeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setExpanded({});
  }, [stage]);

  useEffect(() => {
    if (!revealNodeId) return;
    const ancestors = findAncestorIds(tree, revealNodeId);
    if (!ancestors?.length) return;
    setExpanded((prev) => {
      const next = { ...prev };
      for (const id of ancestors) next[id] = true;
      return next;
    });
  }, [revealNodeId, tree]);

  useEffect(() => {
    if (!revealNodeId || selectedId !== revealNodeId) return;
    const frame = requestAnimationFrame(() => {
      treeRef.current
        ?.querySelector<HTMLElement>(".tree-row.selected")
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [revealNodeId, selectedId, expanded, tree]);

  const isExpanded = (node: MappingNode) => {
    if (hasFilter) return true;
    const def = defaultExpanded(node);
    return expanded[node.id] ?? def;
  };

  const toggle = (node: MappingNode) => {
    const def = defaultExpanded(node);
    const cur = expanded[node.id] ?? def;
    setExpanded((e) => ({ ...e, [node.id]: !cur }));
  };

  const expandableIds = useMemo(() => collectExpandableIds(tree), [tree]);

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    for (const id of expandableIds) next[id] = true;
    setExpanded(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    for (const id of expandableIds) next[id] = false;
    setExpanded(next);
  };

  const visibleRoots = tree.filter(
    (n) =>
      n.row_type === "section" ||
      n.row_type === "subtitle" ||
      n.row_type === "extension_intro" ||
      subtreeMatches(n, pred),
  );

  if (!visibleRoots.length) {
    return (
      <div className="tree-pane">
        <div className="tree-toolbar">
          <button type="button" className="btn btn-sm" disabled>
            Expand all
          </button>
          <button type="button" className="btn btn-sm" disabled>
            Collapse all
          </button>
        </div>
        <div className="placeholder">
          <div className="icon">∅</div>
          <div>No fields match the current filter.</div>
        </div>
      </div>
    );
  }

  const renderNode = (node: MappingNode, depth: number) => {
    if (node.row_type === "section") {
      const kids = node.children || [];
      const matchingKids = kids.filter((k) => subtreeMatches(k, pred));
      if (!matchingKids.length) return null;
      return (
        <div key={node.id}>
          <div
            style={{
              padding: "10px 12px 4px",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-faint)",
              fontWeight: 600,
            }}
          >
            {node.title || node.section}
          </div>
          {matchingKids.map((c) => renderNode(c, depth))}
        </div>
      );
    }

    if (node.row_type === "extension_intro") {
      const kids = (node.children || []).filter((k) => subtreeMatches(k, pred));
      if (!kids.length) return null;
      return (
        <div key={node.id}>
          <div className="tree-extension-intro">
            <strong>{node.title}</strong>
            {node.description ? <span>{node.description}</span> : null}
          </div>
          {kids.map((c) => renderNode(c, depth))}
        </div>
      );
    }

    if (node.row_type === "subtitle") {
      return (
        <div
          key={node.id}
          className="tree-subtitle"
          style={{
            padding: "12px 12px 6px",
            fontSize: "12px",
            color: "var(--text-dim)",
            borderTop: depth === 0 ? "1px solid var(--border-soft)" : undefined,
            marginTop: depth === 0 ? 4 : 0,
          }}
        >
          {node.title}
        </div>
      );
    }

    const kids = (node.children || []).filter((c) => subtreeMatches(c, pred));
    const open = isExpanded(node);
    const ind = depth * 18;

    if (isContainerNode(node)) {
      return (
        <div key={node.id}>
          <div
            className="tree-row tree-row-container"
            style={{ paddingLeft: 12 + ind }}
            onClick={() => {
              if (kids.length) toggle(node);
            }}
          >
            <span
              className={`chevron${kids.length ? "" : " empty"}`}
              onClick={(e) => {
                e.stopPropagation();
                if (kids.length) toggle(node);
              }}
            >
              {kids.length ? (open ? "▼" : "▶") : ""}
            </span>
            <span className="path">{renderPath(node.path, node)}</span>
            <span className="title-text">{node.title}</span>
            <span className="badges">
              <CategoryBadge node={node} />
              <span className="badge span-hint">structure</span>
            </span>
          </div>
          {open && kids.map((c) => renderNode(c, depth + 1))}
        </div>
      );
    }

    const isSelected = selectedId === node.id;
    const modified = modifiedPaths.has(node.path);

    return (
      <div key={node.id}>
        <div
          className={`tree-row${isSelected ? " selected" : ""}${modified ? " modified" : ""}`}
          style={{ paddingLeft: 12 + ind }}
          onClick={() => onSelect(stage, node)}
        >
          <span
            className={`chevron${kids.length ? "" : " empty"}`}
            onClick={(e) => {
              e.stopPropagation();
              if (kids.length) toggle(node);
            }}
          >
            {kids.length ? (open ? "▼" : "▶") : ""}
          </span>
          <span className="path">{renderPath(node.path, node)}</span>
          <span className="title-text">{node.title}</span>
          <span className="badges">
            <CategoryBadge node={node} />
            <StatusBadge status={node.mapped} />
          </span>
        </div>
        {open && kids.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  };

  return (
    <div className="tree-pane">
      <div className="tree-toolbar">
        <button
          type="button"
          className="btn btn-sm"
          onClick={expandAll}
          disabled={hasFilter || expandableIds.length === 0}
          title={hasFilter ? "Clear search and status filter to use tree expand/collapse" : "Expand all branches"}
        >
          Expand all
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={collapseAll}
          disabled={hasFilter || expandableIds.length === 0}
          title={hasFilter ? "Clear search and status filter to use tree expand/collapse" : "Collapse all branches"}
        >
          Collapse all
        </button>
      </div>
      <div className="tree" ref={treeRef}>
        {visibleRoots.map((n) => renderNode(n, 0))}
      </div>
    </div>
  );
}
