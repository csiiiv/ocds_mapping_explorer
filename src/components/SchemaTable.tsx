import { useMemo, useState } from "react";
import type { OcdsSchemaRow } from "../types";

type SortKey = "path" | "section" | "extension" | "title" | "type" | "range" | "deprecated";
type SortDir = "asc" | "desc";

interface Props {
  rows: OcdsSchemaRow[];
  hideExtensions: boolean;
  onSelect: (row: OcdsSchemaRow) => void;
}

interface Col {
  key: SortKey;
  label: string;
  mono?: boolean;
  wrap?: boolean;
}

const COLS: Col[] = [
  { key: "section", label: "Section", wrap: true },
  { key: "extension", label: "Extension", wrap: true },
  { key: "path", label: "Path", mono: true },
  { key: "title", label: "Title" },
  { key: "type", label: "Type" },
  { key: "range", label: "Range" },
  { key: "deprecated", label: "Dep?" },
];

export function SchemaTable({ rows, hideExtensions, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [deprecatedFilter, setDeprecatedFilter] = useState<"" | "yes" | "no">("");
  const [sortKey, setSortKey] = useState<SortKey>("path");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sections = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.section) set.add(r.section);
    return [...set].sort();
  }, [rows]);

  const types = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.type) set.add(r.type);
    return [...set].sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (hideExtensions && r.extension) return false;
      if (sectionFilter && r.section !== sectionFilter) return false;
      if (typeFilter && r.type !== typeFilter) return false;
      if (deprecatedFilter === "yes" && !r.deprecated_bool) return false;
      if (deprecatedFilter === "no" && r.deprecated_bool) return false;
      if (q) {
        const blob = `${r.path} ${r.title} ${r.description} ${r.type} ${r.values} ${r.extension}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });

    out.sort((a, b) => {
      const av = cellSortValue(a, sortKey);
      const bv = cellSortValue(b, sortKey);
      const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return out;
  }, [rows, query, sectionFilter, typeFilter, deprecatedFilter, sortKey, sortDir, hideExtensions]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const sortIndicator = (k: SortKey) => (sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : "");

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <input
            type="text"
            placeholder="Search path, title, description, type, values…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          title="Filter by section"
        >
          <option value="">All sections</option>
          {sections.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          title="Filter by type"
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={deprecatedFilter}
          onChange={(e) => setDeprecatedFilter(e.target.value as "" | "yes" | "no")}
          title="Filter by deprecation"
        >
          <option value="">Any deprecation</option>
          <option value="no">Not deprecated</option>
          <option value="yes">Deprecated</option>
        </select>
        <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
          {filtered.length} / {rows.length} rows
        </span>
      </div>

      <div className="table-wrap">
        <table className="data schema-table">
          <thead>
            <tr>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className={`${c.mono ? "mono" : ""} ${c.wrap ? "wrap" : ""} sortable`.trim()}
                  onClick={() => toggleSort(c.key)}
                  title={`Sort by ${c.label}`}
                >
                  {c.label}
                  {sortIndicator(c.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={`${r.path}-${i}`} onClick={() => onSelect(r)} className="schema-row">
                <td className="wrap">{r.section || "—"}</td>
                <td className="wrap">
                  {r.extension ? <span className="badge extension">{r.extension}</span> : "—"}
                </td>
                <td className="mono">{r.path}</td>
                <td>{r.title}</td>
                <td>
                  {r.type && <span className="badge type-chip">{r.type}</span>}
                </td>
                <td className="mono">{r.range || "—"}</td>
                <td>
                  {r.deprecated_bool ? (
                    <span className="badge deprecated" title={r.deprecationnotes || "deprecated"}>
                      yes
                    </span>
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={COLS.length} className="text-faint" style={{ padding: 24 }}>
                  No fields match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function cellSortValue(r: OcdsSchemaRow, key: SortKey): string {
  switch (key) {
    case "path":
      return r.path;
    case "section":
      return r.section || "";
    case "extension":
      return r.extension || "";
    case "title":
      return r.title || "";
    case "type":
      return r.type || "";
    case "range":
      return r.range || "";
    case "deprecated":
      return r.deprecated_bool ? "1" : "0";
  }
}
