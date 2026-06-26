/** Risk indicator types — definitions live in public/indicator_packs/*.json */

export type IndicatorKind = "cardinal" | "custom";
export type Feasibility = "yes" | "partial" | "no";
export type IndicatorScope = "OCID" | "Buyer" | "ProcuringEntity" | "Tenderer";

export interface PathRequirement {
  /** OCDS JSON path (Cardinal notation; arrays as `[]`). */
  path: string;
  required: boolean;
  note?: string;
}

export interface IndicatorComputation {
  summary?: string;
  steps?: string[];
  thresholds_note?: string;
}

export interface RiskIndicator {
  id: string;
  name: string;
  kind: IndicatorKind;
  scope: IndicatorScope;
  description: string;
  paths: PathRequirement[];
  /** Plain-language signal — what the indicator measures. */
  tracks?: string;
  computation?: IndicatorComputation;
  /** What a positive hit / flag means. */
  interpretation?: string;
  limitations?: string;
  /** Runtime feasibility per data profile id (from feasibility overlay pack). */
  feasibility: Record<string, Feasibility>;
  priority?: number;
  docs_url?: string;
  pack_id?: string;
}

export function feasibilityLabel(f: Feasibility): string {
  if (f === "yes") return "Feasible";
  if (f === "partial") return "Partial";
  return "Blocked";
}

/** @deprecated Use docs_url */
export function indicatorDocsUrl(indicator: RiskIndicator): string | undefined {
  return indicator.docs_url;
}
