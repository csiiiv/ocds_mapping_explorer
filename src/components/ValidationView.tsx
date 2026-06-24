import { useMemo, useState } from "react";
import type { DataElementRow, MappingDocument, StageKey } from "../types";
import { DataElementDetailModal } from "./DataElementDetail";
import {
  buildAutoLinkProposals,
  type AutoLinkProposal,
} from "../lib/autoLink";
import {
  runValidation,
  VALIDATION_CATEGORY_LABELS,
  type ValidationCategory,
  type ValidationIssue,
  type ValidationSeverity,
} from "../lib/validation";

interface Props {
  doc: MappingDocument;
  onOpenMapping: (stage: StageKey, path: string) => void;
  onApplyAutoLinks: (proposals: AutoLinkProposal[]) => void;
}

type SeverityFilter = "all" | ValidationSeverity;
type CategoryFilter = "all" | ValidationCategory;

function SeverityBadge({ severity }: { severity: ValidationSeverity }) {
  return <span className={`val-badge val-${severity}`}>{severity}</span>;
}

export function ValidationView({ doc, onOpenMapping, onApplyAutoLinks }: Props) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [detailRow, setDetailRow] = useState<DataElementRow | null>(null);

  const report = useMemo(() => runValidation(doc), [doc]);
  const autoLinks = useMemo(() => buildAutoLinkProposals(doc), [doc]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return report.issues.filter((issue) => {
      if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
      if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
      if (!q) return true;
      const blob = [
        issue.message,
        issue.path,
        issue.forMapping,
        issue.elementKey,
        issue.shortName,
        issue.mappingDetails,
        VALIDATION_CATEGORY_LABELS[issue.category],
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [report.issues, severityFilter, categoryFilter, query]);

  const openElement = (key: string) => {
    const row = doc.data_elements.rows.find((r) => r.key === key);
    if (row) setDetailRow(row);
  };

  const renderAction = (issue: ValidationIssue) => {
    if (issue.path && issue.stage) {
      return (
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => onOpenMapping(issue.stage!, issue.path!)}
        >
          Open field
        </button>
      );
    }
    if (issue.elementKey) {
      return (
        <button type="button" className="btn btn-sm" onClick={() => openElement(issue.elementKey!)}>
          View element
        </button>
      );
    }
    return null;
  };

  const applyLinks = () => {
    if (autoLinks.length === 0) return;
    const msg =
      autoLinks.length === 1
        ? `Apply 1 mapping from mapping_details?`
        : `Apply ${autoLinks.length} mappings from mapping_details? Empty OCDS fields will be linked to matching data elements.`;
    if (confirm(msg)) onApplyAutoLinks(autoLinks);
  };

  return (
    <>
      <h2>Mapping validation</h2>
      <p className="lead">
        Quality checks across OCDS field mappings, data element inventory, and{" "}
        <code>mapping_details</code> hints. Run after import or before export.
      </p>

      {report.placeholderRowCount > 0 && (
        <div className="callout section-hint" style={{ marginBottom: 16 }}>
          <strong>{report.placeholderRowCount}</strong> empty template row
          {report.placeholderRowCount !== 1 ? "s" : ""} with <code>for_mapping</code>{" "}
          <code>()</code> (blank table/field slots from the Excel inventory sheet) are excluded
          from orphan and duplicate checks.
        </div>
      )}

      <div className="validation-summary">
        <div className={`val-stat val-stat-${report.errorCount ? "error" : "ok"}`}>
          <span className="val-stat-num">{report.errorCount}</span>
          <span className="val-stat-label">Errors</span>
        </div>
        <div className={`val-stat val-stat-${report.warningCount ? "warn" : "ok"}`}>
          <span className="val-stat-num">{report.warningCount}</span>
          <span className="val-stat-label">Warnings</span>
        </div>
        <div className="val-stat val-stat-ok">
          <span className="val-stat-num">{report.infoCount}</span>
          <span className="val-stat-label">Info</span>
        </div>
        <div className="val-stat val-stat-neutral">
          <span className="val-stat-num">{autoLinks.length}</span>
          <span className="val-stat-label">Auto-linkable</span>
        </div>
      </div>

      {report.errorCount === 0 && report.warningCount === 0 ? (
        <div className="callout" style={{ marginBottom: 16 }}>
          No errors or warnings. {report.infoCount > 0 && `${report.infoCount} informational note(s).`}
        </div>
      ) : (
        <div className="callout callout-error" style={{ marginBottom: 16 }}>
          {report.errorCount > 0 && (
            <>
              <strong>{report.errorCount}</strong> error{report.errorCount !== 1 ? "s" : ""}
            </>
          )}
          {report.errorCount > 0 && report.warningCount > 0 && " · "}
          {report.warningCount > 0 && (
            <>
              <strong>{report.warningCount}</strong> warning{report.warningCount !== 1 ? "s" : ""}
            </>
          )}
          {" "}to review before handoff.
        </div>
      )}

      {autoLinks.length > 0 && (
        <div className="validation-autolink">
          <div>
            <strong>{autoLinks.length}</strong> empty OCDS field
            {autoLinks.length !== 1 ? "s" : ""} can be linked from <code>mapping_details</code>.
          </div>
          <button type="button" className="btn btn-primary" onClick={applyLinks}>
            Apply auto-links
          </button>
        </div>
      )}

      <div className="validation-categories">
        {(Object.keys(VALIDATION_CATEGORY_LABELS) as ValidationCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            className={`toggle-chip${categoryFilter === cat ? " active" : ""}`}
            onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
          >
            {VALIDATION_CATEGORY_LABELS[cat]}
            <span className="stat-badge">{report.byCategory[cat]}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search">
          <input
            type="text"
            placeholder="Search issues…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="seg">
          {(["all", "error", "warning", "info"] as const).map((f) => (
            <button
              key={f}
              className={severityFilter === f ? "active" : ""}
              onClick={() => setSeverityFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
          {filtered.length} / {report.issues.length} issues
        </span>
      </div>

      <div className="table-wrap">
        <table className="data validation-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Category</th>
              <th>Issue</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue) => (
              <tr key={issue.id}>
                <td>
                  <SeverityBadge severity={issue.severity} />
                </td>
                <td className="wrap">{VALIDATION_CATEGORY_LABELS[issue.category]}</td>
                <td className="wrap">{issue.message}</td>
                <td>{renderAction(issue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="placeholder compact">
            {report.issues.length === 0
              ? "All checks passed — no issues found."
              : "No issues match the current filters."}
          </div>
        )}
      </div>

      {detailRow && (
        <DataElementDetailModal row={detailRow} onClose={() => setDetailRow(null)} />
      )}
    </>
  );
}

/** Compact summary for Overview dashboard. */
export function ValidationSummaryBanner({
  doc,
  onOpenValidation,
}: {
  doc: MappingDocument;
  onOpenValidation: () => void;
}) {
  const report = useMemo(() => runValidation(doc), [doc]);
  const autoLinks = useMemo(() => buildAutoLinkProposals(doc), [doc]);

  if (report.issues.length === 0 && autoLinks.length === 0) {
    return (
      <div className="callout validation-banner validation-banner-ok" style={{ marginTop: 16 }}>
        Validation: all checks passed.
      </div>
    );
  }

  return (
    <div
      className={`callout validation-banner${
        report.errorCount > 0 ? " validation-banner-error" : " validation-banner-warn"
      }`}
      style={{ marginTop: 16 }}
    >
      <div className="validation-banner-text">
        <strong>Validation:</strong>{" "}
        {report.errorCount > 0 && (
          <>
            {report.errorCount} error{report.errorCount !== 1 ? "s" : ""}
          </>
        )}
        {report.errorCount > 0 && report.warningCount > 0 && ", "}
        {report.warningCount > 0 && (
          <>
            {report.warningCount} warning{report.warningCount !== 1 ? "s" : ""}
          </>
        )}
        {report.errorCount === 0 && report.warningCount === 0 && report.infoCount > 0 && (
          <>{report.infoCount} info note{report.infoCount !== 1 ? "s" : ""}</>
        )}
        {autoLinks.length > 0 && (
          <>
            {" "}
            · {autoLinks.length} auto-link{autoLinks.length !== 1 ? "s" : ""} available
          </>
        )}
      </div>
      <button type="button" className="btn btn-sm" onClick={onOpenValidation}>
        Review
      </button>
    </div>
  );
}
