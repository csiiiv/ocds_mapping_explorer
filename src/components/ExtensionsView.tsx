import { useMemo, useState } from "react";
import type { MappingDocument } from "../types";
import { DataTable } from "./DataTable";
import {
  emptyProposal,
  normalizeProposalPath,
  type ExtensionProposal,
  type ExtensionProposalStatus,
} from "../lib/extensionProposals";

interface Props {
  doc: MappingDocument;
  proposals: ExtensionProposal[];
  onUpsert: (proposal: ExtensionProposal) => void;
  onDelete: (id: string) => void;
  onMapProposal?: (proposal: ExtensionProposal) => void;
}

export function ExtensionsView({
  doc,
  proposals,
  onUpsert,
  onDelete,
  onMapProposal,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExtensionProposal | null>(null);
  const [query, setQuery] = useState("");

  const schemaRows = doc.ocds_extensions;
  const filteredSchema = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schemaRows;
    return schemaRows.filter((r) =>
      [r.extension, r.path, r.title, r.type].join(" ").toLowerCase().includes(q),
    );
  }, [schemaRows, query]);

  const filteredProposals = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return proposals;
    return proposals.filter((p) =>
      [p.extension, p.path, p.title, p.description, p.for_mapping, p.status]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [proposals, query]);

  return (
    <>
      <div className="view-header-row">
        <div>
          <h2>OCDS Extensions</h2>
          <p className="lead">
            Reference extension fields from the bundled schema, plus project-specific{" "}
            <strong>extension proposals</strong> for new paths not yet in the template.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Propose field
        </button>
      </div>

      {proposals.length > 0 && (
        <>
          <h3>Extension proposals ({proposals.length})</h3>
          <p className="section-hint">
            Draft fields for your implementation — included in project JSON export. Map via{" "}
            <code>for_mapping</code> when ready.
          </p>
          <div className="table-wrap" style={{ marginBottom: 24 }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Extension</th>
                  <th>Path</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>For mapping</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map((p) => (
                  <tr key={p.id}>
                    <td>{p.extension || "—"}</td>
                    <td className="mono wrap">{p.path}</td>
                    <td>{p.title || "—"}</td>
                    <td>{p.data_type || "—"}</td>
                    <td>
                      <span className={`badge ext-status-${p.status}`}>{p.status}</span>
                    </td>
                    <td className="mono wrap">{p.for_mapping || "—"}</td>
                    <td>
                      <span className="row-actions">
                        {onMapProposal && p.for_mapping && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => onMapProposal(p)}
                          >
                            Map
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => {
                            setEditing(p);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => {
                            if (confirm(`Delete proposal "${p.path}"?`)) onDelete(p.id);
                          }}
                        >
                          Delete
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h3>Extension schema reference ({schemaRows.length})</h3>
      <div className="toolbar">
        <div className="search">
          <input
            type="text"
            placeholder="Search extension catalogue…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
          {filteredSchema.length} schema rows
        </span>
      </div>
      <DataTable
        rows={filteredSchema as unknown as Record<string, unknown>[]}
        columns={[
          { key: "extension", label: "Extension", wrap: true },
          { key: "path", label: "Path", mono: true },
          { key: "title", label: "Title" },
          { key: "type", label: "Type" },
          { key: "range", label: "Range" },
          { key: "values", label: "Values", wrap: true },
          { key: "deprecated", label: "Deprecated?" },
        ]}
      />

      {formOpen && (
        <ExtensionProposalFormModal
          initial={editing}
          onSave={onUpsert}
          onClose={() => setFormOpen(false)}
        />
      )}
    </>
  );
}

function ExtensionProposalFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial: ExtensionProposal | null;
  onSave: (p: ExtensionProposal) => void;
  onClose: () => void;
}) {
  const [row, setRow] = useState<ExtensionProposal>(initial ? { ...initial } : emptyProposal());
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ExtensionProposal>(key: K, value: ExtensionProposal[K]) => {
    setRow((prev) => ({ ...prev, [key]: value }));
  };

  const submit = () => {
    const path = normalizeProposalPath(row.extension, row.path);
    if (!path.trim()) {
      setError("Path is required.");
      return;
    }
    if (!row.title.trim()) {
      setError("Title is required.");
      return;
    }
    onSave({
      ...row,
      path,
      extension: row.extension.trim(),
      title: row.title.trim(),
      updated_at: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{initial ? "Edit extension proposal" : "Propose extension field"}</h3>
            <div className="modal-subtitle">
              Document a new extension path for your OCDS implementation (exported in project JSON)
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body wizard-body">
          {error && <div className="callout callout-error">{error}</div>}
          <div className="wizard-grid">
            <label>
              Extension prefix
              <input
                value={row.extension}
                onChange={(e) => set("extension", e.target.value)}
                placeholder="e.g. bids, parties"
                className="mono"
              />
            </label>
            <label>
              Path <span className="req">*</span>
              <input
                value={row.path}
                onChange={(e) => set("path", e.target.value)}
                placeholder="e.g. statistics/numberOfTenderers"
                className="mono"
              />
            </label>
            <label>
              Title <span className="req">*</span>
              <input value={row.title} onChange={(e) => set("title", e.target.value)} />
            </label>
            <label>
              Data type
              <input
                value={row.data_type}
                onChange={(e) => set("data_type", e.target.value)}
                placeholder="string, number, object…"
              />
            </label>
            <label>
              Status
              <select
                value={row.status}
                onChange={(e) => set("status", e.target.value as ExtensionProposalStatus)}
              >
                <option value="draft">draft</option>
                <option value="proposed">proposed</option>
              </select>
            </label>
            <label>
              Link for_mapping label
              <input
                value={row.for_mapping}
                onChange={(e) => set("for_mapping", e.target.value)}
                placeholder="Optional data element label"
              />
            </label>
            <label className="span-2">
              Description
              <textarea
                value={row.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
              />
            </label>
            <label className="span-2">
              Notes
              <textarea value={row.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
            </label>
          </div>
          {row.extension || row.path ? (
            <p className="section-hint">
              Full path:{" "}
              <code className="mono">{normalizeProposalPath(row.extension, row.path) || "—"}</code>
            </p>
          ) : null}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={submit}>
            {initial ? "Save changes" : "Add proposal"}
          </button>
        </div>
      </div>
    </div>
  );
}
