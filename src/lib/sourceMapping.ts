import { MAPPABLE_FIELD_ROW_TYPES } from "./mappingNodes";
import { normalizeMappingKey } from "./dataElements";
import {
  buildMappingPathIndex,
  normalizeOcdsPath,
  type PathIndexEntry,
} from "./indicatorMapping";
import type { MappingDocument, MappingNode, StageKey } from "../types";
import { STAGES } from "../types";

const MAPPABLE_TYPES = MAPPABLE_FIELD_ROW_TYPES;

export interface MappableOcdsPath {
  stage: StageKey;
  path: string;
  title: string;
  rowType: string;
  mapped: MappingNode["mapped"];
  currentMapping: string;
  normalized: string;
}

export interface ElementMappingLink {
  stage: StageKey;
  path: string;
  title: string;
  mapping: string;
}

/** All OCDS field rows that can receive a for_mapping label. */
export function listMappableOcdsPaths(doc: MappingDocument): MappableOcdsPath[] {
  const out: MappableOcdsPath[] = [];
  for (const stage of STAGES) {
    for (const node of doc.stages[stage.key]?.flat ?? []) {
      if (!node.path || !MAPPABLE_TYPES.has(node.row_type)) continue;
      if (node.path.startsWith("__subtitle")) continue;
      out.push({
        stage: stage.key,
        path: node.path,
        title: node.title || "",
        rowType: node.row_type,
        mapped: node.mapped,
        currentMapping: node.mapping || "",
        normalized: normalizeOcdsPath(node.path),
      });
    }
  }
  out.sort((a, b) => a.path.localeCompare(b.path));
  return out;
}

export function filterMappablePaths(
  paths: MappableOcdsPath[],
  query: string,
  stageFilter: StageKey | "",
): MappableOcdsPath[] {
  const q = query.trim().toLowerCase();
  return paths.filter((p) => {
    if (stageFilter && p.stage !== stageFilter) return false;
    if (!q) return true;
    const blob = [p.path, p.title, p.currentMapping, p.rowType, p.stage].join(" ").toLowerCase();
    return blob.includes(q);
  });
}

/** OCDS fields whose mapping label matches this data element (case-insensitive). */
export function findOcdsLinksForElement(
  doc: MappingDocument,
  forMapping: string,
): ElementMappingLink[] {
  const target = normalizeMappingKey(forMapping);
  if (!target) return [];
  const links: ElementMappingLink[] = [];
  for (const stage of STAGES) {
    for (const node of doc.stages[stage.key]?.flat ?? []) {
      if (!node.path || !MAPPABLE_TYPES.has(node.row_type)) continue;
      if (!node.mapping?.trim()) continue;
      if (normalizeMappingKey(node.mapping) !== target) continue;
      links.push({
        stage: stage.key,
        path: node.path,
        title: node.title || "",
        mapping: node.mapping,
      });
    }
  }
  return links;
}

export function lookupPathEntry(
  index: Map<string, PathIndexEntry>,
  normalized: string,
): PathIndexEntry | null {
  return index.get(normalizeOcdsPath(normalized)) ?? null;
}

export function buildPathIndex(doc: MappingDocument) {
  return buildMappingPathIndex(doc);
}
