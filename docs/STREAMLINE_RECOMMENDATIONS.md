# Streamlining OCDS mapping from scratch

**Purpose:** Practical structure for new publishers mapping a source system to OCDS 1.1 using the Mapping Explorer — without trying to fill the entire schema at once.

**Audience:** Mapping leads, data engineers, and stakeholders starting from **Blank project** or **+ New** (empty inventory).

**Related:** [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md) · [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) · [`PLANNED_IMPLEMENTATIONS.md`](PLANNED_IMPLEMENTATIONS.md) (mapping playbooks backlog)

**Last updated:** June 24, 2026

---

## Executive summary

OCDS is broad by design. Mapping from scratch works when you:

1. **Narrow the target** — define one compiled release shape (grain, stages, extensions) before field work.
2. **Work inventory-first** — data sources → data elements → link to OCDS (not random tree browsing).
3. **Follow a stage ladder** — General → Award → Tender → … in priority order, not alphabetical stage order.
4. **Use bundles and indicators** — map until required paths for your publish tier and risk checks are satisfied.

The explorer already supports each step; this doc is the recommended **workflow and scoping discipline**.

---

## 1. Define the release shape first

Do not map “all of OCDS.” Decide what **one compiled release** means for version 1 of your pipeline.

| Decision | Questions to answer |
|----------|---------------------|
| **Process grain** | One release per award? per tender? per contract line? How will compile group rows? |
| **Stages published** | Award-only flat export vs plan → tender → award → contract |
| **Extensions** | bids, lots, … — only those your compiler actually emits |
| **Identifiers** | How `ocid`, `id`, `date`, and `tag` are generated |

Record answers in project metadata (`description`), stakeholder notes, or (when available) `publication_config`.

### In the app

| Task | View |
|------|------|
| Publisher-wide compile rules | **Release & publication** → publication config form |
| Release envelope paths | **Release & publication** → envelope table (`ocid`, `id`, `date`, `tag`, …) |
| Preview header JSON | **Release & publication** → header preview |

Treat **Release & publication** as a **gate** before deep mapping in Tender/Award — not a final polish step.

---

## 2. Inventory-first, not tree-first

The OCP workbook model (and this tool) is:

```text
Sheet 1 — Data sources  →  systems / tables
Sheet 2 — Data elements →  fields you can export
Sheet 3 — OCDS mappings →  for_mapping on each leaf path
```

### Recommended order

| Step | Action | App view |
|------|--------|----------|
| 1 | Register systems and which stages they support | **Data Sources** |
| 2 | Add fields (wizard: source → table → column) | **Data Elements** |
| 3 | Set `mapping_details` on elements to target OCDS paths | **Data Elements** (edit row) |
| 4 | Apply **auto-link** suggestions | **Validation** |
| 5 | Fill remaining gaps leaf-by-leaf | **Mapping Explorer** |

Map **source → OCDS** (inventory and `for_mapping` in exported YAML). Browsing the OCDS tree without an inventory drifts from what your ETL can actually populate.

### Batch tip

For each source table:

1. Add all exportable columns as data elements.
2. Set `mapping_details` to intended OCDS paths (rough is fine).
3. Run **Validation → auto-link** once per stage.

This is usually faster than mapping each leaf in the explorer in isolation.

---

## 3. Stage priority ladder

The app exposes six procurement stages. For a **from-scratch MVP**, map in this order:

```text
General → Award → Tender → Contract → Planning → Implementation
```

| Phase | Stage | Focus | “Done enough” signal |
|-------|-------|--------|----------------------|
| **A** | General | `ocid`, `id`, `date`, `tag`, `buyer`, `parties` | Release envelope: required paths mapped |
| **B** | Award | value, date, suppliers, status, items/classification | Minimal award notice publishable |
| **C** | Tender | period, method, title, value (ABC) | Timing/competition indicators runnable |
| **D** | Contract | period, value | Only if you publish contract stage |
| **E** | Planning | budget, milestones | Only if APP/planning in scope |
| **F** | Implementation | physical/financial progress | Defer unless source data exists |

Use **Overview** stage coverage bars as a dashboard: improve **A → B → C** before chasing low coverage in later stages.

### Explorer shortcuts

| Goal | URL pattern |
|------|-------------|
| Unmapped award fields | `/p/{project}/explorer/award?status=unmapped` |
| Search by keyword | `/p/{project}/explorer/tender?q=procurementMethod` |

---

## 4. Mapping bundles (field groups)

Think in **bundles** aligned to compile and risk indicators — not hundreds of unrelated leaves.

| Bundle | Representative OCDS paths | Unlocks |
|--------|----------------------------|---------|
| **Release identity** | `ocid`, `id`, `date`, `tag`, `initiationType` | Every release |
| **Buyer block** | `buyer/id`, `buyer/name`, `parties/id`, `parties/name` | Attribution, R038 (buyer scope) |
| **Competition** | `tender/procurementMethod`, `tender/tenderPeriod`, `bids/details[]/tenderers` | R003, R018, PH-C02 |
| **Award economics** | `tender/value/amount`, `awards[]/value/amount`, `awards[]/suppliers` | PH-C03, value analytics |
| **Items / classification** | `tender/items[]/classification`, `awards[]/items[]/classification` | R048, PH-C06 |
| **Documents** | `tender/documents[]`, `awards/documents[]` | PH-C11 (procedural pack) |
| **Contracts** | `contracts[]/period`, `awards[]/contractPeriod` | PH-C14, PH-C15 |

Map a bundle across stages before moving to the next bundle.

**Future product:** `mapping_playbooks.json` (same pattern as indicator packs) — bundle id, paths, readiness on Overview. See [`PLANNED_IMPLEMENTATIONS.md`](PLANNED_IMPLEMENTATIONS.md).

---

## 5. Indicator-driven completion

Risk indicators declare **which OCDS paths must be mapped** for a check to run at compile time.

### Workflow

1. Open **Risk Indicators** — enable packs relevant to your jurisdiction/export (custom packs default on).
2. Optional: enable **PhilGEPS deployment feasibility** overlay to see per-export-shape feasibility.
3. Sort mentally by readiness % — low readiness = missing required paths.
4. Use **Path details** in-indicator to map without leaving the view.
5. Read **What it tracks** / **How it's computed** on each indicator (Cardinal + custom packs).

### Typical priorities by export shape

| Export shape | Map first for indicators |
|--------------|--------------------------|
| Flat award CSV | R003, R018, PH-C01, PH-C04–C08 |
| Normalized DB (e-GP tables) | Above + bid blocks, documents, PH-C09–C15 |
| WSF integrated | PH-WSF-C01–C06, R003 (mode-filtered), PH-C03 — not R018 (no bidders) |

Do not map bid-price collusion paths (R024, R028, R058) until `/bids/details[]/value/amount` exists in source.

---

## 6. Scoping tactics that reduce breadth

### Publish tiers

Document which tier you are targeting:

| Tier | Contents | Typical use |
|------|----------|-------------|
| **Tier 1** | Award notice: buyer, method, dates, value, awardee | Flat exports, transparency portal |
| **Tier 2** | Tier 1 + tender period, bidders, documents | Competition scrutiny |
| **Tier 3** | Tier 2 + planning, contracts, implementation | Full procurement cycle |

State tier in project `description` or team runbook. Unmapped fields outside tier are **out of scope**, not backlog debt.

### One source field, many paths

- Prefer **one data element** with `mapping_details` listing multiple OCDS paths only when compile needs each path.
- Do not map optional OCDS fields “just in case.”

### Arrays

- Map **one representative** path per array block (`awards[]`, `items[]`, `bids/details[]`).
- Document in field **notes**: “repeat per row at compile” — do not map every array index in the template.

### Extensions

- Propose extensions in **OCDS Extensions** only when compile emits them.
- Map core 1.1 paths for a block before extension-specific fields.

### Competitive vs non-competitive

- Stratify indicators and review by `procurementMethod` / `procurementMethodDetails` (especially SVP vs Public Bidding in Philippines data).

---

## 7. Suggested first-week plan

| Day | Focus | Primary views |
|-----|--------|----------------|
| 1 | Scope + publication config | Release & publication, Welcome guide |
| 2 | Data sources + core tables | Data Sources |
| 3 | Award + buyer data elements | Data Elements wizard |
| 4 | Auto-link + explorer gaps | Validation, Explorer (award, tender) |
| 5 | Indicator-driven gap fill | Risk Indicators |
| 6 | Export handoff | Export → Project JSON + mapping YAML |

Hand YAML + `publication_config` to the compile pipeline per [`EXPORT_GUIDE.md`](EXPORT_GUIDE.md).

---

## 8. Anti-patterns

| Avoid | Instead |
|-------|---------|
| Mapping the full tree before inventory exists | Data sources + elements first |
| Same work as “100% coverage” goal | Tier + indicator readiness as exit criteria |
| Inferring single bid from awardee alone | R018 only when bidders disclosed; PH-C02 for missing lists |
| Mapping planning on award-only CSV | Scope planning to WSF/DB exports |
| Duplicating PhilGEPS template without grouping rules | Define process grain in publication/compile docs |

---

## 9. App features that support this workflow (today)

| Feature | Role in streamlined mapping |
|---------|----------------------------|
| **Overview** | Stage coverage + dashboard cards |
| **Mapping Explorer** | Leaf-only edits; expand/collapse; filters |
| **Data element wizard** | Section/table suggestions |
| **Validation + auto-link** | Inventory → OCDS path proposals |
| **Risk Indicators** | Path requirements + in-app computation reference |
| **Release & publication** | Envelope + `publication_config` |
| **Import / Export** | Round-trip project JSON, YAML, CSV, xlsx (CLI) |
| **Welcome guide** | Header **Guide** — onboarding checklist |

---

## 10. Proposed product improvements

Items to reduce friction for blank-project users (see [`PLANNED_IMPLEMENTATIONS.md`](PLANNED_IMPLEMENTATIONS.md) for backlog):

| Idea | Benefit |
|------|---------|
| **Mapping playbooks** (`public/mapping_playbooks/`) | Bundle readiness on Overview (“Award MVP 5/8”) |
| **Guided blank project** | Pick publish tier → highlight paths → suggest element names |
| **Project scope metadata** | `publish_tier`, `primary_stages`, `extensions_in_scope` |
| **Default explorer filter** | New project opens Award + unmapped |
| **Starter element templates** | “e-GP award CSV”, “ERP PO” inventory seeds |
| **Playbook ↔ indicator links** | “This bundle unblocks R003, PH-C04” |

---

## 11. Quick reference — three-tier model

```text
A. ocds_reference.json     Shared OCDS 1.1.5 tree (all projects)
B. project JSON            data_sources, data_elements, publication_config
C. mapping_edits           stage::path → mapping, example, notes (browser / import)
```

Export merges B + C into handoff artifacts; compile consumes YAML + publication rules.

---

## References

- [OCP field-level mapping template guidance](https://www.open-contracting.org/resources/ocds-1-1-mapping-template-guidance/)
- [OCP Cardinal indicators](https://cardinal.readthedocs.io/en/latest/cli/indicators/)
- Project indicator packs: `public/indicator_packs/`
- Optional PhilGEPS corpus notes: `samples/philgeps/docs/RISK_INDICATOR_RECOMMENDATIONS.md` (if `samples/` present locally)
