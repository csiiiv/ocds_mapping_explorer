/** Load and merge indicator packs for a mapping project. */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PathRequirement, RiskIndicator } from "./riskIndicators";
import { publicUrl } from "./publicUrl";
import {
  loadIndicatorPreferences,
  resolveIndicatorPreferences,
  saveIndicatorPreferences,
  type IndicatorPreferences,
} from "./indicatorPreferences";

export interface DataProfile {
  id: string;
  name: string;
  description?: string;
}

export interface IndicatorPackMeta {
  pack_id: string;
  name: string;
  description?: string;
  engine?: string;
  jurisdiction?: string;
}

interface PackIndicatorRaw {
  id: string;
  name: string;
  engine: "cardinal" | "custom";
  scope: RiskIndicator["scope"];
  description: string;
  paths: PathRequirement[];
  priority?: number;
  docs_url?: string;
  tracks?: string;
  computation?: RiskIndicator["computation"];
  interpretation?: string;
  limitations?: string;
}

interface IndicatorPackFile extends IndicatorPackMeta {
  version?: string;
  indicators: PackIndicatorRaw[];
}

interface FeasibilityPackFile {
  pack_id: string;
  name?: string;
  feasibility: Record<string, Record<string, string>>;
}

export interface ProjectIndicatorConfig {
  indicator_packs?: string[];
  feasibility_pack?: string;
  data_profiles?: DataProfile[];
}

export interface CatalogCustomPack {
  pack_id: string;
  name: string;
  description?: string;
}

export interface CatalogFeasibilityOverlay {
  pack_id: string;
  name: string;
  description?: string;
  data_profiles: DataProfile[];
}

export interface IndicatorCatalog {
  custom_packs: CatalogCustomPack[];
  feasibility_overlays: CatalogFeasibilityOverlay[];
}

export interface ActiveIndicatorState extends LoadedIndicators {
  preferences: IndicatorPreferences;
  setPreferences: (prefs: Partial<IndicatorPreferences>) => void;
  catalog: IndicatorCatalog | null;
  catalogError: string | null;
}

export interface LoadedIndicators {
  indicators: RiskIndicator[];
  packs: IndicatorPackMeta[];
  profiles: DataProfile[];
  loading: boolean;
  error: string | null;
  warnings: string[];
}

export function preferencesToIndicatorConfig(
  prefs: IndicatorPreferences,
  catalog: IndicatorCatalog | null,
): ProjectIndicatorConfig {
  const overlay = catalog?.feasibility_overlays.find(
    (o) => o.pack_id === prefs.feasibility_overlay,
  );
  return {
    indicator_packs: [...DEFAULT_INDICATOR_PACKS, ...prefs.custom_packs],
    feasibility_pack: overlay?.pack_id,
    data_profiles: overlay?.data_profiles ?? [],
  };
}

/** Cardinal-only indicator config for imported / general-purpose projects. */
export function normalizeIndicatorMetadataForProject(metadata: {
  indicator_packs?: string[];
  feasibility_pack?: string;
  data_profiles?: DataProfile[];
}): {
  indicator_packs: string[];
  feasibility_pack: undefined;
  data_profiles: DataProfile[];
  stripped: string[];
} {
  const stripped: string[] = [];
  const requested = metadata.indicator_packs?.length
    ? metadata.indicator_packs
    : [...DEFAULT_INDICATOR_PACKS];
  const extraPacks = requested.filter((id) => id !== "cardinal");
  if (extraPacks.length) {
    stripped.push(`indicator packs: ${extraPacks.join(", ")}`);
  }
  if (metadata.feasibility_pack) {
    stripped.push(`feasibility pack: ${metadata.feasibility_pack}`);
  }
  if (metadata.data_profiles?.length) {
    stripped.push(`${metadata.data_profiles.length} data profile(s)`);
  }
  return {
    indicator_packs: [...DEFAULT_INDICATOR_PACKS],
    feasibility_pack: undefined,
    data_profiles: [],
    stripped,
  };
}

const PACK_BASE = "indicator_packs";

export const DEFAULT_INDICATOR_PACKS = ["cardinal"] as const;

const packCache = new Map<string, IndicatorPackFile>();
const feasibilityCache = new Map<string, FeasibilityPackFile>();

async function fetchJsonPack<T>(paths: string[]): Promise<T> {
  let lastStatus = 0;
  for (const rel of paths) {
    const res = await fetch(publicUrl(rel));
    lastStatus = res.status;
    if (res.ok) return (await res.json()) as T;
  }
  throw new Error(`HTTP ${lastStatus}`);
}

function packPaths(packId: string): string[] {
  return [`${PACK_BASE}/${packId}.json`];
}

async function fetchPack(packId: string): Promise<IndicatorPackFile> {
  const cached = packCache.get(packId);
  if (cached) return cached;
  const data = await fetchJsonPack<IndicatorPackFile>(packPaths(packId));
  packCache.set(packId, data);
  return data;
}

async function fetchFeasibility(packId: string): Promise<FeasibilityPackFile> {
  const cached = feasibilityCache.get(packId);
  if (cached) return cached;
  const data = await fetchJsonPack<FeasibilityPackFile>(packPaths(packId));
  feasibilityCache.set(packId, data);
  return data;
}

function rawToIndicator(
  raw: PackIndicatorRaw,
  packId: string,
  feasibilityOverlay: FeasibilityPackFile | null,
): RiskIndicator {
  const feasibility: Record<string, RiskIndicator["feasibility"][string]> = {};
  const row = feasibilityOverlay?.feasibility[raw.id];
  if (row) {
    for (const [profileId, value] of Object.entries(row)) {
      if (value === "yes" || value === "partial" || value === "no") {
        feasibility[profileId] = value;
      }
    }
  }
  return {
    id: raw.id,
    name: raw.name,
    kind: raw.engine,
    scope: raw.scope,
    description: raw.description,
    paths: raw.paths,
    tracks: raw.tracks,
    computation: raw.computation,
    interpretation: raw.interpretation,
    limitations: raw.limitations,
    feasibility,
    priority: raw.priority,
    docs_url: raw.docs_url,
    pack_id: packId,
  };
}

export async function loadProjectIndicators(
  config: ProjectIndicatorConfig,
): Promise<{ indicators: RiskIndicator[]; packs: IndicatorPackMeta[]; warnings: string[] }> {
  const requested = config.indicator_packs?.length ? config.indicator_packs : [...DEFAULT_INDICATOR_PACKS];
  const packIds = [...new Set([...DEFAULT_INDICATOR_PACKS, ...requested])];
  const packs: IndicatorPackMeta[] = [];
  const indicators: RiskIndicator[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  let feasibilityOverlay: FeasibilityPackFile | null = null;
  if (config.feasibility_pack) {
    try {
      feasibilityOverlay = await fetchFeasibility(config.feasibility_pack);
    } catch {
      warnings.push(
        `Feasibility pack "${config.feasibility_pack}" is not available — runtime feasibility hidden.`,
      );
      feasibilityOverlay = null;
    }
  }

  for (const packId of packIds) {
    let pack: IndicatorPackFile;
    try {
      pack = await fetchPack(packId);
    } catch {
      if (packId === "cardinal") throw new Error("Cardinal indicator pack is missing from this deployment.");
      warnings.push(`Indicator pack "${packId}" is not bundled — skipped.`);
      continue;
    }
    packs.push({
      pack_id: pack.pack_id,
      name: pack.name,
      description: pack.description,
      engine: pack.engine,
      jurisdiction: pack.jurisdiction,
    });
    for (const raw of pack.indicators) {
      if (seen.has(raw.id)) continue;
      seen.add(raw.id);
      indicators.push(rawToIndicator(raw, packId, feasibilityOverlay));
    }
  }

  indicators.sort((a, b) => {
    const pa = a.priority ?? 99;
    const pb = b.priority ?? 99;
    if (pa !== pb) return pa - pb;
    return a.id.localeCompare(b.id);
  });

  return { indicators, packs, warnings };
}

export function useProjectIndicators(config: ProjectIndicatorConfig | undefined): LoadedIndicators {
  const [state, setState] = useState<LoadedIndicators>({
    indicators: [],
    packs: [],
    profiles: config?.data_profiles ?? [],
    loading: true,
    error: null,
    warnings: [],
  });

  const packKey = (config?.indicator_packs ?? [...DEFAULT_INDICATOR_PACKS]).join(",");
  const feasKey = config?.feasibility_pack ?? "";
  const profilesKey = JSON.stringify(config?.data_profiles ?? []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    const cfg: ProjectIndicatorConfig = {
      indicator_packs: packKey ? packKey.split(",") : [...DEFAULT_INDICATOR_PACKS],
      feasibility_pack: feasKey || undefined,
      data_profiles: JSON.parse(profilesKey) as DataProfile[],
    };

    loadProjectIndicators(cfg)
      .then(({ indicators, packs, warnings }) => {
        if (cancelled) return;
        setState({
          indicators,
          packs,
          profiles: JSON.parse(profilesKey) as DataProfile[],
          loading: false,
          error: null,
          warnings,
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setState({
          indicators: [],
          packs: [],
          profiles: JSON.parse(profilesKey) as DataProfile[],
          loading: false,
          error: String(e),
          warnings: [],
        });
      });

    return () => {
      cancelled = true;
    };
  }, [packKey, feasKey, profilesKey]);

  return state;
}

export function useActiveIndicators(): ActiveIndicatorState {
  const [preferences, setPreferencesState] = useState(() => loadIndicatorPreferences());
  const [catalog, setCatalog] = useState<IndicatorCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(publicUrl(`${PACK_BASE}/catalog.json`))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<IndicatorCatalog>;
      })
      .then((data) => {
        if (!cancelled) {
          setCatalog(data);
          setCatalogError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setCatalog(null);
          setCatalogError(String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const catalogPackIds = useMemo(
    () => catalog?.custom_packs.map((p) => p.pack_id) ?? [],
    [catalog],
  );

  const resolvedPreferences = useMemo(
    () => resolveIndicatorPreferences(preferences, catalogPackIds),
    [preferences, catalogPackIds],
  );

  const config = useMemo(
    () => preferencesToIndicatorConfig(resolvedPreferences, catalog),
    [resolvedPreferences, catalog],
  );

  const loaded = useProjectIndicators(config);

  const setPreferences = useCallback((next: Partial<IndicatorPreferences>) => {
    setPreferencesState((prev) => {
      const merged = { ...prev, ...next };
      saveIndicatorPreferences(merged);
      return merged;
    });
  }, []);

  return {
    ...loaded,
    preferences: resolvedPreferences,
    setPreferences,
    catalog,
    catalogError,
  };
}

export function feasibilityForProfile(
  indicator: RiskIndicator,
  profileId: string,
): RiskIndicator["feasibility"][string] | undefined {
  return indicator.feasibility[profileId];
}

export function packLabel(packs: IndicatorPackMeta[]): string {
  if (!packs.length) return "None";
  return packs.map((p) => p.name).join(", ");
}
