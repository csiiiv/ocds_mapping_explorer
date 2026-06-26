# PhilGEPS sample pack

Filled mPhilGEPS mapping data, Philippines indicator pack copies, and corpus analysis notes for the BetterGov PH / PhilGEPS workstream.

## Contents

| Path | Purpose |
|------|---------|
| `project.json` | Filled mPhilGEPS field-level mapping (~274 data elements) |
| `indicator_packs/` | Archival copies of PH packs (app loads from `public/indicator_packs/`) |
| `docs/RISK_INDICATOR_MASTER_REFERENCE.md` | Master indicator reference tables |
| `docs/RISK_INDICATOR_RECOMMENDATIONS.md` | Recommended custom indicators from corpus analysis |

## Use in the app

**Bundled project (recommended):** Open **mPhilGEPS** or **PhilGEPS 1.5** from the project picker (`public/projects/`).

**Import:** Use **Import → Project JSON** with `samples/philgeps/project.json` to merge into the active project or seed a handoff.

**Indicator packs:** Enable Philippines packs under **Risk Indicators** (saved per browser). Pack JSON is served from `public/indicator_packs/`; files here are for reference and diffing only.

## Regenerate

Place the PS-DBM OCP mapping workbook in `references/` and run:

```bash
# Bundled app projects (picker)
npm run build-philgeps-projects

# Or write archive copy only
python scripts/build_project.py -i references/your-workbook.xlsx \
  --project philgeps --name "mPhilGEPS" --source-system "mPhilGEPS" \
  --project-out samples/philgeps/project.json
```

Publication config for bundled PhilGEPS projects is merged by `scripts/apply_philgeps_metadata.py` (included in `build-philgeps-projects`).

## Attribution

Mapping template data is from the Philippine Government Electronic Procurement System (PhilGEPS) / mPhilGEPS programme and PS-DBM. Retain provenance when sharing exports derived from this sample.
