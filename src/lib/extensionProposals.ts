import type { MappingProject } from "./project";

export type ExtensionProposalStatus = "draft" | "proposed";

export interface ExtensionProposal {
  id: string;
  extension: string;
  path: string;
  title: string;
  description: string;
  data_type: string;
  for_mapping: string;
  status: ExtensionProposalStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export function proposalsStorageKey(projectId: string) {
  return `ocds-mapping-extension-proposals-${projectId}-v1`;
}

export function loadStoredProposals(projectId: string): ExtensionProposal[] | null {
  try {
    const raw = localStorage.getItem(proposalsStorageKey(projectId));
    return raw ? (JSON.parse(raw) as ExtensionProposal[]) : null;
  } catch {
    return null;
  }
}

export function saveStoredProposals(projectId: string, proposals: ExtensionProposal[]) {
  localStorage.setItem(proposalsStorageKey(projectId), JSON.stringify(proposals));
}

export function clearStoredProposals(projectId: string) {
  try {
    localStorage.removeItem(proposalsStorageKey(projectId));
  } catch {
    /* ignore */
  }
}

export function mergeProjectProposals(project: MappingProject): ExtensionProposal[] {
  const file = project.extension_proposals ?? [];
  const stored = loadStoredProposals(project.metadata.project_id);
  if (stored && stored.length > 0) return stored;
  return file;
}

export function emptyProposal(): ExtensionProposal {
  const now = new Date().toISOString();
  return {
    id: `ext-${Date.now()}`,
    extension: "",
    path: "",
    title: "",
    description: "",
    data_type: "string",
    for_mapping: "",
    status: "draft",
    notes: "",
    created_at: now,
    updated_at: now,
  };
}

export function normalizeProposalPath(extension: string, path: string): string {
  const ext = extension.trim().replace(/^\//, "").replace(/\/$/, "");
  const p = path.trim().replace(/^\//, "");
  if (!p) return ext;
  if (ext && p.startsWith(ext + "/")) return p;
  if (ext) return `${ext}/${p}`;
  return p;
}
