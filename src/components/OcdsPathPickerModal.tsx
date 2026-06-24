import { useMemo, useState } from "react";
import type { StageKey } from "../types";
import { STAGES } from "../types";
import {
  filterMappablePaths,
  listMappableOcdsPaths,
  type MappableOcdsPath,
} from "../lib/sourceMapping";
import type { MappingDocument } from "../types";

interface Props {
  doc: MappingDocument;
  forMappingLabel: string;
  onSelect: (stage: StageKey, path: string) => void;
  onClose: () => void;
}

export function OcdsPathPickerModal({ doc, forMappingLabel, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageKey | "">("");

  const allPaths = useMemo(() => listMappableOcdsPaths(doc), [doc]);
  const filtered = useMemo(
    () => filterMappablePaths(allPaths, query, stageFilter),
    [allPaths, query, stageFilter],
  );

  const pick = (entry: MappableOcdsPath) => {
    const msg = entry.currentMapping.trim()
      ? `Replace mapping on "${entry.path}"?\nCurrent: ${entry.currentMapping}\nNew: ${forMappingLabel}`
      : `Map "${forMappingLabel}" to OCDS field "${entry.path}"?`;
    if (confirm(msg)) {
      onSelect(entry.stage, entry.path);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Choose OCDS field</h3>
            <div className="modal-subtitle">
              Link data element <code className="mono">{forMappingLabel}</code> to an OCDS path
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
            placeholder="Search path, title, current mapping…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as StageKey | "")}
          >
            <option value="">All stages</option>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="modal-count">{filtered.length} fields</span>
        </div>

        <div className="modal-body modal-body-table">
          <table className="data picker-table">
            <thead>
              <tr>
                <th>Path</th>
                <th>Title</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Current mapping</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((row) => (
                <tr key={`${row.stage}::${row.path}`} onClick={() => pick(row)}>
                  <td className="mono wrap">{row.path}</td>
                  <td className="wrap">{row.title || "—"}</td>
                  <td>{row.stage}</td>
                  <td>
                    <span className={`badge status-${row.mapped}`}>{row.mapped}</span>
                  </td>
                  <td className="mono wrap">{row.currentMapping || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="placeholder" style={{ padding: 24 }}>
              No OCDS fields match your search.
            </div>
          )}
          {filtered.length > 200 && (
            <div className="modal-footnote">
              Showing first 200 of {filtered.length} — refine your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
