import type {
  DataElementRow,
  FieldEdit,
  MappingDocument,
  OcdsSchemaRow,
  Stage,
  StageKey,
} from "../types";
import type { ExtensionProposal } from "./extensionProposals";
import type { PublicationConfig } from "./publicationConfig";
import { isKnownProjectId } from "./localProjects";

export interface ImportRecord {
  filename: string;
  scope: string;
  imported_at: string;
  rows_added?: number;
  rows_updated?: number;
  /** project_id from an imported file when it differs from the active shell project */
  source_project_id?: string;
}

export interface ProjectMetadata {
  project_id: string;
  name: string;
  description?: string;
  source_system?: string;
  ocds_version: string;
  template_version?: string;
  source_file?: string;
  created_at: string;
  updated_at: string;
  imports?: ImportRecord[];
}

export interface MappingProject {
  metadata: ProjectMetadata;
  data_sources: MappingDocument["data_sources"];
  data_elements: MappingDocument["data_elements"];
  mapping_edits: Record<string, FieldEdit>;
  data_element_additions?: DataElementRow[];
  extension_proposals?: ExtensionProposal[];
  publication_config?: PublicationConfig;
}

export interface OcdsReference {
  ocds_version: string;
  metadata: {
    title: string;
    version_line: string;
    instructions: string[];
    sheet_names?: string[];
    generated_at?: string;
  };
  stages: Record<string, Stage>;
  ocds_schema: OcdsSchemaRow[];
  ocds_extensions: OcdsSchemaRow[];
}

export const PROJECT_STORAGE_KEY = "ocds-mapping-active-project-v1";

export const DEFAULT_PROJECT_ID = "blank";

/** Map stored or requested id to a known project; migrates unknown ids to default. */
export function resolveProjectId(stored: string | null | undefined): string {
  const id = stored?.trim() || DEFAULT_PROJECT_ID;
  if (isKnownProjectId(id)) return id;
  return DEFAULT_PROJECT_ID;
}

export function editsStorageKey(projectId: string) {
  return `ocds-mapping-edits-${projectId}-v1`;
}

export function editKey(stage: StageKey, path: string) {
  return `${stage}::${path}`;
}

/** Merge bundled OCDS reference with a project file into app-ready MappingDocument. */
export function mergeReferenceAndProject(
  reference: OcdsReference,
  project: MappingProject,
): MappingDocument {
  const stages = structuredClone(reference.stages) as MappingDocument["stages"];

  const additions = project.data_element_additions ?? [];
  const elementRows = [...project.data_elements.rows];
  const keys = new Set(elementRows.map((r) => r.key));
  for (const row of additions) {
    if (!keys.has(row.key)) {
      elementRows.push(row);
      keys.add(row.key);
    }
  }

  return {
    metadata: {
      title: reference.metadata.title,
      version_line: reference.metadata.version_line,
      instructions: reference.metadata.instructions,
      source_file: project.metadata.source_file || reference.metadata.title,
      generated_at: project.metadata.updated_at,
      sheet_names: reference.metadata.sheet_names ?? [],
      project_id: project.metadata.project_id,
      project_name: project.metadata.name,
      project_description: project.metadata.description,
      source_system: project.metadata.source_system,
    },
    data_sources: project.data_sources,
    data_elements: {
      ...project.data_elements,
      rows: elementRows,
    },
    stages,
    ocds_schema: reference.ocds_schema,
    ocds_extensions: reference.ocds_extensions,
  };
}

export interface ProjectManifestEntry {
  id: string;
  name: string;
  description: string;
  file: string;
}

/**
 * Bundled projects shipped under public/projects/{id}.json.
 * Filename stem must match `id` and `metadata.project_id` in the JSON file.
 */
export const BUILTIN_PROJECTS: ProjectManifestEntry[] = [
  {
    id: "blank",
    name: "Blank project",
    description: "Empty source inventory — start a new OCDS mapping",
    file: "projects/blank.json",
  },
  {
    id: "mphilgeps",
    name: "mPhilGEPS",
    description: "Philippines mPhilGEPS field-level mapping (PS-DBM template v0.91)",
    file: "projects/mphilgeps.json",
  },
  {
    id: "philgeps-1.5",
    name: "PhilGEPS 1.5",
    description: "Philippines PhilGEPS 1.5 field-level mapping (PS-DBM template v0.91)",
    file: "projects/philgeps-1.5.json",
  },
];

export function findShippedProject(projectId: string): ProjectManifestEntry | undefined {
  return BUILTIN_PROJECTS.find((p) => p.id === projectId);
}

export function routableProjectIds(localIds: readonly string[]): string[] {
  const ids = new Set<string>([...BUILTIN_PROJECTS.map((p) => p.id), ...localIds]);
  return [...ids];
}
