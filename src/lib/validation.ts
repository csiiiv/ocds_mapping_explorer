import { buildDataElementIndex, countPlaceholderElements, isPlaceholderDataElement, normalizeMappingKey, resolveDataElement } from "./dataElements";
import { inferStageFromPath, normalizeOcdsPath } from "./indicatorMapping";
import { MAPPABLE_FIELD_ROW_TYPES } from "./mappingNodes";
import type { DataElementRow, DataSourceRow, MappingDocument, MappingNode, StageKey } from "../types";
import { STAGES } from "../types";

const FIELD_TYPES = MAPPABLE_FIELD_ROW_TYPES;

export type ValidationSeverity = "error" | "warning" | "info";

export type ValidationCategory =
  | "broken_mapping"
  | "orphan_element"
  | "unmapped_required"
  | "invalid_mapping_details"
  | "duplicate_source"
  | "duplicate_element";

export interface ValidationIssue {
  id: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  message: string;
  stage?: StageKey;
  path?: string;
  forMapping?: string;
  elementKey?: string;
  shortName?: string;
  mappingDetails?: string;
}

export interface ValidationReport {
  issues: ValidationIssue[];
  byCategory: Record<ValidationCategory, number>;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  /** Template rows with for_mapping "()" and no table/field — excluded from inventory checks. */
  placeholderRowCount: number;
}

export const VALIDATION_CATEGORY_LABELS: Record<ValidationCategory, string> = {
  broken_mapping: "Broken for_mapping link",
  orphan_element: "Orphan data element",
  unmapped_required: "Required OCDS field unmapped",
  invalid_mapping_details: "Invalid mapping_details path",
  duplicate_source: "Duplicate data source",
  duplicate_element: "Duplicate element key",
};

export function splitMappingDetails(details: string): string[] {
  return details
    .split(/[,;]/)
    .map((s) => normalizeOcdsPath(s.trim()))
    .filter(Boolean);
}

function buildKnownPaths(doc: MappingDocument): Set<string> {
  const known = new Set<string>();
  for (const row of doc.ocds_schema) {
    if (row.path) known.add(normalizeOcdsPath(row.path));
  }
  for (const row of doc.ocds_extensions) {
    if (row.path) known.add(normalizeOcdsPath(row.path));
  }
  for (const stage of STAGES) {
    for (const node of doc.stages[stage.key]?.flat ?? []) {
      if (node.path) known.add(normalizeOcdsPath(node.path));
    }
  }
  return known;
}

function pathKnown(normalized: string, known: Set<string>): boolean {
  if (known.has(normalized)) return true;
  const parts = normalized.split("/");
  while (parts.length > 1) {
    parts.pop();
    if (known.has(parts.join("/"))) return true;
  }
  return false;
}

function collectMappedFields(doc: MappingDocument): MappingNode[] {
  const nodes: MappingNode[] = [];
  for (const stage of STAGES) {
    for (const node of doc.stages[stage.key]?.flat ?? []) {
      if (!FIELD_TYPES.has(node.row_type) || !node.path) continue;
      if (node.mapping?.trim()) nodes.push(node);
    }
  }
  return nodes;
}

function issueId(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join("::");
}

export function runValidation(doc: MappingDocument): ValidationReport {
  const issues: ValidationIssue[] = [];
  const placeholderRowCount = countPlaceholderElements(doc.data_elements.rows);
  const elementIndex = buildDataElementIndex(doc.data_elements.rows);
  const knownPaths = buildKnownPaths(doc);

  const referencedForMapping = new Set<string>();
  for (const node of collectMappedFields(doc)) {
    const label = normalizeMappingKey(node.mapping);
    if (!label) continue;
    referencedForMapping.add(label);

    if (!resolveDataElement(elementIndex, node.mapping)) {
      issues.push({
        id: issueId(["broken", node.path, node.mapping]),
        category: "broken_mapping",
        severity: "error",
        message: `OCDS field "${node.path}" maps to "${node.mapping}" but no matching data element exists.`,
        stage: inferStageFromPath(node.path),
        path: node.path,
        forMapping: node.mapping,
      });
    }
  }

  for (const row of doc.data_elements.rows) {
    if (isPlaceholderDataElement(row)) continue;
    if (!row.for_mapping?.trim()) continue;
    const publish = row.publish?.trim().toLowerCase();
    if (publish !== "yes") continue;
    const key = normalizeMappingKey(row.for_mapping);
    if (!referencedForMapping.has(key)) {
      issues.push({
        id: issueId(["orphan", row.key]),
        category: "orphan_element",
        severity: "warning",
        message: `Data element "${row.for_mapping}" (publish=Yes) is not referenced by any OCDS field mapping.`,
        forMapping: row.for_mapping,
        elementKey: row.key,
      });
    }
  }

  for (const stage of STAGES) {
    for (const node of doc.stages[stage.key]?.flat ?? []) {
      if (node.row_type !== "required_field" || !node.path) continue;
      if (node.mapped === "mapped") continue;
      issues.push({
        id: issueId(["required", stage.key, node.path]),
        category: "unmapped_required",
        severity: "warning",
        message: `Required OCDS field "${node.path}" is ${node.mapped}.`,
        stage: stage.key,
        path: node.path,
        forMapping: node.mapping || undefined,
      });
    }
  }

  for (const row of doc.data_elements.rows) {
    if (isPlaceholderDataElement(row)) continue;
    const details = splitMappingDetails(row.mapping_details || "");
    if (!details.length) continue;
    for (const detailPath of details) {
      if (pathKnown(detailPath, knownPaths)) continue;
      issues.push({
        id: issueId(["details", row.key, detailPath]),
        category: "invalid_mapping_details",
        severity: "warning",
        message: `mapping_details "${detailPath}" on "${row.for_mapping || row.key}" is not in the OCDS reference.`,
        forMapping: row.for_mapping,
        elementKey: row.key,
        mappingDetails: detailPath,
        stage: inferStageFromPath(detailPath),
        path: detailPath,
      });
    }
  }

  const sourceNames = new Map<string, DataSourceRow[]>();
  for (const src of doc.data_sources.rows) {
    const k = src.short_name.trim().toLowerCase();
    if (!k) continue;
    const list = sourceNames.get(k) ?? [];
    list.push(src);
    sourceNames.set(k, list);
  }
  for (const [name, group] of sourceNames) {
    if (group.length < 2) continue;
    issues.push({
      id: issueId(["dup-src", name]),
      category: "duplicate_source",
      severity: "error",
      message: `Duplicate data source short name "${group[0].short_name}" (${group.length} rows).`,
      shortName: group[0].short_name,
    });
  }

  const elementKeys = new Map<string, DataElementRow[]>();
  for (const row of doc.data_elements.rows) {
    if (isPlaceholderDataElement(row)) continue;
    const k = row.key.trim().toLowerCase();
    if (!k) continue;
    const list = elementKeys.get(k) ?? [];
    list.push(row);
    elementKeys.set(k, list);
  }
  for (const [key, group] of elementKeys) {
    if (group.length < 2) continue;
    issues.push({
      id: issueId(["dup-el", key]),
      category: "duplicate_element",
      severity: "error",
      message: `Duplicate data element key "${group[0].key}" (${group.length} rows).`,
      elementKey: group[0].key,
      forMapping: group.map((r) => r.for_mapping).join(", "),
    });
  }

  const byCategory = {
    broken_mapping: 0,
    orphan_element: 0,
    unmapped_required: 0,
    invalid_mapping_details: 0,
    duplicate_source: 0,
    duplicate_element: 0,
  } satisfies Record<ValidationCategory, number>;

  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;
  for (const issue of issues) {
    byCategory[issue.category]++;
    if (issue.severity === "error") errorCount++;
    else if (issue.severity === "warning") warningCount++;
    else infoCount++;
  }

  issues.sort((a, b) => {
    const rank = { error: 0, warning: 1, info: 2 };
    const d = rank[a.severity] - rank[b.severity];
    if (d !== 0) return d;
    return a.message.localeCompare(b.message);
  });

  return { issues, byCategory, errorCount, warningCount, infoCount, placeholderRowCount };
}
