import type { DataElementRow, DataSourceRow, FieldEdit, MappingDocument, StageKey } from "../types";
import { findOcdsLinksForElement } from "./sourceMapping";

export interface DeleteElementImpact {
  key: string;
  forMapping: string;
  linkedCount: number;
}

export interface DeleteSourceImpact {
  shortName: string;
  sourceLabel: string;
  elementCount: number;
  linkedCount: number;
  elements: DataElementRow[];
}

export function collectMappingClearPatches(
  doc: MappingDocument,
  forMappingLabels: string[],
): { stage: StageKey; path: string; patch: FieldEdit }[] {
  const seen = new Set<string>();
  const patches: { stage: StageKey; path: string; patch: FieldEdit }[] = [];
  for (const label of forMappingLabels) {
    if (!label.trim()) continue;
    for (const link of findOcdsLinksForElement(doc, label)) {
      const dedupe = `${link.stage}::${link.path}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      patches.push({ stage: link.stage, path: link.path, patch: { mapping: "" } });
    }
  }
  return patches;
}

export function getDeleteElementImpact(
  doc: MappingDocument,
  rows: DataElementRow[],
  key: string,
): DeleteElementImpact | null {
  const row = rows.find((r) => r.key === key);
  if (!row) return null;
  const linkedCount = findOcdsLinksForElement(doc, row.for_mapping).length;
  return { key, forMapping: row.for_mapping, linkedCount };
}

export function getDeleteSourceImpact(
  doc: MappingDocument,
  elements: DataElementRow[],
  sources: DataSourceRow[],
  shortName: string,
): DeleteSourceImpact | null {
  const src = sources.find((r) => r.short_name === shortName);
  if (!src) return null;
  const sourceName = src.data_source.trim();
  const linkedElements = elements.filter((r) => r.data_source.trim() === sourceName);
  const labels = linkedElements.map((r) => r.for_mapping).filter(Boolean);
  const linkedCount = collectMappingClearPatches(doc, labels).length;
  return {
    shortName,
    sourceLabel: src.data_source || src.short_name,
    elementCount: linkedElements.length,
    linkedCount,
    elements: linkedElements,
  };
}

export function formatDeleteElementMessage(impact: DeleteElementImpact): string {
  const label = impact.forMapping || impact.key;
  if (impact.linkedCount === 0) {
    return `Delete data element "${label}"?`;
  }
  const n = impact.linkedCount;
  return `Delete data element "${label}"?\n\n${n} OCDS field mapping${n === 1 ? "" : "s"} linked to this element will be cleared.`;
}

export function formatDeleteSourceMessage(impact: DeleteSourceImpact): string {
  const label = impact.sourceLabel;
  if (impact.elementCount === 0) {
    return `Delete data source "${label}"?`;
  }
  const el = impact.elementCount;
  let msg = `Delete data source "${label}"?\n\nThis will also delete ${el} data element${el === 1 ? "" : "s"} from this source.`;
  if (impact.linkedCount > 0) {
    const n = impact.linkedCount;
    msg += `\n${n} OCDS field mapping${n === 1 ? "" : "s"} will be cleared.`;
  }
  return msg;
}
