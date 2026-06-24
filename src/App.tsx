import { useEffect, useMemo, useRef, useState } from "react";
import { useMappingDoc } from "./useMappingDoc";
import { useAppNavigation } from "./hooks/useAppNavigation";
import type { ViewKey } from "./lib/appRoutes";
import {
  STAGES,
  type DataElementColumn,
  type DataElementColumnGroup,
  type DataElementRow,
  type DataSourceRow,
  type MappingDocument,
  type MappingNode,
  type OcdsSchemaRow,
  type StageKey,
} from "./types";
import { TreeView } from "./components/TreeView";
import { DetailPanel } from "./components/DetailPanel";
import { DataTable } from "./components/DataTable";
import { DataElementDetailModal } from "./components/DataElementDetail";
import { DataElementsTable } from "./components/DataElementsTable";
import { filterDataElements, countPlaceholderElements, filterRealDataElements, isPlaceholderDataElement } from "./lib/dataElements";
import { findBaseNode } from "./lib/indicatorMapping";
import { RiskIndicatorsView } from "./components/RiskIndicatorsView";
import { useActiveIndicators } from "./lib/indicatorPacks";
import { ExportModal, ImportModal } from "./components/ImportExportModal";
import { DataElementWizard } from "./components/DataElementWizard";
import { DataSourceFormModal } from "./components/DataSourceFormModal";
import { ValidationView } from "./components/ValidationView";
import { OverviewDashboard, type OverviewViewKey } from "./components/OverviewDashboard";
import { OcdsPathPickerModal } from "./components/OcdsPathPickerModal";
import { ExtensionsView } from "./components/ExtensionsView";
import { findOcdsLinksForElement } from "./lib/sourceMapping";
import {
  formatDeleteElementMessage,
  formatDeleteSourceMessage,
  type DeleteElementImpact,
  type DeleteSourceImpact,
} from "./lib/inventoryDelete";
import { PublicationView } from "./components/PublicationView";
import { AboutView } from "./components/AboutView";
import { LoadingPlaceholder } from "./components/LoadingPlaceholder";
import { CreateProjectModal } from "./components/CreateProjectModal";
import { WelcomeGuideModal } from "./components/WelcomeGuideModal";
import { computeReleaseEnvelope } from "./lib/releaseEnvelope";
import { runValidation } from "./lib/validation";
import { dismissWelcomeGuide, shouldShowWelcomeGuide } from "./lib/welcomeGuide";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: string;
  group: string;
}

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: "◎", group: "Dashboard" },
  { key: "explorer", label: "Mapping Explorer", icon: "⌘", group: "Dashboard" },
  { key: "publication", label: "Release & publication", icon: "◈", group: "Dashboard" },
  { key: "indicators", label: "Risk Indicators", icon: "⚑", group: "Dashboard" },
  { key: "validation", label: "Validation", icon: "✓", group: "Dashboard" },
  { key: "data_sources", label: "Data Sources", icon: "≣", group: "Reference data" },
  { key: "data_elements", label: "Data Elements", icon: "≣", group: "Reference data" },
  { key: "schema", label: "OCDS Schema 1.1.5", icon: "≣", group: "Reference data" },
  { key: "extensions", label: "OCDS Extensions", icon: "≣", group: "Reference data" },
];

export default function App() {
  const h = useMappingDoc();
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const welcomeAutoShown = useRef(false);

  const availableProjectIds = h.routableProjectIds;

  const nav = useAppNavigation(h.doc, availableProjectIds, h.switchProject);

  const modifiedPaths = useMemo(() => {
    const set = new Set<string>();
    for (const k of Object.keys(h.edits)) {
      const [, path] = k.split("::");
      if (path) set.add(path);
    }
    return set;
  }, [h.edits]);

  const validationReport = useMemo(
    () => (h.doc ? runValidation(h.doc) : null),
    [h.doc],
  );

  const indicatorState = useActiveIndicators();

  const releaseEnvelopeStats = useMemo(
    () => (h.doc ? computeReleaseEnvelope(h.doc) : null),
    [h.doc],
  );

  useEffect(() => {
    if (h.doc && !welcomeAutoShown.current && shouldShowWelcomeGuide()) {
      welcomeAutoShown.current = true;
      setShowWelcomeGuide(true);
    }
  }, [h.doc]);

  const closeWelcomeGuide = (dontShowAgain: boolean) => {
    if (dontShowAgain) dismissWelcomeGuide();
    setShowWelcomeGuide(false);
  };

  if (h.loadError) {
    return (
      <div className="placeholder" style={{ height: "100vh" }}>
        <div className="icon">⚠</div>
        <div>Failed to load mapping data.</div>
        <code>{h.loadError}</code>
        <div style={{ maxWidth: 480 }}>
          Run <code>npm run build-data</code> to generate <code>public/ocds_reference.json</code> and{" "}
          <code>public/projects/*.json</code> from the Excel template.
        </div>
      </div>
    );
  }

  if (!h.doc) {
    const title =
      h.docStatus === "preparing"
        ? "Preparing mapping view…"
        : h.loadStatus?.phase ?? "Loading project…";
    const detail =
      h.docStatus === "preparing"
        ? `Applying ${h.pendingEditCount.toLocaleString()} mapping edit${
            h.pendingEditCount === 1 ? "" : "s"
          } to the OCDS field tree`
        : h.loadStatus?.detail;
    return (
      <LoadingPlaceholder
        title={title}
        detail={detail}
        subdetail={
          h.docStatus === "preparing"
            ? "Large imports can take a few seconds — the page will open when ready."
            : undefined
        }
      />
    );
  }

  const doc = h.doc;

  const {
    view,
    stage,
    query,
    statusFilter,
    selected,
    goToView,
    goToExplorer,
    openMappingField,
    switchProject,
    setQuery,
    setStatusFilter,
    setSelected,
  } = nav;

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>OCDS Mapping Explorer</h1>
          <div className="subtitle">
            {doc.metadata.project_name || "Mapping project"} · OCDS{" "}
            {doc.metadata.version_line || "1.1"}
            {doc.metadata.source_system ? ` · ${doc.metadata.source_system}` : ""}
          </div>
        </div>
        <div className="project-toolbar">
          <label className="project-select">
            <span className="sr-only">Project</span>
            <select
              value={h.projectId}
              onChange={(e) => {
                const next = e.target.value;
                if (next === h.projectId) return;
                if (
                  h.editedCount === 0 ||
                  confirm(
                    "Switch project? Mapping edits are saved separately per project in this browser.",
                  )
                ) {
                  switchProject(next);
                }
              }}
              title="Switch mapping project"
            >
              {h.availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.local ? " (local)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setShowCreateProject(true)}
            title="Create a new project in this browser"
          >
            + New
          </button>
          {h.canDeleteCurrentProject && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                const current = h.availableProjects.find((p) => p.id === h.projectId);
                const label = current?.name || h.projectId;
                if (
                  confirm(
                    `Delete local project "${label}"? This removes its data from this browser only.`,
                  )
                ) {
                  h.deleteProject(h.projectId);
                  switchProject("blank");
                }
              }}
              title="Delete this local project"
            >
              Delete
            </button>
          )}
        </div>
        <div className="spacer" />
        <button className="btn" onClick={h.undo} disabled={!h.canUndo} title="Undo (Ctrl+Z)">
          ↶ Undo
        </button>
        <button className="btn" onClick={h.redo} disabled={!h.canRedo} title="Redo">
          ↷ Redo
        </button>
        <button
          className="btn"
          onClick={() => {
            if (h.editedCount === 0 || confirm(`Clear all ${h.editedCount} edits?`)) h.clearAllEdits();
          }}
          disabled={h.editedCount === 0}
        >
          Clear edits
        </button>
        <button className="btn" onClick={() => setShowWelcomeGuide(true)} title="Open welcome guide">
          Guide
        </button>
        <button className="btn" onClick={() => setShowImport(true)}>
          Import
        </button>
        <button className="btn btn-primary" onClick={() => setShowExport(true)}>
          Export {h.editedCount > 0 && `(${h.editedCount})`}
        </button>
        <div className="meta">
          <div>generated {new Date(doc.metadata.generated_at).toLocaleString()}</div>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <div className="group-label">Dashboard</div>
          {NAV.filter((n) => n.group === "Dashboard").map((n) => (
            <button
              key={n.key}
              className={`nav-item${view === n.key ? " active" : ""}`}
              onClick={() => goToView(n.key)}
            >
              <span style={{ width: 14, textAlign: "center" }}>{n.icon}</span>
              {n.label}
              {n.key === "publication" && releaseEnvelopeStats && (
                <span className="stat-badge">{releaseEnvelopeStats.requiredPct}%</span>
              )}
              {n.key === "indicators" && (
                <span className="stat-badge">{indicatorState.indicators.length || "…"}</span>
              )}
              {n.key === "validation" &&
                validationReport &&
                validationReport.errorCount + validationReport.warningCount > 0 && (
                <span className="stat-badge stat-badge-warn">
                  {validationReport.errorCount + validationReport.warningCount}
                </span>
              )}
            </button>
          ))}

          <div className="group-label">Procurement stages</div>
          {STAGES.map((s) => {
            const st = doc.stages[s.key]?.stats;
            return (
              <button
                key={s.key}
                className={`nav-item${view === "explorer" && stage === s.key ? " active" : ""}`}
                onClick={() => goToExplorer(s.key)}
              >
                <span className="stage-dot" style={{ background: s.color }} />
                {s.label}
                <span className="stat-badge">{st ? `${st.coverage_pct}%` : ""}</span>
              </button>
            );
          })}

          <div className="group-label">Reference data</div>
          {NAV.filter((n) => n.group === "Reference data").map((n) => (
            <button
              key={n.key}
              className={`nav-item${view === n.key ? " active" : ""}`}
              onClick={() => goToView(n.key)}
            >
              <span style={{ width: 14, textAlign: "center" }}>{n.icon}</span>
              {n.label}
              <span className="stat-badge">
                {n.key === "data_sources"
                  ? doc.data_sources.rows.length
                  : n.key === "data_elements"
                    ? doc.data_elements.rows.length - countPlaceholderElements(doc.data_elements.rows)
                    : n.key === "schema"
                      ? doc.ocds_schema.length
                      : doc.ocds_extensions.length}
              </span>
            </button>
          ))}

          <div className="sidebar-footer">
            <button
              className={`nav-item${view === "about" ? " active" : ""}`}
              onClick={() => goToView("about")}
            >
              <span style={{ width: 14, textAlign: "center" }}>ⓘ</span>
              About
            </button>
          </div>
        </aside>

        <main className="main">
          {view === "overview" && (
            <OverviewDashboard
              doc={doc}
              editedCount={h.editedCount}
              releaseEnvelopeStats={releaseEnvelopeStats}
              indicatorState={indicatorState}
              validationReport={validationReport}
              extensionProposalsCount={h.extensionProposals.length}
              onNavigate={(v: OverviewViewKey) => goToView(v)}
              onPickStage={(k) => goToExplorer(k)}
            />
          )}

          {view === "publication" && (
            <PublicationView
              doc={doc}
              rawDoc={h.rawDoc}
              config={h.publicationConfig}
              modifiedPaths={modifiedPaths}
              onSaveConfig={h.updatePublicationConfig}
              onSave={h.updateField}
              onReset={h.resetField}
              onUpsertDataElement={h.upsertDataElement}
              onUpsertDataSource={h.upsertDataSource}
              onOpenInExplorer={openMappingField}
            />
          )}

          {view === "indicators" && (
            <RiskIndicatorsView
              doc={doc}
              rawDoc={h.rawDoc}
              modifiedPaths={modifiedPaths}
              indicatorState={indicatorState}
              onSave={h.updateField}
              onReset={h.resetField}
              onUpsertDataElement={h.upsertDataElement}
              onUpsertDataSource={h.upsertDataSource}
              onOpenInExplorer={openMappingField}
            />
          )}

          {view === "validation" && (
            <ValidationView
              doc={doc}
              onOpenMapping={openMappingField}
              onApplyAutoLinks={h.applyAutoLinks}
            />
          )}

          {view === "explorer" && (
            <ExplorerView
              doc={doc}
              stage={stage}
              setStage={(s) => goToExplorer(s, { path: null, q: query, status: statusFilter })}
              query={query}
              setQuery={setQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              selected={selected}
              setSelected={setSelected}
              modifiedPaths={modifiedPaths}
              edits={h.edits}
              rawDoc={h.rawDoc}
              onSave={h.updateField}
              onReset={h.resetField}
              onUpsertDataElement={h.upsertDataElement}
              onUpsertDataSource={h.upsertDataSource}
            />
          )}

          {view === "data_sources" && (
            <DataSourcesView
              rows={doc.data_sources.rows}
              columns={doc.data_sources.columns}
              onUpsert={h.upsertDataSource}
              onDelete={h.deleteDataSource}
              previewDelete={h.previewDeleteSource}
            />
          )}
          {view === "data_elements" && (
            <DataElementsView
              doc={doc}
              filterQuery={query}
              onFilterQueryChange={(q) => goToView("data_elements", { q }, true)}
              onUpsert={h.upsertDataElement}
              onDelete={h.deleteDataElement}
              previewDelete={h.previewDeleteElement}
              onUpsertDataSource={h.upsertDataSource}
              onMapElement={(stage, path, forMapping) => {
                h.updateField(stage, path, { mapping: forMapping });
              }}
              onOpenMappingField={openMappingField}
            />
          )}
          {view === "schema" && <SchemaView rows={doc.ocds_schema} kind="schema" />}
          {view === "extensions" && (
            <ExtensionsView
              doc={doc}
              proposals={h.extensionProposals}
              onUpsert={h.upsertExtensionProposal}
              onDelete={h.deleteExtensionProposal}
              onMapProposal={(p) => {
                if (!p.for_mapping?.trim()) return;
                goToView("data_elements", { q: p.for_mapping });
              }}
            />
          )}
          {view === "about" && (
            <AboutView
              doc={doc}
              projectMeta={h.projectMeta}
              onShowWelcomeGuide={() => setShowWelcomeGuide(true)}
            />
          )}
        </main>
      </div>

      {showWelcomeGuide && (
        <WelcomeGuideModal
          projectName={doc.metadata.project_name || "Mapping project"}
          onClose={closeWelcomeGuide}
          onNavigate={goToView}
        />
      )}

      {showExport && (
        <ExportModal
          projectId={h.projectId}
          editedCount={h.editedCount}
          projectJson={h.exportJson()}
          editsJson={h.exportEditsOnly()}
          fullDocJson={h.exportFullDocument()}
          project={h.getProjectPayload()}
          onClose={() => setShowExport(false)}
        />
      )}

      {showCreateProject && (
        <CreateProjectModal
          onCreate={async (name, sourceSystem) => {
            const id = await h.createProject(name, sourceSystem);
            switchProject(id);
          }}
          onClose={() => setShowCreateProject(false)}
        />
      )}

      {showImport && h.getProjectPayload() && (
        <ImportModal
          project={h.getProjectPayload()!}
          onImport={h.applyImport}
          onClose={() => setShowImport(false)}
        />
      )}

      <KeyboardShortcuts onUndo={h.undo} onRedo={h.redo} />
    </div>
  );
}

/* ----------------------------- Views ----------------------------- */

interface ExplorerProps {
  doc: NonNullable<ReturnType<typeof useMappingDoc>["doc"]>;
  rawDoc: ReturnType<typeof useMappingDoc>["rawDoc"];
  stage: StageKey;
  setStage: (s: StageKey) => void;
  query: string;
  setQuery: (q: string) => void;
  statusFilter: "all" | "mapped" | "partial" | "unmapped";
  setStatusFilter: (f: "all" | "mapped" | "partial" | "unmapped") => void;
  selected: { stage: StageKey; node: MappingNode } | null;
  setSelected: (s: { stage: StageKey; node: MappingNode } | null) => void;
  modifiedPaths: Set<string>;
  edits: Record<string, unknown>;
  onSave: ReturnType<typeof useMappingDoc>["updateField"];
  onReset: ReturnType<typeof useMappingDoc>["resetField"];
  onUpsertDataElement: ReturnType<typeof useMappingDoc>["upsertDataElement"];
  onUpsertDataSource: ReturnType<typeof useMappingDoc>["upsertDataSource"];
}

function ExplorerView(props: ExplorerProps) {
  const { doc, rawDoc, stage, selected, setSelected } = props;
  const stageData = doc.stages[stage];

  // Look up the original (unedited) node for diff display.
  const baseNode = useMemo(() => {
    if (!rawDoc || !selected) return null;
    return findBaseNode(rawDoc, selected.stage, selected.node.id);
  }, [rawDoc, selected]);

  return (
    <>
      <div className="tabs">
        {STAGES.map((s) => (
          <button
            key={s.key}
            className={stage === s.key ? "active" : ""}
            onClick={() => props.setStage(s.key)}
          >
            {s.short} · {doc.stages[s.key].stats.coverage_pct}%
          </button>
        ))}
      </div>

      <h2>{stageData.title}</h2>
      <p className="lead">{stageData.subtitle}</p>

      <div className="toolbar">
        <div className="search">
          <input
            type="text"
            placeholder="Search path, title, description, mapping…"
            value={props.query}
            onChange={(e) => props.setQuery(e.target.value)}
          />
        </div>
        <div className="seg">
          {(["all", "mapped", "partial", "unmapped"] as const).map((f) => (
            <button
              key={f}
              className={props.statusFilter === f ? "active" : ""}
              onClick={() => props.setStatusFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
          {stageData.stats.total} mappable fields
        </span>
      </div>

      <div className="explorer-split">
        <div className="explorer-tree-pane">
          <TreeView
            tree={stageData.tree}
            selectedId={selected?.stage === stage ? selected.node.id : null}
            revealNodeId={selected?.stage === stage ? selected.node.id : null}
            onSelect={(st, node) => setSelected({ stage: st, node })}
            stage={stage}
            query={props.query}
            filter={props.statusFilter}
            modifiedPaths={props.modifiedPaths}
          />
        </div>

        <div className="explorer-detail-pane">
          <DetailPanel
            node={selected?.stage === stage ? selected.node : null}
            stage={stage}
            isModified={!!selected && props.modifiedPaths.has(selected.node.path)}
            baseNode={baseNode}
            dataElements={doc.data_elements.rows}
            dataSources={doc.data_sources.rows}
            onSave={props.onSave}
            onReset={props.onReset}
            onUpsertDataElement={props.onUpsertDataElement}
            onUpsertDataSource={props.onUpsertDataSource}
          />
        </div>
      </div>
    </>
  );
}

function DataSourcesView({
  rows,
  columns,
  onUpsert,
  onDelete,
  previewDelete,
}: {
  rows: DataSourceRow[];
  columns: string[];
  onUpsert?: (row: DataSourceRow) => void;
  onDelete?: (shortName: string) => void;
  previewDelete?: (shortName: string) => DeleteSourceImpact | null;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DataSourceRow | null>(null);
  const editable = !!(onUpsert && onDelete);

  const cols = [
    ...columns.map((c) => ({
      key: slugify(c),
      label: c,
      wrap: ["agency_unit_responsible", "existing_apis_data_publication"].includes(slugify(c)),
    })),
    ...(editable ? [{ key: "_actions", label: "", wrap: false }] : []),
  ];
  return (
    <>
      <div className="view-header-row">
        <div>
          <h2>Data sources</h2>
          <p className="lead">
            Systems that hold contracting-process data and which stages they cover.
          </p>
        </div>
        {editable && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            + Add source
          </button>
        )}
      </div>
      <DataTable
        rows={rows as unknown as Record<string, unknown>[]}
        columns={cols}
        renderCell={(row, colKey) => {
          if (colKey !== "_actions" || !editable) return undefined;
          const src = row as unknown as DataSourceRow;
          return (
            <span className="row-actions">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  setEditing(src);
                  setFormOpen(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  const impact = previewDelete?.(src.short_name);
                  const msg = impact
                    ? formatDeleteSourceMessage(impact)
                    : `Delete data source "${src.data_source || src.short_name}"?`;
                  if (confirm(msg)) {
                    onDelete!(src.short_name);
                  }
                }}
              >
                Delete
              </button>
            </span>
          );
        }}
      />

      {formOpen && onUpsert && (
        <DataSourceFormModal
          initial={editing}
          onSave={onUpsert}
          onClose={() => setFormOpen(false)}
        />
      )}
    </>
  );
}

function DataElementsView({
  doc,
  filterQuery = "",
  onFilterQueryChange,
  onUpsert,
  onDelete,
  previewDelete,
  onUpsertDataSource,
  onMapElement,
  onOpenMappingField,
}: {
  doc: MappingDocument;
  filterQuery?: string;
  onFilterQueryChange?: (q: string) => void;
  onUpsert: (row: DataElementRow) => void;
  onDelete: (key: string) => void;
  previewDelete?: (key: string) => DeleteElementImpact | null;
  onUpsertDataSource: (row: DataSourceRow) => void;
  onMapElement: (stage: StageKey, path: string, forMapping: string) => void;
  onOpenMappingField: (stage: StageKey, path: string) => void;
}) {
  const [showOptional, setShowOptional] = useState(true);
  const [showMappingStats, setShowMappingStats] = useState(true);
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const [detailRow, setDetailRow] = useState<DataElementRow | null>(null);
  const [pathPickerRow, setPathPickerRow] = useState<DataElementRow | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<DataElementRow | null>(null);

  const placeholderCount = useMemo(
    () => countPlaceholderElements(doc.data_elements.rows),
    [doc.data_elements.rows],
  );
  const inventoryRows = useMemo(
    () => (showPlaceholders ? doc.data_elements.rows : filterRealDataElements(doc.data_elements.rows)),
    [doc.data_elements.rows, showPlaceholders],
  );

  const filtered = useMemo(
    () => filterDataElements(inventoryRows, filterQuery, ""),
    [inventoryRows, filterQuery],
  );

  const columnGroups =
    doc.data_elements.column_groups ??
    fallbackColumnGroups(doc.data_elements.columns);

  const visibleCount = doc.data_elements.columns.filter((col) => {
    if (col.optional && !showOptional) return false;
    if (col.group === "mapping_statistics" && !showMappingStats) return false;
    return true;
  }).length;

  const confirmDeleteElement = (el: DataElementRow): boolean => {
    const impact = previewDelete?.(el.key);
    const msg = impact
      ? formatDeleteElementMessage(impact)
      : `Delete data element "${el.for_mapping || el.key}"?`;
    if (!confirm(msg)) return false;
    onDelete(el.key);
    return true;
  };

  return (
    <>
      <div className="view-header-row">
        <div>
          <h2>
            Existing data elements (
            {showPlaceholders
              ? doc.data_elements.rows.length
              : doc.data_elements.rows.length - placeholderCount}
            {placeholderCount > 0 && !showPlaceholders && (
              <span className="text-faint" style={{ fontWeight: 400 }}>
                {" "}
                · {placeholderCount} template slots hidden
              </span>
            )}
            )
          </h2>
          <p className="lead">
            Full inventory from sheet &quot;2. Data Elements&quot;. Use <strong>Map</strong> to link
            an element to an OCDS field (source-first workflow), or browse from the Mapping Explorer.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingRow(null);
            setWizardOpen(true);
          }}
        >
          + Add element
        </button>
      </div>

      <div className="toolbar">
        <div className="search">
          <input
            type="text"
            placeholder="Search for_mapping, table, field, description…"
            value={filterQuery}
            onChange={(e) => onFilterQueryChange?.(e.target.value)}
          />
        </div>
        <label className="toggle-chip">
          <input
            type="checkbox"
            checked={showOptional}
            onChange={(e) => setShowOptional(e.target.checked)}
          />
          Optional columns
        </label>
        <label className="toggle-chip">
          <input
            type="checkbox"
            checked={showMappingStats}
            onChange={(e) => setShowMappingStats(e.target.checked)}
          />
          Mapping statistics
        </label>
        {placeholderCount > 0 && (
          <label className="toggle-chip">
            <input
              type="checkbox"
              checked={showPlaceholders}
              onChange={(e) => setShowPlaceholders(e.target.checked)}
            />
            Template placeholders ({placeholderCount})
          </label>
        )}
        <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
          {filtered.length} rows · {visibleCount} / {doc.data_elements.columns.length} columns
        </span>
      </div>

      <DataElementsTable
        columns={doc.data_elements.columns}
        columnGroups={columnGroups}
        rows={filtered as unknown as Record<string, unknown>[]}
        showOptional={showOptional}
        showMappingStats={showMappingStats}
        renderCell={(row, col) => {
          const el = row as unknown as DataElementRow;
          if (isPlaceholderDataElement(el) && col.key === "for_mapping") {
            return (
              <span className="text-faint mono" title="Empty Excel template slot">
                ()
              </span>
            );
          }
          const v = row[col.key];
          if (col.key === "for_mapping" && typeof v === "string" && v) {
            return (
              <span className="row-actions-inline">
                <button
                  type="button"
                  className="mapping-link mono"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailRow(el);
                  }}
                >
                  {v}
                </button>
                {!isPlaceholderDataElement(el) && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPathPickerRow(el);
                    }}
                  >
                    Map
                  </button>
                )}
              </span>
            );
          }
          if (col.key === "data_element") {
            const el = row as unknown as DataElementRow;
            return (
              <span className="row-actions-inline">
                <span className="mono">{el.data_element}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingRow(el);
                    setWizardOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteElement(el);
                  }}
                >
                  Delete
                </button>
              </span>
            );
          }
          return undefined;
        }}
      />

      {wizardOpen && (
        <DataElementWizard
          dataSources={doc.data_sources.rows}
          dataElements={doc.data_elements.rows}
          initial={editingRow}
          onSave={({ row }) => {
            if (editingRow && editingRow.key !== row.key) {
              onDelete(editingRow.key);
            }
            onUpsert(row);
          }}
          onAddDataSource={onUpsertDataSource}
          onClose={() => setWizardOpen(false)}
        />
      )}

      {detailRow && (
        <DataElementDetailModal
          row={detailRow}
          linkedPaths={findOcdsLinksForElement(doc, detailRow.for_mapping)}
          onClose={() => setDetailRow(null)}
          onDelete={() => {
            if (confirmDeleteElement(detailRow)) setDetailRow(null);
          }}
          onMapToOcds={() => {
            setPathPickerRow(detailRow);
            setDetailRow(null);
          }}
          onOpenField={(stage, path) => {
            setDetailRow(null);
            onOpenMappingField(stage, path);
          }}
        />
      )}

      {pathPickerRow && (
        <OcdsPathPickerModal
          doc={doc}
          forMappingLabel={pathPickerRow.for_mapping}
          onSelect={(stage, path) => onMapElement(stage, path, pathPickerRow.for_mapping)}
          onClose={() => setPathPickerRow(null)}
        />
      )}
    </>
  );
}

function fallbackColumnGroups(columns: DataElementColumn[]): DataElementColumnGroup[] {
  const groups: DataElementColumnGroup[] = [
    { id: "for_mapping", label: "For mapping", keys: [] },
    { id: "existing_data_elements", label: "Existing data elements", keys: [] },
    { id: "mapping_statistics", label: "Mapping statistics", keys: [] },
  ];
  for (const col of columns) {
    const g = groups.find((x) => x.id === col.group);
    if (g) g.keys.push(col.key);
  }
  return groups.filter((g) => g.keys.length > 0);
}

function SchemaView({ rows, kind }: { rows: OcdsSchemaRow[]; kind: "schema" | "extensions" }) {
  const cols =
    kind === "extensions"
      ? [
          { key: "extension", label: "Extension", wrap: true },
          { key: "path", label: "Path", mono: true },
          { key: "title", label: "Title" },
          { key: "type", label: "Type" },
          { key: "range", label: "Range" },
          { key: "values", label: "Values", wrap: true },
          { key: "deprecated", label: "Deprecated?" },
        ]
      : [
          { key: "section", label: "Section", wrap: true },
          { key: "path", label: "Path", mono: true },
          { key: "title", label: "Title" },
          { key: "type", label: "Type" },
          { key: "range", label: "Range" },
          { key: "values", label: "Values", wrap: true },
          { key: "deprecated", label: "Deprecated?" },
        ];
  return (
    <>
      <h2>{kind === "extensions" ? "OCDS Extension Schemas 1.1.5" : "OCDS Schema 1.1.5"}</h2>
      <p className="lead">
        Reference catalogue of {rows.length} fields from the{" "}
        {kind === "extensions" ? "extensions" : "core"} schema. Useful when adding new mappings.
      </p>
      <DataTable rows={rows as unknown as Record<string, unknown>[]} columns={cols} />
    </>
  );
}

/* ----------------------------- Keyboard ----------------------------- */

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "col";
}

function KeyboardShortcuts({
  onUndo,
  onRedo,
}: {
  onUndo: () => void;
  onRedo: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onUndo, onRedo]);
  return null;
}
