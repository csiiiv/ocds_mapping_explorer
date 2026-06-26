#!/usr/bin/env python3
"""Import OCP field-level mapping workbook into a project JSON file.

Scopes:
  full       — data sources, data elements, and OCDS stage mappings
  inventory  — sheets 1 + 2 only
  mappings   — OCDS stage mapping columns only

Merge modes:
  replace    — wipe target tier before import
  merge      — upsert by short_name / element key / stage::path

Usage:
  python scripts/import_ocp_workbook.py -i stakeholder.xlsx -p public/projects/blank.json
  python scripts/import_ocp_workbook.py -i stakeholder.xlsx --scope inventory --merge merge \\
      -p public/projects/blank.json -o public/projects/agency.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from excel_to_json_mapping import (  # noqa: E402
    build_document,
    extract_mapping_edits,
    parse_inventory,
)
from ocp_project_io import apply_workbook_import, load_project, save_project  # noqa: E402


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input", "-i", type=Path, required=True, help="OCP mapping workbook (.xlsx)")
    p.add_argument("--project", "-p", type=Path, required=True, help="Base project JSON to merge into")
    p.add_argument("--output", "-o", type=Path, help="Output project JSON (default: overwrite --project)")
    p.add_argument(
        "--scope",
        choices=("full", "inventory", "mappings"),
        default="full",
        help="What to read from the workbook",
    )
    p.add_argument(
        "--merge",
        choices=("replace", "merge"),
        default="merge",
        dest="merge_mode",
        help="How to combine with existing project data",
    )
    p.add_argument("--new-project-id", type=str, help="Override metadata.project_id on output")
    p.add_argument("--new-project-name", type=str, help="Override metadata.name on output")
    args = p.parse_args()

    if not args.input.exists():
        raise SystemExit(f"Workbook not found: {args.input}")
    if not args.project.exists():
        raise SystemExit(f"Project not found: {args.project}")

    print(f"Reading workbook: {args.input.name}")
    project = load_project(args.project)

    inventory = None
    mapping_edits = None

    if args.scope in ("full", "inventory"):
        inventory = parse_inventory(args.input)
        print(
            f"  Inventory: {len(inventory['data_sources']['rows'])} sources, "
            f"{len(inventory['data_elements']['rows'])} elements"
        )

    if args.scope in ("full", "mappings"):
        if args.scope == "mappings":
            from excel_to_json_mapping import parse_mappings_workbook  # noqa: WPS433

            stages = parse_mappings_workbook(args.input)
            mapping_edits = extract_mapping_edits(stages)
        else:
            doc = build_document(args.input)
            mapping_edits = extract_mapping_edits(doc["stages"])
        print(f"  Mappings: {len(mapping_edits)} field edits")

    updated = apply_workbook_import(
        project,
        inventory=inventory,
        mapping_edits=mapping_edits,
        scope=args.scope,
        merge_mode=args.merge_mode,
        filename=args.input.name,
    )

    if args.new_project_id:
        updated["metadata"]["project_id"] = args.new_project_id
    if args.new_project_name:
        updated["metadata"]["name"] = args.new_project_name
    updated["metadata"]["source_file"] = args.input.name

    out = args.output or args.project
    save_project(out, updated)
    print(f"Wrote project: {out}")

    last = (updated.get("metadata") or {}).get("imports") or []
    if last:
        print(f"Import summary: {json.dumps(last[-1], indent=2)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
