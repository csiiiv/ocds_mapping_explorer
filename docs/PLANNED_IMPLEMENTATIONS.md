# Planned implementations

**Purpose:** Forward-looking backlog for `ocds_mapping_explorer/` — what to build next, in what order, and what is explicitly out of scope.

**Last updated:** July 23, 2026  
**Current baseline:** v1 complete (Phases 1–4) + post-v1 export, indicator packs (app-level + OCP red flags), selectable structure rows, indicator sort, path detail modal, release & publication, overview hub, explorer UX. See [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md).

**How to use this doc:** Pick a **priority band**; each item has enough scope to become a PR or sprint. Cross off items here when shipped and note them in `IMPLEMENTATION_SUMMARY.md`.

---

## Current state (done)

| Area | Status |
|------|--------|
| Three-tier model (reference + project + edits) | ✅ |
| Import / export (JSON, CSV, YAML, xlsx CLI) | ✅ |
| Source authoring (wizard, CRUD, source-first map) | ✅ |
| Validation + auto-link | ✅ |
| Extension proposals | ✅ |
| Indicator packs (Cardinal + app-level custom packs) | ✅ |
| Risk Indicators → Path details modal | ✅ |
| Release envelope + publication config | ✅ |
| Overview dashboard hub (all views) | ✅ |
| Local project create/delete (browser) | ✅ |
| Inventory delete with mapping cleanup | ✅ |
| Leaf-only mapping UX + container rows | ✅ |
| Selectable structure rows (read-only detail) | ✅ |
| Tree expand/collapse all (explorer) | ✅ |
| Wizard section/table suggestions | ✅ |
| Welcome guide (first visit) | ✅ |
| Bundled PhilGEPS projects | ✅ |
| OCP red-flags catalogue pack (R001–R073) | ✅ |
| Risk Indicators list sort (code / name / % ↑↓) | ✅ |
| Dev tunnel / `allowedHosts` | ✅ |

The tool is **handoff-ready**. Further work is ops, pipeline integration (YAML + `publication` → compile), and UX polish — not core mapping blockers.

---

## Priority overview

| Band | Theme | When |
|------|--------|------|
| **P0** | Ship & validate | Now — before more features |
| **P1** | UX polish | Next dev sprint |
| **P2** | Pipeline & data loop | When ETL consumes `mapping.yaml` |
| **P3** | Indicator & visualization depth | When running Cardinal / building oversight dashboards |
| **P4** | Standards upgrade | When OCDS 1.2 is required |

---

## P0 — Operations & real-world validation

*Goal: someone other than the author can use the tool end-to-end.*

### P0.1 Static deploy (optional)

- [ ] Build `dist/` and host on internal static bucket or private server if needed
- [x] Document `npm run build` and dev tunnel in README
- [ ] Smoke-test: project picker, edit, export, import on hosted URL

**Acceptance:** Shared link opens app; bundled projects load; export downloads work.

### P0.2 Bundle blank OCP template

- [ ] Add `references/OCDS_Mapping_Template_1.1_blank.xlsx` (via `npm run strip-template` once source xlsx is in `references/`)
- [ ] Document in README + [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md)
- [ ] Verify `export_ocp_workbook.py` uses blank template by default on a clean clone

**Acceptance:** New clone can run xlsx export without a filled agency-specific workbook.

### P0.3 Stakeholder mapping exercise (dogfood)

- [ ] Run handoff checklist ([`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) §13) on Blank or imported workbook
- [ ] Second person imports exported Project JSON in a fresh browser
- [ ] Capture friction list → feed P1 backlog

**Acceptance:** Round-trip JSON import/export works; notes filed for any blockers.

---

## P1 — UX polish (low risk, high touch)

### P1.1 Path detail modal in Validation view

- [ ] Reuse `OcdsPathDetailModal` for validation “jump to field” actions (same as Risk Indicators)
- [ ] Keep optional “Open in Mapping Explorer” footer link

**Acceptance:** Fixing validation issues does not require leaving Validation view.

### P1.2 Indicator pack picker (app-level) — partial ✅

*Custom packs are **not** stored on project JSON. Cardinal is always on; optional packs are enabled in the browser.*

- [x] UI to enable/disable custom packs from `public/indicator_packs/catalog.json` (Risk Indicators view)
- [x] Persist choices in localStorage (`indicatorPreferences`)
- [x] Optional feasibility overlay + data profiles from catalog (app-level)
- [ ] Surface pack picker from Overview or a dedicated settings panel (today: Risk Indicators sidebar only)
- [ ] Export enabled pack ids in handoff notes / optional YAML metadata (P2.2)

**Acceptance:** Any project can opt into jurisdiction packs without editing project JSON. *(Shipped for Risk Indicators; polish items remain.)*

### P1.3 New project flow (partial ✅)

- [x] **+ New** in header — name + optional source system; clones blank template to localStorage
- [x] **Delete** for local projects (not built-in `blank`)
- [ ] Indicator pack selection at create time *(superseded — packs are app-level; see P1.2)*
- [ ] Optional import JSON on create (today: import after create)
- [ ] Export new project as `projects/{id}.json` into repo manifest (today: Export → Project JSON download)

**Acceptance:** Agency can start without forking `blank.json` manually. *(Pack picker: P1.2)*

### P1.4 Export all (npm script)

- [ ] `npm run export-all -- blank` → JSON + YAML + xlsx + CSV in `dist/exports/`
- [ ] One-liner documented in [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md)

**Acceptance:** Single command produces full handoff bundle.

### P1.5 Release & publication metadata (view + edit) ✅

*See [Release metadata](#release-metadata--publication-config) below.*

- [x] **Publication config** form: `ocid_prefix`, `publisher`, `license`, `extensions`, `generated` rules, defaults
- [x] Persist in project JSON as `publication_config` (tier B); export in Project JSON + `mapping.yaml`
- [x] **Release envelope** view: filtered General-stage paths with mapping readiness + Path details modal
- [x] Release header JSON preview
- [ ] Link publication config fields to related General-stage paths where applicable (e.g. buyer compile refs ↔ envelope mapping) — optional polish

**Acceptance:** Stakeholder can set publisher + OCID prefix in the app; export includes config for `compile_ocds.py`; release-level OCDS paths are reviewable without browsing the full General tree. *(Compile consumer: P2.4)*

---

## P2 — Pipeline integration (parent repo)

*Goal: mapping work in the explorer drives compiled OCDS and analysis.*

### P2.1 `mapping.yaml` consumer

- [ ] Wire `export_mapping_yaml.py` output into parent `canonical_to_ocds` / compile pipeline
- [ ] Document field mapping: `ocds_mappings` stage → path → `for_mapping`
- [ ] Version field in YAML for schema evolution

**Acceptance:** Changing a mapping in the app → export YAML → compile step picks up new `for_mapping`.

### P2.4 Consume `publication_config` in compile pipeline

- [ ] `compile_ocds.py` reads `publication_config` from exported `mapping.yaml` (fallback: `canonical_to_ocds.yaml`)
- [ ] Replace hardcoded buyer / ocid generation where YAML already documents intent
- [ ] Validate required publication fields before compile

**Acceptance:** Explorer-edited publisher + `ocid_prefix` drive compiled releases without editing repo `config/` separately.

### P2.2 Indicator requirements in YAML export

- [ ] Add optional `indicator_requirements` section (indicator id → paths) from active packs
- [ ] ETL or Cardinal prep can validate compiled releases against required paths

**Acceptance:** YAML lists paths needed for enabled indicators without opening the app.

### P2.3 Regenerate project JSON from xlsx

- [ ] Commit or document source workbook location
- [ ] `npm run build-data` reproducible in CI or documented local step
- [ ] Diff review when template updates

**Acceptance:** Template v0.92+ can refresh reference project without manual JSON surgery.

---

## P3 — Indicator & analysis depth

### P3.1 Custom indicator authoring (in-app)

- [ ] CRUD for custom indicators (like extension proposals): id, name, scope, paths[], description
- [ ] Store in project JSON; export in Project JSON + optional YAML
- [ ] Optional: export as new pack JSON file

**Acceptance:** Country-specific flag defined in UI without editing `indicator_packs/*.json`.

### P3.2 Coverage-driven feasibility

- [ ] Import Cardinal `coverage` output JSON per `data_profile`
- [ ] Derive feasibility (`yes` / `partial` / `no`) from path fill rates instead of hand-maintained `philgeps-feasibility.json`
- [ ] CLI: `scripts/import_coverage_snapshot.py`

**Acceptance:** After compile + coverage run, app shows updated feasibility for that profile.

### P3.3 Align reference docs with packs — partial ✅

- [x] OCP public red-flag CSVs → [`references/OCP_RED_FLAGS_TO_OCDS.md`](../references/OCP_RED_FLAGS_TO_OCDS.md) + `ocp-red-flags.json` (`npm run build-ocp-red-flags`)
- [ ] Generate or validate PhilGEPS `RISK_INDICATOR_MASTER_REFERENCE.md` tables from pack JSON (script or CI check)
- [ ] Reduce drift between PhilGEPS corpus docs and `public/indicator_packs/` Philippines packs

**Acceptance:** Pack JSON is single source of truth; doc is generated or linted. *(OCP catalogue regeneration shipped.)*

### P3.4 Rich in-app reference (indicators & visualizations) — partial ✅

*Goal: mappers and publishers understand **what** each item tracks and **how** it is computed without opening Cardinal or external docs in another tab.*

Pack JSON and the Risk Indicators detail panel include structured reference fields.

**Schema additions (indicator pack JSON):**

| Field | Purpose |
|-------|---------|
| `tracks` | Plain-language signal — what the indicator measures |
| `computation.summary` | One-line formula or rule |
| `computation.steps[]` | Numbered steps (how values are derived at runtime) |
| `computation.thresholds_note` | Optional — method-specific thresholds, filters |
| `interpretation` | What a positive hit / flag means for oversight |
| `limitations` | When incomplete mappings break or bias results |
| `references[]` | `{ label, url }` — collapsed in UI; `docs_url` kept for Cardinal |

- [x] Extend `RiskIndicator` types and pack loader to accept optional reference fields
- [x] Render **What it tracks**, **How it's computed**, **Interpretation**, **Limitations** in Risk Indicators detail (above path table)
- [x] Enrich shipped `cardinal.json` entries
- [x] Enrich custom pack JSON (`philippines-ra9184`, `philippines-procedural`, `philippines-wsf`)
- [ ] Optional: markdown-safe rendering for `computation.steps` (plain strings first)

**Acceptance:** Opening R003 (or a custom PH indicator) shows computation steps and interpretation in-app; external docs link is supplementary. *(Shipped; markdown rendering optional.)*

### P3.5 Visualization packs

*Goal: parallel to indicator packs — optional **visualization** definitions that declare which OCDS paths a chart/view needs, plus mapping readiness. Independent of mapping project (app-level preferences, like custom indicator packs).*

**Concept:** Indicators answer “can we **run** this integrity check?” Visualizations answer “can we **build** this chart/dashboard view?” Both use path requirements; visualizations add aggregation/grain/time-axis metadata.

**Asset layout:**

```
public/
  visualization_packs/
    catalog.json
    ocds-core-dashboards.json      ← starter pack
    philippines-procurement.json ← optional jurisdiction pack
```

**Visualization item shape (draft):**

| Field | Purpose |
|-------|---------|
| `id`, `name`, `chart_type` | Identity + UI badge (`bar`, `line`, `map`, `table`, …) |
| `tracks` | What the view shows (same semantics as indicators) |
| `computation` | Summary, steps, `grain`, `aggregation`, `measure_path`, optional `time_path` |
| `paths[]` | Required/optional OCDS paths (`required`, `note`) — same notation as indicators |
| `linkage_paths[]` | Optional — cross-stage keys (plan → tender → award) |
| `interpretation`, `limitations`, `references[]` | Same as P3.4 |

**Phased delivery:**

| Phase | Scope |
|-------|--------|
| **3.5a** | `visualization_packs/` schema + `catalog.json` + app-level preferences (mirror `indicatorPreferences`) |
| **3.5b** | New nav view **Visualizations** — list + detail; reuse path-readiness engine (`computeIndicatorReadiness` / shared requirement resolver) |
| **3.5c** | Starter pack: 5–8 core OCDS dashboard definitions (e.g. spend by buyer, method mix, award timeline, participation proxy) |
| **3.5d** | Overview dashboard card — viz count + avg path readiness |
| **3.5e** | Cross-links: path required by both indicator R018 and viz X |
| **3.5f** | Optional mock preview from template `example` values (synthetic only — not live ETL) |

- [ ] **3.5a** — `visualizationPacks.ts`, `visualizationPreferences.ts`, `public/visualization_packs/catalog.json`
- [ ] **3.5b** — `VisualizationsView.tsx` (list, filters, detail, Path details modal)
- [ ] **3.5c** — Ship `ocds-core-dashboards.json` with documented `tracks` + `computation`
- [ ] **3.5d** — Overview summary card
- [ ] **3.5e** — Reverse index: path → indicators + visualizations that need it
- [ ] **3.5f** — Example-value preview charts (defer until 3.5b–c stable)
- [ ] P2.2 extension: optional `visualization_requirements` in exported YAML

**Explicitly out of scope for visualization packs:** full charting library on real corpus data (belongs in publication/BI pipeline); storing viz pack ids on project JSON.

**Acceptance:** User enables a visualization pack in-app; Visualizations view shows each chart’s path readiness and in-app computation reference; no project rebuild required to add a new viz JSON file + catalog entry.

*See [Analytics packs (design notes)](#analytics-packs-design-notes) below.*

---

## P4 — Standards & platform

### P4.1 OCDS 1.2 reference pin

- [ ] New tier-A `ocds_reference_1_2.json` or version switch in project metadata
- [ ] Project picker / metadata `ocds_version`
- [ ] Migration notes from 1.1.5 mappings

**Acceptance:** Project can target 1.2 field tree when OCP template is available.

### P4.2 Multi-user / server-backed projects (optional)

- [ ] Only if static + JSON handoff is insufficient
- [ ] Small API or git-backed project store; out of scope for static v1

**Acceptance:** TBD — defer until stakeholder workflow requires it.

---

## Explicitly not planned

| Item | Reason |
|------|--------|
| In-browser xlsx import/generation | Template size, formulas, openpyxl; CLI documented in [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md) |
| Separate DB schema layer in explorer | Elements-only model matches OCP workbook |
| Running Cardinal inside the app | Analysis pipeline concern; app supplies path requirements only |
| Live charts on published OCDS corpus in explorer | Visualization packs document requirements + readiness; rendering belongs in BI / publication stack (optional mock from template `example` values only — P3.5f) |

---

## Suggested order (if unsure)

1. **P0.1 + P0.2** — deploy + template (unblocks others)
2. **P0.3** — dogfood exercise
3. **P1.1** — path modal in Validation (small, reuses existing component)
4. **P1.2** — pack picker (unblocks custom jurisdiction packs)
5. **P2.1 + P2.4** — YAML + publication config → compile pipeline (closes the mapping loop)
6. **P1.5** — release metadata UI (can parallel P2 once schema is agreed)
7. **P3.4** — rich in-app indicator reference (low dependency; improves handoff immediately)
8. **P3.5a–c** — visualization packs + Visualizations view + starter pack
9. Everything else as demand appears

---

## Release metadata & publication config

OCDS “release metadata” spans **two concerns** in this tool. They should not be conflated.

### 1. Release envelope fields (per-release OCDS paths) ✅

Fields on every OCDS release: `ocid`, `id`, `date`, `tag`, `initiationType`, `buyer`, `parties`, `language`, etc.

**Implemented:** Dashboard → **Release & publication** — envelope table (10 curated paths), required-field readiness %, **Path details** modal. Uses existing `mapping_edits` on `general::*` keys.

### 2. Publication / compile config (publisher-wide) ✅ in app / ⏳ in compile pipeline

Settings that apply across all compiled releases but are **not** row-by-row template mappings. Example fields:

| Config block | Example | Used by |
|--------------|---------|---------|
| `ocid_prefix` | `ocds-myagency` | OCID generation |
| `extensions` | bid, lots extension URLs | Release `extensions` array |
| `generated.ocid.from` | `[award_reference_no, procuring_entity]` | Compiler logic |
| `generated.release_id` | `record_id` | Release `id` |
| `generated.release_date.prefer` | `[award_published_date, published_date, …]` | Release `date` |
| `buyer` / defaults | name, id, currency, language | Top-level release + blocks |

The OCP field-level mapping template does **not** dedicate a sheet to these; they belong in a separate **publication config** tier on the project.

**Project shape (implemented):**

```json
{
  "publication_config": {
    "ocid_prefix": "ocds-myagency",
    "publisher": {
      "name": "Philippine Government Electronic Procurement System",
      "scheme": "PH-GEPS",
      "uid": "…"
    },
    "license": "https://…",
    "publicationPolicy": "https://…",
    "extensions": ["https://…/ocds_bid_extension/…"],
    "defaults": {
      "currency": "PHP",
      "classification_scheme": "UNSPSC",
      "language": "en",
      "initiationType": "tender"
    },
    "generated": {
      "ocid": { "from": ["award_reference_no", "procuring_entity"] },
      "release_id": "record_id",
      "release_date": { "prefer": ["award_published_date", "published_date", "award_date"] }
    },
    "planning_triggers": ["app_item_id", "app_total_estimated_budget"]
  }
}
```

`generated.*` values reference **canonical / data element keys** (or `for_mapping` labels), not OCDS paths — link to Data Elements via autocomplete.

**UI (done):** **Release & publication** view — form for publication config + envelope table + header preview.

**Export (done):** `publication_config` in Project JSON and `mapping.yaml` under `publication:`.

**Remaining:** P2.4 — `compile_ocds.py` reads `publication` from exported YAML (fallback: `canonical_to_ocds.yaml`).

---

## Analytics packs (design notes)

Risk **indicators** and **visualizations** are complementary but should share patterns:

| | Indicators | Visualizations |
|--|------------|----------------|
| Question | Can we run this integrity check? | Can we build this chart/view? |
| Runtime output | Flag / score per OCID (or entity) | Aggregates, time series, distributions |
| Pack location | `public/indicator_packs/` | `public/visualization_packs/` |
| Activation | App-level preferences (not project JSON) | Same |
| Readiness engine | Required OCDS paths mapped in template | Same core logic; viz may add `grain`, `time_path`, `linkage_paths` |

**Shared documentation block (P3.4 + P3.5):** `tracks`, `computation`, `interpretation`, `limitations`, `references` — rendered in detail panels so users rarely need external docs.

**UI placement:** new **Visualizations** nav item (parallel to Risk Indicators); optional later merge into a single **Analytics** hub with tabs.

**Example visualization JSON (illustrative):**

```json
{
  "id": "award-value-by-buyer",
  "name": "Award value by procuring entity",
  "chart_type": "bar",
  "tracks": "Total contract award amounts grouped by buyer.",
  "computation": {
    "summary": "Sum awards/value/amount per buyer/id.",
    "steps": [
      "Filter releases with active awards.",
      "Group by buyer/id.",
      "Sum awards/value/amount (same currency)."
    ],
    "grain": "buyer",
    "aggregation": "sum",
    "measure_path": "/awards/value/amount"
  },
  "paths": [
    { "path": "/awards/value/amount", "required": true },
    { "path": "/awards/value/currency", "required": true },
    { "path": "/buyer/id", "required": true },
    { "path": "/buyer/name", "required": false, "note": "Chart label" }
  ],
  "interpretation": "Shows spending concentration across agencies.",
  "limitations": "Requires award-stage data in published releases."
}
```

---

## Related docs

| Document | Role |
|----------|------|
| [`GENERALIZATION_PLAN.md`](GENERALIZATION_PLAN.md) | Original design & completed phases |
| [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) | Record of what shipped |
| [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md) | Export / import handoff |
| [`STREAMLINE_RECOMMENDATIONS.md`](STREAMLINE_RECOMMENDATIONS.md) | Mapping from scratch — workflow & scoping |
| [`samples/philgeps/docs/RISK_INDICATOR_MASTER_REFERENCE.md`](../samples/philgeps/docs/RISK_INDICATOR_MASTER_REFERENCE.md) | PhilGEPS indicator corpus reference |
| [`../references/OCP_RED_FLAGS_TO_OCDS.md`](../references/OCP_RED_FLAGS_TO_OCDS.md) | OCP red-flag catalogue (R001–R073) |
| [`../public/projects/README.md`](../public/projects/README.md) | Bundled project conventions |
