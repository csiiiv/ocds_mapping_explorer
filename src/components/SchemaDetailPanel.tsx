import type { SchemaNode } from "../lib/ocdsSchemaTree";
import { jsonPointer, ocdsDocsUrl, typeLabel, codelistName } from "../lib/ocdsSchemaTree";

interface Props {
  node: SchemaNode | null;
}

export function SchemaDetailPanel({ node }: Props) {
  if (!node) {
    return (
      <div className="placeholder" style={{ height: "100%" }}>
        <div className="icon">⌥</div>
        <div>Select a field to see its schema reference.</div>
      </div>
    );
  }

  const row = node.row;
  const isContainer = node.kind === "container";
  const docsUrl = row ? ocdsDocsUrl(node.path, node.isExtension) : null;
  const pointer = jsonPointer(node.path);
  const tl = typeLabel(node);
  const codelist = row ? codelistName(row.values) : null;

  return (
    <div className="schema-detail">
      <div className="detail-header">
        <div className="detail-path mono">{node.path}</div>
        <h3>{row?.title || node.name}</h3>
        <div className="detail-badges">
          {tl && <span className="badge type-chip">{tl}</span>}
          {node.isExtension && (
            <span className="badge extension">
              {node.extension && node.extension !== "extensions" ? node.extension : "extension"}
            </span>
          )}
          {row?.deprecated_bool && (
            <span className="badge deprecated" title={row.deprecationnotes || "deprecated"}>
              deprecated
            </span>
          )}
          {isContainer && <span className="badge span-hint">structure</span>}
        </div>
      </div>

      {row?.description && (
        <section className="detail-section">
          <h4>Description</h4>
          <p className="detail-description">{row.description}</p>
        </section>
      )}

      {row && (
        <section className="detail-section">
          <h4>Schema</h4>
          <dl className="detail-meta">
            <dt>JSON pointer</dt>
            <dd className="mono">{pointer}</dd>

            {row.type && (
              <>
                <dt>Type</dt>
                <dd className="mono">{row.type}</dd>
              </>
            )}

            {row.range && (
              <>
                <dt>Cardinality</dt>
                <dd className="mono">{row.range}</dd>
              </>
            )}

            {row.values && (
              <>
                <dt>{codelist ? "Codelist" : "Values / format"}</dt>
                <dd className="mono">
                  {codelist ? (
                    <a
                      href={`https://standard.open-contracting.org/1.1.5/en/schema/codelists/`}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {row.values} ↗
                    </a>
                  ) : (
                    row.values
                  )}
                </dd>
              </>
            )}

            {row.links && (
              <>
                <dt>Reference</dt>
                <dd>
                  <a href={row.links} target="_blank" rel="noreferrer noopener">
                    {row.links} ↗
                  </a>
                </dd>
              </>
            )}
          </dl>
        </section>
      )}

      {row?.deprecated_bool && row?.deprecationnotes && (
        <section className="detail-section">
          <h4>Deprecation note</h4>
          <p className="callout callout-warn">{row.deprecationnotes}</p>
        </section>
      )}

      {isContainer && (
        <section className="detail-section">
          <h4>Structure</h4>
          <p className="text-faint">
            Object container with {countLeaves(node)} nested field
            {countLeaves(node) === 1 ? "" : "s"}.
          </p>
        </section>
      )}

      {(docsUrl || row?.links) && (
        <div className="detail-footer">
          {docsUrl && (
            <a
              className="btn btn-sm"
              href={docsUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              OCDS docs ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function countLeaves(node: SchemaNode): number {
  if (node.kind === "leaf") return 1;
  return node.children.reduce((acc, c) => acc + countLeaves(c), 0);
}
