# Risk indicator recommendations — PhilGEPS OCDS (2021–2025 CSV)

**Date:** June 23, 2026  
**Inputs reviewed:**
- `references/2025_mPhilGEPS_OCDS - Field Level Mapping Template for OCDS 1.1 (Template Version 0.91) (1) (1).xlsx`
- `references/2025_PhilGEPS 1.5_OCDS - Field Level Mapping Template for OCDS 1.1 (Template Version 0.91).xlsx`
- Compiled corpus: `ocds/csv_2021_2025/compiled_releases.jsonl` (5,120,088 releases)
- [OCP Cardinal](https://cardinal.readthedocs.io/en/latest/cli/indicators/) indicator definitions

---

## Executive summary

**Best targets for this dataset are process-level competition and timing indicators**, not bid-price collusion indicators.

The PS-DBM v0.91 templates describe rich normalized tables (`Tenders`, `Vendors`, `M_TenderBiddersList`, bid line items) that support full Cardinal collusion flags. Our **flat CSV export** only carries `List of Bidder's` (names, semicolon-separated) — no non-winner bid amounts, no bid submission timestamps, no per-bidder status. Cardinal coverage confirms **`/bids/details[]/value/amount` = 0** across the full corpus.

| Priority | Indicator | Type | Why |
|----------|-----------|------|-----|
| **1** | **R003** — Short submission period | Cardinal | ~98% `tenderPeriod` coverage; both templates map start/end dates |
| **2** | **R018** — Single bid received | Cardinal | Competitive methods + bidder names available for ~46% of releases; strong PH policy signal |
| **3** | **PH-C01** — Non-competitive method above value threshold | Custom | Templates map `procurementMethod` + `tender/value`; RA 9184 context |
| **4** | **R048** — Heterogeneous supplier | Cardinal | Feasible at scale with UNSPSC; ~48% item classification coverage |
| **5** | **PH-C02** — Competitive procedure, empty bidder list | Custom | Detects missing transparency where competition is declared |

**Do not prioritize (yet):** R024, R025, R028, R030, R035, R036, R038, R058 — require bid amounts, bid dates, or bid status the templates source from tables **not present** in the CSV export.

---

## How the templates relate to our data

Both v0.91 workbooks share the same OCDS target paths; they differ only in **source table names**:

| OCDS concept | mPhilGEPS 2.0 template source | PhilGEPS 1.5 template source | Our CSV export (schema_3) |
|--------------|------------------------------|-------------------------------|---------------------------|
| Tender period | `Tenders (Tender Start/End Datetime)` | `M_Tender` dates | `published_date`, `closing_date` |
| Approved budget | `Tenders Items (Estimated Budget Cost)` | `M_Tender` amounts | `approved_budget` |
| Procurement mode | `Tenders (Procurement Mode)` | `M_Tender` procedure | `procurement_mode` |
| Award value | `Awards (Contract Amount)` | `M_Award` | `contract_amount` |
| Bidders | `Vendors (Name)` | `M_TenderBiddersList` | `list_of_bidders` (names only) |
| Bid amounts | Bid / vendor price tables | Bid detail tables | **Not exported** |
| Planning (APP) | `app_line_items` | N/A in 1.5 sheet | **Not in CSV** |

**Implication:** Adopt the templates' **OCDS paths** and **policy intent**, but target indicators that rely on fields we actually populate from the awards CSV — not the full mPhilGEPS / 1.5 DB surface.

---

## Empirical coverage (5.12M releases)

Cardinal `coverage` on `ocds/csv_2021_2025/compiled_releases.jsonl`:

| OCDS path | Releases with field | Share | Cardinal use |
|-----------|----------------------:|------:|--------------|
| `/tender/tenderPeriod/startDate` | 5,120,088 | 100% | **R003** |
| `/tender/tenderPeriod/endDate` | 5,026,247 | 98.2% | **R003** |
| `/tender/value/amount` | 5,120,088 | 100% | R003 config, **PH-C01** |
| `/tender/procurementMethod` | 5,120,088 | 100% | **R018**, **PH-C01** |
| `/tender/procurementMethodDetails` | 5,120,088 | 100% | R003 per-method thresholds |
| `/bids/details[]/tenderers[]/name` | 2,362,019 | 46.1% | **R018** |
| `/bids/details[]/value/amount` | **0** | 0% | R024, R028, R058 |
| `/awards[]/value/amount` | 2,385,468 | 46.6% | Custom budget checks |
| `/awards[]/suppliers[]/name` | 2,388,032 | 46.7% | **R048** |
| `/tender/items[]/classification/id` | 2,477,960 | 48.4% | **R048** |
| `/contracts[]/period/startDate` | 1,834,728 | 35.8% | Future duration anomalies |

Bidder list fill (canonical `2023.csv`, 100k-row sample): **~24%** of rows have `bidders`; when present, **~97%** list exactly one name — consistent with awards-export bias (winner-focused), not necessarily true single-bidder processes.

---

## Tier 1 — Cardinal indicators (implement first)

### R003 — Short submission period (primary)

**What it detects:** Submission window \((endDate - startDate)\) shorter than threshold (default 15 days).

**Template alignment:** Both workbooks map `tender/tenderPeriod/startDate` and `endDate` from tender notice dates.

**Why it's the best fit:**
- Near-complete coverage on the compiled corpus
- Directly addresses a classic corruption risk (“inadequate notice to bidders”)
- Configurable per `procurementMethodDetails` — important for Philippines RA 9184 modes (Public Bidding vs Shopping vs Negotiated variants)

**Recommended configuration** (`config/cardinal_settings.ini`):

```ini
[R003]
procurement_methods = open|selective|limited
threshold = 15

[R003.procurement_method_details]
Public Bidding = 15
Shopping = 7
"Negotiated Procurement - Small Value Procurement (Sec. 53.9)" = 7
```

Tune thresholds with legal review; Cardinal supports per-label overrides.

**Caveats:**
- ~2% missing `endDate` — exclude or impute in `prepare`
- Grouped releases use mode-merged dates; 5,271 releases still carry `philgeps:metadataConflict` on date fields — filter or down-rank those in analysis

---

### R018 — Single bid received (co-primary)

**What it detects:** Competitive procedure (`procurementMethod` = `open` or `selective`) with only one tenderer.

**Template alignment:** Templates map tenderers to `Vendors` / `M_TenderBiddersList`; compiler emits `/bids/details[]` via the bids extension.

**Why it's worthwhile:**
- ~54% of releases use competitive methods (sampled)
- Where bidder lists exist, single-name lists dominate
- Flags suppression-of-competition risk even without bid prices

**Critical interpretation caveat:**

> **Absence of `bids` ≠ single bid.** ~54% of releases have no bidder list at all. R018 only fires when exactly one tenderer is recorded. Missing lists are a separate transparency problem — see **PH-C02**.

**Recommended configuration:**

```ini
[R018]
procurement_methods = open|selective
```

Consider adding `limited` only after reviewing false-positive rate for small-value procurement.

---

## Tier 2 — Custom Philippines indicators (high value, template-grounded)

These use fields both templates map and our pipeline emits, but are **not** standard Cardinal flags.

### PH-C01 — Non-competitive award above value threshold

**Logic:** Flag when `tender/procurementMethod` ∈ `{direct, limited}` **and** `tender/value/amount` ≥ threshold (e.g. PHP 1M / 10M tiered).

**Template fields:** `tender/procurementMethod`, `tender/procurementMethodDetails`, `tender/value/amount`.

**Rationale:** RA 9184 restricts when direct contracting, shopping, and negotiated modes are permissible. High-value use of non-open methods warrants manual review even when procedurally valid.

**Sample prevalence (200k releases):** ~2.2% direct method with value ≥ PHP 1M.

---

### PH-C02 — Competitive procedure, no bidders disclosed

**Logic:** `procurementMethod` ∈ `{open, selective}` **and** (`bids` absent or empty `details[]`).

**Rationale:** Templates expect vendor/bidder tables to be published. A competitive notice with no disclosed participants is a **transparency** red flag distinct from R018.

**Sample prevalence:** Roughly half of competitive-method releases lack a bidder block — investigate how many are data gaps vs. genuine non-disclosure.

---

### PH-C03 — Award value vs. approved budget (paired releases only)

**Logic:** Where both `tender/value/amount` and `awards[0]/value/amount` exist, flag if `award / budget > 1.05` (or absolute PHP overrun).

**Template fields:** `tender/value/amount`, `awards/value/amount`.

**Rationale:** Both templates explicitly map budget and award amounts; large overruns may indicate change orders, scope creep, or data errors.

**Caveat:** Low flag rate in quick sample (~0.01%) — useful as an anomaly detector, not a high-volume screen. Line-item grouping may absorb per-item noise; test on grouped releases with awards.

---

## Tier 3 — Cardinal indicators (secondary / partial coverage)

### R048 — Heterogeneous supplier

**What it detects:** Supplier wins contracts across an unusually wide variety of UNSPSC classifications.

**Requirements:** `/awards[]/suppliers[]`, `/tender/items[]/classification/id` across many processes per supplier.

**Coverage:** ~48% classification fill — workable for large suppliers, incomplete for long tail.

**Recommendation:** Run after `prepare`; report coverage by supplier tier (e.g. suppliers with ≥10 awarded processes only).

---

## Deferred — not feasible on CSV export alone

| Cardinal ID | Name | Blocker | Template source that would unlock |
|-------------|------|---------|----------------------------------|
| R024 | Price close to winning bid | No bid amounts | mPhilGEPS bid tables; 1.5 bid detail |
| R028 | Identical bid prices | No bid amounts | Same |
| R058 | Heavily discounted bid | No bid amounts | Same |
| R025 | Excessive unsuccessful bids | No win/loss per tenderer history | Bid outcome tables |
| R030 | Late bid won | No bid submission dates | Bid timestamp fields |
| R035 | All except winner disqualified | No per-bid status | Bid evaluation tables |
| R036 | Lowest bid disqualified | No amounts + status | Same |
| R038 | Excessive disqualified bids | No bid status | Same |

When mPhilGEPS 2.0 API or richer exports become available, revisit **R024 / R028 / R058** first — templates already map the underlying columns.

---

## mPhilGEPS WSF sample (`REQ2026-016191`)

**Source:** `references/REQ2026-016191_WSF_Sample Raw Data_mPhilGEPS.csv`  
**Schema:** `schema_mphilgeps_wsf` (72 columns — integrated APP + PR + bid + award)  
**Analyzed rows:** 42,320 (file has ~109k physical lines due to multiline quoted fields)  
**Script:** `scripts/_analyze_wsf_sample.py`

### How WSF differs from the 2021–2025 CSV export

| Dimension | CSV `schema_3` (5.12M releases) | WSF sample (42,320 rows) |
|-----------|-----------------------------------|---------------------------|
| Bidder list | `List of Bidder's` ~24% fill | **No bidder column at all** |
| Planning (APP) | Not in export | **100%** APP item ID + milestone dates |
| ABC / award value | ~100% tender value; awards ~47% | **100%** ABC, contract amount, awardee |
| UNSPSC / UACS | ~48% classification | **100%** UNSPSC; **99.8%** UACS |
| Procurement mode mix | ~54% competitive (sample) | **75%** Small Value Procurement; **9%** Public Bidding |
| `bid_notice_status` | Mostly text labels | **276 rows** have numeric garbage (amounts in status field) |

**Implication:** WSF is **better for value, classification, and planning indicators**; **worse for competition indicators** (R018, PH-C02) because bidder disclosure is absent entirely, not merely sparse.

### Revised priority table (WSF sample)

| Priority | Indicator | Type | WSF feasibility |
|----------|-----------|------|-----------------|
| **1** | **R003** — Short submission period | Cardinal | **Strong** — 87.8% computable dates; must use **per-mode thresholds** (see below) |
| **2** | **PH-WSF-C01** — APP milestone slippage | Custom | **New** — 100% APP planned dates vs actual published/closing/award |
| **3** | **PH-C01** — Non-competitive method above threshold | Custom | **Strong** — 100% mode + ABC; SVP dominates so tune thresholds carefully |
| **4** | **PH-WSF-C02** — Line ABC vs APP total budget gap | Custom | **New** — 17% of rows have ABC &lt; 50% of APP line budget (line vs process grain) |
| **5** | **PH-C03** — Award vs ABC overrun | Custom | **Strong** — both fields 100% populated |
| **6** | **R048** — Heterogeneous supplier | Cardinal | **Better than CSV** — full UNSPSC on every row |
| **—** | **R018** — Single bid received | Cardinal | **Not feasible** — no bidder/tenderer source column |
| **—** | **PH-C02** — Competitive, no bidders | Custom | **Degenerate** — 100% of competitive rows lack bidders by schema design |

### R003 on WSF — mode-specific interpretation required

Raw submission-period stats on the sample:

| Segment | Short-period rate | Notes |
|---------|------------------:|-------|
| All computable rows (&lt;15 days) | **90.9%** | Misleading if applied globally |
| Small Value Procurement (&lt;7 days) | **98.2%** (31,309 / 31,898) | Likely **legal** under RA 9184 SVP rules — not a corruption screen by itself |
| Competitive / Public Bidding (&lt;15 days) | **12.4%** (479 / 3,870) | **Actionable** subset for R003 |

**Recommendation:** Do **not** run R003 with a single 15-day threshold on WSF without filtering to `procurementMethodDetails` = Public Bidding (and other open methods). For SVP rows, use Shopping/SVP thresholds (e.g. 7 days) or exclude SVP from timing flags entirely.

### WSF-only custom indicators (template-grounded)

#### PH-WSF-C01 — APP schedule slippage

**Logic:** Compare APP milestone dates to actual notice dates:

- `planning` milestone `Advertisement/Posting of IB/REI` vs `published_date`
- `Submission/Opening of Bids` vs `closing_date`
- `Notice of Award` vs `award_date`

**Coverage:** 100% on all four APP milestones in the sample.

**Rationale:** mPhilGEPS v0.91 template maps these to `planning/milestones` — a capability **absent from flat CSV**. Slippage between APP plan and executed dates is a procurement-integrity signal independent of bidder lists.

#### PH-WSF-C02 — ABC vs APP estimated budget mismatch

**Logic:** Flag when row-level `approved_budget` (ABC) is far below `app_total_estimated_budget` (e.g. ABC &lt; 50% of APP line budget).

**Sample:** 7,195 / 42,320 rows (17.0%) — often reflects **line-item grain** (one PR line vs whole APP item), not necessarily fraud.

**Mitigation:** Apply at **process level** after `compile_ocds.py` grouping (`bid_ref + PE` or `award_ref + PE`), summing ABC across line items before comparing to APP total.

### Data quality guards (WSF-specific)

| Issue | Count / rate | Impact | Mitigation |
|-------|-------------|--------|------------|
| No bidder column | 100% missing | R018, PH-C02 unusable | Do not infer single bid from `awardee` alone |
| `Bid Notice Status` numeric garbage | 276 rows (0.7%) | Wrong `tender_status` | Coerce numeric-only values to null; flag `philgeps:statusParseError` |
| Duplicate `Item/Lot Name` columns | cols 49 & 58 | Second overwrites first in mapper | Fix `schema_mappings.yaml` alias before production WSF ingest |
| SVP dominance (75%) | 31,898 rows | Inflates global R003 rate | Stratify indicators by `procurement_mode` |
| ABC vs APP at row grain | 17% large gap | False positives on PH-WSF-C02 | Group to process before budget comparison |

### Bottom line (WSF vs CSV)

> On the WSF integrated export, **shift from competition indicators (R018) to timing + planning + value indicators**. **R003** remains primary but only after **mode filtering**. Add **PH-WSF-C01 (APP slippage)** and **PH-WSF-C02 (grouped budget gap)** as WSF-specific flags. **R048** improves vs CSV thanks to full UNSPSC. Bid-price collusion indicators remain blocked — WSF still has no bid amounts or bidder tables.

---

## Suggested implementation sequence

1. **Cardinal `coverage` + `prepare`** on `ocds/csv_2021_2025/compiled_releases.jsonl`
   - Default `currency = PHP`, `item_classification_scheme = UNSPSC`
   - Review `issues.csv` for date parsing and party normalization

2. **Run R003 and R018** with PH-tuned `cardinal_settings.ini`

3. **Implement PH-C01 and PH-C02** as a small post-Cardinal script (or Cardinal custom indicators) — highest policy ROI for this export shape

4. **Pilot R048** on suppliers with sufficient award volume; document coverage limits

5. **Publish a short methodology note** distinguishing:
   - “Single disclosed bidder” (R018)
   - “No bidders disclosed” (PH-C02)
   - “Missing data” (coverage gap)

---

## Data quality guards (apply before trusting flags)

| Issue | Impact on indicators | Mitigation |
|-------|---------------------|------------|
| Bidder list only ~24% populated | Under-counts competition; inflates PH-C02 | Treat missing bidders as unknown, not single bid |
| Awards block ~47% populated | Skews value-based flags | Scope value indicators to releases with `awards[]` |
| `philgeps:metadataConflict` (5,271 releases) | Wrong tender dates/methods | Exclude or tag in output |
| Grouped multi-line-item releases | Correct for process-level R003/R018 | Do not revert to per-row compilation for indicators |
| `list_of_bidders` parsing (semicolon-only) | Mis-counts tenderers when commas used | Monitor parse anomalies; see `philgeps_ocds_plan.md` |

---

## Bottom line

Given the v0.91 templates and the **actual** 2021–2025 CSV → OCDS pipeline:

> **Target R003 (timing) and R018 (single disclosed bidder) as core Cardinal indicators**, supplemented by **PH-C01 (non-competitive high-value)** and **PH-C02 (competitive but no bidders listed)** as Philippines-specific custom flags.

Bid-price collusion indicators (R024, R028, R058) should wait until bid-level amounts exist in the source — the templates anticipate them, but the flat export does not provide them.

---

## References

- [Cardinal indicators index](https://cardinal.readthedocs.io/en/latest/cli/indicators/)
- [R003 — Short submission period](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/003.html)
- [R018 — Single bid received](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/018.html)
- [R048 — Heterogeneous supplier](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/048.html)
- [RISK_INDICATOR_MASTER_REFERENCE.md](RISK_INDICATOR_MASTER_REFERENCE.md) — indicator dictionary and OCDS path requirements
