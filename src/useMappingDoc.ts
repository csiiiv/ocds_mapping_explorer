import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FieldEdit, MappingDocument, MappingNode, StageKey } from "./types";
import { isMappableFieldNode } from "./lib/mappingNodes";
import { mergeFieldEdit } from "./lib/fieldEdits";
import {
  collectMappingClearPatches,
  getDeleteElementImpact,
  getDeleteSourceImpact,
} from "./lib/inventoryDelete";
import { BUILTIN_PROJECTS, editsStorageKey, editKey, findShippedProject, mergeReferenceAndProject, PROJECT_STORAGE_KEY, resolveProjectId, DEFAULT_PROJECT_ID, routableProjectIds, type MappingProject, type OcdsReference } from "./lib/project";
import { publicUrl } from "./lib/publicUrl";
import { isLocalProjectId, listAllProjectEntries, loadLocalProject, saveLocalProject, createLocalProject, deleteLocalProject } from "./lib/localProjects";
import {
  applyStoredInventory,
  saveStoredInventory,
} from "./lib/inventory";
import type { DataElementRow, DataSourceRow } from "./types";
import type { AutoLinkProposal } from "./lib/autoLink";
import type { ExtensionProposal } from "./lib/extensionProposals";
import { proposalsToEdits } from "./lib/autoLink";
import {
  normalizePublicationConfig,
  type PublicationConfig,
} from "./lib/publicationConfig";

export type EditMap = Record<string, FieldEdit>;

export type DocStatus = "idle" | "preparing" | "ready";

export interface LoadStatus {
  phase: string;
  detail?: string;
}

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

function loadStoredProjectId(): string {
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    const resolved = resolveProjectId(raw);
    if (raw && resolved !== raw) {
      localStorage.setItem(PROJECT_STORAGE_KEY, resolved);
    }
    return resolved;
  } catch {
    return DEFAULT_PROJECT_ID;
  }
}

function loadEdits(projectId: string): EditMap {
  try {
    const raw = localStorage.getItem(editsStorageKey(projectId));
    return raw ? (JSON.parse(raw) as EditMap) : {};
  } catch {
    return {};
  }
}

export function useMappingDoc() {
  const [projectId, setProjectId] = useState(loadStoredProjectId);
  const [reference, setReference] = useState<OcdsReference | null>(null);
  const [project, setProject] = useState<MappingProject | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus | null>({ phase: "Starting…" });
  const [decoratedDoc, setDecoratedDoc] = useState<MappingDocument | null>(null);
  const [docStatus, setDocStatus] = useState<DocStatus>("idle");
  const [edits, setEdits] = useState<EditMap>(() => loadEdits(loadStoredProjectId()));
  const [history, setHistory] = useState<EditMap[]>([]);
  const [redoStack, setRedoStack] = useState<EditMap[]>([]);
  const loadedRef = useRef<EditMap>({});
  /** Tracks which project the current `edits` belong to (avoids cross-project bleed). */
  const editsProjectRef = useRef(projectId);
  const inventoryProjectRef = useRef(projectId);
  const inventoryDirtyRef = useRef(false);
  const [projectListTick, setProjectListTick] = useState(0);

  const touchProject = useCallback((updater: (p: MappingProject) => MappingProject) => {
    inventoryDirtyRef.current = true;
    setProject((prev) => {
      if (!prev || prev.metadata.project_id !== projectId) return prev;
      const next = updater(prev);
      next.metadata = { ...next.metadata, updated_at: new Date().toISOString() };
      if (inventoryProjectRef.current === projectId) {
        try {
          saveStoredInventory(projectId, next);
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }, [projectId]);

  const loadProject = useCallback(async (id: string) => {
    const resolved = resolveProjectId(id);

    const refRes = await fetch(publicUrl("ocds_reference.json"));
    if (!refRes.ok) throw new Error(`OCDS reference HTTP ${refRes.status}`);
    const ref = (await refRes.json()) as OcdsReference;

    if (isLocalProjectId(resolved)) {
      const proj = loadLocalProject(resolved);
      if (!proj) throw new Error(`Local project not found: ${resolved}`);
      return { ref, proj };
    }

    const entry = findShippedProject(resolved);
    if (!entry) throw new Error(`Unknown project: ${resolved}`);

    const projRes = await fetch(publicUrl(entry.file));
    if (!projRes.ok) {
      throw new Error(`Project HTTP ${projRes.status} (${entry.file}).`);
    }
    const proj = (await projRes.json()) as MappingProject;

    return { ref, proj };
  }, []);

  // Initial + project switch load
  useEffect(() => {
    let cancelled = false;
    const activeId = resolveProjectId(projectId);
    if (activeId !== projectId) {
      setProjectId(activeId);
      return;
    }

    setProject(null);
    setReference(null);
    setDecoratedDoc(null);
    setDocStatus("idle");

    setLoadError(null);
    setLoadStatus({ phase: "Loading OCDS reference and project…" });

    loadProject(activeId)
      .then(async ({ ref, proj: fileProj }) => {
        if (cancelled) return;
        setLoadStatus({ phase: "Merging project data…" });
        await yieldToUi();
        if (cancelled) return;

        setReference(ref);
        const { project: mergedProj, inventoryDirty } = isLocalProjectId(activeId)
          ? { project: fileProj, inventoryDirty: false }
          : applyStoredInventory(activeId, fileProj);

        inventoryProjectRef.current = activeId;
        inventoryDirtyRef.current = inventoryDirty;
        setProject(mergedProj);

        const baseEdits = mergedProj.mapping_edits || {};
        let stored = loadEdits(activeId);

        setLoadStatus({
          phase: "Restoring saved mapping edits…",
          detail: `${Object.keys(stored).length} edit(s) in browser storage`,
        });
        await yieldToUi();
        if (cancelled) return;

        // Recover blank project polluted by cross-project localStorage bleed
        if (
          activeId === "blank" &&
          Object.keys(baseEdits).length === 0 &&
          Object.keys(stored).length > 50
        ) {
          try {
            localStorage.removeItem(editsStorageKey(activeId));
          } catch {
            /* ignore */
          }
          stored = {};
        }

        const merged = { ...baseEdits, ...stored };
        editsProjectRef.current = activeId;
        setEdits(merged);
        setHistory([]);
        setRedoStack([]);
        try {
          localStorage.setItem(PROJECT_STORAGE_KEY, activeId);
        } catch {
          /* ignore */
        }
        setLoadStatus(null);
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadStatus(null);
          setLoadError(String(e));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, loadProject]);

  // Persist edits only when they belong to the loaded project
  useEffect(() => {
    if (!project || project.metadata.project_id !== projectId) return;
    if (editsProjectRef.current !== projectId) return;
    try {
      localStorage.setItem(editsStorageKey(projectId), JSON.stringify(edits));
    } catch {
      /* ignore */
    }
  }, [edits, projectId, project]);

  // Persist local projects (full payload) to localStorage
  useEffect(() => {
    if (!project || !isLocalProjectId(projectId)) return;
    if (project.metadata.project_id !== projectId) return;
    if (editsProjectRef.current !== projectId) return;
    saveLocalProject({
      ...project,
      mapping_edits: edits,
      data_element_additions: project.data_element_additions ?? [],
      extension_proposals: project.extension_proposals ?? [],
      publication_config: project.publication_config,
    });
  }, [project, edits, projectId]);

  const baseDoc = useMemo<MappingDocument | null>(() => {
    if (!reference || !project) return null;
    if (project.metadata.project_id !== projectId) return null;
    return mergeReferenceAndProject(reference, project);
  }, [reference, project, projectId]);

  useEffect(() => {
    if (!baseDoc || !project || project.metadata.project_id !== projectId) {
      setDecoratedDoc(null);
      setDocStatus("idle");
      return;
    }
    if (editsProjectRef.current !== projectId) {
      setDecoratedDoc(null);
      setDocStatus("idle");
      return;
    }

    let cancelled = false;
    setDocStatus("preparing");
    setDecoratedDoc(null);

    const run = async () => {
      await yieldToUi();
      if (cancelled) return;
      const next = decorateDocument(baseDoc, edits);
      if (cancelled) return;
      setDecoratedDoc(next);
      setDocStatus("ready");
    };

    void run().catch(() => {
      if (!cancelled) {
        setDecoratedDoc(null);
        setDocStatus("idle");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [baseDoc, edits, project, projectId]);

  const switchProject = useCallback(
    (id: string) => {
      if (id === projectId) return;

      // Flush outgoing edits to the correct storage slot before changing projectId
      if (project && project.metadata.project_id === projectId && editsProjectRef.current === projectId) {
        try {
          localStorage.setItem(editsStorageKey(projectId), JSON.stringify(edits));
        } catch {
          /* ignore */
        }
      }

      if (
        project &&
        project.metadata.project_id === projectId &&
        inventoryProjectRef.current === projectId &&
        inventoryDirtyRef.current
      ) {
        try {
          saveStoredInventory(projectId, project);
        } catch {
          /* ignore */
        }
      }

      editsProjectRef.current = id;
      inventoryProjectRef.current = id;
      inventoryDirtyRef.current = false;
      setEdits({});
      setHistory([]);
      setRedoStack([]);
      setProject(null);
      setReference(null);
      setProjectId(id);
    },
    [projectId, project, edits],
  );

  const updateField = useCallback(
    (stage: StageKey, path: string, patch: FieldEdit) => {
      setEdits((prev) => {
        const k = editKey(stage, path);
        setHistory((h) => [...h, prev]);
        setRedoStack([]);
        const merged = mergeFieldEdit(prev[k], patch);
        const next = { ...prev };
        if (merged) next[k] = merged;
        else delete next[k];
        return next;
      });
    },
    [],
  );

  const resetField = useCallback(
    (stage: StageKey, path: string) => {
      const k = editKey(stage, path);
      setEdits((prev) => {
        setHistory((h) => [...h, prev]);
        const next = { ...prev };
        delete next[k];
        return next;
      });
    },
    [],
  );

  const applyMappingBatch = useCallback(
    (patches: { stage: StageKey; path: string; patch: FieldEdit }[]) => {
      if (!patches.length) return;
      setEdits((prev) => {
        setHistory((h) => [...h, prev]);
        setRedoStack([]);
        const next = { ...prev };
        for (const { stage, path, patch } of patches) {
          const k = editKey(stage, path);
          const merged = mergeFieldEdit(next[k], patch);
          if (merged) next[k] = merged;
          else delete next[k];
        }
        return next;
      });
    },
    [],
  );

  const applyAutoLinks = useCallback(
    (proposals: AutoLinkProposal[]) => {
      applyMappingBatch(proposalsToEdits(proposals));
    },
    [applyMappingBatch],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      setEdits((current) => {
        setRedoStack((r) => [...r, current]);
        return last;
      });
      return h.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (!r.length) return r;
      const last = r[r.length - 1];
      setEdits((current) => {
        setHistory((h) => [...h, current]);
        return last;
      });
      return r.slice(0, -1);
    });
  }, []);

  const clearAllEdits = useCallback(() => {
    setHistory((h) => [...h, edits]);
    setEdits({});
  }, [edits]);

  const editedCount = useMemo(
    () => Object.keys(edits).filter((k) => !loadedRef.current[k]).length,
    [edits],
  );

  const getProjectPayload = useCallback((): MappingProject | null => {
    if (!project) return null;
    return {
      ...project,
      metadata: {
        ...project.metadata,
        updated_at: new Date().toISOString(),
      },
      mapping_edits: edits,
      data_element_additions: project.data_element_additions ?? [],
      extension_proposals: project.extension_proposals ?? [],
      publication_config: project.publication_config,
    };
  }, [project, edits]);

  const applyImport = useCallback(
    (result: {
      project: MappingProject;
      mappingEdits: EditMap;
    }) => {
      const activeId = projectId;
      const normalized: MappingProject = {
        ...result.project,
        metadata: {
          ...result.project.metadata,
          project_id: activeId,
        },
      };
      setProject(normalized);
      editsProjectRef.current = activeId;
      inventoryProjectRef.current = activeId;
      inventoryDirtyRef.current = true;
      setDocStatus("preparing");
      setDecoratedDoc(null);
      try {
        saveStoredInventory(activeId, normalized);
      } catch {
        /* ignore */
      }
      setEdits(result.mappingEdits);
      setHistory([]);
      setRedoStack([]);
    },
    [projectId],
  );

  const upsertDataElement = useCallback(
    (row: DataElementRow) => {
      touchProject((p) => {
        const rows = [...p.data_elements.rows];
        const idx = rows.findIndex((r) => r.key === row.key);
        const isNew = idx < 0;
        if (isNew) rows.push(row);
        else rows[idx] = row;
        let additions = [...(p.data_element_additions ?? [])];
        if (isNew) {
          additions.push(row);
        } else {
          const ai = additions.findIndex((r) => r.key === row.key);
          if (ai >= 0) additions[ai] = row;
        }
        return {
          ...p,
          data_elements: { ...p.data_elements, rows },
          data_element_additions: additions,
        };
      });
    },
    [touchProject],
  );

  const clearMappingsForLabels = useCallback(
    (labels: string[]) => {
      if (!decoratedDoc || !labels.length) return;
      const patches = collectMappingClearPatches(decoratedDoc, labels);
      if (patches.length) applyMappingBatch(patches);
    },
    [decoratedDoc, applyMappingBatch],
  );

  const deleteDataElement = useCallback(
    (key: string) => {
      const row = project?.data_elements.rows.find((r) => r.key === key);
      if (row?.for_mapping?.trim()) {
        clearMappingsForLabels([row.for_mapping]);
      }
      touchProject((p) => ({
        ...p,
        data_elements: {
          ...p.data_elements,
          rows: p.data_elements.rows.filter((r) => r.key !== key),
        },
        data_element_additions: (p.data_element_additions ?? []).filter((r) => r.key !== key),
      }));
    },
    [project, clearMappingsForLabels, touchProject],
  );

  const upsertDataSource = useCallback(
    (row: DataSourceRow) => {
      touchProject((p) => {
        const rows = [...p.data_sources.rows];
        const idx = rows.findIndex((r) => r.short_name === row.short_name);
        if (idx >= 0) rows[idx] = row;
        else rows.push(row);
        return {
          ...p,
          data_sources: { ...p.data_sources, rows },
        };
      });
    },
    [touchProject],
  );

  const deleteDataSource = useCallback(
    (shortName: string) => {
      const src = project?.data_sources.rows.find((r) => r.short_name === shortName);
      if (!src) return;
      const sourceName = src.data_source.trim();
      const linkedElements = (project?.data_elements.rows ?? []).filter(
        (r) => r.data_source.trim() === sourceName,
      );
      const labels = linkedElements.map((r) => r.for_mapping).filter(Boolean);
      if (labels.length) clearMappingsForLabels(labels);
      const keysToRemove = new Set(linkedElements.map((r) => r.key));
      touchProject((p) => ({
        ...p,
        data_sources: {
          ...p.data_sources,
          rows: p.data_sources.rows.filter((r) => r.short_name !== shortName),
        },
        data_elements: {
          ...p.data_elements,
          rows: p.data_elements.rows.filter((r) => !keysToRemove.has(r.key)),
        },
        data_element_additions: (p.data_element_additions ?? []).filter(
          (r) => !keysToRemove.has(r.key),
        ),
      }));
    },
    [project, clearMappingsForLabels, touchProject],
  );

  const previewDeleteElement = useCallback(
    (key: string) => {
      if (!decoratedDoc || !project) return null;
      return getDeleteElementImpact(decoratedDoc, project.data_elements.rows, key);
    },
    [decoratedDoc, project],
  );

  const previewDeleteSource = useCallback(
    (shortName: string) => {
      if (!decoratedDoc || !project) return null;
      return getDeleteSourceImpact(
        decoratedDoc,
        project.data_elements.rows,
        project.data_sources.rows,
        shortName,
      );
    },
    [decoratedDoc, project],
  );

  const upsertExtensionProposal = useCallback(
    (proposal: ExtensionProposal) => {
      touchProject((p) => {
        const rows = [...(p.extension_proposals ?? [])];
        const idx = rows.findIndex((r) => r.id === proposal.id);
        if (idx >= 0) rows[idx] = proposal;
        else rows.push(proposal);
        return { ...p, extension_proposals: rows };
      });
    },
    [touchProject],
  );

  const deleteExtensionProposal = useCallback(
    (id: string) => {
      touchProject((p) => ({
        ...p,
        extension_proposals: (p.extension_proposals ?? []).filter((r) => r.id !== id),
      }));
    },
    [touchProject],
  );

  const updatePublicationConfig = useCallback(
    (config: PublicationConfig) => {
      touchProject((p) => ({
        ...p,
        publication_config: normalizePublicationConfig(config),
      }));
    },
    [touchProject],
  );

  const exportJson = useCallback((): string => {
    const payload = getProjectPayload();
    if (!payload) return "{}";
    return JSON.stringify(payload, null, 2);
  }, [getProjectPayload]);

  const exportEditsOnly = useCallback((): string => {
    return JSON.stringify(
      {
        _type: "ocds-mapping-edits",
        project_id: projectId,
        generated_at: new Date().toISOString(),
        edits,
      },
      null,
      2,
    );
  }, [projectId, edits]);

  const exportFullDocument = useCallback((): string => {
    if (!decoratedDoc) return "{}";
    return JSON.stringify(decoratedDoc, null, 2);
  }, [decoratedDoc]);

  const availableProjects = useMemo(
    () =>
      listAllProjectEntries(
        BUILTIN_PROJECTS.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          local: false,
        })),
      ),
    [projectListTick],
  );

  const routableIds = useMemo(
    () => routableProjectIds(availableProjects.map((p) => p.id)),
    [availableProjects],
  );

  const createProject = useCallback(
    async (name: string, sourceSystem?: string, description?: string) => {
      const { proj: blank } = await loadProject(DEFAULT_PROJECT_ID);
      const created = createLocalProject(blank, { name, sourceSystem, description });
      setProjectListTick((t) => t + 1);
      return created.metadata.project_id;
    },
    [loadProject],
  );

  const deleteProject = useCallback(
    (id: string) => {
      deleteLocalProject(id);
      setProjectListTick((t) => t + 1);
    },
    [],
  );

  const canDeleteCurrentProject = isLocalProjectId(projectId);

  return {
    doc: decoratedDoc,
    rawDoc: project?.metadata.project_id === projectId ? baseDoc : null,
    projectLoading: !project || project.metadata.project_id !== projectId,
    loadStatus,
    docStatus,
    pendingEditCount: Object.keys(edits).length,
    loadError,
    edits,
    editedCount,
    projectId,
    projectMeta: project?.metadata ?? null,
    switchProject,
    availableProjects,
    routableProjectIds: routableIds,
    createProject,
    deleteProject,
    canDeleteCurrentProject,
    updateField,
    resetField,
    undo,
    redo,
    canUndo: history.length > 0,
    canRedo: redoStack.length > 0,
    clearAllEdits,
    exportJson,
    exportEditsOnly,
    exportFullDocument,
    getProjectPayload,
    applyImport,
    upsertDataElement,
    deleteDataElement,
    previewDeleteElement,
    upsertDataSource,
    deleteDataSource,
    previewDeleteSource,
    applyAutoLinks,
    upsertExtensionProposal,
    deleteExtensionProposal,
    extensionProposals: project?.extension_proposals ?? [],
    publicationConfig: normalizePublicationConfig(project?.publication_config),
    updatePublicationConfig,
  };
}

function decorateDocument(baseDoc: MappingDocument, edits: EditMap): MappingDocument {
  const next: MappingDocument = structuredClone(baseDoc);
  for (const [stageKey, stage] of Object.entries(next.stages)) {
    const walk = (nodes: MappingNode[]) => {
      for (const n of nodes) {
        const e = edits[editKey(stageKey as StageKey, n.path)];
        if (e) {
          if (e.mapping !== undefined) {
            n.mapping = e.mapping;
            n.mapped = classifyMapping(e.mapping);
          }
          if (e.example !== undefined) n.example = e.example;
          if (e.notes !== undefined) n.notes = e.notes;
          (n as MappingNode & { _modified?: boolean })._modified = true;
        }
        if (n.children?.length) walk(n.children);
      }
    };
    walk(stage.tree);
    const flat = flatten(stage.tree);
    stage.flat = flat;
    stage.stats = computeStats(flat);
  }
  return next;
}

function classifyMapping(mapping: string): "mapped" | "partial" | "unmapped" {
  const m = (mapping || "").trim().toLowerCase();
  if (!m) return "unmapped";
  if (["n/a", "na", "none", "no", "tbd", "todo"].includes(m) || m.includes("not available"))
    return "unmapped";
  if (m.startsWith("no ") || m.includes(" to be ") || m.includes("pending")) return "partial";
  return "mapped";
}

function flatten(tree: MappingNode[]): MappingNode[] {
  const out: MappingNode[] = [];
  const walk = (nodes: MappingNode[]) => {
    for (const n of nodes) {
      if (n.row_type === "section" || n.row_type === "subtitle" || n.row_type === "extension_intro") continue;
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(tree);
  return out;
}

function computeStats(flat: MappingNode[]) {
  const leaves = flat.filter((n) => isMappableFieldNode(n));
  const total = leaves.length;
  const mapped = leaves.filter((n) => n.mapped === "mapped").length;
  const partial = leaves.filter((n) => n.mapped === "partial").length;
  const unmapped = leaves.filter((n) => n.mapped === "unmapped").length;
  return {
    total,
    mapped,
    partial,
    unmapped,
    coverage_pct: total ? Math.round((10000 * mapped) / total) / 100 : 0,
  };
}
