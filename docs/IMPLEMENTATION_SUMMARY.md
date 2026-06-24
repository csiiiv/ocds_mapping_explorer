# OCDS Mapping Explorer — Implementation Summary

**Status:** v1 complete (Phases 1–4) + post-v1 export, indicator packs, release & publication, UX polish  
**Last updated:** June 23, 2026  
**Package:** `ocds_mapping_explorer/` — standalone OCDS 1.1 field-level mapping tool

This document records what was built during generalization into a **general OCDS 1.1 field-level mapping tool**, aligned with the [OCP mapping template](https://www.open-contracting.org/resources/ocds-1-1-mapping-template-guidance/).

For the original design rationale and deferred items, see [`GENERALIZATION_PLAN.md`](GENERALIZATION_PLAN.md).

---

## 1. What it is now

A browser-based **mapping studio** for:

- Browsing the OCDS 1.1.5 field tree by procurement stage
- Maintaining a **source inventory** (data sources + data elements, sheets 1–2)
- Linking OCDS fields to source labels (`for_mapping`)
- Validating mapping quality before handoff
- Exporting portable **Project JSON**, **mapping.yaml**, CSV, and OCP **xlsx** (CLI) for stakeholders or downstream ETL
- Reviewing **risk indicators** (Cardinal + optional jurisdiction packs) against mapping readiness and data-profile feasibility
- Configuring **release envelope** mappings and **publication** settings (OCID prefix, publisher, compile rules) for downstream pipelines

**Bundled projects:**

| Project | File | Purpose |
|---------|------|---------|
| Blank | `public/projects/blank.json` | Default — new mapping exercise |
| mPhilGEPS | `public/projects/mphilgeps.json` | PS-DBM v0.91 filled mapping |
| PhilGEPS 1.5 | `public/projects/philgeps-1.5.json` | PhilGEPS 1.5 filled mapping |

Corpus analysis, indicator reference docs, and optional payloads: `samples/philgeps/`. See [`samples/README.md`](../samples/README.md) when present.

**OCDS reference (tier A):** `public/ocds_reference.json` — shared across all projects.

---

## 2. Architecture

```text
┌─────────────────────────────────────┐
│  A. OCDS reference (bundled)         │  ocds_reference.json
├─────────────────────────────────────┤
│  B. Source inventory (per project)   │  data_sources, data_elements
│     + extension_proposals (optional) │
│     + publication_config (optional)  │  publisher / OCID / compile rules
├─────────────────────────────────────┤
│  C. Mappings (per project)           │  mapping_edits: stage::path → edits
└─────────────────────────────────────┘
```

**Runtime merge:** `ocds_reference.json` + selected `projects/{id}.json` + browser `localStorage` overlays → live `MappingDocument` in the app.

**localStorage keys (per project):**

| Key | Contents |
|-----|----------|
| `ocds-mapping-active-project-v1` | Last selected project id |
| `ocds-mapping-edits-{id}-v1` | Tier C mapping edits |
| `ocds-mapping-inventory-{id}-v1` | Tier B inventory overlay (`data_sources`, `data_elements`, `extension_proposals`, `publication_config`; `is_dirty` after user CRUD) |
| `ocds-mapping-local-registry-v1` | Manifest of browser-local projects |
| `ocds-mapping-local-project-{id}-v1` | Full project JSON blob for local (non-bundled) projects |

---

## 3. Phases completed

### Phase 1 — Foundation

- Three-tier data model (`ocds_reference.json` + per-project JSON)
- `scripts/build_project.py` — generates reference + `blank.json`
- `scripts/strip_template.py` — blank OCP workbook from filled template
- Project picker, generic branding, versioned storage keys
- [`GENERALIZATION_PLAN.md`](GENERALIZATION_PLAN.md) as living roadmap

### Phase 2 — Import / export

- Parser refactor: `parse_inventory`, `parse_mappings`, `extract_mapping_edits`
- CLI: `import_ocp_workbook.py` (scopes: full, inventory, mappings + merge modes)
- CLI: `export_project.py` (JSON, CSV, `--yaml`, `--xlsx`)
- CLI: `export_ocp_workbook.py`, `export_mapping_yaml.py`, shared `ocp_export.py`
- In-app **Import** / **Export** modals (project JSON, edits JSON, merged view, CSV, mapping.yaml)
- Export modal: OCP xlsx CLI guide + downloadable [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md)
- Import provenance in `metadata.imports[]`

### Phase 3 — Source authoring

- **Data element wizard** (3 steps: source → field → details)
- **Data source form** (add / edit lifecycle coverage)
- CRUD on Data Sources and Data Elements tabs
- Inventory persistence with project-switch safeguards (no cross-project bleed)
- “+ Add new” in mapping explorer data-element picker

### Phase 4 — Quality & handoff

- **Validation panel** — six check types, filters, jump-to-field
- **Auto-link** from `mapping_details` → empty OCDS fields (batch, undoable)
- **Source-first mapping** — Data Elements → Map → OCDS path picker
- **Extension field proposals** — draft new extension paths, export in project JSON
- **Data quality polish:**
  - Excel `()` placeholder rows excluded from validation and hidden by default in UI
  - `scripts/clean_project_placeholders.py` + `npm run clean-placeholders`
  - Orphan warnings only for `publish=Yes` elements

### Post-v1 — Indicator packs & path detail modal

- **Indicator packs** — definitions in `public/indicator_packs/*.json` (Cardinal + Philippines custom packs)
- **App-level preferences** — custom packs and feasibility overlay in browser `localStorage` (`indicatorPreferences`); not stored on project JSON
- **Risk Indicators view** — in-app reference (`tracks`, `computation`, …); mapping readiness computed live
- **Welcome guide** — first-visit modal + header **Guide** button
- **`OcdsPathDetailModal`** — path details from Risk Indicators (and Release & publication) reuse `DetailPanel` without leaving the view

### Post-v1 — Release & publication

- **`PublicationView`** — Dashboard nav item combining:
  - **Release envelope** — curated General-stage paths (`ocid`, `id`, `date`, `tag`, …) with readiness % and Path details modal
  - **Publication settings** — form for `publication_config` (OCID prefix, publisher, license, extensions, `generated` rules, defaults, buyer compile refs)
  - **Release header preview** — illustrative JSON from config + mapped examples
- **`publication_config`** on project JSON (tier B); optional per-project compile settings
- Export in Project JSON + `mapping.yaml` under `publication:` (in-app + `ocp_export.py`)
- Libraries: `src/lib/publicationConfig.ts`, `src/lib/releaseEnvelope.ts`

### Post-v1 — Overview dashboard & explorer UX

- **`OverviewDashboard`** — project hub with clickable summary cards for all Dashboard views (explorer, publication, indicators, validation) and Reference data (sources, elements, schema, extensions); stage coverage bars below
- **Mapping Explorer tree** — **Expand all** / **Collapse all** toolbar (disabled while search or status filter is active; resets on stage change)
- **Leaf-only mapping** — mappings apply to leaf row types only (`field`, `required_field`, `extension_field`, `additional_field`); container rows (`span`, `ref_span`, …) are navigational structure with read-only detail guidance
- **Coverage stats** — leaf fields only (aligned with mappable rows in UI and `excel_to_json_mapping.py`)
- **`extension_intro` rows** — extension block headers from OCP template (e.g. “Lots: A tender process…”) parsed as non-path intros, not fake OCDS paths

### Post-v1 — Local projects & inventory lifecycle

- **Create project** — header **+ New** → `CreateProjectModal`; clones blank template into localStorage (`src/lib/localProjects.ts`)
- **Delete project** — removes local projects and their edits/inventory overlays (built-in `blank` cannot be deleted)
- **Delete data source / data element** — `src/lib/inventoryDelete.ts` previews linked mapping impact; delete clears `mapping_edits` that referenced removed inventory (`mergeFieldEdit` treats explicit `mapping: ""` as clearing base-document mappings)
- **Data element wizard** — section/table field suggestions from existing elements per selected data source (`dataElementSectionTables`)

### Post-v1 — Risk indicator path matching

- **Cardinal `[]` notation** — `normalizeOcdsPath` strips array brackets; `resolveIndicatorPaths` uses exact normalized path match against project mapping index
- **Related mapped paths** — UI hints when an indicator path is unmapped but a related OCDS path is mapped (suffix / structural siblings)
- **`dataElementsForIndicator()`** — shared path suffix matching for linking indicators to inventory rows

---

## 4. App views

| View | Key capabilities |
|------|------------------|
| **Overview** | Dashboard hub cards (all views + reference data stats), stage coverage bars, navigation into any view |
| **Mapping Explorer** | OCDS tree by stage, search, status filter, expand/collapse all, leaf-only inline edit, data-element picker |
| **Risk Indicators** | Pack-based indicators, path readiness %, data-profile feasibility, related-path hints, **Path details** modal (inline edit) |
| **Release & publication** | Release envelope mapping table + publication config form + header preview |
| **Validation** | Errors / warnings / info, category filters, auto-link action, jump to field in explorer |
| **Data Sources** | Table + add / edit / delete (cascades to elements, clears mappings) |
| **Data Elements** | Grouped table, wizard (section/table suggestions), **Map** (source-first), placeholder toggle, delete |
| **OCDS Schema** | Core schema catalogue |
| **OCDS Extensions** | Extension proposals + extension schema reference |

---

## 5. Mapping workflows

| Mode | Flow | Entry point |
|------|------|-------------|
| **OCDS-first** | OCDS path → pick `for_mapping` label | Mapping Explorer → Edit → Browse |
| **Source-first** | Data element → pick OCDS path | Data Elements → **Map** or element detail |

Both write to the same `mapping_edits` store.

**Auto-link:** Validation → **Apply auto-links** fills empty OCDS fields from element `mapping_details` hints.

**Leaf-only mapping:** Only leaf row types accept `for_mapping` values. Container rows (object spans, party refs) group the tree; map the child fields beneath them. One inventory row can be referenced from multiple OCDS paths via the same `for_mapping` label.

---

## 6. Validation rules (implemented)

| Check | Severity | Notes |
|-------|----------|-------|
| OCDS `for_mapping` with no matching data element | Error | |
| Duplicate `short_name` (data sources) | Error | |
| Duplicate element `key` | Error | Placeholders excluded |
| Required OCDS field unmapped | Warning | `required_field` rows |
| `mapping_details` path not in reference | Warning | |
| Orphan data element (`publish=Yes`, never referenced) | Warning | Skips placeholders, No, blank publish |
| Template `()` placeholder rows | — | Excluded from checks; run `npm run clean-placeholders` on filled projects |

---

## 7. Project JSON shape (export)

```json
{
  "metadata": {
    "project_id": "blank",
    "name": "Blank project",
    "source_system": "",
    "ocds_version": "1.1.5",
    "indicator_packs": ["cardinal"],
    "data_profiles": [],
    "imports": []
  },
  "data_sources": { "columns": [], "rows": [] },
  "data_elements": { "columns": [], "column_groups": [], "rows": [] },
  "mapping_edits": { "tender::tender/id": { "mapping": "Tenders (Tender ID)" } },
  "data_element_additions": [],
  "extension_proposals": [],
  "publication_config": {
    "version": "1",
    "ocid_prefix": "ocds-myagency",
    "publisher": { "name": "…", "scheme": "", "uid": "", "uri": "" },
    "extensions": [],
    "defaults": { "currency": "PHP", "language": "en" },
    "generated": { "ocid": { "from": [] }, "release_id": "", "release_date": { "prefer": [] } },
    "buyer": { "name": "", "id": "" }
  }
}
```

`publication_config` (optional) — publisher-wide compile settings; see **Release & publication** view. Exported in Project JSON and `mapping.yaml` under `publication:`.

| Field | Purpose |
|-------|---------|
| `indicator_packs` | Pack ids to load from `public/indicator_packs/` (default: `["cardinal"]`) |
| `feasibility_pack` | Overlay id for runtime feasibility per `data_profiles` |
| `data_profiles` | Deployment / export shapes for indicator feasibility filters |

**Extension proposal fields:** `id`, `extension`, `path`, `title`, `description`, `data_type`, `for_mapping`, `status` (`draft` | `proposed`), `notes`, timestamps.

---

## 8. Risk indicator packs

Indicator definitions are **data**, not app code. The app loads packs at runtime and merges them per project.

```text
public/indicator_packs/
├── cardinal.json              # R003, R018, … — OCDS path requirements
```

Jurisdiction-specific packs can be added under `public/indicator_packs/` or shipped as optional samples under `samples/`.

| Concern | Source | Generic? |
|---------|--------|----------|
| OCDS paths required | Indicator pack JSON | Yes (Cardinal pack is universal) |
| Mapping readiness % | Computed from current project | Yes |
| Runtime feasibility | `feasibility_pack` overlay + `data_profiles` | Per deployment (optional sample packs) |

From **Risk Indicators → Path details**, the shared `OcdsPathDetailModal` wraps `DetailPanel` so users can edit mappings inline. Validation still jumps to Mapping Explorer (same modal pattern optional later).

Corpus analysis for optional samples may live under `samples/`; they do not drive app logic.

---

## 8b. Release & publication config

Two concerns, one view:

| Concern | What | Where stored |
|---------|------|--------------|
| **Release envelope** | Per-release OCDS field mappings (`ocid`, `id`, `date`, …) | Tier C — `general::*` in `mapping_edits` |
| **Publication config** | Publisher-wide compile settings (not OCP yellow cells) | Tier B — `publication_config` on project JSON |

**Publication config fields:** `ocid_prefix`, `publisher`, `license`, `publicationPolicy`, `extensions[]`, `defaults`, `generated` (ocid / release_id / release_date rules), `planning_triggers[]`, `buyer` compile refs.

**YAML export** (`mapping.yaml`):

```yaml
publication:
  ocid_prefix: ocds-myagency
  publisher: { name: "…" }
  generated:
    ocid: { from: [award_reference_no, procuring_entity] }
    release_id: record_id
```

**Not yet wired:** parent repo `compile_ocds.py` reading `publication` from YAML (see [`PLANNED_IMPLEMENTATIONS.md`](PLANNED_IMPLEMENTATIONS.md) P2.4).

---

## 9. Scripts & npm commands

```bash
pip install -r requirements.txt
npm install

npm run build-data          # ocds_reference.json + projects/*.json (needs xlsx in references/)
npm run clean-placeholders  # strip () template rows from project JSON
npm run strip-template      # blank OCP xlsx (needs openpyxl + source xlsx)
npm run dev                 # local dev server
npm run build               # production static site → dist/

npm run export-project      # JSON / CSV / --yaml / --xlsx
npm run export-xlsx         # OCP workbook (needs template)
npm run export-yaml         # mapping.yaml for ETL

# CLI import / export
python scripts/import_ocp_workbook.py -i workbook.xlsx -p public/projects/blank.json --scope full --merge merge
python scripts/export_project.py -p public/projects/blank.json --yaml dist/mapping.yaml --xlsx dist/mapping.xlsx
python scripts/export_ocp_workbook.py -p exports/ocds-mapping-project-blank.json -o exports/mapping.xlsx
```

---

## 10. Source code map

```text
src/
├── App.tsx                      # Shell, routing, all views
├── useMappingDoc.ts             # Project load, edits, inventory CRUD, auto-link batch, local projects
├── lib/
│   ├── project.ts               # Types, merge reference + project
│   ├── localProjects.ts         # Browser-local project registry + blobs
│   ├── inventory.ts             # Placeholder detection, localStorage tier B
│   ├── inventoryDelete.ts       # Delete impact preview, mapping-clear patches
│   ├── fieldEdits.ts            # mergeFieldEdit (explicit mapping clear)
│   ├── mappingNodes.ts          # Mappable leaf vs container row types
│   ├── importExport.ts          # CSV + project JSON import/export
│   ├── exportMappingYaml.ts     # mapping.yaml builder (in-browser)
│   ├── exportGuide.ts           # CLI commands + export guide markdown
│   ├── validation.ts            # runValidation()
│   ├── autoLink.ts              # mapping_details → mapping proposals
│   ├── sourceMapping.ts         # Source-first path list + reverse links
│   ├── extensionProposals.ts    # Extension proposal types + storage helpers
│   ├── dataElements.ts          # Index, filter, placeholder helpers, section/table suggestions
│   ├── indicatorMapping.ts      # Risk indicator path resolution + readiness
│   ├── indicatorPacks.ts        # Load packs from public/indicator_packs/
│   ├── publicationConfig.ts     # publication_config types + export helpers
│   ├── releaseEnvelope.ts       # Release envelope paths + readiness
│   └── riskIndicators.ts        # Indicator types (definitions in JSON)
└── components/
    ├── OverviewDashboard.tsx      # Project hub — all view summary cards
    ├── PublicationView.tsx        # Release envelope + publication settings
    ├── DataElementWizard.tsx
    ├── DataSourceFormModal.tsx
    ├── CreateProjectModal.tsx     # New local project
    ├── OcdsPathPickerModal.tsx  # Source-first
    ├── OcdsPathDetailModal.tsx  # Reusable path detail (Risk Indicators, etc.)
    ├── DetailPanel.tsx          # Path detail body (mapping edit, linked element)
    ├── TreeView.tsx             # Explorer tree + expand/collapse all
    ├── ValidationView.tsx
    ├── ExtensionsView.tsx       # Proposals + schema
    ├── RiskIndicatorsView.tsx
    ├── ImportExportModal.tsx
    └── …

scripts/
├── excel_to_json_mapping.py     # Full parse + build helpers
├── build_project.py
├── import_ocp_workbook.py
├── export_project.py
├── export_ocp_workbook.py
├── export_mapping_yaml.py
├── ocp_export.py
├── ocp_project_io.py
├── strip_template.py
└── clean_project_placeholders.py
```

---

## 11. Documentation bundled

| Document | Purpose |
|----------|---------|
| [`GENERALIZATION_PLAN.md`](GENERALIZATION_PLAN.md) | Design plan, phases, deferred work |
| [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) | This file — what was built |
| [`PLANNED_IMPLEMENTATIONS.md`](PLANNED_IMPLEMENTATIONS.md) | Forward backlog (P0–P4) |
| [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md) | Handoff: JSON, YAML, xlsx CLI, re-import |
| [`../samples/README.md`](../samples/README.md) | Optional filled sample projects |

---

## 12. Known limitations & next steps

| Item | Status |
|------|--------|
| OCP xlsx export / write-back | ✅ CLI — `export_ocp_workbook.py`; Export modal has step-by-step guide |
| In-browser xlsx upload | Not planned — use CLI import |
| `mapping.yaml` ETL export | ✅ In-app download + `export_mapping_yaml.py` |
| Indicator packs | ✅ `public/indicator_packs/` + per-project metadata |
| Indicator pack picker UI | Optional later — edit project JSON today |
| Custom indicator authoring in-app | Optional later |
| Release & publication (envelope + config) | ✅ In-app; YAML export; compile consumer P2.4 |
| Path detail modal in Validation | Optional — P1.1; Risk Indicators + Release & publication use modal today |
| Overview dashboard hub | ✅ All view summary cards + stage coverage |
| Local project create/delete | ✅ Browser localStorage; export via Project JSON |
| Leaf-only mapping UX | ✅ Containers navigational; coverage counts leaves |
| Tree expand/collapse all | ✅ Mapping Explorer toolbar |
| OCDS 1.2 reference pin | Optional later |
| Regenerate projects from xlsx | Requires OCP workbook in `references/` |
| Static deploy / blank template in `references/` | See [`PLANNED_IMPLEMENTATIONS.md`](PLANNED_IMPLEMENTATIONS.md) P0 |

---

## 13. Handoff checklist

For a new agency mapping exercise:

1. Switch to **Blank project** or **+ New** local project (or import stakeholder workbook via CLI)
2. Add **data sources** and **data elements** (wizard or CSV import)
3. Map **leaf fields** — **OCDS-first** or **source-first**; use Overview to jump between views
4. Run **Validation** → fix errors → optional **Apply auto-links**
5. **Release & publication** → map envelope fields + save publication config
6. Review **Risk Indicators** → **Path details** to fill gaps for target flags
7. **Export → Project JSON** (+ **mapping.yaml** or CSV; xlsx via CLI per [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md))
8. Share JSON; recipient opens same app version and imports project JSON
