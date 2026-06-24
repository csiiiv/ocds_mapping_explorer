/** CLI and handoff instructions shown in the Export modal. */

export function projectJsonFilename(projectId: string): string {
  return `ocds-mapping-project-${projectId}.json`;
}

export function xlsxExportCommand(projectJsonPath: string, outputPath?: string): string {
  const out = outputPath ?? `ocds-mapping-${pathBasename(projectJsonPath)}.xlsx`;
  return `python scripts/export_ocp_workbook.py -p ${quotePath(projectJsonPath)} -o ${quotePath(out)}`;
}

export function yamlExportCommand(projectJsonPath: string, outputPath?: string): string {
  const out = outputPath ?? `mapping-${pathBasename(projectJsonPath)}.yaml`;
  return `python scripts/export_mapping_yaml.py -p ${quotePath(projectJsonPath)} -o ${quotePath(out)}`;
}

export function fullExportCommand(projectJsonPath: string): string {
  const base = pathBasename(projectJsonPath);
  return [
    `python scripts/export_project.py -p ${quotePath(projectJsonPath)} -o dist/${base}_export.json`,
    xlsxExportCommand(projectJsonPath, `dist/${base}.xlsx`),
    yamlExportCommand(projectJsonPath, `dist/mapping-${base}.yaml`),
  ].join("\n");
}

function pathBasename(p: string): string {
  const name = p.replace(/\\/g, "/").split("/").pop() ?? p;
  return name.replace(/\.json$/i, "");
}

function quotePath(p: string): string {
  return p.includes(" ") ? `"${p}"` : p;
}

export function exportGuideMarkdown(projectId: string): string {
  const jsonFile = projectJsonFilename(projectId);
  const stem = projectId;
  return `# OCDS Mapping Explorer — export guide

This guide explains how to hand off mapping work from the browser to OCP-compatible files and ETL pipelines.

## Quick reference

| Format | In browser | CLI |
|--------|------------|-----|
| Project JSON | Yes | \`export_project.py\` |
| Data elements / sources CSV | Yes | \`export_project.py --csv-*\` |
| mapping.yaml (ETL) | Yes | \`export_mapping_yaml.py\` |
| OCP field-level mapping .xlsx | No (by design) | \`export_ocp_workbook.py\` |

**Why no in-browser .xlsx?** The OCP workbook is large, formula-heavy, and depends on openpyxl. Generating it in the browser would add a heavy dependency and risk corrupting template structure. Use the Python CLI instead.

## 1. Save your work from the app

1. Open **Export** in the mapping explorer.
2. Download **Project JSON** (\`${jsonFile}\`). This file contains data sources, data elements, mapping edits, extension proposals, and optional \`publication_config\`.
3. Optionally download **mapping.yaml** for ETL pipelines (same content as the CLI YAML export).

**Local projects:** Projects created with **+ New** exist only in this browser until exported. Share Project JSON for handoff; recipients import via **Import**.

## 2. Export OCP workbook (.xlsx)

From the \`ocds_mapping_explorer\` directory:

\`\`\`bash
# Save Project JSON to e.g. exports/${jsonFile} first, then:
${xlsxExportCommand(`exports/${jsonFile}`, `exports/${stem}.xlsx`)}
\`\`\`

**Template:** The script uses \`references/OCDS_Mapping_Template_1.1_blank.xlsx\` if present, otherwise any filled OCP workbook in \`references/\`. Create a blank template with:

\`\`\`bash
npm run strip-template
\`\`\`

The exporter writes:

- Sheet **1. Data Sources** — inventory rows from your project
- Sheet **2. Data Elements** — inventory rows (placeholder \`()\` rows omitted)
- Sheets **(OCDS) 1–6** — mapping / example / notes columns from \`mapping_edits\`

## 3. Export mapping.yaml for ETL

\`\`\`bash
${yamlExportCommand(`exports/${jsonFile}`, `exports/mapping-${stem}.yaml`)}
\`\`\`

YAML structure:

- \`meta\` — project id, name, OCDS version
- \`data_elements\` — source field inventory with \`mapping_details\`
- \`ocds_mappings\` — nested by stage → OCDS path → \`for_mapping\` (and optional example/notes)
- \`publication\` — optional; from **Release & publication** → \`publication_config\`
- \`extension_proposals\` — if any

## 4. Re-import

- **Browser:** Import → Project JSON, CSV, or mapping edits JSON
- **Full OCP workbook:** \`python scripts/import_ocp_workbook.py -p public/projects/${stem}.json -i your_workbook.xlsx\`

## All exports at once

\`\`\`bash
${fullExportCommand(`exports/${jsonFile}`)}
\`\`\`
`;
}
