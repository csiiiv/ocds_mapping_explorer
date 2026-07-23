import { useState } from "react";
import type { ViewKey } from "../lib/appRoutes";

interface GuideItem {
  icon: string;
  title: string;
  body: string;
  view?: ViewKey;
}

const DASHBOARD_ITEMS: GuideItem[] = [
  {
    icon: "◎",
    title: "Overview",
    body: "Project hub — mapping coverage by stage, release envelope readiness, indicator summary, and validation counts. Start here for the big picture.",
    view: "overview",
  },
  {
    icon: "⌘",
    title: "Mapping Explorer",
    body: "Browse the OCDS field tree by procurement stage. Click structure rows for titles and descriptions (not mappable). Map leaf fields to your source data elements, search, filter by status, and expand or collapse the tree.",
    view: "explorer",
  },
  {
    icon: "◈",
    title: "Release & publication",
    body: "Configure publisher-wide settings (OCID prefix, buyer, extensions) and review release envelope fields — ocid, date, tag, buyer, and related paths.",
    view: "publication",
  },
  {
    icon: "⚑",
    title: "Risk Indicators",
    body: "Cardinal red flags plus optional OCP and Philippines packs. Sort by code, name, or % mapped. See what each indicator tracks and which OCDS paths still need mapping.",
    view: "indicators",
  },
  {
    icon: "✓",
    title: "Validation",
    body: "Mapping quality checks — missing examples, unlinked inventory, and auto-link suggestions. Jump to fields to fix issues inline.",
    view: "validation",
  },
];

const REFERENCE_ITEMS: GuideItem[] = [
  {
    icon: "≣",
    title: "Data Sources & Data Elements",
    body: "Your source-system inventory (sheet 1 & 2). Add systems, author fields with the wizard, and map elements to OCDS paths source-first.",
    view: "data_elements",
  },
  {
    icon: "≣",
    title: "OCDS Schema & Extensions",
    body: "Reference catalogues for OCDS 1.1.5 fields and extension proposals attached to this project.",
    view: "schema",
  },
];

interface Props {
  projectName: string;
  onClose: (dontShowAgain: boolean) => void;
  onNavigate: (view: ViewKey) => void;
}

export function WelcomeGuideModal({ projectName, onClose, onNavigate }: Props) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const go = (view: ViewKey) => {
    onNavigate(view);
    onClose(dontShowAgain);
  };

  return (
    <div
      className="modal-backdrop welcome-guide-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-guide-title"
      onClick={() => onClose(dontShowAgain)}
    >
      <div className="modal modal-wide welcome-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 id="welcome-guide-title">Welcome to OCDS Mapping Explorer</h3>
            <div className="modal-subtitle">
              A browser-based editor for OCDS 1.1 field-level mapping handoff — currently viewing{" "}
              <strong>{projectName}</strong>.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onClose(dontShowAgain)}
            aria-label="Close guide"
          >
            ✕
          </button>
        </div>

        <div className="modal-body welcome-guide-body">
          <section className="welcome-guide-section">
            <h4>What this tool does</h4>
            <p>
              Connect your agency&apos;s source fields to the OCDS release model, track mapping coverage,
              check risk-indicator readiness, and export project JSON / YAML for your compile pipeline.
              Edits are saved per project in this browser.
            </p>
          </section>

          <section className="welcome-guide-section">
            <h4>Projects</h4>
            <ul className="welcome-guide-list">
              <li>
                <strong>Blank project</strong> — empty inventory for a new mapping exercise.
              </li>
              <li>
                <strong>mPhilGEPS / PhilGEPS 1.5</strong> — pre-filled PS-DBM v0.91 templates when bundled.
              </li>
              <li>
                <strong>+ New</strong> — clone blank into a local browser project; use{" "}
                <strong>Import</strong> / <strong>Export</strong> in the header for handoff.
              </li>
            </ul>
          </section>

          <section className="welcome-guide-section">
            <h4>Dashboard views</h4>
            <p className="welcome-guide-hint">Click a card to open that view when you close this guide.</p>
            <div className="welcome-guide-grid">
              {DASHBOARD_ITEMS.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className="welcome-guide-card"
                  onClick={() => item.view && go(item.view)}
                >
                  <span className="welcome-guide-card-icon" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="welcome-guide-card-title">{item.title}</span>
                  <span className="welcome-guide-card-body">{item.body}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="welcome-guide-section">
            <h4>Reference data</h4>
            <div className="welcome-guide-grid welcome-guide-grid-compact">
              {REFERENCE_ITEMS.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className="welcome-guide-card"
                  onClick={() => item.view && go(item.view)}
                >
                  <span className="welcome-guide-card-icon" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="welcome-guide-card-title">{item.title}</span>
                  <span className="welcome-guide-card-body">{item.body}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="welcome-guide-section welcome-guide-tips">
            <h4>Suggested first visit</h4>
            <ol className="welcome-guide-steps">
              <li>
                Open <strong>Overview</strong> for stage coverage and summary cards.
              </li>
              <li>
                Skim <strong>Risk Indicators</strong> — custom Philippines packs are on by default; each
                indicator explains what it tracks and how it is computed.
              </li>
              <li>
                Use <strong>Mapping Explorer</strong> on a stage with low coverage; map leaf fields only.
              </li>
              <li>
                Set <strong>Release &amp; publication</strong> config (OCID prefix, publisher) before export.
              </li>
              <li>
                Run <strong>Validation</strong>, then <strong>Export</strong> project JSON or mapping YAML.
              </li>
            </ol>
          </section>
        </div>

        <div className="modal-footer welcome-guide-footer">
          <label className="welcome-guide-dismiss">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            Don&apos;t show on startup
          </label>
          <span className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={() => onClose(dontShowAgain)}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={() => go("overview")}>
            Go to Overview
          </button>
        </div>
      </div>
    </div>
  );
}
