import { useMemo, useState } from "react";
import type { DataElementRow, DataSourceRow, MappingDocument, StageKey } from "../types";
import { OcdsPathDetailModal } from "./OcdsPathDetailModal";
import { DataElementDetailModal } from "./DataElementDetail";
import {
  buildMappingPathIndex,
  computeIndicatorReadiness,
  dataElementsForIndicator,
  inferStageFromPath,
} from "../lib/indicatorMapping";
import {
  feasibilityForProfile,
  packLabel,
  type ActiveIndicatorState,
  type DataProfile,
} from "../lib/indicatorPacks";
import {
  feasibilityLabel,
  type Feasibility,
  type IndicatorKind,
  type RiskIndicator,
} from "../lib/riskIndicators";

interface Props {
  doc: MappingDocument;
  rawDoc: MappingDocument | null;
  modifiedPaths: Set<string>;
  indicatorState: ActiveIndicatorState;
  onSave: (stage: StageKey, path: string, patch: { mapping?: string; example?: string; notes?: string }) => void;
  onReset: (stage: StageKey, path: string) => void;
  onUpsertDataElement: (row: DataElementRow) => void;
  onUpsertDataSource: (row: DataSourceRow) => void;
  onOpenInExplorer?: (stage: StageKey, path: string) => void;
}

type KindFilter = "all" | IndicatorKind;

function FeasBadge({ value }: { value: Feasibility | undefined }) {
  if (!value) return <span className="feas-badge feas-unknown">Unknown</span>;
  return <span className={`feas-badge feas-${value}`}>{feasibilityLabel(value)}</span>;
}

function ReadinessBar({ pct }: { pct: number }) {
  const tone = pct >= 100 ? "good" : pct >= 50 ? "mid" : "low";
  return (
    <div className="readiness-bar" title={`${pct}% required paths mapped`}>
      <div className={`readiness-fill readiness-${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function RiskIndicatorsView({
  doc,
  rawDoc,
  modifiedPaths,
  indicatorState,
  onSave,
  onReset,
  onUpsertDataElement,
  onUpsertDataSource,
  onOpenInExplorer,
}: Props) {
  const sourceLabel = doc.metadata.source_system?.trim() || "source system";
  const {
    indicators,
    packs,
    profiles,
    loading,
    error,
    warnings,
    preferences,
    setPreferences,
    catalog,
    catalogError,
  } = indicatorState;

  const showFeasibility = profiles.length > 0;

  const [selectedId, setSelectedId] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [profileFilter, setProfileFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [detailRow, setDetailRow] = useState<DataElementRow | null>(null);
  const [pathDetail, setPathDetail] = useState<{ stage: StageKey; path: string } | null>(null);

  const pathIndex = useMemo(() => buildMappingPathIndex(doc), [doc]);

  const filteredIndicators = useMemo(() => {
    const q = query.trim().toLowerCase();
    return indicators.filter((ind) => {
      if (kindFilter !== "all" && ind.kind !== kindFilter) return false;
      if (profileFilter !== "all") {
        const feas = feasibilityForProfile(ind, profileFilter);
        if (feas === "no") return false;
      }
      if (!q) return true;
      const blob = [ind.id, ind.name, ind.description, ...ind.paths.map((p) => p.path)]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [indicators, kindFilter, profileFilter, query]);

  const selected = useMemo(() => {
    if (selectedId && filteredIndicators.some((i) => i.id === selectedId)) {
      return filteredIndicators.find((i) => i.id === selectedId) ?? null;
    }
    return filteredIndicators[0] ?? null;
  }, [selectedId, filteredIndicators]);

  const readiness = useMemo(
    () => (selected ? computeIndicatorReadiness(selected, pathIndex) : null),
    [selected, pathIndex],
  );

  const relatedElements = useMemo(
    () => (selected ? dataElementsForIndicator(doc.data_elements.rows, selected) : []),
    [selected, doc.data_elements.rows],
  );

  const indicatorSummaries = useMemo(() => {
    const map = new Map<string, number>();
    for (const ind of indicators) {
      map.set(ind.id, computeIndicatorReadiness(ind, pathIndex).requiredPct);
    }
    return map;
  }, [indicators, pathIndex]);

  const highlightProfiles = showFeasibility ? profiles.slice(0, 2) : [];

  if (loading) {
    return (
      <div className="placeholder">
        <div className="icon">⚑</div>
        <div>Loading indicator packs…</div>
      </div>
    );
  }

  if (error && indicators.length === 0) {
    return (
      <div className="callout callout-error">
        <strong>Could not load indicator packs</strong> — {error}
      </div>
    );
  }

  return (
    <div className="indicators-layout">
      <aside className="indicators-list-pane">
        {warnings.length > 0 && (
          <div className="callout callout-warn indicators-warnings">
            <strong>Some indicator packs were skipped</strong>
            <ul className="import-summary-list">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        <h2>Risk indicators</h2>
        <p className="lead compact">
          OCP Cardinal is always on. Optional custom packs add jurisdiction-specific checks computed from
          mapped OCDS paths in this project ({packLabel(packs)}).
          {showFeasibility ? " Runtime feasibility uses the selected data-profile overlay." : ""}
        </p>

        {catalog?.custom_packs.length ? (
          <div className="indicators-pack-panel">
            <span className="meta-label">Custom indicator packs</span>
            <p className="hint compact">
              Enable additional risk indicators beyond Cardinal. Saved in this browser (not per project).
            </p>
            <ul className="pack-toggle-list">
              {catalog.custom_packs.map((pack) => {
                const on = preferences.custom_packs.includes(pack.pack_id);
                return (
                  <li key={pack.pack_id}>
                    <label className="pack-toggle">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => {
                          const next = on
                            ? preferences.custom_packs.filter((id) => id !== pack.pack_id)
                            : [...preferences.custom_packs, pack.pack_id];
                          setPreferences({
                            custom_packs: next,
                            custom_packs_customized: true,
                          });
                        }}
                      />
                      <span>
                        <strong>{pack.name}</strong>
                        {pack.description ? (
                          <span className="hint"> — {pack.description}</span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {catalog.feasibility_overlays.length > 0 ? (
              <label className="pack-feas-select">
                <span className="meta-label">Feasibility overlay</span>
                <select
                  value={preferences.feasibility_overlay ?? ""}
                  onChange={(e) =>
                    setPreferences({
                      feasibility_overlay: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">None</option>
                  {catalog.feasibility_overlays.map((o) => (
                    <option key={o.pack_id} value={o.pack_id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        ) : catalogError ? (
          <p className="hint compact">Custom pack catalog unavailable — Cardinal only.</p>
        ) : null}

        <div className="indicators-filters">
          <input
            type="text"
            className="modal-search"
            placeholder="Search indicators…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="seg seg-small">
            {(["all", "cardinal", "custom"] as const).map((k) => (
              <button
                key={k}
                className={kindFilter === k ? "active" : ""}
                onClick={() => setKindFilter(k)}
              >
                {k === "all" ? "All" : k === "cardinal" ? "Cardinal" : "Custom"}
              </button>
            ))}
          </div>
          {showFeasibility ? (
            <div className="seg seg-small">
              <button
                className={profileFilter === "all" ? "active" : ""}
                onClick={() => setProfileFilter("all")}
              >
                All profiles
              </button>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  className={profileFilter === p.id ? "active" : ""}
                  onClick={() => setProfileFilter(p.id)}
                  title={p.description}
                >
                  {p.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="indicators-list">
          {filteredIndicators.map((ind) => (
            <IndicatorListItem
              key={ind.id}
              indicator={ind}
              active={selected?.id === ind.id}
              readinessPct={indicatorSummaries.get(ind.id) ?? 0}
              highlightProfiles={highlightProfiles}
              onSelect={() => setSelectedId(ind.id)}
            />
          ))}
          {filteredIndicators.length === 0 && (
            <div className="placeholder compact">No indicators match filters.</div>
          )}
        </div>
      </aside>

      <section className="indicators-detail-pane">
        {!selected || !readiness ? (
          <div className="placeholder">
            <div className="icon">⚑</div>
            <div>Select an indicator to see required OCDS mappings.</div>
          </div>
        ) : (
          <IndicatorDetail
            indicator={selected}
            readiness={readiness}
            relatedElements={relatedElements}
            profiles={showFeasibility ? profiles : []}
            sourceLabel={sourceLabel}
            onOpenPathDetail={(stage, path) => setPathDetail({ stage, path })}
            onShowElement={setDetailRow}
          />
        )}
      </section>

      {pathDetail && (
        <OcdsPathDetailModal
          stage={pathDetail.stage}
          path={pathDetail.path}
          doc={doc}
          rawDoc={rawDoc}
          modifiedPaths={modifiedPaths}
          onClose={() => setPathDetail(null)}
          onSave={onSave}
          onReset={onReset}
          onUpsertDataElement={onUpsertDataElement}
          onUpsertDataSource={onUpsertDataSource}
          onOpenInExplorer={onOpenInExplorer}
        />
      )}

      {detailRow && (
        <DataElementDetailModal row={detailRow} onClose={() => setDetailRow(null)} />
      )}
    </div>
  );
}

function IndicatorListItem({
  indicator,
  active,
  readinessPct,
  highlightProfiles,
  onSelect,
}: {
  indicator: RiskIndicator;
  active: boolean;
  readinessPct: number;
  highlightProfiles: DataProfile[];
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`indicator-card${active ? " active" : ""}`}
      onClick={onSelect}
    >
      <div className="indicator-card-top">
        <span className="indicator-id">{indicator.id}</span>
        <span className={`indicator-kind kind-${indicator.kind}`}>
          {indicator.kind === "cardinal" ? "Cardinal" : "Custom"}
        </span>
      </div>
      <div className="indicator-card-name">{indicator.name}</div>
      {highlightProfiles.length > 0 && (
        <div className="indicator-card-feas">
          {highlightProfiles.map((p) => (
            <span key={p.id} className="indicator-feas-chip">
              <FeasBadge value={feasibilityForProfile(indicator, p.id)} />
              <span className="feas-label">{p.name}</span>
            </span>
          ))}
        </div>
      )}
      <div className="indicator-card-readiness">
        <ReadinessBar pct={readinessPct} />
        <span className="readiness-pct">{readinessPct}% mapped</span>
      </div>
    </button>
  );
}

function IndicatorDetail({
  indicator,
  readiness,
  relatedElements,
  profiles,
  sourceLabel,
  onOpenPathDetail,
  onShowElement,
}: {
  indicator: RiskIndicator;
  readiness: ReturnType<typeof computeIndicatorReadiness>;
  relatedElements: DataElementRow[];
  profiles: DataProfile[];
  sourceLabel: string;
  onOpenPathDetail: (stage: StageKey, path: string) => void;
  onShowElement: (row: DataElementRow) => void;
}) {
  return (
    <>
      <div className="indicator-detail-header">
        <div>
          <div className="indicator-detail-id">
            {indicator.id}
            <span className={`indicator-kind kind-${indicator.kind}`}>
              {indicator.kind === "cardinal" ? "Cardinal" : "Custom"}
            </span>
            <span className="indicator-scope">Scope: {indicator.scope}</span>
          </div>
          <h2>{indicator.name}</h2>
          <p className="lead">{indicator.description}</p>
        </div>
        {indicator.docs_url && (
          <a className="btn" href={indicator.docs_url} target="_blank" rel="noreferrer">
            Docs ↗
          </a>
        )}
      </div>

      {(indicator.tracks ||
        indicator.computation ||
        indicator.interpretation ||
        indicator.limitations) && (
        <div className="indicator-reference-block">
          {indicator.tracks && (
            <div>
              <h3>What it tracks</h3>
              <p className="section-hint">{indicator.tracks}</p>
            </div>
          )}
          {indicator.computation && (
            <div>
              <h3>How it&apos;s computed</h3>
              {indicator.computation.summary && (
                <p className="section-hint">
                  <strong>Rule:</strong> {indicator.computation.summary}
                </p>
              )}
              {indicator.computation.steps && indicator.computation.steps.length > 0 && (
                <ol className="indicator-steps">
                  {indicator.computation.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
              {indicator.computation.thresholds_note && (
                <p className="section-hint text-faint">{indicator.computation.thresholds_note}</p>
              )}
            </div>
          )}
          {indicator.interpretation && (
            <div>
              <h3>Interpretation</h3>
              <p className="section-hint">{indicator.interpretation}</p>
            </div>
          )}
          {indicator.limitations && (
            <div>
              <h3>Limitations</h3>
              <p className="section-hint text-faint">{indicator.limitations}</p>
            </div>
          )}
        </div>
      )}

      <div className="indicator-meta-row">
        {profiles.length > 0 && (
          <div className="indicator-feas-group">
            <span className="meta-label">Runtime feasibility (data profiles)</span>
            <div className="indicator-feas-badges">
              {profiles.map((p) => (
                <span key={p.id}>
                  {p.name} <FeasBadge value={feasibilityForProfile(indicator, p.id)} />
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="indicator-readiness-summary">
          <span className="meta-label">Template mapping readiness</span>
          <div className="readiness-stat">
            <ReadinessBar pct={readiness.requiredPct} />
            <strong>{readiness.requiredPct}%</strong>
            <span>
              {readiness.requiredMapped}/{readiness.requiredTotal} required paths mapped
            </span>
          </div>
        </div>
      </div>

      <h3>Required OCDS paths</h3>
      <p className="section-hint">
        Paths this indicator reads at runtime (Cardinal <code>[]</code> array notation is normalized to
        template paths, e.g. <code>/bids/details[]/tenderers[]/name</code> →{" "}
        <code>bids/details/tenderers/name</code>). Open path details to view or edit the {sourceLabel}{" "}
        mapping without leaving this view. A related mapping on a different OCDS path does not satisfy
        the indicator — map the exact path or publish bid-level data separately.
      </p>
      <table className="data indicator-paths-table">
        <thead>
          <tr>
            <th>Path</th>
            <th>Required</th>
            <th>Mapping status</th>
            <th>Source mapping</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {readiness.paths.map((p) => (
            <tr key={p.normalized}>
              <td className="mono wrap">
                <div>{p.requirement.path}</div>
                <div className="text-faint" style={{ fontSize: 11, marginTop: 2 }}>
                  Template: <code>{p.normalized}</code>
                </div>
              </td>
              <td>{p.requirement.required ? "Yes" : "Optional"}</td>
              <td>
                <span className={`badge status-${p.mapped === "missing" ? "unmapped" : p.mapped}`}>
                  {p.mapped}
                </span>
              </td>
              <td className="wrap">
                {p.node?.mapping || "—"}
                {p.relatedMappings.length > 0 && (
                  <div className="indicator-related-mapping">
                    Related:{" "}
                    {p.relatedMappings.map((rel, i) => (
                      <span key={rel.path}>
                        {i > 0 && "; "}
                        <button
                          type="button"
                          className="mapping-link mono"
                          onClick={() => onOpenPathDetail(rel.stage, rel.path)}
                        >
                          {rel.path}
                        </button>
                        {" → "}
                        {rel.mapping}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    const path = p.node?.path ?? p.normalized;
                    const stage = p.stage ?? inferStageFromPath(path);
                    onOpenPathDetail(stage, path);
                  }}
                >
                  Path details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {readiness.paths.some((p) => p.requirement.note) && (
        <ul className="indicator-notes">
          {readiness.paths
            .filter((p) => p.requirement.note)
            .map((p) => (
              <li key={p.normalized}>
                <code>{p.requirement.path}</code> — {p.requirement.note}
              </li>
            ))}
        </ul>
      )}

      <h3 style={{ marginTop: 28 }}>
        Related data elements ({relatedElements.length})
      </h3>
      <p className="section-hint">
        Source fields whose <code>mapping_details</code> reference these OCDS paths — candidates to
        map or verify.
      </p>
      {relatedElements.length === 0 ? (
        <div className="callout">
          No data elements explicitly list these paths in <code>mapping_details</code>. Check the
          path table above and map manually in the explorer.
        </div>
      ) : (
        <table className="data">
          <thead>
            <tr>
              <th>For mapping</th>
              <th>Source</th>
              <th>Table</th>
              <th>Field</th>
              <th>OCDS path(s)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {relatedElements.map((row) => (
              <tr key={row.key}>
                <td className="mono wrap">{row.for_mapping}</td>
                <td>{row.data_source}</td>
                <td className="mono">{row.section_table}</td>
                <td className="mono">{row.data_element}</td>
                <td className="mono wrap">{row.mapping_details || "—"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onShowElement(row)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
