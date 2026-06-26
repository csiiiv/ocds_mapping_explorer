import type { MappingDocument, MappingNode } from "../types";
import { findNodeByPath } from "./indicatorMapping";

export interface ReleaseEnvelopePath {
  path: string;
  label: string;
  required: boolean;
}

/** Curated release-level OCDS paths (General stage). */
export const RELEASE_ENVELOPE_PATHS: ReleaseEnvelopePath[] = [
  { path: "ocid", label: "Open Contracting ID", required: true },
  { path: "id", label: "Release ID", required: true },
  { path: "date", label: "Release date", required: true },
  { path: "tag", label: "Release tag", required: true },
  { path: "initiationType", label: "Initiation type", required: true },
  { path: "language", label: "Release language", required: false },
  { path: "buyer/name", label: "Buyer name", required: false },
  { path: "buyer/id", label: "Buyer ID", required: false },
  { path: "parties/id", label: "Party ID", required: false },
  { path: "parties/name", label: "Party name", required: false },
];

export interface ReleaseEnvelopeRow {
  spec: ReleaseEnvelopePath;
  node: MappingNode | null;
  mapped: MappingNode["mapped"] | "missing";
}

export interface ReleaseEnvelopeStats {
  requiredTotal: number;
  requiredMapped: number;
  requiredPct: number;
  rows: ReleaseEnvelopeRow[];
}

export function computeReleaseEnvelope(doc: MappingDocument): ReleaseEnvelopeStats {
  const rows: ReleaseEnvelopeRow[] = RELEASE_ENVELOPE_PATHS.map((spec) => {
    const node = findNodeByPath(doc, "general", spec.path);
    return {
      spec,
      node,
      mapped: node ? node.mapped : "missing",
    };
  });
  const required = rows.filter((r) => r.spec.required);
  const requiredMapped = required.filter((r) => r.mapped === "mapped").length;
  return {
    requiredTotal: required.length,
    requiredMapped,
    requiredPct: required.length ? Math.round((100 * requiredMapped) / required.length) : 100,
    rows,
  };
}

/** Sample release header JSON for preview (publication config + mapped examples). */
export function buildReleasePreview(
  doc: MappingDocument,
  ocidPrefix: string,
): Record<string, unknown> {
  const get = (path: string) => findNodeByPath(doc, "general", path);
  const example = (path: string) => get(path)?.example?.trim() || get(path)?.mapping?.trim() || "";
  const prefix = ocidPrefix.trim() || "ocds-example";
  return {
    ocid: example("ocid") || `${prefix}-process-0001`,
    id: example("id") || "release-0001",
    date: example("date") || "2026-01-15T00:00:00Z",
    tag: example("tag") ? example("tag").split(/[,;]/).map((s) => s.trim()) : ["tender"],
    initiationType: example("initiationType") || "tender",
    language: example("language") || "en",
    buyer: {
      name: example("buyer/name") || "…",
      id: example("buyer/id") || "…",
    },
    parties: [
      {
        id: example("parties/id") || "…",
        name: example("parties/name") || "…",
      },
    ],
  };
}

export function canonicalFieldSuggestions(doc: MappingDocument): string[] {
  const keys = new Set<string>();
  for (const row of doc.data_elements.rows) {
    if (row.section_table && row.data_element) {
      keys.add(`${row.section_table}.${row.data_element}`.toLowerCase());
    }
    const fm = row.for_mapping.trim();
    if (fm) keys.add(fm);
  }
  return [...keys].sort();
}
