import { useRef, useState } from "react";
import type { MappingProject } from "../lib/project";
import {
  exportGuideMarkdown,
  projectJsonFilename,
  xlsxExportCommand,
  yamlExportCommand,
} from "../lib/exportGuide";
import { countYamlMappings, exportMappingYaml } from "../lib/exportMappingYaml";
import {
  applyProjectImport,
  downloadText,
  exportDataElementsCsv,
  exportDataSourcesCsv,
  parseDataElementsCsv,
  parseDataSourcesCsv,
  parseProjectJson,
  type ImportSummary,
  type MergeMode,
} from "../lib/importExport";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

interface ExportProps {
  projectId: string;
  editedCount: number;
  projectJson: string;
  editsJson: string;
  fullDocJson: string;
  project: MappingProject | null;
  onClose: () => void;
}

export function ExportModal({
  projectId,
  editedCount,
  projectJson,
  editsJson,
  fullDocJson,
  project,
  onClose,
}: ExportProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const jsonFilename = projectJsonFilename(projectId);
  const yamlStats = project ? countYamlMappings(project) : { stages: 0, paths: 0 };
  const xlsxCmd = xlsxExportCommand(`exports/${jsonFilename}`, `exports/${projectId}.xlsx`);
  const yamlCmd = yamlExportCommand(`exports/${jsonFilename}`, `exports/mapping-${projectId}.yaml`);

  const handleCopy = async (label: string, text: string) => {
    const ok = await copyText(text);
    setCopied(ok ? label : null);
    if (ok) window.setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Export</h3>
            <div className="modal-subtitle">
              Project <strong>{projectId}</strong> · {editedCount} mapping edit
              {editedCount === 1 ? "" : "s"}
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body io-modal-body">
          <section>
            <h4>Project files</h4>
            <div className="io-btn-grid">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => downloadText(`ocds-mapping-project-${projectId}.json`, projectJson, "application/json")}
              >
                Project JSON
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => downloadText(`ocds-mapping-edits-${projectId}.json`, editsJson, "application/json")}
              >
                Mapping edits only
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => downloadText(`ocds-mapping-merged-${projectId}.json`, fullDocJson, "application/json")}
              >
                Merged view (OCDS + mappings)
              </button>
            </div>
            <p className="section-hint">
              Project JSON is the portable handoff file (inventory + mapping edits). Save it before
              running CLI exports below.
            </p>
          </section>

          {project && (
            <section>
              <h4>ETL — mapping.yaml</h4>
              <div className="io-btn-grid">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    downloadText(`mapping-${projectId}.yaml`, exportMappingYaml(project), "text/yaml")
                  }
                >
                  mapping.yaml ({yamlStats.paths} paths · {yamlStats.stages} stages)
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void handleCopy("yaml", yamlCmd)}
                >
                  {copied === "yaml" ? "Copied CLI command" : "Copy CLI command"}
                </button>
              </div>
              <p className="section-hint">
                Flat YAML for pipelines: <code>data_elements</code>, <code>ocds_mappings</code> by
                stage, and optional <code>extension_proposals</code>.
              </p>
            </section>
          )}

          <section>
            <h4>OCP workbook (.xlsx)</h4>
            <div className="callout export-guide-callout">
              <strong>CLI export only</strong> — the OCP template is large and formula-heavy;
              generating it in the browser would be slow and fragile. Use Python after downloading
              Project JSON.
            </div>
            <ol className="export-steps">
              <li>
                Download <strong>Project JSON</strong> above (e.g. <code>{jsonFilename}</code>).
              </li>
              <li>
                From the <code>ocds_mapping_explorer</code> folder, run:
                <pre className="export-cli-block">{xlsxCmd}</pre>
              </li>
              <li>
                Ensure a template exists: <code>references/OCDS_Mapping_Template_1.1_blank.xlsx</code>{" "}
                or run <code>npm run strip-template</code>.
              </li>
            </ol>
            <div className="io-btn-grid">
              <button type="button" className="btn" onClick={() => void handleCopy("xlsx", xlsxCmd)}>
                {copied === "xlsx" ? "Copied command" : "Copy xlsx command"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() =>
                  downloadText(`EXPORT_GUIDE_${projectId}.md`, exportGuideMarkdown(projectId), "text/markdown")
                }
              >
                Download full export guide
              </button>
            </div>
          </section>

          {project && (
            <section>
              <h4>Source inventory (CSV)</h4>
              <div className="io-btn-grid">
                <button
                  type="button"
                  className="btn"
                  disabled={!project.data_elements.rows.length}
                  onClick={() =>
                    downloadText(
                      `data_elements_${projectId}.csv`,
                      exportDataElementsCsv(project),
                      "text/csv",
                    )
                  }
                >
                  Data elements CSV ({project.data_elements.rows.length} rows)
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={!project.data_sources.rows.length}
                  onClick={() =>
                    downloadText(
                      `data_sources_${projectId}.csv`,
                      exportDataSourcesCsv(project),
                      "text/csv",
                    )
                  }
                >
                  Data sources CSV ({project.data_sources.rows.length} rows)
                </button>
              </div>
              <p className="section-hint">
                CSV columns match OCP template sheets 1–2. Re-import via Import → CSV.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

interface ImportProps {
  project: MappingProject;
  onImport: (result: {
    project: MappingProject;
    mappingEdits: Record<string, import("../types").FieldEdit>;
    summary: ImportSummary;
  }) => void;
  onClose: () => void;
}

type ImportKind = "project_json" | "data_elements_csv" | "data_sources_csv" | "edits_json";

export function ImportModal({ project, onImport, onClose }: ImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<ImportKind>("project_json");
  const [mergeMode, setMergeMode] = useState<MergeMode>("merge");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportSummary | null>(null);
  const [pending, setPending] = useState<{
    project: MappingProject;
    mappingEdits: Record<string, import("../types").FieldEdit>;
    summary: ImportSummary;
  } | null>(null);
  const [busyStep, setBusyStep] = useState<string | null>(null);

  const kindToScope = (k: ImportKind) => {
    if (k === "data_elements_csv") return "data_elements_csv" as const;
    if (k === "data_sources_csv") return "data_sources_csv" as const;
    if (k === "edits_json") return "mappings" as const;
    return "project_json" as const;
  };

  const handleFile = async (file: File) => {
    setError(null);
    setPreview(null);
    setPending(null);
    setBusyStep(`Reading ${file.name} (${formatBytes(file.size)})…`);

    try {
      const text = await file.text();
      await yieldToUi();

      let patch: Parameters<typeof applyProjectImport>[1] = {};

      if (kind === "data_elements_csv") {
        setBusyStep("Parsing data elements CSV…");
        await yieldToUi();
        const rows = parseDataElementsCsv(text);
        if (!rows.length) throw new Error("No data rows found in CSV");
        patch = {
          data_elements: {
            columns: project.data_elements.columns,
            column_groups: project.data_elements.column_groups,
            rows,
          },
        };
      } else if (kind === "data_sources_csv") {
        setBusyStep("Parsing data sources CSV…");
        await yieldToUi();
        const rows = parseDataSourcesCsv(text);
        if (!rows.length) throw new Error("No data rows found in CSV");
        patch = {
          data_sources: {
            columns: project.data_sources.columns,
            rows,
          },
        };
      } else {
        setBusyStep("Parsing JSON…");
        await yieldToUi();
        const parsed = parseProjectJson(text);
        patch = {
          data_sources: parsed.data_sources,
          data_elements: parsed.data_elements,
          mapping_edits: parsed.mapping_edits,
          metadata: parsed.metadata,
          publication_config: parsed.publication_config,
        };
      }

      setBusyStep("Merging into current project…");
      await yieldToUi();
      const result = applyProjectImport(project, patch, {
        scope: kindToScope(kind),
        mergeMode: kind === "edits_json" ? "merge" : mergeMode,
        filename: file.name,
      });
      setPending(result);
      setPreview(result.summary);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusyStep(null);
    }
  };

  const confirm = () => {
    if (pending) {
      onImport(pending);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Import</h3>
            <div className="modal-subtitle">
              Merge source inventory or mappings into the current project (browser only). For full
              OCP <strong>.xlsx</strong> workbooks, use{" "}
              <code>python scripts/import_ocp_workbook.py</code>.
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body io-modal-body">
          <div className="io-import-options">
            <label>
              Import type
              <select value={kind} onChange={(e) => setKind(e.target.value as ImportKind)}>
                <option value="project_json">Project JSON</option>
                <option value="data_elements_csv">Data elements CSV</option>
                <option value="data_sources_csv">Data sources CSV</option>
                <option value="edits_json">Mapping edits JSON</option>
              </select>
            </label>
            {kind !== "edits_json" && (
              <label>
                Merge mode
                <select value={mergeMode} onChange={(e) => setMergeMode(e.target.value as MergeMode)}>
                  <option value="merge">Merge (upsert)</option>
                  <option value="replace">Replace tier</option>
                </select>
              </label>
            )}
          </div>

          <div className="io-dropzone">
            <input
              ref={fileRef}
              type="file"
              accept={kind.includes("csv") ? ".csv,text/csv" : ".json,application/json"}
              disabled={!!busyStep}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn"
              disabled={!!busyStep}
              onClick={() => fileRef.current?.click()}
            >
              Choose file…
            </button>
          </div>

          {busyStep && (
            <div className="import-busy" role="status">
              <div className="loading-spinner loading-spinner-sm" aria-hidden />
              <span>{busyStep}</span>
            </div>
          )}

          {error && <div className="callout callout-error">{error}</div>}

          {preview && (
            <div className="callout">
              <strong>Ready to import</strong> — {preview.filename}
              {preview.dataElements && (
                <div className="section-hint" style={{ marginTop: 6 }}>
                  Applying will load {preview.dataElements.total.toLocaleString()} data elements
                  {preview.mappingEdits
                    ? ` and ${preview.mappingEdits.total.toLocaleString()} mappings`
                    : ""}
                  . The main view may take a few seconds to refresh.
                </div>
              )}
              <ul className="import-summary-list">
                {preview.indicatorNormalization && (
                <li>{preview.indicatorNormalization}</li>
              )}
              {preview.dataSources && (
                  <li>
                    Data sources: +{preview.dataSources.added} / ~{preview.dataSources.updated}{" "}
                    updated → {preview.dataSources.total} total
                  </li>
                )}
                {preview.dataElements && (
                  <li>
                    Data elements: +{preview.dataElements.added} / ~{preview.dataElements.updated}{" "}
                    updated → {preview.dataElements.total} total
                  </li>
                )}
                {preview.mappingEdits && (
                  <li>
                    Mappings: +{preview.mappingEdits.added} / ~{preview.mappingEdits.updated}{" "}
                    updated → {preview.mappingEdits.total} total
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={!!busyStep}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!pending || !!busyStep}
            onClick={confirm}
          >
            Apply import
          </button>
        </div>
      </div>
    </div>
  );
}
