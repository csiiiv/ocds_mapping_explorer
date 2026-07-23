#!/usr/bin/env python3
"""Convert OCP Red Flags → OCDS CSV into markdown reference + indicator pack JSON.

Source CSVs (in references/):
  - NEW Red Flags to OCDS mapping #Public - Metadata.csv
  - NEW Red Flags to OCDS mapping #Public - Red flags indicators.csv

Outputs:
  - references/OCP_RED_FLAGS_TO_OCDS.md
  - public/indicator_packs/ocp-red-flags.json
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / "references"
INDICATORS_CSV = REF / "NEW Red Flags to OCDS mapping #Public - Red flags indicators.csv"
METADATA_CSV = REF / "NEW Red Flags to OCDS mapping #Public - Metadata.csv"
MD_OUT = REF / "OCP_RED_FLAGS_TO_OCDS.md"
JSON_OUT = ROOT / "public" / "indicator_packs" / "ocp-red-flags.json"

# Segments that are arrays in OCDS 1.1 (Cardinal-style [] notation).
# Note: `bids` is an object; the array is `bids/details`.
ARRAY_SEGMENTS = {
    "awards",
    "contracts",
    "details",
    "items",
    "documents",
    "parties",
    "tenderers",
    "suppliers",
    "amendments",
    "milestones",
    "transactions",
    "additionalClassifications",
    "additionalContactPoints",
    "deliveryAddresses",
    "deliveryLocations",
    "participationFees",
}


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").replace("\xa0", " ")).strip()


def clean_multiline(text: str) -> str:
    lines = [(ln or "").replace("\xa0", " ").rstrip() for ln in (text or "").splitlines()]
    return "\n".join(lines).strip()


def map_scope(unit: str) -> str:
    u = (unit or "").lower()
    if "contracting process" in u:
        return "OCID"
    if "bidder" in u or "tenderer" in u:
        return "Tenderer"
    if "buyer" in u or "procuring" in u:
        return "Buyer"
    return "OCID"


def normalize_path_token(token: str) -> str | None:
    t = token.strip().strip("`\"'“”‘’")
    t = t.rstrip("`,;")
    # Drop leading OR / AND noise
    t = re.sub(r"^(OR|AND)\s+", "", t, flags=re.I).strip()
    # Keep only path-like: must contain /
    if "/" not in t:
        return None
    # Cut at assignment / comparison / prose
    t = re.split(r"\s*(?:=|OR|AND|,|;)\s*", t, maxsplit=1)[0].strip()
    t = t.strip("`\"'“”‘’").rstrip("`,;")
    if not re.match(r"^[A-Za-z][A-Za-z0-9_/]*$", t):
        return None
    # Normalize known typos / variants
    t = t.replace("award/status", "awards/status")
    if not t.startswith("/"):
        t = "/" + t
    # Insert [] after array segments (idempotent)
    parts = t.strip("/").split("/")
    out: list[str] = []
    for p in parts:
        base = p.rstrip("[]")
        if base in ARRAY_SEGMENTS:
            out.append(f"{base}[]")
        else:
            out.append(base)
    return "/" + "/".join(out)


def extract_paths(ocds_fields: str) -> list[dict]:
    """Parse free-text OCDS fields column into PathRequirement-like dicts."""
    text = ocds_fields or ""
    # Split optional section
    optional_split = re.split(r"\bOptional(?:\s*fields)?(?:\s*to[^:]*)?:\s*", text, maxsplit=1, flags=re.I)
    required_text = optional_split[0]
    optional_text = optional_split[1] if len(optional_split) > 1 else ""

    def collect(chunk: str, required: bool) -> list[dict]:
        found: list[dict] = []
        seen: set[str] = set()
        # Also split OR alternatives into separate candidates
        for raw in re.split(r"[\n,;]+|\s+OR\s+", chunk):
            path = normalize_path_token(raw)
            if not path or path in seen:
                continue
            seen.add(path)
            entry: dict = {"path": path, "required": required}
            # Preserve documentType / roles filters as notes when present nearby
            note_m = re.search(
                rf"{re.escape(path.lstrip('/'))}[^\n]{{0,80}}",
                chunk.replace("\n", " "),
                flags=re.I,
            )
            if note_m:
                nearby = note_m.group(0)
                if "documentType" in nearby or "roles" in nearby or "=" in nearby:
                    note = clean(nearby)
                    if len(note) < 120 and note != path.lstrip("/"):
                        entry["note"] = note
            found.append(entry)
        return found

    paths = collect(required_text, True) + collect(optional_text, False)
    return paths


def load_indicators() -> list[dict]:
    with INDICATORS_CSV.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def load_metadata() -> list[tuple[str, str]]:
    with METADATA_CSV.open(encoding="utf-8-sig", newline="") as f:
        return [(r["Variable"], r["Description"]) for r in csv.DictReader(f)]


def build_pack(rows: list[dict]) -> dict:
    indicators = []
    for i, row in enumerate(rows, start=1):
        rid = clean(row["R_id"])
        name = clean(row["Red flag"])
        definition = clean(row["Definition"])
        stage = clean(row["Stage"])
        flag_type = clean(row["Type of red flag"])
        why = clean(row["Why is this a red flag?"])
        methodology = clean(row["Methodology"])
        unit = clean(row["Unit of analysis"])
        source = clean(row["Source"])
        required_data = clean_multiline(row["Required data fields"])
        ocds_fields = clean_multiline(row["OCDS fields"])

        paths = extract_paths(ocds_fields)
        # Always need ocid for process-scoped indicators when no paths parsed
        if not paths:
            paths = [{"path": "/ocid", "required": True, "note": "Path list could not be auto-parsed — see pack source CSV"}]

        scope = map_scope(unit)
        steps = [
            s
            for s in [
                f"Procurement stage focus: {stage}." if stage else "",
                f"Risk category: {flag_type}." if flag_type else "",
                f"Required source concepts: {clean(required_data)}." if required_data else "",
                methodology if methodology and "Annex" not in methodology else "See OCP Red Flags Guide Annex for full methodology.",
            ]
            if s
        ]

        indicators.append(
            {
                "id": rid,
                "name": name,
                "engine": "custom",
                "scope": scope,
                "description": definition,
                "tracks": why or definition,
                "computation": {
                    "summary": methodology if methodology else "See OCP Red Flags Guide Annex.",
                    "steps": steps,
                },
                "interpretation": why or definition,
                "limitations": f"Unit of analysis: {unit}. Source: {source}" if source else f"Unit of analysis: {unit}.",
                "paths": paths,
                "priority": i,
                "docs_url": "https://www.open-contracting.org/resources/",
            }
        )

    return {
        "pack_id": "ocp-red-flags",
        "name": "OCP Red Flags (methodology catalogue)",
        "description": (
            "Open Contracting Partnership public red-flag indicators mapped to OCDS fields "
            "(R001–R073). Broader than the Cardinal engine subset; overlapping ids defer to "
            "the Cardinal pack when both are enabled."
        ),
        "version": "1.0.0",
        "engine": "custom",
        "source": {
            "indicators_csv": INDICATORS_CSV.name,
            "metadata_csv": METADATA_CSV.name,
        },
        "indicators": indicators,
    }


def build_markdown(meta: list[tuple[str, str]], rows: list[dict], pack: dict) -> str:
    lines: list[str] = []
    lines.append("# OCP Red Flags → OCDS mapping (public)")
    lines.append("")
    lines.append(
        "Reference catalogue derived from the Open Contracting Partnership "
        "**NEW Red Flags to OCDS mapping** public workbook."
    )
    lines.append("")
    lines.append("**Sources (in this folder):**")
    lines.append("")
    lines.append(f"- `{INDICATORS_CSV.name}` — indicator definitions")
    lines.append(f"- `{METADATA_CSV.name}` — column glossary")
    lines.append("")
    lines.append(
        f"**App pack:** [`public/indicator_packs/ocp-red-flags.json`](../public/indicator_packs/ocp-red-flags.json) "
        f"({len(pack['indicators'])} indicators) — enable under **Risk Indicators** "
        "(catalog id `ocp-red-flags`)."
    )
    lines.append("")
    lines.append(
        "Overlapping ids with the Cardinal pack (`R003`, `R018`, …) keep the **Cardinal** definition "
        "when both packs are enabled; this catalogue still documents the full OCP methodology set."
    )
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Column glossary")
    lines.append("")
    lines.append("| Variable | Description |")
    lines.append("|----------|-------------|")
    for var, desc in meta:
        d = clean(desc).replace("|", "\\|")
        lines.append(f"| `{var}` | {d} |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    by_stage: dict[str, int] = {}
    by_type: dict[str, int] = {}
    for row in rows:
        by_stage[clean(row["Stage"])] = by_stage.get(clean(row["Stage"]), 0) + 1
        by_type[clean(row["Type of red flag"])] = by_type.get(clean(row["Type of red flag"]), 0) + 1
    lines.append(f"**{len(rows)}** indicators (`{rows[0]['R_id']}`–`{rows[-1]['R_id']}`).")
    lines.append("")
    lines.append("### By stage")
    lines.append("")
    lines.append("| Stage | Count |")
    lines.append("|-------|------:|")
    for k in sorted(by_stage):
        lines.append(f"| {k} | {by_stage[k]} |")
    lines.append("")
    lines.append("### By type of red flag")
    lines.append("")
    lines.append("| Type | Count |")
    lines.append("|------|------:|")
    for k in sorted(by_type):
        lines.append(f"| {k} | {by_type[k]} |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Index")
    lines.append("")
    lines.append("| Id | Red flag | Stage | Type | Unit of analysis |")
    lines.append("|----|----------|-------|------|------------------|")
    for row in rows:
        rid = clean(row["R_id"])
        lines.append(
            f"| [{rid}](#{rid.lower()}) | {clean(row['Red flag'])} | {clean(row['Stage'])} | "
            f"{clean(row['Type of red flag'])} | {clean(row['Unit of analysis'])} |"
        )
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Indicators")
    lines.append("")

    for row in rows:
        rid = clean(row["R_id"])
        lines.append(f"### {rid}")
        lines.append("")
        lines.append(f"**{clean(row['Red flag'])}**")
        lines.append("")
        lines.append(f"- **Stage:** {clean(row['Stage'])}")
        lines.append(f"- **Type of red flag:** {clean(row['Type of red flag'])}")
        lines.append(f"- **Unit of analysis:** {clean(row['Unit of analysis'])}")
        lines.append("")
        lines.append("#### Definition")
        lines.append("")
        lines.append(clean(row["Definition"]))
        lines.append("")
        lines.append("#### Why is this a red flag?")
        lines.append("")
        lines.append(clean(row["Why is this a red flag?"]))
        lines.append("")
        lines.append("#### Required data fields")
        lines.append("")
        lines.append("```")
        lines.append(clean_multiline(row["Required data fields"]) or "—")
        lines.append("```")
        lines.append("")
        lines.append("#### OCDS fields")
        lines.append("")
        lines.append("```")
        lines.append(clean_multiline(row["OCDS fields"]) or "—")
        lines.append("```")
        lines.append("")
        # Parsed paths from pack
        ind = next((x for x in pack["indicators"] if x["id"] == rid), None)
        if ind and ind.get("paths"):
            lines.append("#### Parsed paths (for app pack)")
            lines.append("")
            lines.append("| Path | Required |")
            lines.append("|------|----------|")
            for p in ind["paths"]:
                req = "yes" if p.get("required") else "no"
                lines.append(f"| `{p['path']}` | {req} |")
            lines.append("")
        lines.append("#### Methodology")
        lines.append("")
        lines.append(clean(row["Methodology"]) or "—")
        lines.append("")
        lines.append("#### Source")
        lines.append("")
        lines.append(clean(row["Source"]) or "—")
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("")
    lines.append("*Generated by `scripts/build_ocp_red_flags_pack.py`.*")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    if not INDICATORS_CSV.exists():
        raise SystemExit(f"Missing {INDICATORS_CSV}")
    rows = load_indicators()
    meta = load_metadata() if METADATA_CSV.exists() else []
    pack = build_pack(rows)
    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(pack, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    MD_OUT.write_text(build_markdown(meta, rows, pack), encoding="utf-8")
    print(f"Wrote {JSON_OUT.relative_to(ROOT)} ({len(pack['indicators'])} indicators)")
    print(f"Wrote {MD_OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
