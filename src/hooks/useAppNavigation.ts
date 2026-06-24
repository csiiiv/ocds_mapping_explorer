import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { MappingDocument, MappingNode, StageKey } from "../types";
import { resolvePathNode } from "../lib/indicatorMapping";
import {
  buildAppUrl,
  parseAppRoute,
  resolveRouteProjectId,
  type AppRouteOptions,
  type StatusFilter,
  type ViewKey,
} from "../lib/appRoutes";

export function useAppNavigation(
  doc: MappingDocument | null,
  availableProjectIds: readonly string[],
  onSwitchProject: (id: string) => void,
) {
  const location = useLocation();
  const navigate = useNavigate();

  const route = useMemo(
    () => parseAppRoute(location.pathname, location.search),
    [location.pathname, location.search],
  );

  const resolvedProjectId = useMemo(
    () => resolveRouteProjectId(route.projectId, availableProjectIds),
    [route.projectId, availableProjectIds],
  );

  // Keep URL in sync when project id is invalid or local project was deleted.
  useEffect(() => {
    if (resolvedProjectId !== route.projectId) {
      navigate(
        buildAppUrl({
          projectId: resolvedProjectId,
          view: route.view,
          stage: route.stage,
          path: route.path,
          q: route.q,
          status: route.status,
        }),
        { replace: true },
      );
    }
  }, [
    navigate,
    resolvedProjectId,
    route.path,
    route.projectId,
    route.q,
    route.stage,
    route.status,
    route.view,
  ]);

  // Browser back/forward and shared links: URL project drives loaded project.
  useEffect(() => {
    onSwitchProject(resolvedProjectId);
  }, [onSwitchProject, resolvedProjectId]);

  const selected = useMemo((): { stage: StageKey; node: MappingNode } | null => {
    if (!doc || route.view !== "explorer" || !route.path) return null;
    const hit = resolvePathNode(doc, route.stage, route.path);
    return hit ? { stage: hit.stage, node: hit.node } : null;
  }, [doc, route.path, route.stage, route.view]);

  const goTo = useCallback(
    (opts: AppRouteOptions, replace = false) => {
      navigate(buildAppUrl(opts), { replace });
    },
    [navigate],
  );

  const goToView = useCallback(
    (
      view: ViewKey,
      opts?: Partial<Omit<AppRouteOptions, "projectId" | "view">>,
      replace = false,
    ) => {
      const keepSearch =
        view === "explorer" || view === "data_elements" || opts?.q !== undefined;
      goTo(
        {
          projectId: resolvedProjectId,
          view,
          stage: opts?.stage ?? (view === "explorer" ? route.stage : "tender"),
          path: opts?.path !== undefined ? opts.path : view === "explorer" ? route.path : null,
          q: opts?.q !== undefined ? opts.q : keepSearch ? route.q : "",
          status: opts?.status ?? (view === "explorer" ? route.status : "all"),
        },
        replace,
      );
    },
    [goTo, resolvedProjectId, route.path, route.q, route.stage, route.status],
  );

  const goToExplorer = useCallback(
    (
      stage: StageKey,
      opts?: { path?: string | null; q?: string; status?: StatusFilter },
    ) => {
      goTo({
        projectId: resolvedProjectId,
        view: "explorer",
        stage,
        path: opts?.path ?? null,
        q: opts?.q ?? "",
        status: opts?.status ?? "all",
      });
    },
    [goTo, resolvedProjectId],
  );

  const openMappingField = useCallback(
    (stageKey: StageKey, path: string) => {
      if (!doc) {
        goToExplorer(stageKey, { path, q: "", status: "all" });
        return;
      }
      const hit = resolvePathNode(doc, stageKey, path);
      if (hit) {
        goToExplorer(hit.stage, { path: hit.node.path, q: "", status: "all" });
        return;
      }
      goToExplorer(stageKey, { path: null, q: path.split("/").pop() || path, status: "all" });
    },
    [doc, goToExplorer],
  );

  const switchProject = useCallback(
    (nextProjectId: string) => {
      goTo({
        projectId: nextProjectId,
        view: route.view,
        stage: route.stage,
        path: route.view === "explorer" ? route.path : null,
        q: route.view === "explorer" || route.view === "data_elements" ? route.q : "",
        status: route.view === "explorer" ? route.status : "all",
      });
    },
    [goTo, route.path, route.q, route.stage, route.status, route.view],
  );

  const setQuery = useCallback(
    (q: string) => {
      if (route.view !== "explorer") return;
      goTo(
        {
          projectId: resolvedProjectId,
          view: "explorer",
          stage: route.stage,
          path: route.path,
          q,
          status: route.status,
        },
        true,
      );
    },
    [goTo, resolvedProjectId, route.path, route.stage, route.status, route.view],
  );

  const setStatusFilter = useCallback(
    (status: StatusFilter) => {
      if (route.view !== "explorer") return;
      goTo(
        {
          projectId: resolvedProjectId,
          view: "explorer",
          stage: route.stage,
          path: route.path,
          q: route.q,
          status,
        },
        true,
      );
    },
    [goTo, resolvedProjectId, route.path, route.q, route.stage, route.view],
  );

  const setSelected = useCallback(
    (sel: { stage: StageKey; node: MappingNode } | null) => {
      if (!sel) {
        goToExplorer(route.stage, { path: null, q: route.q, status: route.status });
        return;
      }
      goToExplorer(sel.stage, {
        path: sel.node.path,
        q: route.q,
        status: route.status,
      });
    },
    [goToExplorer, route.q, route.stage, route.status],
  );

  return {
    view: route.view,
    stage: route.stage,
    query: route.q,
    statusFilter: route.status,
    selected,
    goToView,
    goToExplorer,
    openMappingField,
    switchProject,
    setQuery,
    setStatusFilter,
    setSelected,
  };
}
