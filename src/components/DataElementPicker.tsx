import { useMemo, useState } from "react";
import type { DataElementRow } from "../types";
import { dataElementSources, filterDataElements } from "../lib/dataElements";

interface Props {
  rows: DataElementRow[];
  currentValue: string;
  onSelect: (forMapping: string) => void;
  onAddNew?: () => void;
  onClose: () => void;
}

export function DataElementPickerModal({
  rows,
  currentValue,
  onSelect,
  onAddNew,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");

  const sources = useMemo(() => dataElementSources(rows), [rows]);
  const filtered = useMemo(
    () => filterDataElements(rows, query, source),
    [rows, query, source],
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Choose data element</h3>
            <div className="modal-subtitle">
              Maps to the <code>for_mapping</code> label used in OCDS field mappings
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-toolbar">
          <input
            type="text"
            className="modal-search"
            placeholder="Search table, field, description, for_mapping…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="modal-count">{filtered.length} results</span>
          {onAddNew && (
            <button type="button" className="btn btn-primary" onClick={onAddNew}>
              + Add new
            </button>
          )}
        </div>

        <div className="modal-body modal-body-table">
          <table className="data picker-table">
            <thead>
              <tr>
                <th>For mapping</th>
                <th>Source</th>
                <th>Table</th>
                <th>Field</th>
                <th>Type</th>
                <th>Example</th>
                <th>Description</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((row) => {
                const selected =
                  row.for_mapping.trim().toLowerCase() === currentValue.trim().toLowerCase();
                return (
                  <tr
                    key={row.key}
                    className={selected ? "picker-selected" : ""}
                    onClick={() => {
                      onSelect(row.for_mapping);
                      onClose();
                    }}
                  >
                    <td className="mono wrap">{row.for_mapping}</td>
                    <td>{row.data_source}</td>
                    <td className="mono">{row.section_table}</td>
                    <td className="mono">{row.data_element}</td>
                    <td>{row.data_type}</td>
                    <td className="mono wrap">{row.example}</td>
                    <td className="wrap">{row.description}</td>
                    <td className="wrap">{row.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="placeholder" style={{ padding: 24 }}>
              No data elements match your search.
            </div>
          )}
          {filtered.length > 200 && (
            <div className="modal-footnote">
              Showing first 200 of {filtered.length} — refine your search to narrow results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
