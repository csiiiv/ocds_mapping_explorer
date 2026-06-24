/** Browser-local mapping projects (localStorage). */

import type { MappingProject } from "./project";
import { BUILTIN_PROJECTS, editsStorageKey } from "./project";
import { clearStoredInventory } from "./inventory";

const REGISTRY_KEY = "ocds-mapping-local-registry-v1";

export interface LocalProjectManifestEntry {
  id: string;
  name: string;
  description: string;
  source_system?: string;
  created_at: string;
  updated_at: string;
}

function projectStorageKey(projectId: string) {
  return `ocds-mapping-local-project-${projectId}-v1`;
}

function loadRegistry(): LocalProjectManifestEntry[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    return raw ? (JSON.parse(raw) as LocalProjectManifestEntry[]) : [];
  } catch {
    return [];
  }
}

function saveRegistry(entries: LocalProjectManifestEntry[]) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(entries));
}

export function isBuiltinProjectId(projectId: string): boolean {
  return BUILTIN_PROJECTS.some((p) => p.id === projectId);
}

export function isLocalProjectId(projectId: string): boolean {
  return loadRegistry().some((e) => e.id === projectId);
}

export function isKnownProjectId(projectId: string): boolean {
  return isBuiltinProjectId(projectId) || isLocalProjectId(projectId);
}

export function listLocalProjects(): LocalProjectManifestEntry[] {
  return loadRegistry();
}

export function loadLocalProject(projectId: string): MappingProject | null {
  try {
    const raw = localStorage.getItem(projectStorageKey(projectId));
    return raw ? (JSON.parse(raw) as MappingProject) : null;
  } catch {
    return null;
  }
}

export function saveLocalProject(project: MappingProject): void {
  const id = project.metadata.project_id;
  if (isBuiltinProjectId(id)) return;

  const now = new Date().toISOString();
  const payload: MappingProject = {
    ...project,
    metadata: { ...project.metadata, updated_at: now },
  };
  localStorage.setItem(projectStorageKey(id), JSON.stringify(payload));

  const registry = loadRegistry();
  const idx = registry.findIndex((e) => e.id === id);
  const entry: LocalProjectManifestEntry = {
    id,
    name: payload.metadata.name,
    description: payload.metadata.description ?? "",
    source_system: payload.metadata.source_system,
    created_at: payload.metadata.created_at || now,
    updated_at: now,
  };
  if (idx >= 0) registry[idx] = { ...registry[idx], ...entry };
  else registry.push(entry);
  saveRegistry(registry);
}

function slugifyId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "project";
}

function allocateProjectId(name: string): string {
  const registry = loadRegistry();
  const taken = new Set([...BUILTIN_PROJECTS.map((p) => p.id), ...registry.map((e) => e.id)]);
  const base = slugifyId(name);
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export function createLocalProject(
  blankTemplate: MappingProject,
  opts: { name: string; sourceSystem?: string; description?: string },
): MappingProject {
  const now = new Date().toISOString();
  const id = allocateProjectId(opts.name);

  const project: MappingProject = structuredClone(blankTemplate);
  project.metadata = {
    ...project.metadata,
    project_id: id,
    name: opts.name.trim() || "Untitled project",
    description:
      opts.description?.trim() ||
      `Local mapping project for ${opts.sourceSystem?.trim() || opts.name.trim() || "new source"}`,
    source_system: opts.sourceSystem?.trim() || "",
    created_at: now,
    updated_at: now,
    imports: [],
  };
  project.mapping_edits = {};
  project.data_element_additions = [];
  project.extension_proposals = [];
  project.publication_config = blankTemplate.publication_config
    ? structuredClone(blankTemplate.publication_config)
    : undefined;

  saveLocalProject(project);
  return project;
}

export function deleteLocalProject(projectId: string): void {
  if (isBuiltinProjectId(projectId)) return;

  localStorage.removeItem(projectStorageKey(projectId));
  localStorage.removeItem(editsStorageKey(projectId));
  clearStoredInventory(projectId);
  saveRegistry(loadRegistry().filter((e) => e.id !== projectId));
}

export interface ProjectListEntry {
  id: string;
  name: string;
  description: string;
  local: boolean;
}

export function listAllProjectEntries(
  builtin: ProjectListEntry[],
): ProjectListEntry[] {
  const local = listLocalProjects().map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    local: true,
  }));
  return [...builtin, ...local];
}
