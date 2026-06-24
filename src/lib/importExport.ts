import type { DataElementRow, DataSourceRow, FieldEdit } from "../types";
import type { ImportRecord, MappingProject, ProjectMetadata } from "./project";

export type MergeMode = "replace" | "merge";
export type ImportScope = "full" | "inventory" | "mappings" | "project_json" | "data_elements_csv" | "data_sources_csv";

export interface ImportSummary {
  scope: ImportScope;
  mergeMode: MergeMode;
  filename: string;
  dataSources?: { added: number; updated: number; total: number };
  dataElements?: { added: number; updated: number; total: number };
  mappingEdits?: { added: number; updated: number; total: number };
  /** Set when project JSON import resets indicator config to Cardinal-only */
  indicatorNormalization?: string;
}

export const DATA_ELEMENT_CSV_FIELDS = [
  "for_mapping",
  "data_source",
  "section_table",
  "data_element",
  "publish",
  "example",
  "description",
  "data_type",
  "notes",
  "mapped",
  "mapping_details",
] as const;

export const DATA_SOURCE_CSV_FIELDS = [
  "short_name",
  "data_source",
  "vendor",
  "url_documentation",
  "agency_unit_responsible",
  "planning",
  "tender",
  "award",
  "contract",
  "implementation_physical",
  "implementation_financial",
  "revision_history",
  "documents_available",
  "existing_apis_data_publication",
] as const;

export function elementKey(sectionTable: string, dataElement: string): string {
  return `${sectionTable}.${dataElement}`.toLowerCase();
}

/** Minimal RFC 4180-style CSV parser. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      if (ch === "\r") i++;
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}

function csvRowsToObjects(text: string, allowedFields: readonly string[]): Record<string, string>[] {
  const table = parseCsv(text.trim());
  if (table.length < 2) return [];

  const headers = table[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const out: Record<string, string>[] = [];

  for (let r = 1; r < table.length; r++) {
    const rec: Record<string, string> = {};
    let hasData = false;
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!allowedFields.includes(key as (typeof allowedFields)[number])) continue;
      const val = (table[r][c] ?? "").trim();
      if (val) hasData = true;
      rec[key] = val;
    }
    if (hasData) out.push(rec);
  }
  return out;
}

export function parseDataElementsCsv(text: string): DataElementRow[] {
  const objects = csvRowsToObjects(text, DATA_ELEMENT_CSV_FIELDS);
  return objects.map((o) => {
    const section = o.section_table || "";
    const field = o.data_element || "";
    return {
      for_mapping: o.for_mapping || "",
      data_source: o.data_source || "",
      section_table: section,
      data_element: field,
      publish: o.publish || "",
      example: o.example || "",
      description: o.description || "",
      data_type: o.data_type || "",
      notes: o.notes || "",
      mapped: o.mapped || "",
      mapping_details: o.mapping_details || "",
      key: elementKey(section, field),
      count_1_general_all_stages: 0,
      count_2_planning: 0,
      count_3_tender: 0,
      count_4_award: 0,
      count_5_contract: 0,
      count_6_implementation: 0,
      presence_1_general_all_stages: 0,
      presence_2_planning: 0,
      presence_3_tender: 0,
      presence_4_award: 0,
      presence_5_contract: 0,
      presence_6_implementation: 0,
    };
  });
}

export function parseDataSourcesCsv(text: string): DataSourceRow[] {
  const objects = csvRowsToObjects(text, DATA_SOURCE_CSV_FIELDS);
  return objects.map((o) => ({ ...o })) as DataSourceRow[];
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function toCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(row[h] ?? "")).join(","));
  }
  return lines.join("\n") + "\n";
}

export function exportDataElementsCsv(project: MappingProject): string {
  const rows = project.data_elements.rows.map((r) => {
    const o: Record<string, string> = {};
    for (const k of DATA_ELEMENT_CSV_FIELDS) {
      o[k] = String(r[k] ?? "");
    }
    return o;
  });
  return toCsv([...DATA_ELEMENT_CSV_FIELDS], rows);
}

export function exportDataSourcesCsv(project: MappingProject): string {
  const rows = project.data_sources.rows.map((r) => {
    const o: Record<string, string> = {};
    for (const k of DATA_SOURCE_CSV_FIELDS) {
      o[k] = String(r[k] ?? "");
    }
    return o;
  });
  return toCsv([...DATA_SOURCE_CSV_FIELDS], rows);
}

function mergeDataSources(
  existing: MappingProject["data_sources"],
  incoming: MappingProject["data_sources"],
  mode: MergeMode,
) {
  const stats = { added: 0, updated: 0, total: 0 };
  if (mode === "replace") {
    const rows = incoming.rows;
    return { data: incoming, stats: { added: rows.length, updated: 0, total: rows.length } };
  }
  const byName = new Map<string, DataSourceRow>();
  for (const r of existing.rows) {
    if (r.short_name) byName.set(r.short_name, r);
  }
  for (const r of incoming.rows) {
    if (!r.short_name) continue;
    if (byName.has(r.short_name)) stats.updated++;
    else stats.added++;
    byName.set(r.short_name, r);
  }
  const rows = [...byName.values()];
  stats.total = rows.length;
  return {
    data: { columns: incoming.columns.length ? incoming.columns : existing.columns, rows },
    stats,
  };
}

function mergeDataElements(
  existing: MappingProject["data_elements"],
  incoming: MappingProject["data_elements"],
  mode: MergeMode,
) {
  const stats = { added: 0, updated: 0, total: 0 };
  if (mode === "replace") {
    const rows = incoming.rows;
    return {
      data: incoming,
      stats: { added: rows.length, updated: 0, total: rows.length },
    };
  }
  const byKey = new Map<string, DataElementRow>();
  for (const r of existing.rows) {
    if (r.key) byKey.set(r.key, r);
  }
  for (const r of incoming.rows) {
    const key = r.key || elementKey(r.section_table, r.data_element);
    if (!key || key === ".") continue;
    const row = { ...r, key };
    if (byKey.has(key)) stats.updated++;
    else stats.added++;
    byKey.set(key, row);
  }
  const rows = [...byKey.values()];
  stats.total = rows.length;
  return {
    data: {
      columns: incoming.columns.length ? incoming.columns : existing.columns,
      column_groups: incoming.column_groups?.length
        ? incoming.column_groups
        : existing.column_groups,
      rows,
    },
    stats,
  };
}

function mergeMappingEdits(
  existing: Record<string, FieldEdit>,
  incoming: Record<string, FieldEdit>,
  mode: MergeMode,
) {
  const stats = { added: 0, updated: 0, total: 0 };
  if (mode === "replace") {
    return { data: { ...incoming }, stats: { added: Object.keys(incoming).length, updated: 0, total: Object.keys(incoming).length } };
  }
  const merged = { ...existing };
  for (const [k, v] of Object.entries(incoming)) {
    if (k in merged) {
      merged[k] = { ...merged[k], ...v };
      stats.updated++;
    } else {
      merged[k] = v;
      stats.added++;
    }
  }
  stats.total = Object.keys(merged).length;
  return { data: merged, stats };
}

export function applyProjectImport(
  project: MappingProject,
  patch: {
    data_sources?: MappingProject["data_sources"];
    data_elements?: MappingProject["data_elements"];
    mapping_edits?: Record<string, FieldEdit>;
    metadata?: Partial<MappingProject["metadata"]>;
    publication_config?: MappingProject["publication_config"];
  },
  options: { scope: ImportScope; mergeMode: MergeMode; filename: string },
): { project: MappingProject; summary: ImportSummary; mappingEdits: Record<string, FieldEdit> } {
  const out: MappingProject = structuredClone(project);
  const summary: ImportSummary = {
    scope: options.scope,
    mergeMode: options.mergeMode,
    filename: options.filename,
  };

  let mappingEdits = { ...project.mapping_edits };

  if (
    patch.data_sources &&
    (options.scope === "inventory" || options.scope === "full" || options.scope === "project_json" || options.scope === "data_sources_csv")
  ) {
    const { data, stats } = mergeDataSources(out.data_sources, patch.data_sources, options.mergeMode);
    out.data_sources = data;
    summary.dataSources = stats;
  }

  if (
    patch.data_elements &&
    (options.scope === "inventory" ||
      options.scope === "full" ||
      options.scope === "project_json" ||
      options.scope === "data_elements_csv")
  ) {
    const { data, stats } = mergeDataElements(out.data_elements, patch.data_elements, options.mergeMode);
    out.data_elements = data;
    summary.dataElements = stats;
  }

  if (
    patch.mapping_edits &&
    (options.scope === "mappings" || options.scope === "full" || options.scope === "project_json")
  ) {
    const { data, stats } = mergeMappingEdits(mappingEdits, patch.mapping_edits, options.mergeMode);
    mappingEdits = data;
    out.mapping_edits = data;
    summary.mappingEdits = stats;
  }

  let sourceProjectId: string | undefined;
  if (patch.metadata) {
    sourceProjectId = patch.metadata.project_id;
    out.metadata = {
      ...out.metadata,
      ...patch.metadata,
      project_id: out.metadata.project_id,
    };
  }

  if (patch.publication_config && options.scope === "project_json") {
    out.publication_config = patch.publication_config;
  }

  if (options.scope === "project_json") {
    const legacy = out.metadata as ProjectMetadata & {
      indicator_packs?: string[];
      feasibility_pack?: string;
      data_profiles?: { id: string; name: string }[];
    };
    const stripped: string[] = [];
    if (legacy.indicator_packs?.length) {
      stripped.push(`indicator packs: ${legacy.indicator_packs.join(", ")}`);
    }
    if (legacy.feasibility_pack) {
      stripped.push(`feasibility pack: ${legacy.feasibility_pack}`);
    }
    if (legacy.data_profiles?.length) {
      stripped.push(`${legacy.data_profiles.length} data profile(s)`);
    }
    delete legacy.indicator_packs;
    delete legacy.feasibility_pack;
    delete legacy.data_profiles;
    if (stripped.length) {
      summary.indicatorNormalization = `Indicator packs are app-level (not stored on projects). Ignored on import: ${stripped.join("; ")}.`;
    }
  }

  const importRecord: ImportRecord = {
    filename: options.filename,
    scope: options.scope,
    imported_at: new Date().toISOString(),
    rows_added: (summary.dataElements?.added ?? 0) + (summary.dataSources?.added ?? 0),
    rows_updated: (summary.dataElements?.updated ?? 0) + (summary.dataSources?.updated ?? 0),
    ...(sourceProjectId && sourceProjectId !== out.metadata.project_id
      ? { source_project_id: sourceProjectId }
      : {}),
  };
  out.metadata.imports = [...(out.metadata.imports ?? []), importRecord];
  out.metadata.updated_at = importRecord.imported_at;

  return { project: out, summary, mappingEdits };
}

export function parseProjectJson(text: string): Partial<MappingProject> {
  const data = JSON.parse(text) as Partial<MappingProject> & { _type?: string; edits?: Record<string, FieldEdit> };

  // Edits-only patch file
  if (data._type === "ocds-mapping-edits" && data.edits) {
    return { mapping_edits: data.edits };
  }

  return data;
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
