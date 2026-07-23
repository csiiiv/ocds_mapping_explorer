import { useEffect, useMemo, useState } from "react";
import type { DataElementRow, DataSourceRow, MappingNode, StageKey } from "../types";
import { buildDataElementIndex, resolveDataElement } from "../lib/dataElements";
import { isContainerNode, isStructuralHeaderNode } from "../lib/mappingNodes";
import { DataElementDetailModal } from "./DataElementDetail";
import { DataElementPickerModal } from "./DataElementPicker";
import { DataElementWizard, type DataElementWizardResult } from "./DataElementWizard";

interface Props {
  node: MappingNode | null;
  stage: StageKey;
  isModified: boolean;
  baseNode?: MappingNode | null;
  dataElements: DataElementRow[];
  dataSources: DataSourceRow[];
  onSave: (stage: StageKey, path: string, patch: { mapping?: string; example?: string; notes?: string }) => void;
  onReset: (stage: StageKey, path: string) => void;
  onUpsertDataElement: (row: DataElementRow) => void;
  onUpsertDataSource: (row: DataSourceRow) => void;
}

export function DetailPanel({
  node,
  stage,
  isModified,
  baseNode,
  dataElements,
  dataSources,
  onSave,
  onReset,
  onUpsertDataElement,
  onUpsertDataSource,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [mapping, setMapping] = useState("");
  const [example, setExample] = useState("");
  const [notes, setNotes] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<DataElementRow | null>(null);

  const index = useMemo(() => buildDataElementIndex(dataElements), [dataElements]);

  useEffect(() => {
    if (node) {
      setMapping(node.mapping || "");
      setExample(node.example || "");
      setNotes(node.notes || "");
      setEditing(false);
      setPickerOpen(false);
    }
  }, [node?.id, node?.mapping, node?.example, node?.notes]);

  const resolved = useMemo(
    () => resolveDataElement(index, editing ? mapping : node?.mapping || ""),
    [index, editing, mapping, node?.mapping],
  );

  if (!node) {
    return (
      <div className="placeholder">
        <div className="icon">←</div>
        <div>Select a tree row to see field details or structure guidance.</div>
      </div>
    );
  }

  if (isStructuralHeaderNode(node)) {
    const heading =
      node.row_type === "section"
        ? node.section || node.title || "Section"
        : node.title || "—";
    return (
      <div className="detail detail-readonly">
        <h3>{heading}</h3>
        {node.row_type === "section" && (
          <p className="callout" style={{ marginBottom: 12 }}>
            <strong>Section header (not mapped).</strong> Groups related OCDS fields below. Select a
            child field to add a source mapping.
          </p>
        )}
        {node.row_type === "subtitle" && (
          <p className="callout" style={{ marginBottom: 12 }}>
            <strong>Group introduction (not mapped).</strong> Describes the block of fields below —
            map the leaf rows, not this header.
          </p>
        )}
        {node.row_type === "extension_intro" && (
          <p className="callout" style={{ marginBottom: 12 }}>
            <strong>Extension block (not mapped).</strong> Introduces optional extension fields in
            this stage. Map the extension leaf fields below.
          </p>
        )}
        {node.description && <p className="desc">{node.description}</p>}
        <p className="section-hint" style={{ marginTop: 16 }}>
          Expand the tree and select a mappable leaf field to link a source data element.
        </p>
      </div>
    );
  }

  if (isContainerNode(node)) {
    return (
      <div className="detail detail-readonly">
        <h3>{node.path || node.title}</h3>
        <div className="detail-title">{node.title || "—"}</div>
        {node.row_type === "ref_span" && (
          <p className="callout" style={{ marginBottom: 12 }}>
            <strong>Party reference group.</strong> Map the <code>parties/*</code> child fields below,
            not this object row. Published JSON uses <code>{node.path}</code> as a reference into{" "}
            <code>parties[]</code>.
          </p>
        )}
        {node.row_type === "extension_span" && (
          <p className="callout" style={{ marginBottom: 12 }}>
            <strong>Extension object (not mapped).</strong> Container for extension fields below.
            Map each child leaf field; ETL assembles the extension object at publish time.
          </p>
        )}
        {node.row_type === "required_span" && (
          <p className="callout" style={{ marginBottom: 12 }}>
            <strong>Required object group (not mapped).</strong> Map the required child fields
            below.
          </p>
        )}
        {node.row_type === "span" && (
          <p className="callout" style={{ marginBottom: 12 }}>
            <strong>Object structure (not mapped).</strong> Per the OCP template, grey object rows are
            containers only. Map the child fields below; ETL assembles this object at publish time.
          </p>
        )}
        {node.description && <p className="desc">{node.description}</p>}
        <p className="section-hint" style={{ marginTop: 16 }}>
          Expand this row in the tree and select a child field to add a source mapping.
        </p>
      </div>
    );
  }

  const save = () => {
    onSave(stage, node.path, { mapping, example, notes });
    setEditing(false);
  };

  const handleWizardSave = (result: DataElementWizardResult) => {
    onUpsertDataElement(result.row);
    if (result.selectForMapping) {
      setMapping(result.row.for_mapping);
      if (!editing) setEditing(true);
    }
    setWizardOpen(false);
  };

  return (
    <>
      <div className="detail">
        <h3>{node.path}</h3>
        <div className="detail-title">{node.title || "—"}</div>
        {node.category === "reference" && (
          <p className="callout" style={{ marginBottom: 12 }}>
            <strong>Reference group.</strong> This block maps fields for the{" "}
            <code>{node.path}</code> party reference using the shared <code>parties/*</code>{" "}
            schema below — not nested <code>{node.path}/*</code> paths.
          </p>
        )}
        {node.description && <p className="desc">{node.description}</p>}

        <div className="detail-grid">
          <div className="key">Stage</div>
          <div className="val">
            <code>{stage}</code>
          </div>

          <div className="key">Type</div>
          <div className="val">
            <code>{node.row_type}</code>
          </div>

          <div className="key">Status</div>
          <div className="val">
            <span className={`badge status-${node.mapped}`}>{node.mapped}</span>
            {isModified && (
              <span className="badge additional" style={{ marginLeft: 8 }}>
                edited
              </span>
            )}
          </div>

          <div className="key">Mapping</div>
          <div className="val">
            {editing ? (
              <div className="mapping-edit">
                <input
                  type="text"
                  value={mapping}
                  onChange={(e) => setMapping(e.target.value)}
                  placeholder="e.g. Tenders (Tender ID)"
                />
                <button type="button" className="btn" onClick={() => setPickerOpen(true)}>
                  Browse…
                </button>
              </div>
            ) : node.mapping ? (
              resolved ? (
                <button
                  type="button"
                  className="mapping-link mono"
                  onClick={() => setDetailRow(resolved)}
                >
                  {node.mapping}
                </button>
              ) : (
                <span className="mono">{node.mapping}</span>
              )
            ) : (
              <span style={{ opacity: 0.5 }}>— not mapped —</span>
            )}
            {isModified && baseNode?.mapping !== node.mapping && !editing && (
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 4 }}>
                original: <code>{baseNode?.mapping || "—"}</code>
              </div>
            )}
          </div>

          <div className="key">Example</div>
          <div className="val">
            {editing ? (
              <input type="text" value={example} onChange={(e) => setExample(e.target.value)} />
            ) : (
              <span className={example ? "mono" : ""} style={{ opacity: example ? 1 : 0.5 }}>
                {example || "—"}
              </span>
            )}
          </div>

          <div className="key">Notes</div>
          <div className="val">
            {editing ? (
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            ) : (
              <span style={{ opacity: notes ? 1 : 0.5, whiteSpace: "pre-wrap" }}>
                {notes || "—"}
              </span>
            )}
          </div>
        </div>

        {resolved && !editing && (
          <div className="de-preview">
            <div className="de-preview-head">
              <span>Linked data element</span>
              <button type="button" className="btn btn-ghost" onClick={() => setDetailRow(resolved)}>
                Full details
              </button>
            </div>
            <div className="detail-grid">
              <div className="key">Table</div>
              <div className="val mono">{resolved.section_table}</div>
              <div className="key">Field</div>
              <div className="val mono">{resolved.data_element}</div>
              <div className="key">Source</div>
              <div className="val">{resolved.data_source || "—"}</div>
              <div className="key">Type</div>
              <div className="val">{resolved.data_type || "—"}</div>
              {resolved.description && (
                <>
                  <div className="key">Description</div>
                  <div className="val">{resolved.description}</div>
                </>
              )}
              {resolved.example && (
                <>
                  <div className="key">Example</div>
                  <div className="val mono">{resolved.example}</div>
                </>
              )}
              {resolved.notes && (
                <>
                  <div className="key">Notes</div>
                  <div className="val">{resolved.notes}</div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="detail-actions">
          {editing ? (
            <>
              <button className="btn btn-primary" onClick={save}>
                Save changes
              </button>
              <button className="btn" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit field
            </button>
          )}
          {isModified && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                if (confirm(`Reset "${node.path}" to the original value?`)) {
                  onReset(stage, node.path);
                }
              }}
            >
              Reset to original
            </button>
          )}
        </div>
      </div>

      {pickerOpen && (
        <DataElementPickerModal
          rows={dataElements}
          currentValue={mapping}
          onSelect={setMapping}
          onAddNew={() => {
            setPickerOpen(false);
            setWizardOpen(true);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {wizardOpen && (
        <DataElementWizard
          dataSources={dataSources}
          dataElements={dataElements}
          ocdsPathHint={node.path}
          onSave={handleWizardSave}
          onAddDataSource={onUpsertDataSource}
          onClose={() => setWizardOpen(false)}
        />
      )}

      {detailRow && (
        <DataElementDetailModal row={detailRow} onClose={() => setDetailRow(null)} />
      )}
    </>
  );
}
