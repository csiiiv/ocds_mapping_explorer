import { useEffect, useState } from "react";
import type { DataSourceRow } from "../types";
import { emptyDataSourceRow, STAGE_COVERAGE_FIELDS, YES_NO_OPTIONS } from "../lib/inventory";

interface Props {
  initial?: DataSourceRow | null;
  onSave: (row: DataSourceRow) => void;
  onClose: () => void;
}

export function DataSourceFormModal({ initial, onSave, onClose }: Props) {
  const [row, setRow] = useState<DataSourceRow>(initial ? { ...initial } : emptyDataSourceRow());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRow(initial ? { ...initial } : emptyDataSourceRow());
    setError(null);
  }, [initial]);

  const set = (key: keyof DataSourceRow, value: string) => {
    setRow((prev) => ({ ...prev, [key]: value }));
  };

  const submit = () => {
    if (!row.short_name.trim()) {
      setError("Short name is required (unique identifier for this source).");
      return;
    }
    if (!row.data_source.trim()) {
      setError("Data source name is required.");
      return;
    }
    onSave({ ...row, short_name: row.short_name.trim(), data_source: row.data_source.trim() });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{initial ? "Edit data source" : "Add data source"}</h3>
            <div className="modal-subtitle">Sheet &quot;1. Data Sources&quot; — systems that hold procurement data</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body wizard-body">
          {error && <div className="callout callout-error">{error}</div>}

          <div className="wizard-grid">
            <label>
              Short name <span className="req">*</span>
              <input
                value={row.short_name}
                onChange={(e) => set("short_name", e.target.value)}
                placeholder="e.g. ERP"
                disabled={!!initial}
              />
            </label>
            <label>
              Data source <span className="req">*</span>
              <input
                value={row.data_source}
                onChange={(e) => set("data_source", e.target.value)}
                placeholder="System or database name"
              />
            </label>
            <label>
              Vendor
              <input value={row.vendor} onChange={(e) => set("vendor", e.target.value)} />
            </label>
            <label>
              URL / documentation
              <input value={row.url_documentation} onChange={(e) => set("url_documentation", e.target.value)} />
            </label>
            <label className="span-2">
              Agency / unit responsible
              <input
                value={row.agency_unit_responsible}
                onChange={(e) => set("agency_unit_responsible", e.target.value)}
              />
            </label>
          </div>

          <h4 className="wizard-section-title">Lifecycle coverage</h4>
          <div className="wizard-grid wizard-grid-3">
            {STAGE_COVERAGE_FIELDS.map(({ key, label }) => (
              <label key={key}>
                {label}
                <select value={row[key]} onChange={(e) => set(key, e.target.value)}>
                  {YES_NO_OPTIONS.map((o) => (
                    <option key={o || "empty"} value={o}>
                      {o || "—"}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <h4 className="wizard-section-title">Other</h4>
          <div className="wizard-grid wizard-grid-3">
            <label>
              Revision history?
              <select value={row.revision_history} onChange={(e) => set("revision_history", e.target.value)}>
                {YES_NO_OPTIONS.map((o) => (
                  <option key={o || "empty"} value={o}>
                    {o || "—"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Documents available?
              <select value={row.documents_available} onChange={(e) => set("documents_available", e.target.value)}>
                {YES_NO_OPTIONS.map((o) => (
                  <option key={o || "empty"} value={o}>
                    {o || "—"}
                  </option>
                ))}
              </select>
            </label>
            <label className="span-2">
              Existing APIs / data publication
              <input
                value={row.existing_apis_data_publication}
                onChange={(e) => set("existing_apis_data_publication", e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={submit}>
            {initial ? "Save changes" : "Add source"}
          </button>
        </div>
      </div>
    </div>
  );
}
