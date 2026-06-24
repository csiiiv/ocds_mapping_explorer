import { useMemo } from "react";
import { STAGES, type MappingDocument, type StageKey } from "../types";
import { CoverageOverview } from "./CoverageOverview";
import { countPlaceholderElements } from "../lib/dataElements";
import { buildMappingPathIndex, computeIndicatorReadiness } from "../lib/indicatorMapping";
import type { ReleaseEnvelopeStats } from "../lib/releaseEnvelope";
import type { ValidationReport } from "../lib/validation";
import type { RiskIndicator } from "../lib/riskIndicators";
import { buildAutoLinkProposals } from "../lib/autoLink";

export type OverviewViewKey =
  | "explorer"
  | "publication"
  | "indicators"
  | "validation"
  | "data_sources"
  | "data_elements"
  | "schema"
  | "extensions";

interface DashboardNavItem {
  key: OverviewViewKey;
  label: string;
  icon: string;
  group: "Dashboard" | "Reference data";
}

const DASHBOARD_NAV: DashboardNavItem[] = [
  { key: "explorer", label: "Mapping Explorer", icon: "⌘", group: "Dashboard" },
  { key: "publication", label: "Release & publication", icon: "◈", group: "Dashboard" },
  { key: "indicators", label: "Risk Indicators", icon: "⚑", group: "Dashboard" },
  { key: "validation", label: "Validation", icon: "✓", group: "Dashboard" },
  { key: "data_sources", label: "Data Sources", icon: "≣", group: "Reference data" },
  { key: "data_elements", label: "Data Elements", icon: "≣", group: "Reference data" },
  { key: "schema", label: "OCDS Schema 1.1.5", icon: "≣", group: "Reference data" },
  { key: "extensions", label: "OCDS Extensions", icon: "≣", group: "Reference data" },
];

export function OverviewDashboard({
  doc,
  editedCount,
  releaseEnvelopeStats,
  indicatorState,
  validationReport,
  extensionProposalsCount,
  onNavigate,
  onPickStage,
}: {
  doc: MappingDocument;
  editedCount: number;
  releaseEnvelopeStats: ReleaseEnvelopeStats | null;
  indicatorState: { indicators: RiskIndicator[]; loading: boolean };
  validationReport: ValidationReport | null;
  extensionProposalsCount: number;
  onNavigate: (view: OverviewViewKey) => void;
  onPickStage: (stage: StageKey) => void;
}) {
  const totalFields = STAGES.reduce((acc, s) => acc + (doc.stages[s.key]?.stats.total ?? 0), 0);
  const mapped = STAGES.reduce((acc, s) => acc + (doc.stages[s.key]?.stats.mapped ?? 0), 0);
  const overall = totalFields ? Math.round((10000 * mapped) / totalFields) / 100 : 0;

  const pathIndex = useMemo(() => buildMappingPathIndex(doc), [doc]);
  const indicatorAvgReadiness = useMemo(() => {
    if (!indicatorState.indicators.length) return null;
    const sum = indicatorState.indicators.reduce(
      (acc, ind) => acc + computeIndicatorReadiness(ind, pathIndex).requiredPct,
      0,
    );
    return Math.round(sum / indicatorState.indicators.length);
  }, [indicatorState.indicators, pathIndex]);

  const autoLinkCount = useMemo(() => buildAutoLinkProposals(doc).length, [doc]);

  const realElementCount =
    doc.data_elements.rows.length - countPlaceholderElements(doc.data_elements.rows);

  const dashboardCards = DASHBOARD_NAV.filter((n) => n.group === "Dashboard");
  const referenceCards = DASHBOARD_NAV.filter((n) => n.group === "Reference data");

  return (
    <>
      <h2>Project overview</h2>
      <p className="lead">
        Summary of mapping coverage, publication readiness, risk indicators, validation, and
        reference inventories for this project. Open any card to work in that view.
      </p>

      <div className="callout">
        <strong>{totalFields}</strong> mappable OCDS fields across six stages.{" "}
        <strong>{mapped}</strong> are currently mapped to a source data element ({overall}%
        overall coverage).
        {editedCount > 0 && (
          <>
            {" "}
            · <strong>{editedCount}</strong> unsaved mapping edit{editedCount !== 1 ? "s" : ""} in
            this browser session
          </>
        )}
      </div>

      <h3 className="overview-section-title">Dashboard</h3>
      <div className="overview-dash-grid">
        {dashboardCards.map((item) => (
          <button
            key={item.key}
            type="button"
            className="overview-dash-card"
            onClick={() => onNavigate(item.key)}
          >
            <div className="overview-dash-card-head">
              <span className="overview-dash-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="overview-dash-label">{item.label}</span>
              <span className="overview-dash-stat">{statForCard(item.key)}</span>
            </div>
            <p className="overview-dash-detail">{detailForCard(item.key)}</p>
          </button>
        ))}
      </div>

      <h3 className="overview-section-title">Coverage by procurement stage</h3>
      <p className="lead overview-section-lead">
        Leaf-level mapping status per OCDS stage. Click a stage to open it in the Mapping Explorer.
      </p>
      <CoverageOverview doc={doc} onPick={onPickStage} />

      <h3 className="overview-section-title">Reference data</h3>
      <div className="overview-dash-grid overview-dash-grid-ref">
        {referenceCards.map((item) => (
          <button
            key={item.key}
            type="button"
            className="overview-dash-card overview-dash-card-compact"
            onClick={() => onNavigate(item.key)}
          >
            <div className="overview-dash-card-head">
              <span className="overview-dash-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="overview-dash-label">{item.label}</span>
              <span className="overview-dash-stat">{statForCard(item.key)}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );

  function statForCard(key: OverviewViewKey): string {
    switch (key) {
      case "explorer":
        return `${overall}%`;
      case "publication":
        return releaseEnvelopeStats ? `${releaseEnvelopeStats.requiredPct}%` : "—";
      case "indicators":
        if (indicatorState.loading) return "…";
        return indicatorAvgReadiness !== null ? `${indicatorAvgReadiness}%` : "—";
      case "validation": {
        if (!validationReport) return "—";
        const issues = validationReport.errorCount + validationReport.warningCount;
        return issues > 0 ? String(issues) : "✓";
      }
      case "data_sources":
        return String(doc.data_sources.rows.length);
      case "data_elements":
        return String(realElementCount);
      case "schema":
        return String(doc.ocds_schema.length);
      case "extensions":
        return String(doc.ocds_extensions.length);
      default:
        return "";
    }
  }

  function detailForCard(key: OverviewViewKey): string {
    switch (key) {
      case "explorer":
        return `${mapped} of ${totalFields} mappable fields mapped${
          editedCount > 0 ? ` · ${editedCount} edit${editedCount !== 1 ? "s" : ""}` : ""
        }`;
      case "publication":
        return releaseEnvelopeStats
          ? `${releaseEnvelopeStats.requiredMapped} of ${releaseEnvelopeStats.requiredTotal} required release fields mapped`
          : "Release envelope mapping status";
      case "indicators":
        if (indicatorState.loading) return "Loading indicator packs…";
        return indicatorState.indicators.length
          ? `${indicatorState.indicators.length} indicators · avg required-path readiness`
          : "No indicators loaded for this project";
      case "validation": {
        if (!validationReport) return "Run validation checks";
        if (validationReport.errorCount + validationReport.warningCount === 0) {
          return autoLinkCount > 0
            ? `All checks passed · ${autoLinkCount} auto-link${autoLinkCount !== 1 ? "s" : ""} available`
            : "All checks passed";
        }
        const parts: string[] = [];
        if (validationReport.errorCount > 0) {
          parts.push(
            `${validationReport.errorCount} error${validationReport.errorCount !== 1 ? "s" : ""}`,
          );
        }
        if (validationReport.warningCount > 0) {
          parts.push(
            `${validationReport.warningCount} warning${validationReport.warningCount !== 1 ? "s" : ""}`,
          );
        }
        if (autoLinkCount > 0) {
          parts.push(`${autoLinkCount} auto-link${autoLinkCount !== 1 ? "s" : ""}`);
        }
        return parts.join(" · ");
      }
      case "data_sources":
        return "Source systems and tables in the inventory";
      case "data_elements":
        return `${realElementCount} defined elements (${doc.data_elements.rows.length} rows incl. placeholders)`;
      case "schema":
        return "OCP template field catalogue";
      case "extensions":
        return extensionProposalsCount > 0
          ? `${extensionProposalsCount} extension proposal${extensionProposalsCount !== 1 ? "s" : ""}`
          : "Registered OCDS extensions";
      default:
        return "";
    }
  }
}
