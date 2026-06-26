"""Shared merge and I/O helpers for OCDS mapping projects (tier B + C)."""

from __future__ import annotations

import copy
import datetime as _dt
import json
from pathlib import Path
from typing import Any, Literal

MergeMode = Literal["replace", "merge"]
ImportScope = Literal["full", "inventory", "mappings", "data_elements_csv", "data_sources_csv"]

DATA_ELEMENT_CSV_FIELDS = [
    "for_mapping",
    "data_source",
    "section_table",
    "data_element",
    "publish",
    "example",
    "description",
    "data_type",
    "notes",
    "mapped",
    "mapping_details",
]

DATA_SOURCE_CSV_FIELDS = [
    "short_name",
    "data_source",
    "vendor",
    "url_documentation",
    "agency_unit_responsible",
    "planning",
    "tender",
    "award",
    "contract",
    "implementation_physical",
    "implementation_financial",
    "revision_history",
    "documents_available",
    "existing_apis_data_publication",
]


def element_key(section_table: str, data_element: str) -> str:
    return f"{section_table}.{data_element}".lower()


def load_project(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_project(path: Path, project: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(project, indent=2, ensure_ascii=False), encoding="utf-8")


def merge_data_sources(existing: dict, incoming: dict, mode: MergeMode) -> tuple[dict, dict]:
    """Returns (merged, stats)."""
    stats = {"added": 0, "updated": 0, "total": 0}
    if mode == "replace":
        rows = incoming.get("rows") or []
        stats["total"] = len(rows)
        stats["added"] = len(rows)
        return incoming, stats

    by_name = {r["short_name"]: copy.deepcopy(r) for r in existing.get("rows") or [] if r.get("short_name")}
    for row in incoming.get("rows") or []:
        sn = row.get("short_name", "")
        if not sn:
            continue
        if sn in by_name:
            by_name[sn] = row
            stats["updated"] += 1
        else:
            by_name[sn] = row
            stats["added"] += 1
    rows = list(by_name.values())
    stats["total"] = len(rows)
    columns = incoming.get("columns") or existing.get("columns") or []
    return {"columns": columns, "rows": rows}, stats


def merge_data_elements(existing: dict, incoming: dict, mode: MergeMode) -> tuple[dict, dict]:
    stats = {"added": 0, "updated": 0, "total": 0}
    if mode == "replace":
        rows = incoming.get("rows") or []
        stats["total"] = len(rows)
        stats["added"] = len(rows)
        return incoming, stats

    by_key = {r["key"]: copy.deepcopy(r) for r in existing.get("rows") or [] if r.get("key")}
    for row in incoming.get("rows") or []:
        key = row.get("key") or element_key(row.get("section_table", ""), row.get("data_element", ""))
        if not key or key == ".":
            continue
        row = {**row, "key": key}
        if key in by_key:
            by_key[key] = row
            stats["updated"] += 1
        else:
            by_key[key] = row
            stats["added"] += 1
    rows = list(by_key.values())
    stats["total"] = len(rows)
    out = {
        "columns": incoming.get("columns") or existing.get("columns") or [],
        "column_groups": incoming.get("column_groups") or existing.get("column_groups") or [],
        "rows": rows,
    }
    return out, stats


def merge_mapping_edits(existing: dict, incoming: dict, mode: MergeMode) -> tuple[dict, dict]:
    stats = {"added": 0, "updated": 0, "total": 0}
    if mode == "replace":
        stats["total"] = len(incoming)
        stats["added"] = len(incoming)
        return dict(incoming), stats

    merged = copy.deepcopy(existing)
    for k, v in incoming.items():
        if k in merged:
            merged[k] = {**merged[k], **v}
            stats["updated"] += 1
        else:
            merged[k] = v
            stats["added"] += 1
    stats["total"] = len(merged)
    return merged, stats


def record_import(project: dict, *, filename: str, scope: str, stats: dict[str, Any]) -> None:
    meta = project.setdefault("metadata", {})
    imports = meta.setdefault("imports", [])
    imports.append(
        {
            "filename": filename,
            "scope": scope,
            "imported_at": _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds"),
            **stats,
        }
    )
    meta["updated_at"] = _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds")


def apply_workbook_import(
    project: dict,
    *,
    inventory: dict | None = None,
    mapping_edits: dict | None = None,
    scope: ImportScope,
    merge_mode: MergeMode,
    filename: str,
) -> dict:
    """Return updated project copy."""
    out = copy.deepcopy(project)
    summary: dict[str, Any] = {}

    if scope in ("full", "inventory") and inventory:
        ds, ds_stats = merge_data_sources(out.get("data_sources") or {"columns": [], "rows": []}, inventory["data_sources"], merge_mode)
        out["data_sources"] = ds
        summary["data_sources"] = ds_stats

        de, de_stats = merge_data_elements(out.get("data_elements") or {"columns": [], "column_groups": [], "rows": []}, inventory["data_elements"], merge_mode)
        out["data_elements"] = de
        summary["data_elements"] = de_stats

    if scope in ("full", "mappings") and mapping_edits is not None:
        me, me_stats = merge_mapping_edits(out.get("mapping_edits") or {}, mapping_edits, merge_mode)
        out["mapping_edits"] = me
        summary["mapping_edits"] = me_stats

    if filename:
        record_import(out, filename=filename, scope=scope, stats=summary)
    return out
