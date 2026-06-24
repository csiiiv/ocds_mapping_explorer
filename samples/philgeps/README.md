# PhilGEPS sample pack (internal / optional)

This folder holds a **filled mapping project** used for internal testing and corpus analysis. It is **not** bundled with the general-purpose OCDS Mapping Explorer deployment.

## Contents

| Path | Purpose |
|------|---------|
| `project.json` | Filled mPhilGEPS field-level mapping (~274 data elements) |
| `indicator_packs/` | Philippines jurisdiction packs + feasibility overlay |
| `docs/` | Indicator reference and PhilGEPS corpus analysis notes |

## Restore locally (optional)

To load this sample in a dev build:

1. Copy `project.json` → `public/projects/philgeps.json`
2. Copy `indicator_packs/*.json` → `public/indicator_packs/`
3. Add a manifest entry in `src/lib/project.ts` (`BUILTIN_PROJECTS`)

Or import `project.json` via **Import** in the app header (works on any project, including local projects created with **+ New**).

**Hidden dev route:** `/p/mphilgeps` loads this sample when `npm run sync-philgeps` has copied files into `public/samples/philgeps/` (runs automatically with `npm run dev` / `npm run build`). The project does not appear in the project picker.

## Regenerate from workbook

Place the PS-DBM OCP mapping workbook in `references/` and run:

```bash
python scripts/build_project.py -i references/your-workbook.xlsx \
  --project philgeps --name "mPhilGEPS" --source-system "mPhilGEPS" \
  --project-out samples/philgeps/project.json
```

## Attribution

Mapping template data is from the Philippine Government Electronic Procurement System (PhilGEPS) / mPhilGEPS programme and PS-DBM. Retain provenance when sharing exports derived from this sample.
