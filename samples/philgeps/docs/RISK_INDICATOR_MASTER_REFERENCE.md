# Risk indicator master reference — Cardinal, OCDS mappings & PhilGEPS sources

**Purpose:** Master checklist for procurement risk indicators — what each one needs in OCDS, how PhilGEPS fields map to those paths, and whether the indicator is feasible on each data source.

**Last updated:** June 23, 2026  
**Cardinal version:** 0.0.8 ([docs](https://cardinal.readthedocs.io/en/latest/cli/indicators/))  
**OCDS target:** 1.1 compiled releases (line-delimited JSON)  
**PhilGEPS mapping spec:** `config/canonical_to_ocds.yaml` in the parent analysis repo (if used with a compile pipeline)

**Related docs:**
- [docs/RISK_INDICATOR_RECOMMENDATIONS.md](RISK_INDICATOR_RECOMMENDATIONS.md) — PhilGEPS-specific prioritization and coverage stats
- PS-DBM v0.91 OCDS field-level mapping templates (mPhilGEPS 2.0 & PhilGEPS 1.5)

---

## How to use this document

| Column / section | Meaning |
|------------------|---------|
| **Scope** | What Cardinal groups the result under: `OCID` (process), `Buyer`, `ProcuringEntity`, or `Tenderer` |
| **Required OCDS paths** | Fields Cardinal (or a custom script) reads at runtime |
| **Canonical field** | PhilGEPS universal schema field → see `config/canonical_to_ocds.yaml` |
| **mPhilGEPS 2.0 source** | Table/column from v0.91 template (integrated system) |
| **PhilGEPS 1.5 source** | Table/column from v0.91 template (legacy) |
| **CSV `schema_3`** | 2021–2025 flat export feasibility |
| **WSF sample** | Integrated APP+PR+bid+award export (`schema_mphilgeps_wsf`) |

**Legend:** ✅ feasible · ⚠️ partial / needs tuning · ❌ blocked on current export · 🔧 custom (not in Cardinal)

---

## Cardinal workflow prerequisites

Before running any indicator, data must pass through Cardinal's pipeline:

```
compiled_releases.jsonl  →  coverage  →  prepare  →  indicators
```

### Required OCDS extensions

| Extension | Why |
|-----------|-----|
| [ocds_bid_extension](https://github.com/open-contracting-extensions/ocds_bid_extension) | `/bids/details[]` for competition & collusion indicators |
| [ocds_lots_extension](https://github.com/open-contracting-extensions/ocds_lots_extension) | Optional; multi-lot processes |

### `prepare` settings that affect mappings

From `config/cardinal_settings.ini` (draft):

| Setting | Value | Maps / normalizes |
|---------|-------|-------------------|
| `currency` | `PHP` | All `/value/currency` when missing in source |
| `item_classification_scheme` | `UNSPSC` | `/tender/items[]/classification/scheme`, `/awards[]/items[]/classification/scheme` |
| `bid_status` | `valid` | Default `/bids/details[]/status` when unknown |
| `award_status` | `active` | Default `/awards[]/status` |
| `party_roles` | `true` | Creates `/parties[]` from buyer, procuring entity, suppliers, tenderers |

Codelist mappings (PhilGEPS label → OCDS):

| PhilGEPS field | OCDS path | Example mapping |
|----------------|-----------|-----------------|
| `procurement_mode` | `/tender/procurementMethod` | Public Bidding → `open`; SVP/Shopping → `limited`; Direct → `direct` |
| `procurement_mode` | `/tender/procurementMethodDetails` | Raw label preserved |
| `award_notice_status` | `/awards[]/status` | Posted/Updated/Awarded → `active`; Closed → `cancelled` |
| `bid_notice_status` | `/tender/status` | Map to `active` / `cancelled` / `complete` |

### Global exclusions (all indicators)

Cardinal skips a process when:

- `/ocid` is not a string
- `/tender/status` = `cancelled`
- Organization references lack stable `/id`
- Monetary values use a currency other than the configured main currency

Optional settings file exclusions:

```ini
currency = PHP
no_price_comparison_procurement_methods = Shopping|Small Value Procurement
[exclusions]
procurement_method_details = <pipe-separated labels to skip>
```

---

## Quick lookup — all indicators

### Cardinal red flags (built-in)

| ID | Name | Scope | CSV `schema_3` | WSF | Full DB (templates) |
|----|------|-------|----------------|-----|---------------------|
| **R003** | Short submission period | OCID | ✅ ~98% dates | ✅ (filter by mode) | ✅ |
| **R018** | Single bid received | OCID | ⚠️ ~46% bidders | ❌ no bidder column | ✅ |
| **R024** | Price close to winning bid | OCID, Tenderer | ❌ 0% bid amounts | ❌ | ✅ bid price tables |
| **R025** | Excessive unsuccessful bids | Tenderer | ❌ needs win/loss history | ❌ | ✅ |
| **R028** | Identical bid prices | OCID, Tenderer | ❌ 0% bid amounts | ❌ | ✅ |
| **R030** | Late bid won | OCID, Tenderer | ❌ no bid dates | ❌ | ✅ bid timestamps |
| **R035** | All except winner disqualified | OCID, Tenderer | ❌ no bid status | ❌ | ✅ evaluation tables |
| **R036** | Lowest bid disqualified | OCID | ❌ amounts + status | ❌ | ✅ |
| **R038** | Excessive disqualified bids | Buyer, ProcuringEntity, Tenderer | ❌ no bid status | ❌ | ✅ |
| **R048** | Heterogeneous supplier | Tenderer | ⚠️ ~48% UNSPSC | ✅ 100% UNSPSC | ✅ |
| **R058** | Heavily discounted bid | OCID, Tenderer | ❌ 0% bid amounts | ❌ | ✅ |

### Custom Philippines indicators (not in Cardinal)

| ID | Name | Scope | CSV `schema_3` | WSF |
|----|------|-------|----------------|-----|
| **PH-C01** | Non-competitive method above value threshold | OCID | ✅ | ✅ |
| **PH-C02** | Competitive procedure, no bidders disclosed | OCID | ⚠️ | ❌ degenerate |
| **PH-C03** | Award value vs approved budget overrun | OCID | ⚠️ ~47% awards | ✅ |
| **PH-WSF-C01** | APP milestone slippage | OCID | ❌ no planning | ✅ |
| **PH-WSF-C02** | ABC vs APP line budget gap | OCID | ❌ | ✅ (group first) |

### Dashboard & analytics metrics (non-Cardinal)

These come from OCP dashboard recommendations (see Open Contracting Partnership red-flags guidance) and do not require Cardinal — but each still needs specific OCDS paths or extensions.

| Metric area | Example metrics | Primary OCDS paths needed |
|-------------|-----------------|---------------------------|
| Overview | Value over time, tender/award counts | `/tender/value`, `/awards[]/value`, `/date` |
| Competition | Avg bidders, single-bid rate, method mix | `/bids/details[]`, `/tender/procurementMethod` |
| Lifecycle | Plan → tender → award funnel | `/planning/budget`, `/tender`, `/awards[]`, `/contracts[]` |
| Integrity (manual) | Threshold gaming, repeat winners, amendments | `/tender/value`, `/awards[]/suppliers`, `/contracts[]/amendments` |
| Data quality | Missing fields, broken links, validation errors | All paths + `/documents[]/url` |
| Supplier profile | Concentration, categories won | `/awards[]/suppliers`, `/awards[]/items[]/classification` |
| Geographic | Spend by region | `/tender/items[]/deliveryAddresses` or PhilGEPS `ext/peRegion` |

---

## Cardinal indicators — detail

### R003 — Short submission period

| | |
|---|---|
| **Detects** | Submission window shorter than threshold (default 15 days) |
| **Scope** | `OCID` |
| **Formula** | `(endDate − startDate)` in whole days &lt; threshold |
| **Cardinal docs** | [R003](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/003.html) |

**Required OCDS paths**

| OCDS path | Required | Cardinal `prepare` default |
|-----------|----------|---------------------------|
| `/ocid` | Yes | — |
| `/tender/tenderPeriod/startDate` | Yes | — |
| `/tender/tenderPeriod/endDate` | Yes | — |
| `/tender/procurementMethod` | Optional filter | — |
| `/tender/procurementMethodDetails` | Optional per-mode thresholds | — |
| `/tender/status` | Exclusion if `cancelled` | — |

**PhilGEPS mappings**

| OCDS path | Canonical field | mPhilGEPS 2.0 | PhilGEPS 1.5 | CSV column |
|-----------|-----------------|---------------|--------------|------------|
| `tenderPeriod/startDate` | `published_date` | `Tenders.Tender Start Datetime` | `M_Tender` notice date | `published_date` |
| `tenderPeriod/endDate` | `closing_date` | `Tenders.Tender End Datetime` | `M_Tender` closing date | `closing_date` |
| `procurementMethod` | `procurement_mode` | `Tenders.Procurement Mode` | `M_Tender` procedure | `procurement_mode` |
| `procurementMethodDetails` | `procurement_mode` (raw) | Same | Same | `procurement_mode` |

**Config example (Philippines)**

```ini
[R003]
procurement_methods = open|selective|limited
threshold = 15

[R003.procurement_method_details]
Public Bidding = 15
Shopping = 7
"Negotiated Procurement - Small Value Procurement (Sec. 53.9)" = 7
```

**Notes:** On WSF, ~91% of rows are &lt;15 days globally — stratify by mode; SVP rows are often legally short.

---

### R018 — Single bid received

| | |
|---|---|
| **Detects** | Competitive procedure with exactly one tenderer |
| **Scope** | `OCID` |
| **Formula** | `numberOfTenderers = 1` AND `procurementMethod` ∈ `{open, selective}` |
| **Cardinal docs** | [R018](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/018.html) |

**Required OCDS paths**

| OCDS path | Required | Notes |
|-----------|----------|-------|
| `/ocid` | Yes | |
| `/tender/procurementMethod` | Yes | Must map to OCDS codelist |
| `/bids/details[]/tenderers[]/id` | Yes | `prepare` can derive from names |
| `/bids/details[]/tenderers[]/name` | Yes | At least one per bid |
| `/tender/numberOfTenderers` | Alternative | Cardinal counts from bids if absent |

**PhilGEPS mappings**

| OCDS path | Canonical field | mPhilGEPS 2.0 | PhilGEPS 1.5 | CSV column |
|-----------|-----------------|---------------|--------------|------------|
| `bids/details[]/tenderers/name` | `bidders` (parsed) | `Vendors.Name` | `M_TenderBiddersList` | `list_of_bidders` |
| `procurementMethod` | `procurement_mode` | `Tenders.Procurement Mode` | `M_Tender` | `procurement_mode` |
| `awards[]/suppliers[]/name` | `awardee_organization_name` | `Awards` awardee | `M_Award` | `awardee` (winner link only) |

**Bid extension transform:** Parse `list_of_bidders` on `;` → one `/bids/details[]` entry per name. Default `status = valid`.

**Critical caveat:** Missing `bids` ≠ single bid. ~54% of CSV releases have no bidder block — use **PH-C02** for that pattern.

---

### R024 — Price close to winning bid

| | |
|---|---|
| **Detects** | Winning bid price suspiciously close to second-lowest valid bid (collusion signal) |
| **Scope** | `OCID`, `Tenderer` |
| **Formula** | `(secondLowest − winner) / winner` is low outlier (IQR fence) |
| **Cardinal docs** | [R024](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/024.html) |

**Required OCDS paths**

| OCDS path | Required | Notes |
|-----------|----------|-------|
| `/bids/details[]/status` | Yes | `valid` vs `disqualified` |
| `/bids/details[]/value/amount` | Yes | **≥2 valid bids with amounts** |
| `/bids/details[]/value/currency` | Yes | Must match main currency |
| `/bids/details[]/tenderers[]/id` | Yes | One tenderer per bid |
| `/awards[]/status` | Yes | `active` award |
| `/awards[]/suppliers[]/id` | Yes | Links winner to bid |

**PhilGEPS mappings**

| OCDS path | Canonical field | mPhilGEPS 2.0 | PhilGEPS 1.5 | CSV `schema_3` |
|-----------|-----------------|---------------|--------------|----------------|
| `bids/details[]/value/amount` | bid line price | Bid / vendor price tables | Bid detail tables | **Not exported** |
| Winner amount only | `contract_amount` | `Awards.Contract Amount` | `M_Award` | Winner only — **insufficient** |

**Blocker on CSV:** `/bids/details[]/value/amount` = 0% coverage on 5.12M release corpus.

---

### R025 — Excessive unsuccessful bids

| | |
|---|---|
| **Detects** | Top tenderer wins unusually few of their submitted bids (bid-rigging decoy bids) |
| **Scope** | `Tenderer` |
| **Formula** | `wins / valid_bids` ratio is low outlier among high-volume bidders |
| **Cardinal docs** | [R025](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/025.html) |

**Required OCDS paths**

| OCDS path | Required | Notes |
|-----------|----------|-------|
| `/bids/details[]/status` | Yes | `valid` bids counted |
| `/bids/details[]/tenderers[]/id` | Yes | Stable IDs across processes |
| `/awards[]/status` | Yes | `active` |
| `/awards[]/suppliers[]/id` | Yes | Win detection |

**PhilGEPS mappings**

| Source | Table / field |
|--------|---------------|
| mPhilGEPS 2.0 | `Vendors` + bid outcome / evaluation tables |
| PhilGEPS 1.5 | `M_TenderBiddersList` + award linkage |
| CSV | Names only; no per-process win/loss for non-winners |

**Blocker on CSV:** Cannot distinguish losing bids from undisclosed participants.

---

### R028 — Identical bid prices

| | |
|---|---|
| **Detects** | Different tenderers submitted the same bid amount |
| **Scope** | `OCID`, `Tenderer` |
| **Cardinal docs** | [R028](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/028.html) |

**Required OCDS paths**

| OCDS path | Required |
|-----------|----------|
| `/bids/details[]/value/amount` | Yes (≥2 bids, same amount, different tenderers) |
| `/bids/details[]/tenderers[]/id` | Yes |
| `/bids/details[]/status` | Yes |

**PhilGEPS source:** Bid detail / vendor price tables (both templates). **Not in CSV export.**

---

### R030 — Late bid won

| | |
|---|---|
| **Detects** | Winning bid received after submission deadline |
| **Scope** | `OCID`, `Tenderer` |
| **Cardinal docs** | [R030](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/030.html) |

**Required OCDS paths**

| OCDS path | Required |
|-----------|----------|
| `/bids/details[]/date` | Yes — bid received timestamp |
| `/bids/details[]/status` | Yes — `valid` |
| `/tender/tenderPeriod/endDate` | Yes — deadline |
| `/awards[]/suppliers[]/id` | Yes — winner link |

**PhilGEPS mappings**

| OCDS path | mPhilGEPS 2.0 | PhilGEPS 1.5 | CSV |
|-----------|---------------|--------------|-----|
| `bids/details[]/date` | Bid submission timestamp fields | Bid timestamp tables | **Not in source** |

---

### R035 — All except winning bid disqualified

| | |
|---|---|
| **Detects** | Only winner's bids valid; all other tenderers disqualified |
| **Scope** | `OCID`, `Tenderer` |
| **Cardinal docs** | [R035](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/035.html) |

**Required OCDS paths**

| OCDS path | Required | Values |
|-----------|----------|--------|
| `/bids/details[]/status` | Yes | `valid`, `disqualified` |
| `/bids/details[]/tenderers[]/id` | Yes | |
| `/awards[]/status` | Yes | `active` |
| `/awards[]/suppliers[]/id` | Yes | Must match valid bid tenderer |

**PhilGEPS source:** Bid evaluation / qualification status tables. CSV defaults all bids to `valid` — **indicator will not fire meaningfully.**

---

### R036 — Lowest bid disqualified

| | |
|---|---|
| **Detects** | Lowest priced bid disqualified while a higher bid wins (price-only award) |
| **Scope** | `OCID` |
| **Cardinal docs** | [R036](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/036.html) |

**Required OCDS paths**

| OCDS path | Required |
|-----------|----------|
| `/bids/details[]/status` | Yes |
| `/bids/details[]/value/amount` | Yes — all submitted bids |
| `/awards[]/status` | Yes — `active` |

**PhilGEPS source:** Bid amounts + evaluation status. **Blocked on CSV.**

---

### R038 — Excessive disqualified bids

| | |
|---|---|
| **Detects** | Buyer, procuring entity, or tenderer disqualifies bids at unusually high rate |
| **Scope** | `Buyer`, `ProcuringEntity`, `Tenderer` |
| **Cardinal docs** | [R038](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/038.html) |

**Required OCDS paths**

| OCDS path | Required | Notes |
|-----------|----------|-------|
| `/buyer/id` | Yes (buyer scope) | Stable across processes |
| `/tender/procuringEntity/id` | Yes (PE scope) | |
| `/bids/details[]/status` | Yes | `disqualified` vs submitted |
| `/bids/details[]/tenderers[]/id` | Yes (tenderer scope) | |

**PhilGEPS mappings**

| OCDS path | Canonical | mPhilGEPS 2.0 | CSV |
|-----------|-----------|---------------|-----|
| `buyer/id` | `pe_uacs_code` or PE slug | Agency UACS | Often name-only slug |
| `procuringEntity/id` | Same as buyer | Same | Same |

**Blocker on CSV:** No real `disqualified` status in source.

---

### R048 — Heterogeneous supplier

| | |
|---|---|
| **Detects** | Supplier wins across unusually many product categories (UNSPSC segment level) |
| **Scope** | `Tenderer` |
| **Formula** | Distinct first-level classification codes across all wins ≥ upper IQR fence |
| **Cardinal docs** | [R048](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/048.html) |

**Required OCDS paths**

| OCDS path | Required | Notes |
|-----------|----------|-------|
| `/awards[]/status` | Yes | `active` |
| `/awards[]/suppliers[]/id` | Yes | Stable supplier ID |
| `/awards[]/items[]/classification/id` | Yes | UNSPSC or CPV numeric code |
| `/awards[]/items[]/classification/scheme` | Yes | `UNSPSC` (via `prepare`) |

**PhilGEPS mappings**

| OCDS path | Canonical field | mPhilGEPS 2.0 | PhilGEPS 1.5 | CSV | WSF |
|-----------|-----------------|---------------|--------------|-----|-----|
| `items/classification/id` | `unspsc_code` | Tender/Award item UNSPSC | Item classification | `unspsc` | 100% |
| `suppliers/id` | `awardee_org_id` | Vendor registry ID | Awardee ID | Often name hash | `awardee_org_id` |
| `suppliers/name` | `awardee_organization_name` | Awardee name | `M_Award` | `awardee` | ✅ |

**Config**

```ini
[R048]
digits = 2
minimum_contracting_processes = 20
threshold = 10
```

**Notes:** Run on suppliers with ≥10–20 awards. CSV has ~48% classification fill; WSF is full.

---

### R058 — Heavily discounted bid

| | |
|---|---|
| **Detects** | Winning bid far below second-lowest (lemons / unrealistic pricing) |
| **Scope** | `OCID`, `Tenderer` |
| **Cardinal docs** | [R058](https://cardinal.readthedocs.io/en/latest/cli/indicators/R/058.html) |

**Required OCDS paths:** Same as **R024** (≥2 valid bid amounts, active award, winner = lowest bid).

**PhilGEPS source:** Bid price tables. **Blocked on CSV** (same blocker as R024).

---

## Custom Philippines indicators

These are **not** implemented in Cardinal 0.0.8. Implement as post-Cardinal scripts or future custom indicators.

### PH-C01 — Non-competitive method above value threshold

| | |
|---|---|
| **Logic** | `procurementMethod` ∈ `{direct, limited}` AND `tender/value/amount` ≥ threshold |
| **Scope** | `OCID` |
| **Policy context** | RA 9184 — restricted use of non-open methods |

**Required OCDS paths**

| OCDS path | Canonical field | CSV column |
|-----------|-----------------|------------|
| `/tender/procurementMethod` | `procurement_mode` | `procurement_mode` |
| `/tender/procurementMethodDetails` | `procurement_mode` (raw) | `procurement_mode` |
| `/tender/value/amount` | `approved_budget` | `approved_budget` |
| `/tender/value/currency` | `_default_currency` | (default PHP) |

**Suggested thresholds:** PHP 1M / 10M tiers (legal review required).

---

### PH-C02 — Competitive procedure, no bidders disclosed

| | |
|---|---|
| **Logic** | `procurementMethod` ∈ `{open, selective}` AND (`bids` absent OR empty `details[]`) |
| **Scope** | `OCID` |
| **Distinct from R018** | Transparency gap, not proven single bid |

**Required OCDS paths**

| OCDS path | Canonical field | CSV |
|-----------|-----------------|-----|
| `/tender/procurementMethod` | `procurement_mode` | ✅ |
| `/bids/details[]` | `bidders` | ⚠️ ~54% missing |

**WSF:** Not applicable — schema has no bidder column at all.

---

### PH-C03 — Award value vs approved budget overrun

| | |
|---|---|
| **Logic** | `awards[0]/value/amount / tender/value/amount > 1.05` (or absolute PHP cap) |
| **Scope** | `OCID` |

**Required OCDS paths**

| OCDS path | Canonical field | CSV column |
|-----------|-----------------|------------|
| `/tender/value/amount` | `approved_budget` | `approved_budget` |
| `/awards[]/value/amount` | `contract_amount` | `contract_amount` |
| `/awards[]/status` | `award_notice_status` | `award_status` |

**Caveat:** Awards block ~47% populated on CSV corpus. Group line items to process level before comparing.

---

### PH-WSF-C01 — APP milestone slippage

| | |
|---|---|
| **Logic** | Compare `planning/milestones[]/dueDate` to actual notice dates |
| **Scope** | `OCID` |
| **Source** | WSF / mPhilGEPS integrated export only |

**Required OCDS paths**

| OCDS path | Canonical field | WSF source |
|-----------|-----------------|------------|
| `/planning/milestones[]/type` | APP milestone labels | APP milestone columns |
| `/planning/milestones[]/dueDate` | APP planned dates | APP schedule fields |
| `/tender/tenderPeriod/startDate` | `published_date` | Actual posting |
| `/tender/tenderPeriod/endDate` | `closing_date` | Actual closing |
| `/awards[]/date` | `award_date` | Actual award |

**mPhilGEPS template:** `app_line_items` → `planning/budget`, `planning/milestones`.

**Not available on CSV `schema_3`** (no planning block).

---

### PH-WSF-C02 — ABC vs APP line budget gap

| | |
|---|---|
| **Logic** | Row-level `approved_budget` ≪ `app_total_estimated_budget` (e.g. &lt;50%) |
| **Scope** | `OCID` (after grouping) |

**Required OCDS paths**

| OCDS path | Canonical field |
|-----------|-----------------|
| `/tender/value/amount` | `approved_budget` (ABC) |
| `/planning/budget/amount/amount` | `app_total_estimated_budget` |

**Mitigation:** Sum ABC across line items at process grain (`bid_ref + PE` or `award_ref + PE`) before flagging.

---

## OCDS path → PhilGEPS mapping cheat sheet

Consolidated reference for all indicators. Source of truth: `config/canonical_to_ocds.yaml`.

| OCDS path | Canonical field | CSV `schema_3` | WSF | mPhilGEPS 2.0 table |
|-----------|-----------------|----------------|-----|---------------------|
| `/ocid` | generated from `award_reference_no` + `procuring_entity` | derived | derived | derived |
| `/buyer/id` | `pe_uacs_code` | partial | ✅ | Agency UACS |
| `/buyer/name` | `procuring_entity` | ✅ | ✅ | Procuring entity |
| `/tender/title` | `notice_title` | ✅ | ✅ | Tender notice |
| `/tender/procurementMethod` | `procurement_mode` | ✅ | ✅ | `Tenders.Procurement Mode` |
| `/tender/procurementMethodDetails` | `procurement_mode` | ✅ | ✅ | Same (raw label) |
| `/tender/value/amount` | `approved_budget` | ✅ | ✅ | `Tenders Items.Estimated Budget Cost` |
| `/tender/tenderPeriod/startDate` | `published_date` | ✅ | ✅ | Tender start datetime |
| `/tender/tenderPeriod/endDate` | `closing_date` | ⚠️ ~2% null | ⚠️ | Tender end datetime |
| `/tender/items[]/classification/id` | `unspsc_code` | ⚠️ ~48% | ✅ | Item UNSPSC |
| `/tender/status` | `bid_notice_status` | ✅ | ✅ | Notice status |
| `/bids/details[]/tenderers[]/name` | `bidders` | ⚠️ ~24% rows | ❌ | `Vendors.Name` |
| `/bids/details[]/value/amount` | — | ❌ | ❌ | Bid price tables |
| `/bids/details[]/date` | — | ❌ | ❌ | Bid submission timestamp |
| `/bids/details[]/status` | `_default_bid_status` | default `valid` | — | Evaluation status |
| `/awards[]/id` | `award_reference_no` | ⚠️ | ✅ | `Awards` ref |
| `/awards[]/value/amount` | `contract_amount` | ⚠️ ~47% | ✅ | `Awards.Contract Amount` |
| `/awards[]/suppliers[]/name` | `awardee_organization_name` | ⚠️ | ✅ | Awardee |
| `/awards[]/suppliers[]/id` | `awardee_org_id` | partial | ✅ | Vendor ID |
| `/awards[]/status` | `award_notice_status` | ✅ | ✅ | Award status |
| `/awards[]/date` | `award_date` | ⚠️ | ✅ | Award date |
| `/contracts[]/period/startDate` | `contract_effectivity_date` | partial | ✅ | Contract start |
| `/contracts[]/period/endDate` | `contract_end_date` | partial | ✅ | Contract end |
| `/planning/budget/amount/amount` | `app_total_estimated_budget` | ❌ | ✅ | `app_line_items` |
| `/planning/milestones[]` | APP milestone fields | ❌ | ✅ | APP schedule |

---

## Data source capability matrix

What each export shape unlocks:

| Capability | CSV `schema_3` (5.12M) | WSF integrated | mPhilGEPS 2.0 / 1.5 DB |
|------------|------------------------|----------------|------------------------|
| Timing flags (R003) | ✅ | ✅ (mode-filtered) | ✅ |
| Competition flags (R018, PH-C02) | ⚠️ partial | ❌ / degenerate | ✅ |
| Collusion price flags (R024, R028, R058) | ❌ | ❌ | ✅ |
| Disqualification flags (R035–R038) | ❌ | ❌ | ✅ |
| Supplier breadth (R048) | ⚠️ | ✅ | ✅ |
| Value / method policy (PH-C01) | ✅ | ✅ | ✅ |
| Budget overrun (PH-C03) | ⚠️ | ✅ | ✅ |
| Planning slippage (PH-WSF-C01) | ❌ | ✅ | ✅ |
| APP vs ABC gap (PH-WSF-C02) | ❌ | ✅ | ✅ |

---

## Implementation checklist

Use this when onboarding a new data source or mapping template revision.

### 1. Compile to OCDS

- [ ] Group flat rows to process level (`award_reference_no` + `procuring_entity`)
- [ ] Emit `ocds_bid_extension` for any bidder data
- [ ] Map `procurement_mode` → OCDS `procurementMethod` codelist
- [ ] Default `currency = PHP`, `classification.scheme = UNSPSC`
- [ ] Create stable `/parties[]/id` for buyers, suppliers, tenderers

### 2. Cardinal `coverage`

```bash
ocdscardinal coverage compiled_releases.jsonl > coverage.json
```

Check paths needed for your target indicators (see tables above).

### 3. Cardinal `prepare`

```bash
ocdscardinal prepare --settings config/cardinal_settings.ini compiled_releases.jsonl > prepared.jsonl
```

Review `issues.csv` for date parsing, party normalization, codelist mismatches.

### 4. Cardinal `indicators`

```bash
ocdscardinal indicators --settings config/cardinal_settings.ini prepared.jsonl > red_flags.json
```

Enable only sections in `cardinal_settings.ini` for indicators with sufficient coverage.

### 5. Custom indicators

Run PH-C* scripts on `prepared.jsonl` or `compiled_releases.jsonl` after Cardinal pass.

### 6. Document limitations

For each published flag, record:
- Data coverage % for required fields
- Known false-positive patterns (SVP timing, row-grain budget gaps)
- Distinction: missing data vs. suspicious value

---

## Suggested priority by data source

### CSV `schema_3` (current 5.12M corpus)

1. **R003** — timing
2. **R018** — single disclosed bidder
3. **PH-C01** — non-competitive high-value
4. **PH-C02** — competitive, no bidders listed
5. **R048** — heterogeneous supplier (pilot, coverage limits)
6. **PH-C03** — award vs budget (low volume, high specificity)

**Defer:** R024, R025, R028, R030, R035, R036, R038, R058

### WSF integrated export

1. **R003** (Public Bidding / open methods only)
2. **PH-WSF-C01** — APP slippage
3. **PH-C01** — non-competitive high-value
4. **PH-WSF-C02** — grouped ABC vs APP gap
5. **PH-C03** — award vs ABC
6. **R048** — heterogeneous supplier

**Skip:** R018, PH-C02 (no bidder source)

### Full mPhilGEPS / 1.5 database (per v0.91 templates)

All Cardinal indicators become viable once bid amounts, bid dates, and evaluation status are mapped to `/bids/details[]`.

**First collusion indicators to enable:** R024, R028, R058 → then R035, R036, R038 → then R025, R030.

---

## References

| Resource | URL |
|----------|-----|
| Cardinal indicators index | https://cardinal.readthedocs.io/en/latest/cli/indicators/ |
| Cardinal prepare | https://cardinal.readthedocs.io/en/latest/cli/prepare.html |
| Cardinal coverage | https://cardinal.readthedocs.io/en/latest/cli/coverage.html |
| OCP red flags guide (2024) | https://www.open-contracting.org/resources/red-flags-in-public-procurement-a-guide-to-using-data-to-detect-and-mitigate-risks/ |
| OCDS 1.1.5 | https://standard.open-contracting.org/latest/en/ |
| OCDS bid extension | https://github.com/open-contracting-extensions/ocds_bid_extension |
| Prioritization analysis | [RISK_INDICATOR_RECOMMENDATIONS.md](RISK_INDICATOR_RECOMMENDATIONS.md) |
