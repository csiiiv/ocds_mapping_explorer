const STORAGE_KEY = "ocds-welcome-guide-v1";

export function shouldShowWelcomeGuide(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "dismissed";
  } catch {
    return true;
  }
}

export function dismissWelcomeGuide(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "dismissed");
  } catch {
    /* ignore */
  }
}

export function resetWelcomeGuideDismissal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
