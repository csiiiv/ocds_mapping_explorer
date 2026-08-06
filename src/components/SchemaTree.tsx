import { useEffect, useMemo, useRef, useState } from "react";
import type { SchemaNode } from "../lib/ocdsSchemaTree";
import {
  collectExpandableIds,
  findAncestorIds,
  subtreeMatches,
  typeLabel,
} from "../lib/ocdsSchemaTree";

interface Props {
  tree: SchemaNode[];
  selectedId: string | null;
  revealNodeId?: string | null;
  onSelect: (node: SchemaNode) => void;
  /** Lowercase search string; empty disables search-driven auto-expand. */
  query: string;
  /** When true, hide extension nodes entirely. */
  hideExtensions: boolean;
}

function renderPath(path: string, name: string) {
  const idx = path.lastIndexOf("/");
  if (idx < 0) return <span className="seg-name">{name}</span>;
  return (
    <>
      <span className="seg-dim">{path.slice(0, idx + 1)}</span>
      <span className="seg-name">{name}</span>
    </>
  );
}

function ExtBadge({ node }: { node: SchemaNode }) {
  if (!node.isExtension) return null;
  const label = node.extension && node.extension !== "extensions" ? node.extension : "ext";
  return <span className="badge extension" title={node.extension || "extension field"}>{label}</span>;
}

function defaultExpanded(node: SchemaNode): boolean {
  // All top-level nodes (containers like parties/tender/awards and the release
  // envelope leaves) start collapsed so the eight sections are visible at a
  // glance. Nested container parents stay expanded so drilling in is one click.
  if (node.depth === 0) return false;
  return node.depth <= 1;
}

export function SchemaTree({
  tree,
  selectedId,
  revealNodeId = null,
  onSelect,
  query,
  hideExtensions,
}: Props) {
  const q = query.trim().toLowerCase();
  const pred = useMemo<(n: SchemaNode) => boolean>(
    () => (n) => {
      if (n.kind !== "leaf") return false;
      if (hideExtensions && n.isExtension) return false;
      if (!q) return true;
      const r = n.row;
      if (!r) return false;
      const blob = `${n.path} ${r.title} ${r.description} ${r.type} ${r.values}`.toLowerCase();
      return blob.includes(q);
    },
    [q, hideExtensions],
  );

  const hasFilter = q !== "";
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const treeRef = useRef<HTMLDivElement>(null);

  // When the underlying tree changes, reset expansion.
  useEffect(() => {
    setExpanded({});
  }, [hideExtensions]);

  // Reveal-on-select: expand ancestors of the reveal target.
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

  // Scroll selected row into view.
  useEffect(() => {
    if (!revealNodeId || selectedId !== revealNodeId) return;
    const frame = requestAnimationFrame(() => {
      treeRef.current
        ?.querySelector<HTMLElement>(".tree-row.selected, .tree-row-container.selected")
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [revealNodeId, selectedId, expanded, tree]);

  const isExpanded = (node: SchemaNode) => {
    if (hasFilter) return true;
    const def = defaultExpanded(node);
    return expanded[node.id] ?? def;
  };

  const toggle = (node: SchemaNode) => {
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

  const visibleRoots = tree.filter((n) => {
    if (hideExtensions && n.isExtension) return false;
    return subtreeMatches(n, pred);
  });

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

  const renderNode = (node: SchemaNode) => {
    const matchingKids = node.children.filter((c) => subtreeMatches(c, pred));
    const open = isExpanded(node);

    if (node.kind === "container" && node.depth === 0 && node.name === "extensions") {
      // Top-level extensions hub: render as a section header.
      const isSelected = selectedId === node.id;
      return (
        <div key={node.id}>
          <div
            className={`tree-section-header${isSelected ? " selected" : ""}`}
            onClick={() => onSelect(node)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(node);
              }
            }}
            style={{ marginTop: 8 }}
          >
            Extensions ({matchingKids.reduce((acc, c) => acc + countLeaves(c), 0)} fields)
          </div>
          {open &&
            matchingKids.map((c) => renderNode(c))}
        </div>
      );
    }

    if (node.kind === "container" && node.extension && node.depth === 1) {
      // An individual extension module (bids, lots, …). Render as an extension_intro-style header.
      const isSelected = selectedId === node.id;
      const leafCount = countLeaves(node);
      if (leafCount === 0) return null;
      return (
        <div key={node.id}>
          <div
            className={`tree-extension-intro${isSelected ? " selected" : ""}`}
            onClick={() => onSelect(node)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(node);
              }
            }}
          >
            <strong>{node.name}</strong>
            <span>{leafCount} fields</span>
          </div>
          {open && matchingKids.map((c) => renderNode(c))}
        </div>
      );
    }

    if (node.kind === "container") {
      const isSelected = selectedId === node.id;
      const ind = node.depth * 18;
      return (
        <div key={node.id}>
          <div
            className={`tree-row tree-row-container${isSelected ? " selected" : ""}`}
            style={{ paddingLeft: 12 + ind }}
            onClick={() => onSelect(node)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(node);
              }
            }}
          >
            <span
              className={`chevron${matchingKids.length ? "" : " empty"}`}
              onClick={(e) => {
                e.stopPropagation();
                if (matchingKids.length) toggle(node);
              }}
            >
              {matchingKids.length ? (open ? "▼" : "▶") : ""}
            </span>
            <span className="path">{renderPath(node.path, node.name)}</span>
            {node.row?.title && <span className="title-text">{node.row.title}</span>}
            <span className="badges">
              <ExtBadge node={node} />
              <span className="badge span-hint">
                {countLeaves(node)} field{countLeaves(node) === 1 ? "" : "s"}
              </span>
            </span>
          </div>
          {open && matchingKids.map((c) => renderNode(c))}
        </div>
      );
    }

    // Leaf
    const isSelected = selectedId === node.id;
    const ind = node.depth * 18;
    const tl = typeLabel(node);
    return (
      <div key={node.id}>
        <div
          className={`tree-row${isSelected ? " selected" : ""}`}
          style={{ paddingLeft: 12 + ind }}
          onClick={() => onSelect(node)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(node);
            }
          }}
        >
          <span className="chevron empty" />
          <span className="path">{renderPath(node.path, node.name)}</span>
          <span className="title-text">{node.row?.title}</span>
          <span className="badges">
            {tl && <span className="badge type-chip">{tl}</span>}
            {node.row?.deprecated_bool && (
              <span className="badge deprecated" title={node.row.deprecationnotes || "deprecated"}>
                deprecated
              </span>
            )}
            <ExtBadge node={node} />
          </span>
        </div>
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
          title={hasFilter ? "Clear search to use tree expand/collapse" : "Expand all branches"}
        >
          Expand all
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={collapseAll}
          disabled={hasFilter || expandableIds.length === 0}
          title={hasFilter ? "Clear search to use tree expand/collapse" : "Collapse all branches"}
        >
          Collapse all
        </button>
      </div>
      <div className="tree" ref={treeRef}>
        {visibleRoots.map((n) => renderNode(n))}
      </div>
    </div>
  );
}

function countLeaves(node: SchemaNode): number {
  if (node.kind === "leaf") return 1;
  return node.children.reduce((acc, c) => acc + countLeaves(c), 0);
}
