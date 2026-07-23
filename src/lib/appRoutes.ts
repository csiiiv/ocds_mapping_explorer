import type { StageKey } from "../types";
import { STAGES } from "../types";
import { DEFAULT_PROJECT_ID, PROJECT_STORAGE_KEY, resolveProjectId } from "./project";

export function defaultAppPath(): string {
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    const id = resolveProjectId(raw);
    return `/p/${encodeURIComponent(id)}/overview`;
  } catch {
    return `/p/${DEFAULT_PROJECT_ID}/overview`;
  }
}

export type ViewKey =
  | "overview"
  | "explorer"
  | "publication"
  | "indicators"
  | "validation"
  | "data_sources"
  | "data_elements"
  | "schema"
  | "extensions"
  | "about";

export type StatusFilter = "all" | "mapped" | "partial" | "unmapped";

/** URL path segment per view (kebab-case where needed). */
export const VIEW_PATH: Record<ViewKey, string> = {
  overview: "overview",
  explorer: "explorer",
  publication: "publication",
  indicators: "indicators",
  validation: "validation",
  data_sources: "data-sources",
  data_elements: "data-elements",
  schema: "schema",
  extensions: "extensions",
  about: "about",
};

const PATH_TO_VIEW = Object.fromEntries(
  Object.entries(VIEW_PATH).map(([view, segment]) => [segment, view]),
) as Record<string, ViewKey>;

const STAGE_KEYS = new Set(STAGES.map((s) => s.key));

export interface AppRouteState {
  projectId: string;
  view: ViewKey;
  stage: StageKey;
  path: string | null;
  nodeId: string | null;
  q: string;
  status: StatusFilter;
}

export interface AppRouteOptions {
  projectId: string;
  view: ViewKey;
  stage?: StageKey;
  path?: string | null;
  nodeId?: string | null;
  q?: string;
  status?: StatusFilter;
}

function isStageKey(value: string): value is StageKey {
  return STAGE_KEYS.has(value as StageKey);
}

function isStatusFilter(value: string): value is StatusFilter {
  return value === "all" || value === "mapped" || value === "partial" || value === "unmapped";
}

/** Parse `/p/:projectId/...` pathname and search params into app route state. */
export function parseAppRoute(pathname: string, search: string): AppRouteState {
  const params = new URLSearchParams(search);
  const q = params.get("q") ?? "";
  const statusRaw = params.get("status") ?? "all";
  const status = isStatusFilter(statusRaw) ? statusRaw : "all";
  const path = params.get("path");
  const nodeId = params.get("node");

  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  // segments: ["p", projectId, viewSegment, stage?]
  const projectId = segments[0] === "p" && segments[1] ? decodeURIComponent(segments[1]) : DEFAULT_PROJECT_ID;
  const viewSegment = segments[2] ?? VIEW_PATH.overview;
  const view = PATH_TO_VIEW[viewSegment] ?? "overview";

  let stage: StageKey = "tender";
  if (view === "explorer") {
    const stageSeg = segments[3];
    stage = stageSeg && isStageKey(stageSeg) ? stageSeg : "tender";
  }

  return {
    projectId,
    view,
    stage,
    path: path || null,
    nodeId: nodeId || null,
    q,
    status,
  };
}

/** Build a shareable app URL from route options. */
export function buildAppUrl({
  projectId,
  view,
  stage = "tender",
  path = null,
  nodeId = null,
  q = "",
  status = "all",
}: AppRouteOptions): string {
  let url = `/p/${encodeURIComponent(projectId)}`;

  if (view === "explorer") {
    url += `/explorer/${stage}`;
  } else {
    url += `/${VIEW_PATH[view]}`;
  }

  const params = new URLSearchParams();
  if (path) params.set("path", path);
  if (nodeId) params.set("node", nodeId);
  if (q) params.set("q", q);
  if (status !== "all") params.set("status", status);

  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export function resolveRouteProjectId(
  projectId: string,
  availableIds: readonly string[],
): string {
  if (availableIds.includes(projectId)) return projectId;
  return availableIds.includes(DEFAULT_PROJECT_ID) ? DEFAULT_PROJECT_ID : availableIds[0] ?? DEFAULT_PROJECT_ID;
}
