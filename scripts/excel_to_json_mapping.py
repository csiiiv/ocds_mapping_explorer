#!/usr/bin/env python3
"""Transform an OCP OCDS field-level mapping workbook (xlsx) into JSON.

The workbook has 11 sheets that together describe how source fields map to
the Open Contracting Data Standard (OCDS) 1.1. This script emits one JSON file
with a clean, app-friendly shape:

    {
      "metadata":    {...},
      "data_sources": {"columns": [...], "rows": [...]},
      "data_elements": {"columns": [...], "rows": [...]},
      "stages": {
        "general":         {"title": ..., "subtitle": ..., "tree": [...], "flat": [...]},
        "planning":   {...}, "tender": {...}, "award": {...},
        "contract": {...}, "implementation": {...}
      },
      "ocds_schema":     [...],
      "ocds_extensions": [...]
    }

Usage:
    python scripts/excel_to_json_mapping.py [--input PATH] [--output PATH]
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import re
from pathlib import Path
from typing import Any, Iterable

from python_calamine import CalamineWorkbook

ROOT = Path(__file__).resolve().parents[1]
REFERENCES = ROOT / "references"
DEFAULT_INPUT = REFERENCES / "OCDS_Mapping_Template_1.1.xlsx"
DEFAULT_OUTPUT = ROOT / "dist" / "mapping_document.json"

# Sheet name -> internal stage key
STAGE_SHEETS = {
    "(OCDS) 1. General (all stages)": "general",
    "(OCDS) 2. Planning": "planning",
    "(OCDS) 3. Tender": "tender",
    "(OCDS) 4. Award": "award",
    "(OCDS) 5. Contract": "contract",
    "(OCDS) 6. Implementation": "implementation",
}

# Row-type -> display category
FIELD_CATEGORIES = {
    "required_field": "required",
    "required_span": "required",
    "field": "field",
    "span": "span",
    "additional_field": "additional",
    "extension": "extension",
    "extension_field": "extension",
    "extension_span": "extension",
    "ref_span": "reference",
}


def _s(val: Any) -> str:
    """Normalise a cell value to a trimmed string (empty for None)."""
    if val is None:
        return ""
    s = str(val)
    if isinstance(val, float) and val.is_integer():
        s = str(int(val))
    return s.strip()


def load_rows(path: Path) -> dict[str, list[list]]:
    wb = CalamineWorkbook.from_path(str(path))
    return {name: wb.get_sheet_by_name(name).to_python() for name in wb.sheet_names}


# ---------------------------------------------------------------------------
# Sheet parsers
# ---------------------------------------------------------------------------

def parse_overview(rows: list[list]) -> dict:
    """Field Level Mapping Overview: a single instructional column."""
    lines = [_s(r[0]) for r in rows if r and _s(r[0])]
    title = next((l for l in lines if "Open Contracting Data Standard" in l), "")
    version = next((l for l in lines if "Version" in l and "Template" not in l.lower().split()[::-1]), "")
    # 'Field Level Mapping Template - Version 0.9 - May 2022'
    version = next((l for l in lines if l.lower().startswith("field level mapping template")), "")
    return {
        "title": title,
        "version_line": version,
        "instructions": [l for l in lines if l not in (title, version)],
    }


def parse_data_sources(rows: list[list]) -> dict:
    """'1. Data Sources' sheet. Header row is the one starting with 'Short name'."""
    header_idx = next(i for i, r in enumerate(rows) if _s(r[0]).lower() == "short name")
    headers = [_s(c) for c in rows[header_idx]]
    slug = [_slugify(h) for h in headers]
    out = []
    for r in rows[header_idx + 1:]:
        if not any(_s(c) for c in r):
            continue
        rec = {slug[j]: _s(r[j]) if j < len(r) else "" for j in range(len(headers))}
        # Skip the example row when the short name is literally "Example"
        if rec.get("short_name", "").lower() == "example":
            continue
        out.append(rec)
    return {"columns": headers, "rows": out}


def _is_placeholder_data_element(for_mapping: str, section_table: str, data_element: str) -> bool:
    """Skip empty inventory slots from the OCP template (formula → '()' when blank)."""
    st = _s(section_table).strip()
    de = _s(data_element).strip()
    if not st and not de:
        return True
    fm = _s(for_mapping).strip().replace(" ", "")
    if fm == "()":
        return True
    return False


def parse_data_elements(rows: list[list]) -> dict:
    """'2. Data Elements' sheet. Header row starts with 'For mapping'."""
    header_idx = next(i for i, r in enumerate(rows) if _s(r[0]).lower() == "for mapping")
    raw_headers = [_s(c) for c in rows[header_idx]]
    group_row = rows[0] if rows else []

    stage_names = raw_headers[11:17]
    keys: list[str] = [
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
    keys += [f"count_{_slugify(s)}" for s in stage_names]
    keys += [f"presence_{_slugify(s)}" for s in stage_names]

    labels = [
        raw_headers[0] or "For mapping",
        raw_headers[1] or "Data source",
        raw_headers[2] or "Section / Table",
        raw_headers[3] or "Data element",
        raw_headers[4] or "Publish?",
        raw_headers[5] or "Example (optional)",
        raw_headers[6] or "Description (optional)",
        raw_headers[7] or "Data Type (optional)",
        raw_headers[8] or "Notes on data quality, coverage etc. (optional)",
        raw_headers[9] or "Mapped",
        raw_headers[10] or "Mapping details",
    ]
    for s in stage_names:
        labels.append(f"Count · {s}" if s else "Count")
    for s in stage_names:
        labels.append(f"Present · {s}" if s else "Present")

    group_meta = {
        "for_mapping": _s(group_row[0]) or "For mapping",
        "existing_data_elements": _s(group_row[1]) or "Existing data elements",
        "mapping_statistics": _s(group_row[9]) or "Mapping statistics",
    }

    def _col_group(key: str) -> str:
        if key == "for_mapping":
            return "for_mapping"
        if key in (
            "data_source",
            "section_table",
            "data_element",
            "publish",
            "example",
            "description",
            "data_type",
            "notes",
        ):
            return "existing_data_elements"
        return "mapping_statistics"

    def _col_subgroup(key: str) -> str:
        if key.startswith("count_"):
            return "count"
        if key.startswith("presence_"):
            return "presence"
        if key in ("mapped", "mapping_details"):
            return "summary"
        return ""

    def _col_optional(key: str) -> bool:
        return key in ("example", "description", "data_type", "notes")

    columns = [
        {
            "key": k,
            "label": labels[i],
            "kind": _column_kind(k),
            "group": _col_group(k),
            "subgroup": _col_subgroup(k),
            "optional": _col_optional(k),
        }
        for i, k in enumerate(keys)
    ]

    column_groups = [
        {"id": "for_mapping", "label": group_meta["for_mapping"], "keys": [k for k in keys if _col_group(k) == "for_mapping"]},
        {
            "id": "existing_data_elements",
            "label": group_meta["existing_data_elements"],
            "keys": [k for k in keys if _col_group(k) == "existing_data_elements"],
        },
        {
            "id": "mapping_statistics",
            "label": group_meta["mapping_statistics"],
            "keys": [k for k in keys if _col_group(k) == "mapping_statistics"],
        },
    ]

    out = []
    for r in rows[header_idx + 1 :]:
        if not any(_s(c) for c in r):
            continue
        first = _s(r[0])
        if first.lower() in ("for mapping", "") and not _s(r[3]):
            continue
        rec: dict[str, Any] = {}
        for j, key in enumerate(keys):
            if key.startswith("count_") or key.startswith("presence_"):
                rec[key] = _to_int(r[j]) if j < len(r) else 0
            else:
                rec[key] = _s(r[j]) if j < len(r) else ""
        rec["key"] = f"{rec['section_table']}.{rec['data_element']}".lower()
        if _is_placeholder_data_element(rec["for_mapping"], rec["section_table"], rec["data_element"]):
            continue
        out.append(rec)
    return {"columns": columns, "column_groups": column_groups, "rows": out}


def _column_kind(key: str) -> str:
    if key.startswith("count_"):
        return "count"
    if key.startswith("presence_"):
        return "presence"
    if key in ("for_mapping", "section_table", "data_element", "example"):
        return "mono"
    if key in ("description", "notes", "mapping_details"):
        return "wrap"
    return "text"


def _to_int(val: Any) -> int:
    s = _s(val)
    if not s:
        return 0
    try:
        return int(float(s))
    except ValueError:
        return 0


def _make_node(
    rtype: str,
    path: str,
    row: list,
    *,
    node_id: str,
    section: str = "",
) -> dict:
    """Build a mapping node dict from a sheet row."""
    if rtype == "section":
        return {
            "id": node_id,
            "row_type": rtype,
            "category": "section",
            "path": "",
            "name": "",
            "section": section or _s(row[2]) if len(row) > 2 else "",
            "title": _s(row[3]) if len(row) > 3 else "",
            "description": _s(row[4]) if len(row) > 4 else "",
            "mapping": "",
            "example": "",
            "notes": "",
            "mapped": "unmapped",
            "depth": 0,
        }
    if rtype == "subtitle":
        return {
            "id": node_id,
            "row_type": rtype,
            "category": "subtitle",
            "path": path,
            "name": "",
            "title": _s(row[2]) if len(row) > 2 else "",
            "description": "",
            "mapping": "",
            "example": "",
            "notes": "",
            "mapped": "unmapped",
            "depth": 0,
        }
    mapping = _s(row[5]) if len(row) > 5 else ""
    return {
        "id": node_id,
        "row_type": rtype,
        "category": FIELD_CATEGORIES.get(rtype, rtype),
        "path": path,
        "name": path.split("/")[-1],
        "title": _s(row[3]) if len(row) > 3 else "",
        "description": _s(row[4]) if len(row) > 4 else "",
        "mapping": mapping,
        "example": _s(row[6]) if len(row) > 6 else "",
        "notes": _s(row[7]) if len(row) > 7 else "",
        "mapped": _classify_mapping(mapping),
        "depth": path.count("/"),
    }


def parse_stage(rows: list[list]) -> dict:
    """Parse an '(OCDS) N. Stage' sheet into a tree + flat list.

    Row layout (1-indexed columns in the sheet):
      col 0: row_type  (title | subtitle | column_headers | section | required_field |
                        field | span | extension_field | extension_span | ...)
      col 1: numeric badge (e.g. '0.0') - ignored
      col 2: Path
      col 3: Title
      col 4: Description
      col 5: Mapping
      col 6: Example
      col 7: Notes
    """
    title = ""
    subtitle = ""
    flat: list[dict] = []
    node_seq = 0

    def _next_id() -> str:
        nonlocal node_seq
        node_seq += 1
        return f"n{node_seq}"

    for r in rows:
        rtype = _s(r[0]).lower() if r else ""
        if not rtype:
            continue
        if rtype == "title":
            title = _s(r[2]) if len(r) > 2 else ""
            continue
        if rtype == "subtitle":
            text = _s(r[2]) if len(r) > 2 else ""
            if not subtitle:
                subtitle = text
            else:
                flat.append(
                    _make_node(
                        "subtitle",
                        f"__subtitle_{len(flat)}",
                        r,
                        node_id=_next_id(),
                    )
                )
            continue
        if rtype in ("column_headers",):
            continue
        if rtype == "section":
            flat.append(
                _make_node(
                    "section",
                    "",
                    r,
                    node_id=_next_id(),
                    section=_s(r[2]) if len(r) > 2 else "",
                )
            )
            continue
        if rtype == "extension":
            text = _s(r[2]) if len(r) > 2 else ""
            if text:
                flat.append(_extension_intro_node(text, node_id=_next_id()))
            continue
        path = _s(r[2]) if len(r) > 2 else ""
        if not path:
            continue
        if not _is_ocds_path(path):
            flat.append(_extension_intro_node(path, node_id=_next_id()))
            continue
        flat.append(_make_node(rtype, path, r, node_id=_next_id()))

    tree = _build_tree(flat)
    return {"title": title, "subtitle": subtitle, "tree": tree, "flat": flat}


def _classify_mapping(mapping: str) -> str:
    """Heuristic mapping status: 'mapped' | 'partial' | 'unmapped'."""
    m = mapping.strip().lower()
    if not m:
        return "unmapped"
    # Phrases that indicate no real source
    if m in ("n/a", "na", "none", "no", "tbd", "todo") or "not available" in m:
        return "unmapped"
    if m.startswith("no ") or " to be " in m or "pending" in m:
        return "partial"
    return "mapped"


def _build_tree(flat: list[dict]) -> list[dict]:
    """Build a parent/child tree from the flat stage rows.

    Normal span/field rows nest by path depth. ``ref_span`` rows start a reference
    group: following rows nest by path depth *within that group* until the next
    ref_span, subtitle, or section. This matches the OCDS template layout where
    e.g. ``ref_span buyer`` is followed by ``parties/*`` fields, not ``buyer/*``.
    """
    roots: list[dict] = []
    stack: list[tuple[int, dict]] = []
    ref_group: dict | None = None
    ref_stack: list[tuple[int, dict]] = []

    def _attach(
        node: dict,
        depth: int,
        parent_stack: list[tuple[int, dict]],
        parent_list: list[dict],
    ) -> None:
        while parent_stack and parent_stack[-1][0] >= depth:
            parent_stack.pop()
        if parent_stack:
            parent_stack[-1][1]["children"].append(node)
        else:
            parent_list.append(node)
        parent_stack.append((depth, node))

    for entry in flat:
        rtype = entry["row_type"]
        node = {**entry, "children": []}

        if rtype == "section":
            ref_group = None
            ref_stack = []
            stack = []
            roots.append(node)
            continue

        if rtype == "subtitle":
            ref_group = None
            ref_stack = []
            stack = []
            roots.append(node)
            continue

        if rtype == "ref_span":
            ref_group = node
            ref_stack = []
            stack = []
            roots.append(node)
            continue

        if ref_group is not None:
            _attach(node, entry["depth"], ref_stack, ref_group["children"])
            continue

        _attach(node, entry["depth"], stack, roots)

    return roots


def parse_schema_sheet(rows: list[list]) -> list[dict]:
    """'OCDS Schema 1.1.5' and 'OCDS Extension Schemas 1.1.5' are flat reference tables."""
    if not rows:
        return []
    headers = [_s(c) for c in rows[0]]
    slug = [_slugify(h) for h in headers]
    out = []
    for r in rows[1:]:
        if not any(_s(c) for c in r):
            continue
        rec = {slug[j]: _s(r[j]) if j < len(r) else "" for j in range(len(headers))}
        rec["deprecated_bool"] = _s(rec.get("deprecated", "")).lower() in ("true", "1", "yes")
        out.append(rec)
    return out


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_SLUG_RE = re.compile(r"[^a-z0-9]+")
_OCDS_PATH_RE = re.compile(r"^[a-zA-Z_][a-zA-Z0-9_]*(/[a-zA-Z_][a-zA-Z0-9_]*)*$")


def _is_ocds_path(path: str) -> bool:
    """True when *path* looks like an OCDS JSON pointer (not template prose)."""
    p = _s(path)
    if not p or p.startswith("__"):
        return False
    if " " in p or ":" in p:
        return False
    return bool(_OCDS_PATH_RE.match(p))


def _split_extension_intro(text: str) -> tuple[str, str]:
    """Split OCP extension header cells like ``Lots: A tender process…``."""
    t = _s(text)
    if ": " in t:
        name, _, rest = t.partition(": ")
        return name.strip(), rest.strip()
    return t, ""


def _extension_intro_node(text: str, *, node_id: str) -> dict:
    title, desc = _split_extension_intro(text)
    return {
        "id": node_id,
        "row_type": "extension_intro",
        "category": "extension",
        "path": "",
        "name": "",
        "title": title if desc else text,
        "description": desc,
        "mapping": "",
        "example": "",
        "notes": "",
        "mapped": "unmapped",
        "depth": 0,
    }


def _non_field_row_types() -> frozenset[str]:
    return frozenset({"section", "subtitle", "extension_intro"})


def _mappable_field_row_types() -> frozenset[str]:
    return frozenset({"field", "required_field", "extension_field", "additional_field"})


def _stats_field_nodes(flat: list[dict]) -> list[dict]:
    mappable = _mappable_field_row_types()
    return [n for n in flat if n.get("row_type") in mappable]


def normalize_stage_flat(flat: list[dict]) -> list[dict]:
    """Fix legacy parses where OCP extension headers were stored as paths."""
    out: list[dict] = []
    for entry in flat:
        rtype = _s(entry.get("row_type", "")).lower()
        path = _s(entry.get("path", ""))
        if rtype == "extension" or (
            rtype not in ("section", "subtitle", "title", "column_headers")
            and path
            and not _is_ocds_path(path)
        ):
            text = path or _s(entry.get("title", "")) or _s(entry.get("section", ""))
            out.append(_extension_intro_node(text, node_id=entry.get("id") or f"fix{len(out)}"))
            continue
        if rtype == "section" and path:
            entry = {**entry, "path": ""}
        out.append(entry)
    return out


def normalize_stage(stage: dict) -> dict:
    """Normalize flat rows and rebuild tree + coverage stats."""
    flat = normalize_stage_flat(stage.get("flat") or [])
    tree = _build_tree(flat)
    field_nodes = _stats_field_nodes(flat)
    mapped = sum(1 for n in field_nodes if n.get("mapped") == "mapped")
    partial = sum(1 for n in field_nodes if n.get("mapped") == "partial")
    unmapped = sum(1 for n in field_nodes if n.get("mapped") == "unmapped")
    total = len(field_nodes)
    return {
        **stage,
        "flat": flat,
        "tree": tree,
        "stats": {
            "total": total,
            "mapped": mapped,
            "partial": partial,
            "unmapped": unmapped,
            "coverage_pct": round(100.0 * mapped / total, 1) if total else 0.0,
        },
    }


def _slugify(s: str) -> str:
    s = _s(s).lower().replace("&", "and")
    s = _SLUG_RE.sub("_", s).strip("_")
    return s or "col"


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def build_document(path: Path) -> dict:
    sheets = load_rows(path)
    stages = {key: parse_stage(sheets[name]) for name, key in STAGE_SHEETS.items()}

    # Stage-level coverage stats
    for key, stage in stages.items():
        field_nodes = _stats_field_nodes(stage["flat"])
        mapped = sum(1 for n in field_nodes if n["mapped"] == "mapped")
        partial = sum(1 for n in field_nodes if n["mapped"] == "partial")
        unmapped = sum(1 for n in field_nodes if n["mapped"] == "unmapped")
        total = len(field_nodes)
        stage["stats"] = {
            "total": total,
            "mapped": mapped,
            "partial": partial,
            "unmapped": unmapped,
            "coverage_pct": round(100.0 * mapped / total, 1) if total else 0.0,
        }

    return {
        "metadata": {
            **parse_overview(sheets["Field Level Mapping Overview"]),
            "source_file": path.name,
            "generated_at": _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds"),
            "sheet_names": list(sheets.keys()),
        },
        "data_sources": parse_data_sources(sheets["1. Data Sources"]),
        "data_elements": parse_data_elements(sheets["2. Data Elements"]),
        "stages": stages,
        "ocds_schema": parse_schema_sheet(sheets["OCDS Schema 1.1.5"]),
        "ocds_extensions": parse_schema_sheet(sheets["OCDS Extension Schemas 1.1.5"]),
    }


def main(argv: Iterable[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input", "-i", type=Path, default=DEFAULT_INPUT)
    p.add_argument("--output", "-o", type=Path, default=DEFAULT_OUTPUT)
    args = p.parse_args(argv)

    if not args.input.exists():
        raise SystemExit(f"Input workbook not found: {args.input}")

    print(f"Reading: {args.input}")
    doc = build_document(args.input)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(doc, indent=2, ensure_ascii=False), encoding="utf-8")

    size_kb = args.output.stat().st_size / 1024
    n_fields = sum(len(s["flat"]) for s in doc["stages"].values())
    print(f"Wrote:  {args.output}  ({size_kb:.1f} KB)")
    print(f"Stages: {len(doc['stages'])}, field rows: {n_fields}")
    print(f"Data elements: {len(doc['data_elements']['rows'])}")
    print(f"OCDS schema rows: {len(doc['ocds_schema'])}")
    print(f"OCDS extension rows: {len(doc['ocds_extensions'])}")
    for key, stage in doc["stages"].items():
        s = stage["stats"]
        print(
            f"  - {key:<14} fields={s['total']:<4} "
            f"mapped={s['mapped']:<4} partial={s['partial']:<3} "
            f"unmapped={s['unmapped']:<4} ({s['coverage_pct']}%)"
        )
    return 0


# ---------------------------------------------------------------------------
# Project / reference split (generalization)
# ---------------------------------------------------------------------------

OCDS_VERSION = "1.1.5"


def _clear_node_mappings(node: dict) -> None:
    node["mapping"] = ""
    node["example"] = ""
    node["notes"] = ""
    node["mapped"] = "unmapped"
    for child in node.get("children") or []:
        _clear_node_mappings(child)


def clear_stage_mappings(stage: dict) -> dict:
    """Return a copy of a stage with mapping/example/notes cleared."""
    import copy

    s = copy.deepcopy(stage)
    for node in s.get("flat") or []:
        node["mapping"] = ""
        node["example"] = ""
        node["notes"] = ""
        node["mapped"] = "unmapped"
    for node in s.get("tree") or []:
        _clear_node_mappings(node)
    field_nodes = _stats_field_nodes(s["flat"])
    total = len(field_nodes)
    s["stats"] = {
        "total": total,
        "mapped": 0,
        "partial": 0,
        "unmapped": total,
        "coverage_pct": 0.0,
    }
    return s


def extract_mapping_edits(stages: dict[str, dict]) -> dict[str, dict]:
    """Pull non-empty mapping/example/notes from stages into edit map keys."""
    edits: dict[str, dict] = {}
    for stage_key, stage in stages.items():
        for node in stage.get("flat") or []:
            if node.get("row_type") in _non_field_row_types():
                continue
            path = node.get("path") or ""
            if not path or path.startswith("__subtitle"):
                continue
            patch: dict[str, str] = {}
            if node.get("mapping"):
                patch["mapping"] = node["mapping"]
            if node.get("example"):
                patch["example"] = node["example"]
            if node.get("notes"):
                patch["notes"] = node["notes"]
            if patch:
                edits[f"{stage_key}::{path}"] = patch
    return edits


def build_ocds_reference(doc: dict) -> dict:
    """Tier A: OCDS structure + schema catalogues (no project mappings)."""
    stages = {
        k: normalize_stage(clear_stage_mappings(v)) for k, v in doc["stages"].items()
    }
    meta = doc.get("metadata") or {}
    return {
        "ocds_version": OCDS_VERSION,
        "metadata": {
            "title": meta.get("title", "Open Contracting Data Standard"),
            "version_line": meta.get("version_line", ""),
            "instructions": meta.get("instructions", []),
            "sheet_names": meta.get("sheet_names", []),
            "generated_at": _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds"),
        },
        "stages": stages,
        "ocds_schema": doc.get("ocds_schema") or [],
        "ocds_extensions": doc.get("ocds_extensions") or [],
    }


def build_project_payload(
    doc: dict,
    *,
    project_id: str,
    name: str,
    description: str = "",
    source_system: str = "",
    empty_inventory: bool = False,
) -> dict:
    """Tier B + C project file (no embedded OCDS stage trees)."""
    edits = {} if empty_inventory else extract_mapping_edits(doc["stages"])
    inv = doc.get("data_elements") or {"columns": [], "column_groups": [], "rows": []}
    src = doc.get("data_sources") or {"columns": [], "rows": []}
    return {
        "metadata": {
            "project_id": project_id,
            "name": name,
            "description": description,
            "source_system": source_system,
            "ocds_version": OCDS_VERSION,
            "template_version": (doc.get("metadata") or {}).get("version_line", ""),
            "source_file": (doc.get("metadata") or {}).get("source_file", ""),
            "created_at": _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds"),
            "updated_at": _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds"),
            "imports": [],
        },
        "data_sources": (
            {"columns": src.get("columns") or [], "rows": []}
            if empty_inventory
            else doc.get("data_sources") or {"columns": [], "rows": []}
        ),
        "data_elements": (
            {
                "columns": inv.get("columns") or [],
                "column_groups": inv.get("column_groups") or [],
                "rows": [],
            }
            if empty_inventory
            else doc.get("data_elements") or {"columns": [], "column_groups": [], "rows": []}
        ),
        "mapping_edits": edits,
        "data_element_additions": [],
        "extension_proposals": [],
    }


def parse_inventory(path: Path) -> dict:
    """Parse only sheets 1 (Data Sources) and 2 (Data Elements)."""
    sheets = load_rows(path)
    return {
        "data_sources": parse_data_sources(sheets["1. Data Sources"]),
        "data_elements": parse_data_elements(sheets["2. Data Elements"]),
    }


def parse_mappings_workbook(path: Path) -> dict[str, dict]:
    """Parse only OCDS stage sheets into stages dict."""
    sheets = load_rows(path)
    stages = {key: parse_stage(sheets[name]) for name, key in STAGE_SHEETS.items()}
    for key, stage in stages.items():
        field_nodes = _stats_field_nodes(stage["flat"])
        mapped = sum(1 for n in field_nodes if n["mapped"] == "mapped")
        partial = sum(1 for n in field_nodes if n["mapped"] == "partial")
        unmapped = sum(1 for n in field_nodes if n["mapped"] == "unmapped")
        total = len(field_nodes)
        stage["stats"] = {
            "total": total,
            "mapped": mapped,
            "partial": partial,
            "unmapped": unmapped,
            "coverage_pct": round(100.0 * mapped / total, 1) if total else 0.0,
        }
    return stages


if __name__ == "__main__":
    raise SystemExit(main())
