import type { DataElementRow } from "../types";

export function normalizeMappingKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Empty rows from the OCP Excel template: the for_mapping column is a formula
 * that renders "()" when section_table and data_element are blank, but presence
 * statistics columns may still be filled — so they look like real inventory rows.
 */
export function isPlaceholderDataElement(row: DataElementRow): boolean {
  const section = String(row.section_table ?? "").trim();
  const field = String(row.data_element ?? "").trim();
  if (!section && !field) return true;

  const fm = String(row.for_mapping ?? "").trim().replace(/\s+/g, "");
  if (fm === "()" || fm === "(,)") return true;

  return false;
}

export function countPlaceholderElements(rows: DataElementRow[]): number {
  return rows.filter(isPlaceholderDataElement).length;
}

export function filterRealDataElements(rows: DataElementRow[]): DataElementRow[] {
  return rows.filter((r) => !isPlaceholderDataElement(r));
}

export interface DataElementIndex {
  rows: DataElementRow[];
  byForMapping: Map<string, DataElementRow>;
}

export function buildDataElementIndex(rows: DataElementRow[]): DataElementIndex {
  const byForMapping = new Map<string, DataElementRow>();
  for (const row of rows) {
    if (isPlaceholderDataElement(row)) continue;
    if (row.for_mapping) {
      byForMapping.set(normalizeMappingKey(row.for_mapping), row);
    }
  }
  return { rows, byForMapping };
}

export function resolveDataElement(
  index: DataElementIndex,
  mapping: string,
): DataElementRow | null {
  const key = normalizeMappingKey(mapping);
  if (!key) return null;
  return index.byForMapping.get(key) ?? null;
}

export function filterDataElements(
  rows: DataElementRow[],
  query: string,
  sourceFilter: string,
): DataElementRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (sourceFilter && row.data_source !== sourceFilter) return false;
    if (!q) return true;
    const blob = [
      row.for_mapping,
      row.data_source,
      row.section_table,
      row.data_element,
      row.description,
      row.data_type,
      row.notes,
      row.example,
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  });
}

export function dataElementSources(rows: DataElementRow[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    if (row.data_source) set.add(row.data_source);
  }
  return [...set].sort();
}

/** Distinct section / table names from inventory, optionally scoped to one source. */
export function dataElementSectionTables(
  rows: DataElementRow[],
  dataSourceFilter?: string,
): string[] {
  const set = new Set<string>();
  const source = dataSourceFilter?.trim();
  for (const row of rows) {
    if (isPlaceholderDataElement(row)) continue;
    if (source && row.data_source !== source) continue;
    const section = row.section_table?.trim();
    if (section) set.add(section);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}
