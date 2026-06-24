import type { FieldEdit, MappingDocument, StageKey } from "../types";
import { isPlaceholderDataElement } from "./dataElements";
import { buildMappingPathIndex, normalizeOcdsPath } from "./indicatorMapping";
import { splitMappingDetails } from "./validation";

export interface AutoLinkProposal {
  stage: StageKey;
  path: string;
  forMapping: string;
  elementKey: string;
  currentMapping: string;
}

/** Suggest OCDS field mappings from data element mapping_details where the field is empty. */
export function buildAutoLinkProposals(doc: MappingDocument): AutoLinkProposal[] {
  const pathIndex = buildMappingPathIndex(doc);
  const seen = new Set<string>();
  const proposals: AutoLinkProposal[] = [];

  for (const el of doc.data_elements.rows) {
    if (isPlaceholderDataElement(el)) continue;
    if (!el.for_mapping?.trim()) continue;
    const details = splitMappingDetails(el.mapping_details || "");
    for (const detailPath of details) {
      const hit = pathIndex.get(detailPath);
      if (!hit?.node.path) continue;
      if (hit.node.mapping?.trim()) continue;

      const dedupe = `${hit.stage}::${hit.node.path}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);

      proposals.push({
        stage: hit.stage,
        path: hit.node.path,
        forMapping: el.for_mapping,
        elementKey: el.key,
        currentMapping: hit.node.mapping || "",
      });
    }
  }

  proposals.sort((a, b) => a.path.localeCompare(b.path));
  return proposals;
}

export function proposalsToEdits(
  proposals: AutoLinkProposal[],
): { stage: StageKey; path: string; patch: FieldEdit }[] {
  return proposals.map((p) => ({
    stage: p.stage,
    path: p.path,
    patch: { mapping: p.forMapping },
  }));
}

/** Count elements with mapping_details that resolve to at least one OCDS path. */
export function countElementsWithMappingDetails(doc: MappingDocument): number {
  const pathIndex = buildMappingPathIndex(doc);
  let n = 0;
  for (const el of doc.data_elements.rows) {
    if (isPlaceholderDataElement(el)) continue;
    const details = splitMappingDetails(el.mapping_details || "");
    if (details.some((d) => pathIndex.has(normalizeOcdsPath(d)))) n++;
  }
  return n;
}
