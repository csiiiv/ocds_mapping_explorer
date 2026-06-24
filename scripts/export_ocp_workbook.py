#!/usr/bin/env python3
"""Export a mapping project to an OCP field-level mapping workbook (.xlsx).

Requires openpyxl and a template workbook (structure + formulas preserved).

Usage:
  python scripts/export_ocp_workbook.py -p public/projects/blank.json -o out.xlsx
  python scripts/export_ocp_workbook.py -p project.json -o out.xlsx \\
      -t references/OCDS_Mapping_Template_1.1_blank.xlsx
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from excel_to_json_mapping import DEFAULT_INPUT  # noqa: E402
from ocp_export import export_ocp_workbook  # noqa: E402
from ocp_project_io import load_project  # noqa: E402

DEFAULT_TEMPLATE_CANDIDATES = [
    ROOT / "references" / "OCDS_Mapping_Template_1.1_blank.xlsx",
    DEFAULT_INPUT,
]


def resolve_template(explicit: Path | None) -> Path:
    if explicit:
        return explicit
    for p in DEFAULT_TEMPLATE_CANDIDATES:
        if p.exists():
            return p
    raise FileNotFoundError(
        "No OCP template workbook found. Place a template in references/ or pass --template.\n"
        "  Expected: references/OCDS_Mapping_Template_1.1_blank.xlsx\n"
        "  Or run: npm run strip-template  (needs a filled OCP workbook in references/)"
    )


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--project", "-p", type=Path, required=True)
    p.add_argument("--output", "-o", type=Path, required=True)
    p.add_argument("--template", "-t", type=Path, help="OCP xlsx template (default: auto-detect)")
    args = p.parse_args()

    if not args.project.exists():
        raise SystemExit(f"Project not found: {args.project}")

    template = resolve_template(args.template)
    project = load_project(args.project)
    name = project.get("metadata", {}).get("name", args.project.stem)
    print(f"Exporting workbook for: {name}")
    print(f"  Template: {template.name}")

    stats = export_ocp_workbook(project, template, args.output)
    print(f"  Wrote: {args.output}")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
