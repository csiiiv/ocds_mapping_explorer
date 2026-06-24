import { filterRealDataElements } from "./dataElements";
import type { MappingProject } from "./project";
import { normalizePublicationConfig, publicationConfigForExport } from "./publicationConfig";

export interface MappingYamlDocument {
  version: number;
  meta: {
    project_id: string;
    name: string;
    source_system: string;
    ocds_version: string;
    exported_at: string;
  };
  data_elements: Array<{
    key: string;
    for_mapping: string;
    data_source: string;
    section_table: string;
    data_element: string;
    mapping_details?: string;
    publish?: string;
  }>;
  ocds_mappings: Record<
    string,
    Record<string, { for_mapping: string; example?: string; notes?: string }>
  >;
  extension_proposals?: Array<{
    extension: string;
    path: string;
    title: string;
    data_type: string;
    status: string;
    for_mapping?: string;
    description?: string;
  }>;
  publication?: Record<string, unknown>;
}

function yamlScalar(value: string): string {
  if (value === "") return '""';
  if (/^[\w.-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

function yamlDumpValue(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);
  if (value === null || value === undefined) return '""';
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "string") return yamlScalar(value);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return value
      .map((item) => {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          const lines = yamlDumpObject(item as Record<string, unknown>, indent + 1)
            .split("\n")
            .filter(Boolean);
          const head = lines.shift() ?? "{}";
          return `${pad}- ${head}\n${lines.map((l) => `${pad}  ${l}`).join("\n")}`;
        }
        return `${pad}- ${yamlDumpValue(item, indent + 1)}`;
      })
      .join("\n");
  }
  return yamlDumpObject(value as Record<string, unknown>, indent);
}

function yamlDumpObject(obj: Record<string, unknown>, indent: number): string {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === "object") {
      if (Array.isArray(value)) {
        if (!value.length) continue;
        lines.push(`${pad}${key}:`);
        lines.push(yamlDumpValue(value, indent + 1));
        continue;
      }
      const nested = yamlDumpObject(value as Record<string, unknown>, indent + 1);
      if (!nested.trim()) continue;
      lines.push(`${pad}${key}:`);
      lines.push(nested);
      continue;
    }
    if (value === "" && key !== "for_mapping") continue;
    lines.push(`${pad}${key}: ${yamlDumpValue(value, indent + 1)}`);
  }
  return lines.join("\n");
}

export function buildMappingYamlDocument(project: MappingProject): MappingYamlDocument {
  const byStage: MappingYamlDocument["ocds_mappings"] = {};
  for (const [key, edit] of Object.entries(project.mapping_edits ?? {})) {
    const sep = key.indexOf("::");
    if (sep < 0) continue;
    const stage = key.slice(0, sep);
    const path = key.slice(sep + 2);
    if (!path || !edit.mapping?.trim()) continue;
    if (!byStage[stage]) byStage[stage] = {};
    byStage[stage][path] = {
      for_mapping: edit.mapping,
      ...(edit.example ? { example: edit.example } : {}),
      ...(edit.notes ? { notes: edit.notes } : {}),
    };
  }

  const data_elements = filterRealDataElements(project.data_elements.rows).map((row) => ({
    key: row.key,
    for_mapping: row.for_mapping,
    data_source: row.data_source,
    section_table: row.section_table,
    data_element: row.data_element,
    ...(row.mapping_details ? { mapping_details: row.mapping_details } : {}),
    ...(row.publish ? { publish: row.publish } : {}),
  }));

  const proposals = (project.extension_proposals ?? [])
    .filter((p) => p.extension || p.path)
    .map((p) => ({
      extension: p.extension,
      path: p.path,
      title: p.title,
      data_type: p.data_type,
      status: p.status ?? "draft",
      ...(p.for_mapping ? { for_mapping: p.for_mapping } : {}),
      ...(p.description ? { description: p.description } : {}),
    }));

  const pub = project.publication_config
    ? publicationConfigForExport(normalizePublicationConfig(project.publication_config))
    : null;

  return {
    version: 1,
    meta: {
      project_id: project.metadata.project_id,
      name: project.metadata.name,
      source_system: project.metadata.source_system ?? "",
      ocds_version: project.metadata.ocds_version ?? "1.1.5",
      exported_at: project.metadata.updated_at || new Date().toISOString(),
    },
    data_elements,
    ocds_mappings: byStage,
    ...(proposals.length ? { extension_proposals: proposals } : {}),
    ...(pub && Object.keys(pub).length > 1 ? { publication: pub } : {}),
  };
}

export function exportMappingYaml(project: MappingProject): string {
  const doc = buildMappingYamlDocument(project);
  return `${yamlDumpObject(doc as unknown as Record<string, unknown>, 0)}\n`;
}

/** Count mapped OCDS paths (for UI summary). */
export function countYamlMappings(project: MappingProject): { stages: number; paths: number } {
  const doc = buildMappingYamlDocument(project);
  const stages = Object.keys(doc.ocds_mappings).length;
  const paths = Object.values(doc.ocds_mappings).reduce((n, stage) => n + Object.keys(stage).length, 0);
  return { stages, paths };
}
