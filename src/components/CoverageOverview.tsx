import { STAGES, type MappingDocument } from "../types";

export function CoverageOverview({
  doc,
  onPick,
}: {
  doc: MappingDocument;
  onPick: (key: (typeof STAGES)[number]["key"]) => void;
}) {
  return (
    <div className="coverage-grid">
      {STAGES.map((s) => {
        const stage = doc.stages[s.key];
        if (!stage) return null;
        const st = stage.stats;
        const mappedPct = st.total ? (st.mapped / st.total) * 100 : 0;
        const partialPct = st.total ? (st.partial / st.total) * 100 : 0;
        const unmappedPct = st.total ? (st.unmapped / st.total) * 100 : 0;
        return (
          <button
            key={s.key}
            className="coverage-card"
            style={{ cursor: "pointer", textAlign: "left", color: "inherit", border: "1px solid var(--border)" }}
            onClick={() => onPick(s.key)}
          >
            <div className="cc-head">
              <span className="dot" style={{ background: s.color }} />
              <span className="label">{s.label}</span>
              <span
                className="pct"
                style={{ color: mappedPct > 40 ? "var(--mapped)" : "var(--text)" }}
              >
                {st.coverage_pct}%
              </span>
            </div>
            <div className="coverage-bar" aria-hidden>
              <span style={{ width: `${mappedPct}%`, background: "var(--mapped)" }} />
              <span style={{ width: `${partialPct}%`, background: "var(--partial)" }} />
              <span style={{ width: `${unmappedPct}%`, background: "var(--unmapped)" }} />
            </div>
            <div className="cc-foot">
              {st.mapped} mapped · {st.partial} partial · {st.unmapped} unmapped · {st.total} total
            </div>
          </button>
        );
      })}
    </div>
  );
}
