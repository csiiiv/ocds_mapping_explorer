#!/usr/bin/env python3
"""Merge shared PhilGEPS publication metadata into built project JSON files."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHARED = Path(__file__).with_name("philgeps_shared_metadata.json")
PROJECTS = ROOT / "public" / "projects"

# Indicator packs are app-level (browser preferences), not per-project metadata.
STRIP_METADATA_KEYS = ("indicator_packs", "feasibility_pack", "data_profiles")


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "project_ids",
        nargs="*",
        default=["mphilgeps", "philgeps-1.5"],
        help="Project ids under public/projects/ (default: mphilgeps philgeps-1.5)",
    )
    args = p.parse_args()

    shared = json.loads(SHARED.read_text(encoding="utf-8"))
    publication = shared.get("publication_config")

    for project_id in args.project_ids:
        path = PROJECTS / f"{project_id}.json"
        if not path.exists():
            raise SystemExit(f"Project file not found: {path}")
        data = json.loads(path.read_text(encoding="utf-8"))
        for key in STRIP_METADATA_KEYS:
            data["metadata"].pop(key, None)
        if publication:
            pub = json.loads(json.dumps(publication))
            if project_id == "philgeps-1.5":
                pub["ocid_prefix"] = "ocds-philgeps-15"
            data["publication_config"] = pub
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"  Enriched {path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
