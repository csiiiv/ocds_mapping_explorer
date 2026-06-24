#!/usr/bin/env python3
"""Export a mapping project to JSON and/or CSV files.

Usage:
  python scripts/export_project.py -p public/projects/blank.json
  python scripts/export_project.py -p public/projects/blank.json \\
      --csv-elements out/data_elements.csv --csv-sources out/data_sources.csv
  python scripts/export_project.py -p public/projects/blank.json -o dist/export.json
  python scripts/export_project.py -p public/projects/blank.json --yaml mapping.yaml
  python scripts/export_project.py -p public/projects/blank.json --xlsx out.xlsx
"""

from __future__ import annotations

import argparse
import csv
import datetime as _dt
import json
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from ocp_export import build_mapping_yaml_document, export_ocp_workbook  # noqa: E402
from ocp_project_io import DATA_ELEMENT_CSV_FIELDS, DATA_SOURCE_CSV_FIELDS, load_project, save_project  # noqa: E402
from export_ocp_workbook import resolve_template  # noqa: E402

# Human-readable CSV headers (OCP sheet style)
DATA_ELEMENT_CSV_HEADERS = [
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

DATA_SOURCE_CSV_HEADERS = [
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


def export_data_elements_csv(project: dict, path: Path) -> int:
    rows = project.get("data_elements", {}).get("rows") or []
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=DATA_ELEMENT_CSV_HEADERS, extrasaction="ignore")
        w.writeheader()
        for row in rows:
            w.writerow({k: row.get(k, "") for k in DATA_ELEMENT_CSV_FIELDS})
    return len(rows)


def export_data_sources_csv(project: dict, path: Path) -> int:
    rows = project.get("data_sources", {}).get("rows") or []
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=DATA_SOURCE_CSV_HEADERS, extrasaction="ignore")
        w.writeheader()
        for row in rows:
            w.writerow({k: row.get(k, "") for k in DATA_SOURCE_CSV_FIELDS})
    return len(rows)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--project", "-p", type=Path, required=True)
    p.add_argument("--output", "-o", type=Path, help="Write full project JSON to this path")
    p.add_argument("--csv-elements", type=Path, help="Export data elements CSV")
    p.add_argument("--csv-sources", type=Path, help="Export data sources CSV")
    p.add_argument("--yaml", type=Path, help="Export mapping.yaml for ETL")
    p.add_argument("--xlsx", type=Path, help="Export OCP field-level mapping workbook")
    p.add_argument("--template", "-t", type=Path, help="OCP xlsx template (with --xlsx)")
    args = p.parse_args()

    if not args.project.exists():
        raise SystemExit(f"Project not found: {args.project}")

    project = load_project(args.project)
    print(f"Project: {project.get('metadata', {}).get('name', args.project.stem)}")

    if args.output:
        save_project(args.output, project)
        print(f"  JSON: {args.output}")

    if args.csv_elements:
        n = export_data_elements_csv(project, args.csv_elements)
        print(f"  Data elements CSV: {args.csv_elements} ({n} rows)")

    if args.csv_sources:
        n = export_data_sources_csv(project, args.csv_sources)
        print(f"  Data sources CSV: {args.csv_sources} ({n} rows)")

    if args.yaml:
        doc = build_mapping_yaml_document(project)
        if not doc["meta"].get("exported_at"):
            doc["meta"]["exported_at"] = _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds")
        args.yaml.parent.mkdir(parents=True, exist_ok=True)
        args.yaml.write_text(
            yaml.dump(doc, sort_keys=False, allow_unicode=True, default_flow_style=False),
            encoding="utf-8",
        )
        mapped = sum(len(v) for v in (doc.get("ocds_mappings") or {}).values())
        print(f"  YAML: {args.yaml} ({mapped} mappings)")

    if args.xlsx:
        template = resolve_template(args.template)
        stats = export_ocp_workbook(project, template, args.xlsx)
        print(f"  XLSX: {args.xlsx} (template: {template.name})")
        for k, v in stats.items():
            print(f"    {k}: {v}")

    if not any([args.output, args.csv_elements, args.csv_sources, args.yaml, args.xlsx]):
        # Default: print project JSON path hint
        out = args.project.parent / f"{args.project.stem}_export.json"
        save_project(out, project)
        print(f"  JSON (default): {out}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
