import type { DataElementRow, MappingDocument, MappingNode, StageKey } from "../types";
import { STAGES } from "../types";
import type { PathRequirement, RiskIndicator } from "./riskIndicators";

/** Strip leading slash and array notation for matching mapping template paths. */
export function normalizeOcdsPath(path: string): string {
  return path
    .trim()
    .replace(/^\//, "")
    .replace(/\[\d*\]/g, "")
    .replace(/\/+/g, "/");
}

export function inferStageFromPath(path: string): StageKey {
  const p = normalizeOcdsPath(path);
  if (p.startsWith("planning/")) return "planning";
  if (p.startsWith("tender/") || p.startsWith("bids/")) return "tender";
  if (p.startsWith("awards/")) return "award";
  if (p.startsWith("contracts/")) return "contract";
  if (p.startsWith("implementation/")) return "implementation";
  return "general";
}

export interface PathIndexEntry {
  stage: StageKey;
  node: MappingNode;
}

/** Best mapping node per normalized OCDS path (field rows only). */
export function buildMappingPathIndex(
  doc: MappingDocument,
): Map<string, PathIndexEntry> {
  const index = new Map<string, PathIndexEntry>();
  const fieldTypes = new Set(["field", "required_field", "extension_field", "additional_field"]);

  for (const stage of STAGES) {
    const flat = doc.stages[stage.key]?.flat ?? [];
    for (const node of flat) {
      if (!node.path || !fieldTypes.has(node.row_type)) continue;
      const key = normalizeOcdsPath(node.path);
      const existing = index.get(key);
      if (!existing) {
        index.set(key, { stage: stage.key, node });
        continue;
      }
      // Prefer the stage that matches path prefix over general duplicates.
      const preferred = inferStageFromPath(key);
      if (existing.stage !== preferred && stage.key === preferred) {
        index.set(key, { stage: stage.key, node });
      }
    }
  }
  return index;
}

export interface ResolvedPath {
  requirement: PathRequirement;
  normalized: string;
  stage: StageKey | null;
  node: MappingNode | null;
  mapped: "mapped" | "partial" | "unmapped" | "missing";
  /** Other template paths with the same mapped suffix (e.g. tender/tenderers/name for bids/.../name). */
  relatedMappings: RelatedMapping[];
}

export interface RelatedMapping {
  path: string;
  stage: StageKey;
  mapping: string;
  suffixMatch: string;
}

/** Mapped template paths that share a trailing segment with the indicator path. */
export function findRelatedMappedPaths(
  index: Map<string, PathIndexEntry>,
  normalized: string,
  maxResults = 3,
): RelatedMapping[] {
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 2) return [];

  const results: RelatedMapping[] = [];
  const seen = new Set<string>();

  for (let len = Math.min(4, parts.length); len >= 2; len--) {
    const suffix = parts.slice(-len).join("/");
    for (const [path, entry] of index) {
      if (path === normalized) continue;
      if (entry.node.mapped !== "mapped" || !entry.node.mapping?.trim()) continue;
      if (!path.endsWith("/" + suffix) && path !== suffix) continue;
      if (seen.has(path)) continue;
      seen.add(path);
      results.push({
        path,
        stage: entry.stage,
        mapping: entry.node.mapping,
        suffixMatch: suffix,
      });
    }
  }

  return results
    .sort((a, b) => b.suffixMatch.length - a.suffixMatch.length)
    .slice(0, maxResults);
}

function sharedPathSuffix(a: string, b: string, minSegments = 2): string | null {
  const aParts = a.split("/").filter(Boolean);
  const bParts = b.split("/").filter(Boolean);
  const maxLen = Math.min(4, aParts.length, bParts.length);
  for (let len = maxLen; len >= minSegments; len--) {
    const aSuffix = aParts.slice(-len).join("/");
    const bSuffix = bParts.slice(-len).join("/");
    if (aSuffix === bSuffix) return aSuffix;
  }
  return null;
}

export function resolveIndicatorPaths(
  indicator: RiskIndicator,
  index: Map<string, PathIndexEntry>,
): ResolvedPath[] {
  return indicator.paths.map((requirement) => {
    const normalized = normalizeOcdsPath(requirement.path);
    const exact = index.get(normalized) ?? null;
    const relatedMappings =
      !exact || exact.node.mapped !== "mapped"
        ? findRelatedMappedPaths(index, normalized)
        : [];

    if (!exact) {
      return {
        requirement,
        normalized,
        stage: inferStageFromPath(normalized),
        node: null,
        mapped: "missing" as const,
        relatedMappings,
      };
    }
    return {
      requirement,
      normalized,
      stage: exact.stage,
      node: exact.node,
      mapped: exact.node.mapped,
      relatedMappings,
    };
  });
}

export interface IndicatorReadiness {
  requiredTotal: number;
  requiredMapped: number;
  requiredPct: number;
  allMapped: number;
  allTotal: number;
  paths: ResolvedPath[];
}

export function computeIndicatorReadiness(
  indicator: RiskIndicator,
  index: Map<string, PathIndexEntry>,
): IndicatorReadiness {
  const paths = resolveIndicatorPaths(indicator, index);
  const required = paths.filter((p) => p.requirement.required);
  const requiredMapped = required.filter((p) => p.mapped === "mapped").length;
  const allMapped = paths.filter((p) => p.mapped === "mapped").length;
  return {
    requiredTotal: required.length,
    requiredMapped,
    requiredPct: required.length
      ? Math.round((100 * requiredMapped) / required.length)
      : 100,
    allMapped,
    allTotal: paths.length,
    paths,
  };
}

function mappingDetailsPaths(details: string): string[] {
  return details
    .split(/[,;]/)
    .map((s) => normalizeOcdsPath(s.trim()))
    .filter(Boolean);
}

function pathMatchesIndicatorPath(indicatorPath: string, candidate: string): boolean {
  const a = normalizeOcdsPath(indicatorPath);
  const b = normalizeOcdsPath(candidate);
  if (a === b || a.startsWith(b + "/") || b.startsWith(a + "/")) return true;
  return sharedPathSuffix(a, b) !== null;
}

/** Data elements whose mapping_details reference any indicator OCDS path. */
export function dataElementsForIndicator(
  rows: DataElementRow[],
  indicator: RiskIndicator,
): DataElementRow[] {
  const indicatorPaths = indicator.paths.map((p) => normalizeOcdsPath(p.path));
  return rows.filter((row) => {
    const details = mappingDetailsPaths(row.mapping_details || "");
    if (details.some((d) => indicatorPaths.some((ip) => pathMatchesIndicatorPath(ip, d)))) {
      return true;
    }
    return false;
  });
}

export function findNodeByPath(
  doc: MappingDocument,
  stage: StageKey,
  path: string,
): MappingNode | null {
  const target = normalizeOcdsPath(path);
  const flat = doc.stages[stage]?.flat ?? [];
  return flat.find((n) => normalizeOcdsPath(n.path) === target) ?? null;
}

function findNodeInTree(nodes: MappingNode[], id: string): MappingNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const hit = findNodeInTree(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

/** Resolve stage + node for an OCDS path (tries requested stage, then all stages). */
export function resolvePathNode(
  doc: MappingDocument,
  stageKey: StageKey,
  path: string,
): { stage: StageKey; node: MappingNode } | null {
  let node = findNodeByPath(doc, stageKey, path);
  let stage = stageKey;
  if (!node) {
    const alt = Object.keys(doc.stages).find((sk) => findNodeByPath(doc, sk as StageKey, path));
    if (alt) {
      node = findNodeByPath(doc, alt as StageKey, path);
      stage = alt as StageKey;
    }
  }
  return node ? { stage, node } : null;
}

export function findBaseNode(
  rawDoc: MappingDocument,
  stage: StageKey,
  nodeId: string,
): MappingNode | null {
  return findNodeInTree(rawDoc.stages[stage]?.tree ?? [], nodeId);
}
