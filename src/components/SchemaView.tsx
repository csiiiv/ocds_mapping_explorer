import { useEffect, useMemo, useState } from "react";
import type { OcdsSchemaRow } from "../types";
import {
  buildSchemaTree,
  type SchemaNode,
} from "../lib/ocdsSchemaTree";
import { SchemaTree } from "./SchemaTree";
import { SchemaDetailPanel } from "./SchemaDetailPanel";
import { SchemaTable } from "./SchemaTable";

type Mode = "tree" | "table";

interface Props {
  coreRows: OcdsSchemaRow[];
  extensionRows: OcdsSchemaRow[];
  /** URL query-driven search string (kept in sync with the address bar by the parent). */
  query: string;
  onQueryChange?: (q: string) => void;
}

function findNodeByPath(tree: SchemaNode[], path: string): SchemaNode | null {
  const walk = (nodes: SchemaNode[]): SchemaNode | null => {
    for (const n of nodes) {
      if (n.path === path) return n;
      if (n.children.length) {
        const hit = walk(n.children);
        if (hit) return hit;
      }
    }
    return null;
  };
  return walk(tree);
}

function findNodeByRowId(tree: SchemaNode[], row: OcdsSchemaRow): SchemaNode | null {
  return findNodeByPath(tree, row.extension ? `extensions/${row.extension}/${row.path}` : row.path);
}

export function SchemaView({ coreRows, extensionRows, query, onQueryChange }: Props) {
  const [mode, setMode] = useState<Mode>("tree");
  const [showExtensions, setShowExtensions] = useState(true);
  const [localQuery, setLocalQuery] = useState(query);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Keep local search in sync if parent drives it from the URL.
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const effectiveQuery = onQueryChange ? query : localQuery;
  const setEffectiveQuery = onQueryChange ?? setLocalQuery;

  // Combined rows for the table view (extension rows keep their `extension` tag).
  const allRows = useMemo<OcdsSchemaRow[]>(
    () => [...coreRows, ...extensionRows],
    [coreRows, extensionRows],
  );

  const tree = useMemo(
    () => buildSchemaTree(allRows, { groupExtensions: true }),
    [allRows],
  );

  const selectedNode = useMemo<SchemaNode | null>(() => {
    if (!selectedPath) return null;
    return findNodeByPath(tree, selectedPath);
  }, [selectedPath, tree]);

  const handleSelectRow = (row: OcdsSchemaRow) => {
    const node = findNodeByRowId(tree, row);
    if (node) setSelectedPath(node.path);
  };

  const coreCount = coreRows.length;
  const extCount = extensionRows.length;

  return (
    <>
      <div className="view-header-row">
        <div>
          <h2>OCDS Schema 1.1.5</h2>
          <p className="lead">
            Reference browser for the official OCDS {coreCount} core fields
            {extCount > 0 && ` and ${extCount} extension fields`}. Browse the schema as a nested tree
            or a filterable table.
          </p>
        </div>
        <div className="seg seg-small" role="tablist" aria-label="Schema view mode">
          <button
            type="button"
            className={mode === "tree" ? "active" : ""}
            onClick={() => setMode("tree")}
            role="tab"
            aria-selected={mode === "tree"}
          >
            Tree
          </button>
          <button
            type="button"
            className={mode === "table" ? "active" : ""}
            onClick={() => setMode("table")}
            role="tab"
            aria-selected={mode === "table"}
          >
            Table
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <input
            type="text"
            placeholder="Search path, title, description, type, values…"
            value={effectiveQuery}
            onChange={(e) => setEffectiveQuery(e.target.value)}
          />
        </div>
        <label className="toggle-chip">
          <input
            type="checkbox"
            checked={showExtensions}
            onChange={(e) => setShowExtensions(e.target.checked)}
          />
          Show extension fields ({extCount})
        </label>
        <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
          {showExtensions ? coreCount + extCount : coreCount} visible
        </span>
      </div>

      {mode === "tree" ? (
        <div className="explorer-split">
          <div className="explorer-tree-pane">
            <SchemaTree
              tree={tree}
              selectedId={selectedNode?.id ?? null}
              revealNodeId={selectedNode?.id ?? null}
              onSelect={(n) => setSelectedPath(n.path)}
              query={effectiveQuery}
              hideExtensions={!showExtensions}
            />
          </div>
          <div className="explorer-detail-pane">
            <SchemaDetailPanel node={selectedNode} />
          </div>
        </div>
      ) : (
        <SchemaTable
          rows={allRows}
          hideExtensions={!showExtensions}
          onSelect={handleSelectRow}
        />
      )}
    </>
  );
}
