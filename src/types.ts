// Types that mirror the JSON shape produced by scripts/excel_to_json_mapping.py

export type MappingStatus = "mapped" | "partial" | "unmapped";

export interface FieldEdit {
  mapping?: string;
  example?: string;
  notes?: string;
}

export interface MappingNode {
  id: string;
  row_type: string;
  category: string; // required | field | span | additional | extension | reference | section | subtitle
  path: string;
  name: string;
  title: string;
  description: string;
  mapping: string;
  example: string;
  notes: string;
  mapped: MappingStatus;
  depth: number;
  children?: MappingNode[];
  // Present on section nodes
  section?: string;
}

export interface StageStats {
  total: number;
  mapped: number;
  partial: number;
  unmapped: number;
  coverage_pct: number;
}

export interface Stage {
  title: string;
  subtitle: string;
  tree: MappingNode[];
  flat: MappingNode[];
  stats: StageStats;
}

export interface DataSourceRow {
  short_name: string;
  data_source: string;
  vendor: string;
  url_documentation: string;
  agency_unit_responsible: string;
  planning: string;
  tender: string;
  award: string;
  contract: string;
  implementation_physical: string;
  implementation_financial: string;
  revision_history: string;
  documents_available: string;
  existing_apis_data_publication: string;
  [key: string]: string;
}

export interface DataElementColumn {
  key: string;
  label: string;
  kind: "text" | "mono" | "wrap" | "count" | "presence";
  group: "for_mapping" | "existing_data_elements" | "mapping_statistics";
  subgroup: "" | "summary" | "count" | "presence";
  optional: boolean;
}

export interface DataElementColumnGroup {
  id: string;
  label: string;
  keys: string[];
}

export interface DataElementRow {
  for_mapping: string;
  data_source: string;
  section_table: string;
  data_element: string;
  publish: string;
  example: string;
  description: string;
  data_type: string;
  notes: string;
  mapped: string;
  mapping_details: string;
  count_1_general_all_stages: number;
  count_2_planning: number;
  count_3_tender: number;
  count_4_award: number;
  count_5_contract: number;
  count_6_implementation: number;
  presence_1_general_all_stages: number;
  presence_2_planning: number;
  presence_3_tender: number;
  presence_4_award: number;
  presence_5_contract: number;
  presence_6_implementation: number;
  key: string;
  [key: string]: string | number;
}

export interface OcdsSchemaRow {
  section?: string;
  extension?: string;
  path: string;
  title: string;
  description: string;
  type: string;
  range: string;
  values: string;
  links: string;
  deprecated: string;
  deprecationnotes: string;
  deprecated_bool: boolean;
}

export interface MappingDocument {
  metadata: {
    title: string;
    version_line: string;
    instructions: string[];
    source_file: string;
    generated_at: string;
    sheet_names: string[];
    /** Present when loaded from a split project + reference */
    project_id?: string;
    project_name?: string;
    project_description?: string;
    source_system?: string;
  };
  data_sources: { columns: string[]; rows: DataSourceRow[] };
  data_elements: {
    columns: DataElementColumn[];
    column_groups: DataElementColumnGroup[];
    rows: DataElementRow[];
  };
  stages: Record<string, Stage>;
  ocds_schema: OcdsSchemaRow[];
  ocds_extensions: OcdsSchemaRow[];
}

export type StageKey =
  | "general"
  | "planning"
  | "tender"
  | "award"
  | "contract"
  | "implementation";

export interface StageMeta {
  key: StageKey;
  label: string;
  short: string;
  color: string;
}

export const STAGES: StageMeta[] = [
  { key: "general", label: "General (all stages)", short: "General", color: "#6366f1" },
  { key: "planning", label: "Planning", short: "Planning", color: "#0ea5e9" },
  { key: "tender", label: "Tender", short: "Tender", color: "#10b981" },
  { key: "award", label: "Award", short: "Award", color: "#f59e0b" },
  { key: "contract", label: "Contract", short: "Contract", color: "#ef4444" },
  { key: "implementation", label: "Implementation", short: "Impl.", color: "#a855f7" },
];
