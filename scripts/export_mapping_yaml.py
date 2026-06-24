#!/usr/bin/env python3
"""Export mapping.yaml for ETL pipelines from a project JSON file.

Usage:
  python scripts/export_mapping_yaml.py -p public/projects/blank.json -o mapping.yaml
"""

from __future__ import annotations

import argparse
import datetime as _dt
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from ocp_export import build_mapping_yaml_document  # noqa: E402
from ocp_project_io import load_project  # noqa: E402


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--project", "-p", type=Path, required=True)
    p.add_argument("--output", "-o", type=Path, required=True)
    args = p.parse_args()

    if not args.project.exists():
        raise SystemExit(f"Project not found: {args.project}")

    project = load_project(args.project)
    doc = build_mapping_yaml_document(project)
    if not doc["meta"].get("exported_at"):
        doc["meta"]["exported_at"] = _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        yaml.dump(doc, sort_keys=False, allow_unicode=True, default_flow_style=False),
        encoding="utf-8",
    )
    stages = len(doc.get("ocds_mappings") or {})
    elements = len(doc.get("data_elements") or [])
    mapped = sum(len(v) for v in (doc.get("ocds_mappings") or {}).values())
    print(f"Wrote {args.output} ({elements} elements, {mapped} mappings across {stages} stages)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
