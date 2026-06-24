#!/usr/bin/env python3
"""Build OCDS reference + project JSON files from an OCP mapping workbook.

Outputs:
  public/ocds_reference.json     — tier A (OCDS structure, no mappings)
  public/projects/{id}.json      — tier B + C per project

Usage:
  python scripts/build_project.py --all
  python scripts/build_project.py --reference-only
  python scripts/build_project.py --project my-agency --name "My Agency"
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from excel_to_json_mapping import (  # noqa: E402
    DEFAULT_INPUT,
    build_document,
    build_ocds_reference,
    build_project_payload,
)

PUBLIC = ROOT / "public"
PROJECTS = PUBLIC / "projects"
DEFAULT_REFERENCE = PUBLIC / "ocds_reference.json"


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    kb = path.stat().st_size / 1024
    print(f"  Wrote {path.relative_to(ROOT)} ({kb:.1f} KB)")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input", "-i", type=Path, default=DEFAULT_INPUT)
    p.add_argument("--reference-out", type=Path, default=DEFAULT_REFERENCE)
    p.add_argument("--reference-only", action="store_true")
    p.add_argument("--all", action="store_true", help="Build reference + blank project")
    p.add_argument("--project", type=str, help="Project id (e.g. blank, my-agency)")
    p.add_argument("--name", type=str, default="", help="Display name for --project")
    p.add_argument("--description", type=str, default="")
    p.add_argument("--source-system", type=str, default="")
    p.add_argument("--empty-inventory", action="store_true", help="Blank data_sources/elements")
    p.add_argument("--project-out", type=Path, help="Override project output path")
    args = p.parse_args()

    if not args.input.exists():
        raise SystemExit(f"Workbook not found: {args.input}")

    print(f"Reading {args.input.name}")
    doc = build_document(args.input)

    if args.all or args.reference_only or not args.project:
        print("Building OCDS reference (tier A)...")
        ref = build_ocds_reference(doc)
        write_json(args.reference_out, ref)

    if args.reference_only:
        return 0

    if args.all:
        print("Building projects...")
        blank = build_project_payload(
            doc,
            project_id="blank",
            name="Blank project",
            description="Empty source inventory — start a new OCDS mapping from scratch",
            source_system="",
            empty_inventory=True,
        )
        write_json(PROJECTS / "blank.json", blank)
        return 0

    if not args.project:
        raise SystemExit("Specify --project ID, or use --all / --reference-only")

    project = build_project_payload(
        doc,
        project_id=args.project,
        name=args.name or args.project,
        description=args.description,
        source_system=args.source_system,
        empty_inventory=args.empty_inventory,
    )
    out = args.project_out or (PROJECTS / f"{args.project}.json")
    print(f"Building project {args.project}...")
    write_json(out, project)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
