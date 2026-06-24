#!/usr/bin/env python3
"""Remove empty OCP template placeholder rows from a project JSON file."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from excel_to_json_mapping import _is_placeholder_data_element  # noqa: E402


def clean_project(path: Path) -> int:
    data = json.loads(path.read_text(encoding="utf-8"))
    rows = data.get("data_elements", {}).get("rows") or []
    kept = [
        r
        for r in rows
        if not _is_placeholder_data_element(
            r.get("for_mapping", ""),
            r.get("section_table", ""),
            r.get("data_element", ""),
        )
    ]
    removed = len(rows) - len(kept)
    if removed:
        data["data_elements"]["rows"] = kept
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    return removed


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "project_files",
        nargs="*",
        type=Path,
        default=[ROOT / "public" / "projects" / "blank.json"],
    )
    args = p.parse_args()
    for path in args.project_files:
        if not path.exists():
            print(f"Skip (missing): {path}")
            continue
        n = clean_project(path)
        print(f"{path.name}: removed {n} placeholder row(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
