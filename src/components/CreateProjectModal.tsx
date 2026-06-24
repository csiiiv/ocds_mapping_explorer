import { useState } from "react";

interface Props {
  onCreate: (name: string, sourceSystem?: string) => Promise<void>;
  onClose: () => void;
}

export function CreateProjectModal({ onCreate, onClose }: Props) {
  const [name, setName] = useState("");
  const [sourceSystem, setSourceSystem] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Project name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onCreate(trimmed, sourceSystem.trim() || undefined);
      onClose();
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>New project</h3>
            <div className="modal-subtitle">
              Saved in this browser (localStorage). Starts from the blank OCP template.
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close" disabled={busy}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="project-form-grid">
            <label>
              Project name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ministry of Finance"
                autoFocus
                disabled={busy}
              />
            </label>
            <label>
              Source system <span className="field-hint">(optional)</span>
              <input
                type="text"
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
                placeholder="e.g. SAP, custom ERP"
                disabled={busy}
              />
            </label>
          </div>
          {error && <div className="callout callout-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void submit()} disabled={busy}>
            {busy ? "Creating…" : "Create project"}
          </button>
        </div>
      </div>
    </div>
  );
}
