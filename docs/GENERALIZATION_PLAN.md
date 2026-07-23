# OCDS Mapping Explorer — Generalization Plan

**Status:** v1 complete (Phases 1–4) + post-v1 export, indicator packs, UX polish  
**Last updated:** July 23, 2026  
**Implementation record:** [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md)  
**Forward backlog:** [`PLANNED_IMPLEMENTATIONS.md`](PLANNED_IMPLEMENTATIONS.md)

**Goal:** A **general tool** for mapping any source schema to OCDS 1.1, aligned with the [OCP field-level mapping template](https://www.open-contracting.org/resources/ocds-1-1-mapping-template-guidance/).

**Design principle for v1:** **Elements-only** source modelling — match the OCP workbook (`1. Data Sources` + `2. Data Elements`), not a separate DB schema layer.

---

## 1. Three-tier data model

| Tier | Contents | Owner | Import / export |
|------|----------|-------|-----------------|
| **A. OCDS reference** | Schema 1.1.5, extension catalogues, stage tree structure (paths, titles, descriptions) | OCP / public | **Bundled** — not re-imported per project |
| **B. Source inventory** | `data_sources` + `data_elements` + optional `extension_proposals` | Publisher / stakeholder | **Primary** import/export surface |
| **C. Mappings** | `mapping`, `example`, `notes` on OCDS stage fields | Publisher / stakeholder | JSON patch, CSV, CLI workbook import |

A filled OCP workbook = A + B + C in one xlsx. This tool = **A pinned**, **B + C per project**.

```text
┌─────────────────────────────────────┐
│  A. OCDS reference (versioned)        │  public/ocds_reference.json
├─────────────────────────────────────┤
│  B. Source inventory (per project)  │  data_sources, data_elements,
│                                       │  extension_proposals
├─────────────────────────────────────┤
│  C. Mappings (per project)          │  stage::path → mapping edits
└─────────────────────────────────────┘
```

---

## 2. OCDS schema as public reference

- Ship `public/ocds_reference.json` pinned to **OCDS 1.1.5**.
- Explorer tree, Schema tab, and Extensions tab read from **A**, not from user uploads.
- Stage sheets from the OCP Excel template define the tree structure (not live JSON Schema extraction). The template is schema-aligned but not exhaustive vs the full core schema catalogue.
- **Leaf-only mapping:** coverage stats and editable mappings count mappable leaf rows (`field`, `required_field`, `extension_field`, `additional_field`). Container rows (`span`, `ref_span`, `extension_span`, `required_span`) and structural headers (`section`, `subtitle`, `extension_intro`) are **selectable for read-only detail** (title, description, guidance) but not mapped.
- On workbook import: validate template family / version; **do not** replace bundled schema with user file unless version mismatch (warn).
- Stage sheets from user file contribute **only yellow-cell values** (tier C), merged into `mapping_edits`.

---

## 3. Projects

Each mapping exercise is a **project**:

```ts
interface MappingProject {
  metadata: {
    project_id: string;
    name: string;
    source_system?: string;
    ocds_version: "1.1.5";
    template_version?: string;
    created_at: string;
    updated_at: string;
    imports?: ImportRecord[];
  };
  data_sources: { columns: string[]; rows: DataSourceRow[] };
  data_elements: { columns; column_groups; rows: DataElementRow[] };
  mapping_edits: Record<string, FieldEdit>;  // `${stage}::${path}`
  data_element_additions?: DataElementRow[];
  extension_proposals?: ExtensionProposal[];
  publication_config?: PublicationConfig;  // OCID prefix, publisher, compile rules
}
```

**Shipped examples:**

| Project | Path | Purpose |
|---------|------|---------|
| Blank | `projects/blank.json` | Default for new publishers |
| mPhilGEPS | `projects/mphilgeps.json` | PS-DBM v0.91 filled mapping |
| PhilGEPS 1.5 | `projects/philgeps-1.5.json` | PhilGEPS 1.5 filled mapping |

Corpus analysis, indicator reference docs, and archival payloads: `samples/philgeps/`. Regenerate bundled PhilGEPS projects with `npm run build-philgeps-projects`.

App: project picker; **+ New** creates browser-local projects from blank template; localStorage keyed by `project_id` (edits + inventory overlays + local project blobs).

---

## 4. Blank OCP template

**Approach:** Strip filled data from OCP template — do not rebuild structure.

| Sheet | Clear | Keep |
|-------|-------|------|
| `(OCDS) 1–6` | `mapping`, `example`, `notes` | Path tree, titles, required flags |
| `2. Data Elements` | Data rows (optional: 1 example row) | Headers, column groups |
| `1. Data Sources` | Data rows (optional: 1 example row) | Headers |
| `OCDS Schema` / `Extensions` | — | Full reference (also extracted to tier A) |
| `Field Level Mapping Overview` | — | Instructions |

**Scripts:**

- `scripts/strip_template.py` → blank xlsx (requires source workbook + openpyxl)
- `scripts/build_project.py` → `projects/blank.json`
- `scripts/clean_project_placeholders.py` → remove `()` template slots from project JSON

---

## 5. Import

### 5.1 Scopes (UI + CLI)

| Scope | Reads | Use case |
|-------|-------|----------|
| **full** | Sheets 1, 2, OCDS 1–6 mappings | Stakeholder filled OCP workbook offline |
| **inventory** | Sheets 1 + 2 only | Data dictionary first; mapping later |
| **mappings** | OCDS 1–6 yellow columns only | Inventory already in app |
| **data_elements_csv** | CSV subset of sheet 2 | Bulk from internal dictionary |
| **data_sources_csv** | CSV subset of sheet 1 | Bulk source list |

### 5.2 Merge modes

- **replace** — wipe target tier, load file
- **merge** — upsert by keys:
  - Data sources: `short_name`
  - Data elements: `key` = `{section_table}.{data_element}` (lowercase)
  - Mappings: `${stage}::${path}`

### 5.3 Post-import

- Rebuild data-element index for picker
- Record `metadata.imports[]` (filename, scope, date, counts)
- Optional: **Apply auto-links** from `mapping_details` (Validation panel)

### 5.4 Parsing

- `excel_to_json_mapping.py`: `parse_inventory`, `parse_mappings`, `build_ocds_reference`, `build_project_payload`
- **CLI:** `import_ocp_workbook.py`
- **In-app:** Import modal (JSON + CSV); xlsx via CLI only

---

## 6. Export (v1 handoff)

| Export | Format | Status |
|--------|--------|--------|
| Full project | JSON | ✅ In-app + CLI |
| Mappings only | JSON patch | ✅ In-app |
| Merged OCDS view | JSON | ✅ In-app |
| Source inventory | CSV | ✅ In-app + CLI |
| ETL mapping | YAML (`mapping.yaml`) | ✅ In-app + CLI (`ocds_mappings` + optional `publication:`) |
| OCP workbook | xlsx | ✅ CLI only (+ in-app export guide) |

See [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md) for handoff steps. In-browser xlsx generation/import intentionally out of scope (template size + openpyxl).

**YAML sections:** `meta`, `data_elements`, `ocds_mappings`, optional `publication` (from `publication_config`), optional `extension_proposals`.

**CSV columns (data elements):** `for_mapping`, `data_source`, `section_table`, `data_element`, `publish`, `example`, `description`, `data_type`, `notes`, `mapped`, `mapping_details`

---

## 7. Add data element wizard ✅

**Elements-only CRUD** on tier B.

### Wizard steps

1. Data source — select existing or add new
2. Section / table + field name — **datalist suggestions** from existing elements for the selected source
3. For mapping label (auto: `{Section} ({Field})`) + optional metadata + `mapping_details`

### UI entry points

- **Data Elements** tab — `+ Add element`
- **Mapping Explorer** picker — `+ Add new`
- **Data Sources** tab — `+ Add source`
- **Delete** — data sources and elements with impact preview; clears linked OCDS mappings

Persisted in tier B localStorage overlay + `data_element_additions` on export.

---

## 8. UI generalization ✅

| Change | From | To |
|--------|------|-----|
| Title | mPhilGEPS · OCDS Mapping Explorer | OCDS Mapping Explorer |
| Data load | Fixed monolithic JSON | Project picker + `projects/*.json` + `ocds_reference.json` |
| localStorage | `mphilegeps-mapping-edits-v1` | `ocds-mapping-*-{projectId}-v1` |
| Copy | mPhilGEPS source field | Source data element |
| Risk indicators | Pack-based | `public/indicator_packs/` + **app-level** browser preferences (`indicatorPreferences`) |
| Path detail UX | Explorer-only | **`OcdsPathDetailModal`** — inline edit from Risk Indicators, Release & publication |
| Overview | Stage coverage only | **Dashboard hub** — summary cards for all views + reference data |
| Explorer tree | Per-node chevrons | **Expand all / Collapse all** toolbar; structure rows selectable (read-only detail) |

---

## 8b. Risk indicator packs ✅

Indicators are **portable JSON packs**, not hardcoded per data source.

```text
public/indicator_packs/
├── cardinal.json
├── catalog.json
├── ocp-red-flags.json
├── philippines-ra9184.json
├── philippines-procedural.json
├── philippines-wsf.json
└── philgeps-feasibility.json
```

Indicator pack JSON is the source of truth. OCP methodology markdown: `references/OCP_RED_FLAGS_TO_OCDS.md` (from public CSVs). PhilGEPS corpus notes: `samples/philgeps/docs/`.

| Layer | What it answers | Where |
|-------|-----------------|-------|
| OCDS path requirements | What must be mapped? | Pack JSON (`paths[]`); `/ocid` is compile-time, not a Cardinal required path |
| Mapping readiness | Is this project's template ready? | Computed in app |
| Runtime feasibility | Can we run on our published data? | App-level feasibility overlay + `data_profiles` from `catalog.json` |

**Cardinal** is always on. **Custom packs** default to all catalog entries enabled until the user changes checkboxes in **Risk Indicators** (saved in `localStorage` as `ocds-indicator-preferences-v1`). Overlapping ids (e.g. `R003`) keep Cardinal when both packs are enabled. Legacy `indicator_packs` / `feasibility_pack` / `data_profiles` on imported project JSON are stripped on import.

**UI:** Risk Indicators → sort by code / name / % mapped (↑↓); **Path details** opens `OcdsPathDetailModal`. Path matching normalizes Cardinal `[]` array notation; related mapped paths shown when exact indicator path is unmapped.

**Optional later:** pack picker in project settings; custom indicator authoring; same path modal in Validation view; coverage-driven feasibility from Cardinal output.

---

## 8d. Overview dashboard ✅

The **Overview** view is the project hub, not a single-purpose coverage screen.

| Section | Contents |
|---------|----------|
| Project callout | Overall leaf-field coverage, session edit count |
| Dashboard cards | Explorer, Release & publication, Risk Indicators, Validation — click to navigate |
| Stage coverage | Per-procurement-stage bars (opens explorer on that stage) |
| Reference data cards | Data Sources, Data Elements, OCDS Schema, Extensions — counts + navigation |

Replaces the earlier embedded data-sources table on the overview page.

---

## 8c. Release & publication ✅

Publisher-wide settings and release-level field review — not covered by OCP template yellow cells alone.

| Layer | UI | Storage |
|-------|-----|---------|
| Release envelope | Table of General-stage paths + readiness; Path details modal | `mapping_edits` (`general::*`) |
| Publication config | Form (OCID prefix, publisher, extensions, generated rules, defaults) | `publication_config` on project JSON |

Exported in Project JSON and `mapping.yaml` as `publication:`.

**Optional later:** `compile_ocds.py` reads `publication` from YAML (P2.4); link compile buyer refs to envelope mapping in UI.

---

## 9. Mapping workflows ✅

| Mode | Flow | Primary view |
|------|------|--------------|
| **OCDS-first** | OCDS path → pick `for_mapping` | Mapping Explorer |
| **Source-first** | Data element → pick OCDS path | Data Elements → **Map** |

Same project model; different entry points. Auto-link bridges `mapping_details` hints.

---

## 10. Validation ✅

Implemented in **Validation** view (`src/lib/validation.ts`):

| Rule | Severity |
|------|----------|
| `for_mapping` on OCDS field does not resolve to a data element | Error |
| Duplicate `short_name` / element `key` | Error |
| Required OCDS field still unmapped | Warning |
| `mapping_details` path not in OCDS reference | Warning |
| Orphan element (`publish=Yes`, never referenced) | Warning |
| Excel `()` placeholder rows | Excluded (not real inventory) |

Overview shows per-view summary cards and stage coverage; sidebar badges show publication %, indicator count, and validation issue count.

---

## 11. Optional later

- In-browser xlsx upload (WASM) — **not planned** (use CLI; see [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md))
- Custom indicator authoring in-app — optional later
- Path detail modal in Validation view — optional later
- Coverage-driven feasibility (import Cardinal `coverage` JSON) — optional later
- OCDS 1.2 reference pin

**Done (post-v1):** `mapping.yaml` export, OCP xlsx export (`export_ocp_workbook.py` / `ocp_export.py`), indicator packs (app-level prefs + OCP red-flags catalogue), rich in-app indicator reference fields, indicator list sort, selectable structure rows, `OcdsPathDetailModal`, welcome guide, bundled PhilGEPS projects.

---

## 12. Implementation phases

### Phase 1 — Foundation ✅

- [x] This plan document
- [x] Extract `ocds_reference.json` (tier A)
- [x] `strip_template.py` + blank xlsx pipeline
- [x] `build_project.py` — `projects/blank.json`
- [x] Project types + loader
- [x] Project picker UI
- [x] Generic branding / storage keys

### Phase 2 — Import / export ✅

- [x] Refactor parser: `parse_inventory`, `parse_mappings`
- [x] CLI: `import_ocp_workbook.py` (scopes + merge)
- [x] CLI: `export_project.py` (JSON, CSV, `--yaml`, `--xlsx`)
- [x] Header Import / Export in app
- [x] Import provenance in metadata

### Phase 3 — Source authoring ✅

- [x] Data element wizard
- [x] CRUD persistence for tier B
- [x] Data source dialog

### Phase 4 — Quality & handoff ✅

- [x] Validation panel
- [x] Auto-link from `mapping_details`
- [x] Source-first mapping flow
- [x] Extension field proposal UI
- [x] Placeholder row handling + `clean_project_placeholders.py`
- [x] OCP xlsx export — `export_ocp_workbook.py` (CLI + Export modal guide)
- [x] `mapping.yaml` export — in-app + `export_mapping_yaml.py`
- [x] Indicator packs — `public/indicator_packs/` + app-level preferences
- [x] Path detail modal — `OcdsPathDetailModal` from Risk Indicators
- [x] Release & publication — `PublicationView`, `publication_config`, YAML `publication:` export
- [x] Overview dashboard hub — `OverviewDashboard.tsx`
- [x] Local project create/delete — `localProjects.ts`, `CreateProjectModal`
- [x] Inventory delete with mapping cleanup — `inventoryDelete.ts`
- [x] Leaf-only mapping UX — `mappingNodes.ts`, container read-only detail
- [x] Tree expand/collapse all — `TreeView.tsx`
- [x] `extension_intro` parsing — `excel_to_json_mapping.py`

### Post-v1 summary ✅

Export handoff (JSON, CSV, YAML, xlsx CLI), indicator packs, path detail modal, release/publication config, overview hub, and explorer UX polish are complete. See [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md), [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md).

## 13. File layout

```text
ocds_mapping_explorer/
├── docs/
│   ├── GENERALIZATION_PLAN.md          ← this file
│   ├── IMPLEMENTATION_SUMMARY.md       ← what was built (v1 record)
│   ├── PLANNED_IMPLEMENTATIONS.md      ← forward backlog
│   └── EXPORT_GUIDE.md                 ← JSON / YAML / xlsx handoff
├── public/
│   ├── ocds_reference.json             ← tier A (bundled)
│   ├── indicator_packs/                ← risk indicator definitions + catalog.json
│   └── projects/
│       ├── blank.json
│       ├── mphilgeps.json
│       └── philgeps-1.5.json
├── samples/                            ← PhilGEPS corpus notes + archival project.json
│   └── philgeps/docs/
├── references/                         ← OCP xlsx workbooks (incl. PhilGEPS templates)
│   └── OCP_RED_FLAGS_TO_OCDS.md        ← OCP red-flag catalogue markdown
├── scripts/
│   ├── excel_to_json_mapping.py
│   ├── strip_template.py
│   ├── build_project.py
│   ├── apply_philgeps_metadata.py
│   ├── build_ocp_red_flags_pack.py
│   ├── import_ocp_workbook.py
│   ├── export_project.py
│   ├── export_ocp_workbook.py
│   ├── export_mapping_yaml.py
│   ├── ocp_export.py
│   ├── ocp_project_io.py
│   └── clean_project_placeholders.py
└── src/
    ├── useMappingDoc.ts
    ├── lib/
    │   ├── project.ts
    │   ├── localProjects.ts
    │   ├── inventory.ts
    │   ├── inventoryDelete.ts
    │   ├── mappingNodes.ts
    │   ├── importExport.ts
    │   ├── exportMappingYaml.ts
    │   ├── exportGuide.ts
│   ├── indicatorPacks.ts
│   ├── indicatorPreferences.ts
│   ├── publicationConfig.ts
    │   ├── releaseEnvelope.ts
    │   ├── indicatorMapping.ts
    │   ├── riskIndicators.ts
    │   ├── validation.ts
    │   ├── autoLink.ts
    │   ├── sourceMapping.ts
    │   └── extensionProposals.ts
    └── components/
        ├── OverviewDashboard.tsx
        ├── DataElementWizard.tsx
        ├── CreateProjectModal.tsx
        ├── ValidationView.tsx
        ├── TreeView.tsx
        ├── OcdsPathPickerModal.tsx
        ├── OcdsPathDetailModal.tsx
        ├── DetailPanel.tsx
        ├── PublicationView.tsx
        ├── RiskIndicatorsView.tsx
        ├── WelcomeGuideModal.tsx
        ├── ImportExportModal.tsx
        ├── ExtensionsView.tsx
        └── …
```

---

## 14. References

- [OCP OCDS 1.1 mapping template guidance](https://www.open-contracting.org/resources/ocds-1-1-mapping-template-guidance/)
- [OCDS 1.1.5 documentation](https://standard.open-contracting.org/1.1/en/)
- [Cardinal risk indicators](https://cardinal.readthedocs.io/en/latest/cli/indicators/)
- Example workflow: `projects/blank.json` or import Project JSON
