import type { DataElementRow, StageKey } from "../types";
import type { ElementMappingLink } from "../lib/sourceMapping";

interface Props {
  row: DataElementRow;
  linkedPaths?: ElementMappingLink[];
  onClose: () => void;
  onDelete?: () => void;
  onMapToOcds?: () => void;
  onOpenField?: (stage: StageKey, path: string) => void;
}

export function DataElementDetailModal({
  row,
  linkedPaths = [],
  onClose,
  onDelete,
  onMapToOcds,
  onOpenField,
}: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Data element</h3>
            <div className="modal-subtitle mono">{row.for_mapping}</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <DataElementFields row={row} />

          {linkedPaths.length > 0 && (
            <div className="de-linked-paths">
              <h4>Linked OCDS fields ({linkedPaths.length})</h4>
              <ul className="de-linked-list">
                {linkedPaths.map((link) => (
                  <li key={`${link.stage}::${link.path}`}>
                    <code className="mono">{link.path}</code>
                    <span className="text-faint"> · {link.stage}</span>
                    {onOpenField && (
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => onOpenField(link.stage, link.path)}
                      >
                        Open
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(onMapToOcds || onDelete) && (
            <div className="detail-actions" style={{ marginTop: 16, display: "flex", gap: 8 }}>
              {onMapToOcds && (
                <button type="button" className="btn btn-primary" onClick={onMapToOcds}>
                  Map to OCDS field…
                </button>
              )}
              {onDelete && (
                <button type="button" className="btn btn-ghost" onClick={onDelete}>
                  Delete element
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DataElementFields({ row }: { row: DataElementRow }) {
  const stageCounts = [
    ["General", row.count_1_general_all_stages, row.presence_1_general_all_stages],
    ["Planning", row.count_2_planning, row.presence_2_planning],
    ["Tender", row.count_3_tender, row.presence_3_tender],
    ["Award", row.count_4_award, row.presence_4_award],
    ["Contract", row.count_5_contract, row.presence_5_contract],
    ["Implementation", row.count_6_implementation, row.presence_6_implementation],
  ] as const;

  return (
    <>
      <div className="detail-grid">
        <div className="key">For mapping</div>
        <div className="val mono">{row.for_mapping}</div>

        <div className="key">Data source</div>
        <div className="val">{row.data_source || "—"}</div>

        <div className="key">Section / table</div>
        <div className="val mono">{row.section_table || "—"}</div>

        <div className="key">Data element</div>
        <div className="val mono">{row.data_element || "—"}</div>

        <div className="key">Publish?</div>
        <div className="val">{row.publish || "—"}</div>

        <div className="key">Data type{opt("data_type")}</div>
        <div className="val">{row.data_type || "—"}</div>

        <div className="key">Mapped?</div>
        <div className="val">{row.mapped || "—"}</div>

        <div className="key">Example{opt("example")}</div>
        <div className="val mono">{row.example || "—"}</div>

        <div className="key">Description{opt("description")}</div>
        <div className="val">{row.description || "—"}</div>

        <div className="key">Notes{opt("notes")}</div>
        <div className="val">{row.notes || "—"}</div>

        <div className="key">Mapping details</div>
        <div className="val">{row.mapping_details || "—"}</div>
      </div>

      <div className="de-stage-grid">
        <div className="de-stage-head">
          <span>Stage</span>
          <span>Count</span>
          <span>Present</span>
        </div>
        {stageCounts.map(([label, count, present]) => (
          <div key={label} className="de-stage-row">
            <span>{label}</span>
            <span>{count}</span>
            <span>{present ? "✓" : "—"}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function opt(field: string) {
  return ["example", "description", "data_type", "notes"].includes(field) ? (
    <span className="de-opt-tag">optional</span>
  ) : null;
}
