import type { DataElementRow, DataSourceRow } from "../types";
import type { MappingProject } from "./project";
import type { ExtensionProposal } from "./extensionProposals";
import type { PublicationConfig } from "./publicationConfig";
import { elementKey } from "./importExport";

export function inventoryStorageKey(projectId: string) {
  return `ocds-mapping-inventory-${projectId}-v1`;
}

export interface StoredInventory {
  data_sources: MappingProject["data_sources"];
  data_elements: MappingProject["data_elements"];
  extension_proposals?: ExtensionProposal[];
  publication_config?: PublicationConfig;
  updated_at: string;
  /** True only after explicit user inventory edits (not passive project-switch snapshots). */
  is_dirty?: boolean;
}

export function clearStoredInventory(projectId: string) {
  try {
    localStorage.removeItem(inventoryStorageKey(projectId));
  } catch {
    /* ignore */
  }
}

function overlayInventory(fileProj: MappingProject, stored: StoredInventory): MappingProject {
  return {
    ...fileProj,
    data_sources: stored.data_sources,
    data_elements: stored.data_elements,
    extension_proposals: stored.extension_proposals ?? fileProj.extension_proposals ?? [],
    publication_config: stored.publication_config ?? fileProj.publication_config,
  };
}

/** Apply localStorage inventory overlay only when it represents real user edits. */
export function applyStoredInventory(
  projectId: string,
  fileProj: MappingProject,
): { project: MappingProject; inventoryDirty: boolean } {
  const stored = loadStoredInventory(projectId);
  if (!stored) return { project: fileProj, inventoryDirty: false };

  const fileSources = fileProj.data_sources.rows.length;
  const storedSources = stored.data_sources.rows.length;
  const fileElements = fileProj.data_elements.rows.length;
  const storedElements = stored.data_elements.rows.length;

  if (stored.is_dirty) {
    return { project: overlayInventory(fileProj, stored), inventoryDirty: true };
  }

  // Corrupt empty snapshot (e.g. project-switch bleed before dirty flag existed)
  if (fileSources > 0 && storedSources === 0) {
    clearStoredInventory(projectId);
    return { project: fileProj, inventoryDirty: false };
  }
  if (fileElements > 50 && storedElements === 0) {
    clearStoredInventory(projectId);
    return { project: fileProj, inventoryDirty: false };
  }

  const sameShape =
    fileSources === storedSources && fileElements === storedElements;
  if (sameShape) {
    clearStoredInventory(projectId);
    return { project: fileProj, inventoryDirty: false };
  }

  // Legacy user edits saved before is_dirty existed
  return { project: overlayInventory(fileProj, stored), inventoryDirty: true };
}

export function loadStoredInventory(projectId: string): StoredInventory | null {
  try {
    const raw = localStorage.getItem(inventoryStorageKey(projectId));
    return raw ? (JSON.parse(raw) as StoredInventory) : null;
  } catch {
    return null;
  }
}

export function saveStoredInventory(projectId: string, project: MappingProject) {
  const payload: StoredInventory = {
    data_sources: project.data_sources,
    data_elements: project.data_elements,
    extension_proposals: project.extension_proposals ?? [],
    publication_config: project.publication_config,
    updated_at: new Date().toISOString(),
    is_dirty: true,
  };
  localStorage.setItem(inventoryStorageKey(projectId), JSON.stringify(payload));
}

export function buildForMappingLabel(sectionTable: string, dataElement: string): string {
  const section = sectionTable.trim();
  const field = dataElement.trim();
  if (!section && !field) return "";
  if (!section) return field;
  if (!field) return section;
  return `${section} (${field})`;
}

const ZERO_COUNTS = {
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

export function createDataElementRow(input: {
  data_source: string;
  section_table: string;
  data_element: string;
  for_mapping?: string;
  publish?: string;
  example?: string;
  description?: string;
  data_type?: string;
  notes?: string;
  mapped?: string;
  mapping_details?: string;
}): DataElementRow {
  const section_table = input.section_table.trim();
  const data_element = input.data_element.trim();
  const for_mapping =
    input.for_mapping?.trim() || buildForMappingLabel(section_table, data_element);
  return {
    for_mapping,
    data_source: input.data_source.trim(),
    section_table,
    data_element,
    publish: input.publish?.trim() || "Yes",
    example: input.example?.trim() || "",
    description: input.description?.trim() || "",
    data_type: input.data_type?.trim() || "",
    notes: input.notes?.trim() || "",
    mapped: input.mapped?.trim() || "",
    mapping_details: input.mapping_details?.trim() || "",
    key: elementKey(section_table, data_element),
    ...ZERO_COUNTS,
  };
}

export function emptyDataSourceRow(): DataSourceRow {
  return {
    short_name: "",
    data_source: "",
    vendor: "",
    url_documentation: "",
    agency_unit_responsible: "",
    planning: "",
    tender: "",
    award: "",
    contract: "",
    implementation_physical: "",
    implementation_financial: "",
    revision_history: "",
    documents_available: "",
    existing_apis_data_publication: "",
  };
}

export const STAGE_COVERAGE_FIELDS = [
  { key: "planning", label: "Planning" },
  { key: "tender", label: "Tender" },
  { key: "award", label: "Award" },
  { key: "contract", label: "Contract" },
  { key: "implementation_physical", label: "Implementation (physical)" },
  { key: "implementation_financial", label: "Implementation (financial)" },
] as const;

export const YES_NO_OPTIONS = ["", "Yes", "No", "Partial"] as const;
