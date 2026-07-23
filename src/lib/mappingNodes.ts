/** OCP template row types that accept source-field mappings (leaves only). */

import type { MappingNode } from "../types";

export const MAPPABLE_FIELD_ROW_TYPES = new Set([
  "field",
  "required_field",
  "extension_field",
  "additional_field",
]);

/** Structural object / reference groups — navigate only, do not map. */
export const CONTAINER_ROW_TYPES = new Set([
  "span",
  "extension_span",
  "ref_span",
  "required_span",
]);

/** Structural headers — section labels, subtitles, extension block intros. */
export const STRUCTURAL_HEADER_ROW_TYPES = new Set([
  "section",
  "subtitle",
  "extension_intro",
]);

export function isMappableFieldNode(node: { row_type: string }): boolean {
  return MAPPABLE_FIELD_ROW_TYPES.has(node.row_type);
}

export function isContainerNode(node: { row_type: string }): boolean {
  return CONTAINER_ROW_TYPES.has(node.row_type);
}

export function isStructuralHeaderNode(node: { row_type: string }): boolean {
  return STRUCTURAL_HEADER_ROW_TYPES.has(node.row_type);
}

/** Tree rows that open a read-only detail panel (not mappable). */
export function isDetailOnlyNode(node: { row_type: string }): boolean {
  return isContainerNode(node) || isStructuralHeaderNode(node);
}

/** URL params for explorer tree selection (pathless nodes use `node` id). */
export function explorerSelectionParams(
  node: MappingNode,
): { path: string | null; nodeId: string | null } {
  if (node.path) return { path: node.path, nodeId: null };
  return { path: null, nodeId: node.id };
}
