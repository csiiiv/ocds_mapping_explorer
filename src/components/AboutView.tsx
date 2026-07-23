import type { ReactNode } from "react";
import type { MappingDocument } from "../types";
import type { ProjectMetadata } from "../lib/project";
import { ABOUT_SECTIONS, SOFTWARE_ATTRIBUTIONS } from "../lib/aboutContent";
import pkg from "../../package.json";

interface Props {
  doc: MappingDocument;
  projectMeta?: ProjectMetadata | null;
  onShowWelcomeGuide?: () => void;
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function AboutView({ doc, projectMeta, onShowWelcomeGuide }: Props) {
  const ocdsVersion = projectMeta?.ocds_version || doc.metadata.version_line || "1.1.5";
  const templateVersion = projectMeta?.template_version;
  const sourceFile = projectMeta?.source_file || doc.metadata.source_file;

  return (
    <div className="about-view">
      <div className="view-header-row">
        <div>
          <h2>About</h2>
          <p className="lead">
            Interactive browser and editor for OCDS field-level mapping — aligned with the Open
            Contracting Partnership workbook model. Map any source system to OCDS paths, maintain a
            source inventory, validate mappings, and export for ETL or stakeholder handoff.
          </p>
          {onShowWelcomeGuide && (
            <p className="section-hint">
              New here?{" "}
              <button type="button" className="btn btn-sm" onClick={onShowWelcomeGuide}>
                Open welcome guide
              </button>
            </p>
          )}
        </div>
      </div>

      <section className="about-section about-hero">
        <div className="about-meta-grid">
          <div className="about-meta-card">
            <span className="about-meta-label">App version</span>
            <strong>{pkg.version}</strong>
          </div>
          <div className="about-meta-card">
            <span className="about-meta-label">OCDS reference</span>
            <strong>{ocdsVersion}</strong>
          </div>
          <div className="about-meta-card">
            <span className="about-meta-label">Active project</span>
            <strong>{doc.metadata.project_name || doc.metadata.project_id}</strong>
          </div>
          {doc.metadata.source_system && (
            <div className="about-meta-card">
              <span className="about-meta-label">Source system</span>
              <strong>{doc.metadata.source_system}</strong>
            </div>
          )}
        </div>
        {templateVersion && (
          <p className="section-hint">
            Template: {templateVersion}
            {sourceFile ? ` · derived from ${sourceFile}` : ""}
          </p>
        )}
      </section>

      {ABOUT_SECTIONS.map((section) => (
        <section key={section.id} className="about-section">
          <h3>{section.title}</h3>
          {section.body && <p className="section-hint">{section.body}</p>}
          <ul className="about-link-list">
            {section.links.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink>
                {link.description && <p className="about-link-desc">{link.description}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="about-section">
        <h3>Documentation in this package</h3>
        <p className="section-hint">
          When running from source, see the <code>docs/</code> folder in the repository:
        </p>
        <ul className="about-doc-list">
          <li>
            <code>IMPLEMENTATION_SUMMARY.md</code> — feature record, architecture, and source map
          </li>
          <li>
            <code>EXPORT_GUIDE.md</code> — JSON, YAML, and xlsx handoff workflow
          </li>
          <li>
            <code>STREAMLINE_RECOMMENDATIONS.md</code> — mapping from scratch workflow
          </li>
          <li>
            <code>GENERALIZATION_PLAN.md</code> — design rationale and data model
          </li>
          <li>
            <code>PLANNED_IMPLEMENTATIONS.md</code> — forward backlog (P0–P4)
          </li>
          <li>
            <code>public/projects/README.md</code> — bundled project naming and regenerate commands
          </li>
          <li>
            <code>references/OCP_RED_FLAGS_TO_OCDS.md</code> — OCP red-flag catalogue (R001–R073)
          </li>
          <li>
            <code>samples/philgeps/docs/</code> — PhilGEPS indicator corpus reference (markdown)
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h3>License & attribution</h3>
        <div className="about-attribution">
          <p>
            <strong>OCDS</strong> is maintained by the{" "}
            <ExternalLink href="https://www.open-contracting.org/">Open Contracting Partnership</ExternalLink>
            . Mapping workbook structure follows OCP field-level template guidance.
          </p>
          <p>
            <strong>Cardinal risk indicators</strong> are documented by the Open Contracting
            community; the OCP{" "}
            <ExternalLink href="https://www.open-contracting.org/wp-content/uploads/2024/12/OCP2024-RedFlagProcurement-1.pdf">
              Red flags in public procurement
            </ExternalLink>{" "}
            guide (2024) informs the broader red-flag catalogue. Indicator pack JSON in this app is a
            convenience layer for mapping readiness, not a substitute for running Cardinal or
            compile-time analysis on published releases.
          </p>
          <p>
            When publishing a fork or sharing exports, retain provenance for any third-party mapping
            templates or sample projects used in your workflow.
          </p>
        </div>
      </section>

      <section className="about-section about-section-muted">
        <h3>Built with</h3>
        <p className="about-built-with">
          {SOFTWARE_ATTRIBUTIONS.map((item, i) => (
            <span key={item.href}>
              {i > 0 && " · "}
              <ExternalLink href={item.href}>{item.label}</ExternalLink>
            </span>
          ))}
        </p>
      </section>
    </div>
  );
}
