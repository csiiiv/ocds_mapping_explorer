/** App-wide custom indicator pack preferences (independent of mapping project). */

const STORAGE_KEY = "ocds-indicator-preferences-v1";

export interface IndicatorPreferences {
  /** Custom pack ids from indicator_packs/catalog.json (Cardinal is always on). */
  custom_packs: string[];
  /** Optional feasibility overlay pack id. */
  feasibility_overlay?: string;
  /**
   * When false/undefined and custom_packs is empty, all catalog packs are enabled.
   * Set true once the user changes pack checkboxes (including unchecking all).
   */
  custom_packs_customized?: boolean;
}

export function defaultIndicatorPreferences(): IndicatorPreferences {
  return { custom_packs: [] };
}

function normalizeStored(parsed: Partial<IndicatorPreferences>): IndicatorPreferences {
  const custom_packs = Array.isArray(parsed.custom_packs)
    ? parsed.custom_packs.filter((id): id is string => typeof id === "string")
    : [];
  const customized =
    parsed.custom_packs_customized === true ||
    (Array.isArray(parsed.custom_packs) && parsed.custom_packs.length > 0);

  return {
    custom_packs,
    feasibility_overlay:
      typeof parsed.feasibility_overlay === "string" ? parsed.feasibility_overlay : undefined,
    custom_packs_customized: customized,
  };
}

export function loadIndicatorPreferences(): IndicatorPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultIndicatorPreferences();
    return normalizeStored(JSON.parse(raw) as Partial<IndicatorPreferences>);
  } catch {
    return defaultIndicatorPreferences();
  }
}

export function saveIndicatorPreferences(prefs: IndicatorPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

/** Apply default-all-custom-packs when the user has not customized selection. */
export function resolveIndicatorPreferences(
  prefs: IndicatorPreferences,
  catalogPackIds: string[],
): IndicatorPreferences {
  if (prefs.custom_packs_customized || !catalogPackIds.length) {
    return prefs;
  }
  return { ...prefs, custom_packs: [...catalogPackIds] };
}
