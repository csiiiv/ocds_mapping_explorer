# Bundled mapping projects

Each file is a **tier B + C** project payload loaded by the app at runtime (tier A comes from `public/ocds_reference.json`).

## Naming convention

| Rule | Example |
|------|---------|
| Filename | `{project_id}.json` |
| `metadata.project_id` | Must match filename stem (`mphilgeps` → `mphilgeps.json`) |
| `project_id` format | Lowercase kebab-case slug (`philgeps-1.5`, not spaces) |
| App manifest | Register in `src/lib/project.ts` → `BUILTIN_PROJECTS` |

## Shipped projects

| File | Source workbook | Description |
|------|-----------------|-------------|
| `blank.json` | Template structure only (empty inventory) | Default new mapping exercise |
| `mphilgeps.json` | `references/2025_mPhilGEPS_OCDS…xlsx` | Modernized PhilGEPS filled mapping |
| `philgeps-1.5.json` | `references/2025_PhilGEPS 1.5_OCDS…xlsx` | PhilGEPS 1.5 filled mapping |

## Regenerate from Excel

```bash
# mPhilGEPS
python scripts/build_project.py \
  -i "references/2025_mPhilGEPS_OCDS - Field Level Mapping Template for OCDS 1.1 (Template Version 0.91) (1) (1).xlsx" \
  --project mphilgeps --name "mPhilGEPS" --source-system "mPhilGEPS" \
  --description "Philippines mPhilGEPS field-level mapping (PS-DBM template v0.91)"

# PhilGEPS 1.5
python scripts/build_project.py \
  -i "references/2025_PhilGEPS 1.5_OCDS - Field Level Mapping Template for OCDS 1.1 (Template Version 0.91).xlsx" \
  --project philgeps-1.5 --name "PhilGEPS 1.5" --source-system "PhilGEPS 1.5" \
  --description "Philippines PhilGEPS 1.5 field-level mapping (PS-DBM template v0.91)"

# Publication config (PhilGEPS projects)
python scripts/apply_philgeps_metadata.py
```

Indicator packs are **app-level** (browser preferences under Risk Indicators), not stored on project JSON.

After adding a new bundled project, update `BUILTIN_PROJECTS` in `src/lib/project.ts`.
