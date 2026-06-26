# OCDS Mapping Explorer — export guide

Hand off mapping work from the browser to OCP-compatible files and ETL pipelines.

## Quick reference

| Format | In browser | CLI |
|--------|------------|-----|
| Project JSON | Yes | `export_project.py` |
| Data elements / sources CSV | Yes | `export_project.py --csv-*` |
| mapping.yaml (ETL) | Yes | `export_mapping_yaml.py` |
| OCP field-level mapping .xlsx | No (by design) | `export_ocp_workbook.py` |

**Why no in-browser .xlsx?** The OCP workbook is large, formula-heavy, and depends on openpyxl. Generating it in the browser would add a heavy dependency and risk corrupting template structure. Use the Python CLI instead.

**Why no in-browser .xlsx import?** Same reason — use `import_ocp_workbook.py` for full workbook round-trips.

## 1. Save from the app

1. Open **Export** in the mapping explorer.
2. Download **Project JSON** (`ocds-mapping-project-{id}.json`).
3. Optionally download **mapping.yaml** for ETL (includes `ocds_mappings`, optional `publication:` block).

**Local projects:** Projects created with **+ New** exist only in this browser until exported. Share Project JSON for handoff; recipients import via **Import**.

**Leaf mappings:** Export includes `mapping_edits` for mappable leaf fields only; structural container rows are not mapping targets.

## 2. Export OCP workbook (.xlsx)

From the `ocds_mapping_explorer` directory:

```bash
# After saving Project JSON to exports/
python scripts/export_ocp_workbook.py -p exports/ocds-mapping-project-blank.json -o exports/mapping.xlsx
```

Or via the unified exporter:

```bash
python scripts/export_project.py -p public/projects/blank.json --xlsx dist/mapping.xlsx
```

**Template:** Uses `references/OCDS_Mapping_Template_1.1_blank.xlsx` if present, otherwise any workbook in `references/`. Create a blank template with:

```bash
npm run strip-template
```

The exporter writes:

- Sheet **1. Data Sources** — inventory rows
- Sheet **2. Data Elements** — inventory rows (placeholder `()` rows omitted)
- Sheets **(OCDS) 1–6** — mapping / example / notes from `mapping_edits`

## 3. Export mapping.yaml for ETL

```bash
python scripts/export_mapping_yaml.py -p exports/ocds-mapping-project-blank.json -o exports/mapping.yaml
```

Or:

```bash
python scripts/export_project.py -p public/projects/blank.json --yaml dist/mapping.yaml
```

YAML structure:

- `meta` — project id, name, OCDS version, exported_at
- `data_elements` — source field inventory with `mapping_details`
- `ocds_mappings` — nested by stage → OCDS path → `for_mapping` (optional example/notes)
- `publication` — optional; from **Release & publication** → `publication_config` (OCID prefix, publisher, extensions, generated rules, defaults)
- `extension_proposals` — if any

Example `publication` block:

```yaml
publication:
  ocid_prefix: ocds-myagency
  publisher:
    name: My Agency
    uri: https://example.gov/opendata
  extensions:
    - https://raw.githubusercontent.com/open-contracting-extensions/ocds_bid_extension/master/extension.json
  generated:
    ocid:
      from: [tender_id, buyer_id]
    release_id: record_id
    release_date:
      prefer: [published_date, award_date]
  defaults:
    currency: USD
    language: en
```

## 4. Re-import

- **Browser:** Import → Project JSON, CSV, or mapping edits JSON
- **Full OCP workbook:** `python scripts/import_ocp_workbook.py -p public/projects/blank.json -i your_workbook.xlsx`

## All exports at once

```bash
python scripts/export_project.py -p public/projects/blank.json \
  -o dist/project_export.json \
  --yaml dist/mapping.yaml \
  --xlsx dist/mapping.xlsx \
  --csv-elements dist/data_elements.csv \
  --csv-sources dist/data_sources.csv
```
