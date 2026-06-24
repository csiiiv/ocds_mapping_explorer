import { useMemo } from "react";
import type { DataElementRow, DataSourceRow, MappingDocument, StageKey } from "../types";
import { DetailPanel } from "./DetailPanel";
import { findBaseNode, resolvePathNode } from "../lib/indicatorMapping";

interface Props {
  stage: StageKey;
  path: string;
  doc: MappingDocument;
  rawDoc: MappingDocument | null;
  modifiedPaths: Set<string>;
  onClose: () => void;
  onSave: (stage: StageKey, path: string, patch: { mapping?: string; example?: string; notes?: string }) => void;
  onReset: (stage: StageKey, path: string) => void;
  onUpsertDataElement: (row: DataElementRow) => void;
  onUpsertDataSource: (row: DataSourceRow) => void;
  onOpenInExplorer?: (stage: StageKey, path: string) => void;
}

export function OcdsPathDetailModal({
  stage,
  path,
  doc,
  rawDoc,
  modifiedPaths,
  onClose,
  onSave,
  onReset,
  onUpsertDataElement,
  onUpsertDataSource,
  onOpenInExplorer,
}: Props) {
  const resolved = useMemo(() => resolvePathNode(doc, stage, path), [doc, stage, path]);

  const baseNode = useMemo(() => {
    if (!rawDoc || !resolved) return null;
    return findBaseNode(rawDoc, resolved.stage, resolved.node.id);
  }, [rawDoc, resolved]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide path-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>OCDS path details</h3>
            <div className="modal-subtitle mono">{path}</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body path-detail-modal-body">
          {!resolved ? (
            <div className="callout">
              <strong>Not in mapping template</strong> — this path is required by the indicator but
              does not appear as a field row in the OCDS reference for this project. You may need an
              extension or a custom compile step.
            </div>
          ) : (
            <DetailPanel
              node={resolved.node}
              stage={resolved.stage}
              isModified={modifiedPaths.has(resolved.node.path)}
              baseNode={baseNode}
              dataElements={doc.data_elements.rows}
              dataSources={doc.data_sources.rows}
              onSave={onSave}
              onReset={onReset}
              onUpsertDataElement={onUpsertDataElement}
              onUpsertDataSource={onUpsertDataSource}
            />
          )}
        </div>

        {resolved && onOpenInExplorer && (
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                onOpenInExplorer(resolved.stage, resolved.node.path);
                onClose();
              }}
            >
              Open in Mapping Explorer →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
