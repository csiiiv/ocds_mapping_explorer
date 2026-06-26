/** OCP template row types that accept source-field mappings (leaves only). */

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

export function isMappableFieldNode(node: { row_type: string }): boolean {
  return MAPPABLE_FIELD_ROW_TYPES.has(node.row_type);
}

export function isContainerNode(node: { row_type: string }): boolean {
  return CONTAINER_ROW_TYPES.has(node.row_type);
}
