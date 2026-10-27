# OCDS Mapping Explorer

Interactive browser and editor for **OCDS 1.1 field-level mapping** — aligned with the [OCP mapping template](https://www.open-contracting.org/resources/ocds-1-1-mapping-template-guidance/). Map any source system to OCDS paths, maintain a source inventory (sheets 1–2), validate mappings, and export for ETL or stakeholder handoff.

**Live site:** [Open OCDS Mapping Explorer](https://csiiiv.github.io/ocds_mapping_explorer/)

**Private repository** — ships with **blank**, **mPhilGEPS**, and **PhilGEPS 1.5** projects under `public/projects/`, Cardinal + Philippines + OCP red-flag indicator packs, PhilGEPS reference workbooks in `references/`, and corpus notes in `samples/`.

## Quick start

**Prerequisites:** Node.js 18+, Python 3.10+

```bash
pip install -r requirements.txt
npm run build-data    # public/ocds_reference.json + public/projects/blank.json (needs xlsx in references/)

npm install
npm run dev
```

Open http://localhost:5173 — start from the **Blank project**, open a bundled PhilGEPS project, create a **+ New** local project, or import a saved Project JSON.

On first visit, the **welcome guide** introduces each view (reopen anytime from **About → Open welcome guide**).

**Windows:** `.\start-dev.ps1` installs dependencies if needed and starts the dev server.

### Dev tunnel (optional)

To expose the dev server via Cloudflare Tunnel (e.g. `ocds.simple-systems.dev`):

1. `npm run dev` (or `npm run dev -- --host` to bind all interfaces)
2. `cloudflared tunnel --url http://127.0.0.1:5173` — see [`cloudflared.example.yml`](cloudflared.example.yml)

Tunnel hostnames are allowed in [`vite.config.ts`](vite.config.ts) (`server.allowedHosts`).

### Shareable URLs

Routes reflect the active project, view, and (in the explorer) the selected field. Routes use hash routing so refresh / direct links work on static hosts (GitHub Pages):

| Example URL | Opens |
|-------------|--------|
| `/#/p/blank/overview` | Blank project — overview |
| `/#/p/blank/explorer/tender` | Mapping Explorer — tender stage |
| `/#/p/blank/explorer/tender?path=tender/id` | Explorer with `tender/id` selected |
| `/#/p/blank/explorer/tender?q=title&status=unmapped` | Explorer with search + filter |
| `/#/p/blank/validation` | Validation view |
| `/#/p/blank/data-elements?q=Buyer` | Data Elements filtered by search |

Browser **back** / **forward** and pasted links restore the same view. Project picker changes update the URL.

See [`docs/IMPLEMENTATION_SUMMARY.md`](docs/IMPLEMENTATION_SUMMARY.md) for the full feature record and [`docs/GENERALIZATION_PLAN.md`](docs/GENERALIZATION_PLAN.md) for design rationale.

## What's included

| Path | Contents |
|------|----------|
| `public/ocds_reference.json` | Tier A — OCDS 1.1.5 structure + schema (shared) |
| `public/projects/` | Tier B + C per project (`blank`, `mphilgeps`, `philgeps-1.5`, …) |
| `public/indicator_packs/` | Cardinal, OCP red flags (R001–R073), Philippines custom packs |
| `references/` | OCP mapping workbooks + red-flag CSVs / [`OCP_RED_FLAGS_TO_OCDS.md`](references/OCP_RED_FLAGS_TO_OCDS.md) |
| `samples/` | PhilGEPS analysis notes, docs, optional sample payloads |
| `src/` | React mapping explorer |
| `scripts/` | Excel ↔ JSON pipeline, export to xlsx / YAML |
| `docs/` | Plans, export guide, architecture notes |

### App views

| View | Description |
|------|-------------|
| **Overview** | Project hub — summary cards for every dashboard and reference view, stage coverage bars |
| **Mapping Explorer** | Hierarchical field tree, search, status filter, **Expand all / Collapse all**, selectable structure rows (read-only detail), leaf-only mapping |
| **Release & publication** | Release envelope readiness, publication config form, header preview |
| **Risk Indicators** | Pack-based indicators, sort (code / name / % mapped ↑↓), mapping readiness, **Path details** modal |
| **Validation** | Mapping quality checks, auto-link from `mapping_details` |
| **Data Sources** | Systems from sheet `1. Data Sources` — add, edit, delete (clears linked mappings) |
| **Data Elements** | Source-field inventory, wizard with section/table suggestions, source-first **Map** |
| **OCDS Schema / Extensions** | Reference catalogues + extension proposals |
| **About** | Standards links, attributions, documentation index |

### Projects

- **Built-in:** `blank`, `mphilgeps`, `philgeps-1.5` in `public/projects/`.
- **Local (browser):** **+ New** creates a project in localStorage from the blank template; **Delete** removes local projects (not `blank`).
- **Import:** Project JSON from **Import** merges into the active project or can seed a handoff.
- Edits and inventory overlays are stored **per project** in localStorage; switching projects preserves each project's state separately.

## Editing & export

- **Mapping** applies to **leaf fields only** (required, optional, extension, and additional fields).
- **Structure rows** (object spans, party refs, section / subtitle / extension intros) are **clickable** — the detail panel shows title and description with a “not mapped” callout; use the chevron to expand/collapse.
- Select a leaf field → **Edit field** to change `mapping`, `example`, or `notes`.
- Edits persist in **localStorage** per project across reloads.
- Deleting a **data source** or **data element** clears any OCDS mappings that referenced it (confirm dialog shows impact).
- **Export** (header): Project JSON, mapping edits, merged view, CSV, **mapping.yaml**; xlsx via CLI (see [`docs/EXPORT_GUIDE.md`](docs/EXPORT_GUIDE.md)).
- **Import** (header): Project JSON, CSV, mapping edits JSON. Full `.xlsx` workbooks: CLI only.
- **Undo / Redo**: toolbar or `Ctrl+Z` / `Ctrl+Shift+Z`.

## Regenerate mapping data

Place an OCP field-level mapping workbook in `references/` (see [`references/README.md`](references/README.md)), then:

```bash
npm run build-data          # ocds_reference.json + public/projects/blank.json (needs xlsx in references/)
npm run build-philgeps-projects   # regenerate mphilgeps + philgeps-1.5 from references/ workbooks
npm run build-ocp-red-flags # references/OCP_RED_FLAGS_TO_OCDS.md + public/indicator_packs/ocp-red-flags.json
npm run strip-template      # blank OCP xlsx from filled template
npm run clean-placeholders  # remove () template rows from project JSON
```

### Import / export (CLI)

```bash
# Import stakeholder workbook into a project
python scripts/import_ocp_workbook.py -i path/to/workbook.xlsx -p public/projects/blank.json \
  --scope full --merge merge -o public/projects/my-agency.json

# Export project (JSON, CSV, YAML, xlsx)
python scripts/export_project.py -p public/projects/blank.json \
  --yaml dist/mapping.yaml --xlsx dist/mapping.xlsx \
  --csv-elements dist/data_elements.csv --csv-sources dist/data_sources.csv
```

In the app, use **Import** / **Export** in the header for browser-friendly formats. See [`docs/EXPORT_GUIDE.md`](docs/EXPORT_GUIDE.md) for the full handoff workflow.

## Risk indicators

**Cardinal** is always active. **Custom packs** in `public/indicator_packs/` are optional add-ons — extra risk checks computed from mapped OCDS paths, independent of which mapping project is open. Enable them under **Risk Indicators** (saved in browser localStorage). Catalog packs include Philippines jurisdiction packs and the **OCP Red Flags** methodology catalogue (`ocp-red-flags`, R001–R073).

Sort the indicator list by **code**, **name**, or **% mapped**, with ↑ / ↓ for ascending or descending.

Pack definitions live in `public/indicator_packs/*.json`; available custom packs are listed in `catalog.json`. Add a new pack by placing JSON there and registering it in the catalog. Regenerate the OCP catalogue from CSVs with `npm run build-ocp-red-flags` (see [`references/OCP_RED_FLAGS_TO_OCDS.md`](references/OCP_RED_FLAGS_TO_OCDS.md)).

`/ocid` is treated as a compile/publication concern — Cardinal path requirements do not list it as a mappable required field.

```json
// public/indicator_packs/my-pack.json — custom indicator example
{ "pack_id": "my-pack", "engine": "custom", "indicators": [ ... ] }
```

From **Risk Indicators** or **Release & publication**, use **Path details** to view or edit OCDS mappings inline.

## Release & publication

Configure publisher-wide compile settings separate from per-field OCP mappings:

```json
"publication_config": {
  "ocid_prefix": "ocds-myagency",
  "publisher": { "name": "…", "uri": "https://…" },
  "extensions": ["https://…/ocds_bid_extension/…"],
  "generated": {
    "ocid": { "from": ["tender_id", "buyer_id"] },
    "release_id": "record_id",
    "release_date": { "prefer": ["published_date", "award_date"] }
  },
  "defaults": { "currency": "USD", "language": "en" }
}
```

- **Release envelope** — map `ocid`, `id`, `date`, `tag`, etc. (General stage)
- **Publication settings** — saved to project JSON; exported in **mapping.yaml** under `publication:`

## Production build

```bash
npm run build
npm run preview
```

Static output: `dist/` (serve at site root with SPA fallback if your host requires it).

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/IMPLEMENTATION_SUMMARY.md`](docs/IMPLEMENTATION_SUMMARY.md) | What was built (v1 + post-v1) |
| [`docs/GENERALIZATION_PLAN.md`](docs/GENERALIZATION_PLAN.md) | Design plan and phases |
| [`docs/PLANNED_IMPLEMENTATIONS.md`](docs/PLANNED_IMPLEMENTATIONS.md) | Forward backlog (P0–P4) |
| [`docs/EXPORT_GUIDE.md`](docs/EXPORT_GUIDE.md) | JSON, YAML, xlsx CLI handoff |
| [`docs/STREAMLINE_RECOMMENDATIONS.md`](docs/STREAMLINE_RECOMMENDATIONS.md) | Mapping from scratch — workflow & scoping |
| [`public/projects/README.md`](public/projects/README.md) | Bundled project naming and regenerate commands |
| [`samples/README.md`](samples/README.md) | PhilGEPS corpus archive vs bundled projects |
| [`references/OCP_RED_FLAGS_TO_OCDS.md`](references/OCP_RED_FLAGS_TO_OCDS.md) | OCP red-flag catalogue (R001–R073) markdown reference |

## License & attribution

OCDS is maintained by the [Open Contracting Partnership](https://www.open-contracting.org/). Cardinal risk indicators: [OCP Cardinal](https://cardinal.readthedocs.io/).

When using third-party mapping templates or sample projects, retain provenance in export metadata or a changelog.
