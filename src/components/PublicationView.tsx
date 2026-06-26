import { useEffect, useMemo, useState } from "react";
import type { DataElementRow, DataSourceRow, MappingDocument, StageKey } from "../types";
import { OcdsPathDetailModal } from "./OcdsPathDetailModal";
import {
  type PublicationConfig,
  linesToList,
  listToLines,
  normalizePublicationConfig,
} from "../lib/publicationConfig";
import {
  buildReleasePreview,
  canonicalFieldSuggestions,
  computeReleaseEnvelope,
} from "../lib/releaseEnvelope";

interface Props {
  doc: MappingDocument;
  rawDoc: MappingDocument | null;
  config: PublicationConfig;
  modifiedPaths: Set<string>;
  onSaveConfig: (config: PublicationConfig) => void;
  onSave: (stage: StageKey, path: string, patch: { mapping?: string; example?: string; notes?: string }) => void;
  onReset: (stage: StageKey, path: string) => void;
  onUpsertDataElement: (row: DataElementRow) => void;
  onUpsertDataSource: (row: DataSourceRow) => void;
  onOpenInExplorer?: (stage: StageKey, path: string) => void;
}

function ReadinessBar({ pct }: { pct: number }) {
  const tone = pct >= 100 ? "good" : pct >= 50 ? "mid" : "low";
  return (
    <div className="readiness-bar" title={`${pct}% required paths mapped`}>
      <div className={`readiness-fill readiness-${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PublicationView({
  doc,
  rawDoc,
  config,
  modifiedPaths,
  onSaveConfig,
  onSave,
  onReset,
  onUpsertDataElement,
  onUpsertDataSource,
  onOpenInExplorer,
}: Props) {
  const [draft, setDraft] = useState(() => normalizePublicationConfig(config));
  const [pathDetail, setPathDetail] = useState<{ stage: StageKey; path: string } | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setDraft(normalizePublicationConfig(config));
  }, [config]);

  const envelope = useMemo(() => computeReleaseEnvelope(doc), [doc]);
  const fieldSuggestions = useMemo(() => canonicalFieldSuggestions(doc), [doc]);
  const preview = useMemo(
    () => buildReleasePreview(doc, draft.ocid_prefix),
    [doc, draft.ocid_prefix],
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(normalizePublicationConfig(config));

  const saveConfig = () => {
    onSaveConfig(normalizePublicationConfig(draft));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  };

  const update = (patch: Partial<PublicationConfig>) => {
    setDraft((d) => normalizePublicationConfig({ ...d, ...patch }));
  };

  return (
    <div className="publication-view">
      <div className="view-header-row">
        <div>
          <h2>Release & publication</h2>
          <p className="lead">
            Map release-level OCDS fields (envelope) and configure publisher-wide compile settings
            exported with the project.
          </p>
        </div>
      </div>

      <section className="publication-section">
        <div className="publication-section-head">
          <h3>Release envelope</h3>
          <div className="readiness-stat compact">
            <ReadinessBar pct={envelope.requiredPct} />
            <strong>{envelope.requiredPct}%</strong>
            <span>
              {envelope.requiredMapped}/{envelope.requiredTotal} required fields mapped
            </span>
          </div>
        </div>
        <p className="section-hint">
          Top-level fields on every OCDS release. Mapped via the General stage; edit mappings here or
          in Mapping Explorer.
        </p>
        <table className="data indicator-paths-table">
          <thead>
            <tr>
              <th>Path</th>
              <th>Required</th>
              <th>Status</th>
              <th>Source mapping</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {envelope.rows.map((row) => (
              <tr key={row.spec.path}>
                <td className="mono wrap">
                  <span className="text-faint">{row.spec.label}</span>
                  <br />
                  {row.spec.path}
                </td>
                <td>{row.spec.required ? "Yes" : "Optional"}</td>
                <td>
                  <span className={`badge status-${row.mapped === "missing" ? "unmapped" : row.mapped}`}>
                    {row.mapped}
                  </span>
                </td>
                <td className="wrap">{row.node?.mapping || "—"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPathDetail({ stage: "general", path: row.spec.path })}
                  >
                    Path details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="publication-section">
        <div className="publication-section-head">
          <h3>Publication settings</h3>
          <div className="publication-actions">
            {savedFlash && <span className="save-flash">Saved</span>}
            <button
              type="button"
              className="btn btn-primary"
              disabled={!dirty}
              onClick={saveConfig}
            >
              Save publication config
            </button>
          </div>
        </div>
        <p className="section-hint">
          Compiler / package metadata (OCID prefix, publisher, generated field rules). Referenced by
          canonical field keys from your data element inventory.
        </p>

        <div className="publication-form-grid">
          <label>
            OCID prefix
            <input
              type="text"
              value={draft.ocid_prefix}
              onChange={(e) => update({ ocid_prefix: e.target.value })}
              placeholder="ocds-agency"
            />
          </label>
          <label>
            Publisher name
            <input
              type="text"
              value={draft.publisher.name}
              onChange={(e) =>
                update({ publisher: { ...draft.publisher, name: e.target.value } })
              }
            />
          </label>
          <label>
            Publisher scheme
            <input
              type="text"
              value={draft.publisher.scheme}
              onChange={(e) =>
                update({ publisher: { ...draft.publisher, scheme: e.target.value } })
              }
            />
          </label>
          <label>
            Publisher UID
            <input
              type="text"
              value={draft.publisher.uid}
              onChange={(e) =>
                update({ publisher: { ...draft.publisher, uid: e.target.value } })
              }
            />
          </label>
          <label className="span-2">
            Publisher URI
            <input
              type="url"
              value={draft.publisher.uri}
              onChange={(e) =>
                update({ publisher: { ...draft.publisher, uri: e.target.value } })
              }
            />
          </label>
          <label className="span-2">
            License URL
            <input
              type="url"
              value={draft.license}
              onChange={(e) => update({ license: e.target.value })}
            />
          </label>
          <label className="span-2">
            Publication policy URL
            <input
              type="url"
              value={draft.publicationPolicy}
              onChange={(e) => update({ publicationPolicy: e.target.value })}
            />
          </label>
          <label>
            Default currency
            <input
              type="text"
              value={draft.defaults.currency}
              onChange={(e) =>
                update({ defaults: { ...draft.defaults, currency: e.target.value } })
              }
              placeholder="PHP"
            />
          </label>
          <label>
            Classification scheme
            <input
              type="text"
              value={draft.defaults.classification_scheme}
              onChange={(e) =>
                update({
                  defaults: { ...draft.defaults, classification_scheme: e.target.value },
                })
              }
              placeholder="UNSPSC"
            />
          </label>
          <label>
            Default language
            <input
              type="text"
              value={draft.defaults.language}
              onChange={(e) =>
                update({ defaults: { ...draft.defaults, language: e.target.value } })
              }
            />
          </label>
          <label>
            Default initiation type
            <input
              type="text"
              value={draft.defaults.initiationType}
              onChange={(e) =>
                update({ defaults: { ...draft.defaults, initiationType: e.target.value } })
              }
            />
          </label>
          <label>
            Generated release ID (field)
            <input
              type="text"
              value={draft.generated.release_id}
              onChange={(e) =>
                update({
                  generated: { ...draft.generated, release_id: e.target.value },
                })
              }
              list="canonical-field-suggestions"
            />
          </label>
          <label>
            Buyer name (compile ref)
            <input
              type="text"
              value={draft.buyer.name}
              onChange={(e) => update({ buyer: { ...draft.buyer, name: e.target.value } })}
              list="canonical-field-suggestions"
            />
          </label>
          <label>
            Buyer ID (compile ref)
            <input
              type="text"
              value={draft.buyer.id}
              onChange={(e) => update({ buyer: { ...draft.buyer, id: e.target.value } })}
              list="canonical-field-suggestions"
            />
          </label>
          <label className="span-2">
            OCID generated from (one field per line)
            <textarea
              rows={3}
              value={listToLines(draft.generated.ocid.from)}
              onChange={(e) =>
                update({
                  generated: {
                    ...draft.generated,
                    ocid: { from: linesToList(e.target.value) },
                  },
                })
              }
            />
          </label>
          <label className="span-2">
            Release date prefer order (one field per line)
            <textarea
              rows={3}
              value={listToLines(draft.generated.release_date.prefer)}
              onChange={(e) =>
                update({
                  generated: {
                    ...draft.generated,
                    release_date: { prefer: linesToList(e.target.value) },
                  },
                })
              }
            />
          </label>
          <label className="span-2">
            Planning block triggers (one field per line)
            <textarea
              rows={3}
              value={listToLines(draft.planning_triggers)}
              onChange={(e) => update({ planning_triggers: linesToList(e.target.value) })}
            />
          </label>
          <label className="span-2">
            OCDS extension URLs (one per line)
            <textarea
              rows={4}
              value={listToLines(draft.extensions)}
              onChange={(e) => update({ extensions: linesToList(e.target.value) })}
            />
          </label>
        </div>

        <datalist id="canonical-field-suggestions">
          {fieldSuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </section>

      <section className="publication-section">
        <h3>Release header preview</h3>
        <p className="section-hint">
          Illustrative JSON from publication config + mapped examples on envelope paths (not a full
          release).
        </p>
        <pre className="release-preview-json">{JSON.stringify(preview, null, 2)}</pre>
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
    </div>
  );
}
