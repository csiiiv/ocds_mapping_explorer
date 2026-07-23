# OCP Red Flags → OCDS mapping (public)

Reference catalogue derived from the Open Contracting Partnership **NEW Red Flags to OCDS mapping** public workbook.

**Sources (in this folder):**

- `NEW Red Flags to OCDS mapping #Public - Red flags indicators.csv` — indicator definitions
- `NEW Red Flags to OCDS mapping #Public - Metadata.csv` — column glossary

**App pack:** [`public/indicator_packs/ocp-red-flags.json`](../public/indicator_packs/ocp-red-flags.json) (73 indicators) — enable under **Risk Indicators** (catalog id `ocp-red-flags`).

Overlapping ids with the Cardinal pack (`R003`, `R018`, …) keep the **Cardinal** definition when both packs are enabled; this catalogue still documents the full OCP methodology set.

---

## Column glossary

| Variable | Description |
|----------|-------------|
| `R_id` | Internal OCP identifier for the red flags indicators |
| `Red flag` | Name of the red flag |
| `Definition` | A definition of the indicator |
| `Stage` | Stage of the process where the red flag can be detected: planning, tender, award or contract implementation. |
| `Type of red flag` | We classify the red flags according to different categories based on the type of corruption risk or the most relevant topic. In the real world, one indicator may be associated with multiple forms of corruption and bad practices. For simplicity, our methodology assigns each indicator to one category only: Low transparency: indicators that show low transparency of the procurement process, which can increase the risk of corruption and opacity. Collusion risks: Collusive tendering occurs when businesses that would otherwise be expected to compete, secretly conspire to raise prices or lower the quality of goods or services for purchasers who wish to acquire products or services through a bidding process. (OECD) Bid rigging: The indicators in this category relate to schemes performed by corrupt officials, colluding firms or officials and firms acting together, to limit competition, avoid controls, rig the process or favor a supplier and exclude legitimate bidders. Fraud: Indicators that could signal a deliberate deception intended to influence any stage of the process (e.g. providing false information). Low competition: This category has indicators that signal low competition, which could be a result of other risks in the process. For instance, a single bid could be the ideal corrupt outcome. Note: In practical implementations, you could re-classify the indicators in other categories that make more sense for your context. |
| `Why is this a red flag?` | An explanation of why the indicator can be considered a procurement red flag |
| `Required data fields` | The data fields needed to calculate the indicator |
| `OCDS fields` | The corresponding data field names in OCDS. |
| `Methodology` | A description of the methodology and calculation method of the indicators |
| `Unit of analysis` | This indicates if the red flag can be calculated by contracting process, bidder, or buyer or procuring entity |
| `Source` | Academic evidence on the use of the indicator |

---

## Summary

**73** indicators (`R001`–`R073`).

### By stage

| Stage | Count |
|-------|------:|
| Award | 21 |
| Contract implementation | 13 |
| Planning | 1 |
| Tender | 38 |

### By type of red flag

| Type | Count |
|------|------:|
| Bid rigging | 31 |
| Collusion risks | 19 |
| Fraud | 12 |
| Low competition | 5 |
| Low transparency | 6 |

---

## Index

| Id | Red flag | Stage | Type | Unit of analysis |
|----|----------|-------|------|------------------|
| [R001](#r001) | Planning documents not available | Planning | Low transparency | Contracting process, Buyer |
| [R002](#r002) | Manipulation of procurement thresholds | Tender | Bid rigging | Buyer |
| [R003](#r003) | The submission period is too short | Tender | Bid rigging | Contracting process |
| [R004](#r004) | Failure to adequately advertise the request for bids | Tender | Low transparency | Contracting process |
| [R005](#r005) | Key tender information and documents are not available | Tender | Low transparency | Contracting process |
| [R006](#r006) | Unreasonable prequalification requirements | Tender | Bid rigging | Contracting process |
| [R007](#r007) | Unreasonable technical specifications | Tender | Bid rigging | Contracting process |
| [R008](#r008) | Unreasonable participation fees | Tender | Bid rigging | Contracting process |
| [R009](#r009) | Buyer increases the cost of the bidding documents | Tender | Bid rigging | Contracting process |
| [R010](#r010) | Unjustified use of non competitive procedure | Tender | Bid rigging | Contracting process |
| [R011](#r011) | Splitting purchases to avoid procurement thresholds | Tender | Bid rigging | Contracting process, Buyer |
| [R012](#r012) | Direct awards in contravention of the provisions of the procurement plan | Tender | Bid rigging | Contracting process |
| [R013](#r013) | High use of non competitive methods | Tender | Low transparency | Buyer |
| [R014](#r014) | Short time between tender advertising and bid opening | Tender | Bid rigging | Contracting process |
| [R015](#r015) | Long time between bid opening and bid evaluation | Tender | Bid rigging | Contracting process |
| [R016](#r016) | Tender value is higher or lower than average for this item category | Tender | Bid rigging | Contracting process |
| [R017](#r017) | Unreasonably low or high line item | Tender | Collusion risks | Contracting process |
| [R018](#r018) | Single bid received | Tender | Low competition | Contracting process |
| [R019](#r019) | Low number of bidders for item category | Tender | Low competition | Contracting process |
| [R020](#r020) | Tender has a complaint | Tender | Bid rigging | Contracting process, Bidder |
| [R021](#r021) | High use of discretionary evaluation criteria | Tender | Bid rigging | Contracting process, Buyer |
| [R022](#r022) | Wide disparity in bid prices | Tender | Collusion risks | Contracting process |
| [R023](#r023) | Fixed multiple bid prices | Tender | Collusion risks | Bidder |
| [R024](#r024) | Price close to winning bid | Award | Collusion risks | Contracting process, Bidder |
| [R025](#r025) | Excessive unsuccessful bids | Award | Collusion risks | Bidder |
| [R026](#r026) | Prevalence of consortia | Award | Collusion risks | Market |
| [R027](#r027) | Missing bidders | Tender | Collusion risks | Market |
| [R028](#r028) | Identical bid prices | Tender | Collusion risks | Contracting process, Bidder |
| [R029](#r029) | Bid prices deviate from Benford’s Law | Tender | Bid rigging | Market |
| [R030](#r030) | Late bid won | Award | Bid rigging | Contracting process, Bidder |
| [R031](#r031) | Winning bid price very close or higher than estimated price | Award | Bid rigging | Contracting process |
| [R032](#r032) | Bidders share same beneficial owner | Tender | Collusion risks | Contracting process, Bidder |
| [R033](#r033) | Bidders share same major shareholder | Tender | Collusion risks | Contracting process, Bidder |
| [R034](#r034) | Bids submitted in same order | Tender | Collusion risks | Contracting process |
| [R035](#r035) | All except winning bid disqualified | Award | Bid rigging | Contracting process, Bidder |
| [R036](#r036) | Lowest bid disqualified | Tender | Bid rigging | Contracting process |
| [R037](#r037) | Poorly supported disqualifications | Tender | Bid rigging | Contracting process, Bidder |
| [R038](#r038) | Excessive disqualified bids | Tender | Bid rigging | Buyer, Bidder |
| [R039](#r039) | Unanswered bidder questions | Tender | Low transparency | Contracting process |
| [R040](#r040) | High share of buyer's contracts | Award | Low competition | Buyer, Bidder |
| [R041](#r041) | Physical similarities in documents by different bidders | Tender | Collusion risks | Contracting process, Bidder |
| [R042](#r042) | Bidder has abnormal address or phone number | Tender | Fraud | Contracting process, Bidder |
| [R043](#r043) | Bidder has same contact information as project official | Tender | Bid rigging | Contracting process, Bidder |
| [R044](#r044) | Business similarities between bidders | Tender | Collusion risks | Contracting process, Bidder |
| [R045](#r045) | Bidder is not listed in business registries | Tender | Fraud | Contracting process, Bidder |
| [R046](#r046) | Bidder is debarred or on sanctions list | Tender | Fraud | Contracting process, Bidder |
| [R047](#r047) | Supplier is not traceable on the web | Award | Fraud | Contracting process, Bidder |
| [R048](#r048) | Heterogeneous supplier | Award | Fraud | Bidder |
| [R049](#r049) | Direct awards below threshold | Award | Bid rigging | Bidder |
| [R050](#r050) | High market share | Award | Low competition | Buyer, Bidder |
| [R051](#r051) | High market concentration | Award | Low competition | Market |
| [R052](#r052) | Small initial purchase from supplier followed by much larger purchases | Award | Bid rigging | Contracting process, Bidder |
| [R053](#r053) | Co-bidding pairs have same recurrent winner | Award | Collusion risks | Contracting process, Bidder |
| [R054](#r054) | Direct award followed by change orders that exceed the competitive threshold | Award | Bid rigging | Contracting process, Bidder |
| [R055](#r055) | Multiple direct awards above or just below competitive threshold | Award | Bid rigging | Buyer, Bidder |
| [R056](#r056) | Winning bid does not meet the award criteria | Award | Bid rigging | Contracting process |
| [R057](#r057) | Bid rotation | Award | Collusion risks | Bidder, Market |
| [R058](#r058) | Heavily discounted bid | Award | Collusion risks | Contracting process, Bidder |
| [R059](#r059) | Large difference between the award value and final contract amount | Contract implementation | Bid rigging | Contracting process |
| [R060](#r060) | Long time between award date and contract signature date | Contract implementation | Bid rigging | Contracting process, Bidder |
| [R061](#r061) | Decision period extremely short | Award | Bid rigging | Contracting process |
| [R062](#r062) | Decision period extremely long | Award | Bid rigging | Contracting process |
| [R063](#r063) | Contract is not published | Contract implementation | Low transparency | Contracting process |
| [R064](#r064) | Contract has modifications | Contract implementation | Fraud | Contracting process |
| [R065](#r065) | Contract amendments to reduce line items | Contract implementation | Fraud | Contracting process |
| [R066](#r066) | Contract amendments to increase line items | Contract implementation | Fraud | Contracting process |
| [R067](#r067) | Delivery failure | Contract implementation | Fraud | Contracting process |
| [R068](#r068) | Contract transactions exceed contract amount | Contract implementation | Fraud | Contracting process |
| [R069](#r069) | Contract amendments to increase price | Contract implementation | Fraud | Contracting process |
| [R070](#r070) | Losing bidders are hired as subcontractors | Contract implementation | Collusion risks | Contracting process |
| [R071](#r071) | A contractor subcontracts all or most of the work received | Contract implementation | Collusion risks | Contracting process |
| [R072](#r072) | High prevalence of subcontracts | Contract implementation | Collusion risks | Buyer, Market |
| [R073](#r073) | Discrepancies between work completed and contract specifications | Contract implementation | Fraud | Contracting process |

---

## Indicators

### R001

**Planning documents not available**

- **Stage:** Planning
- **Type of red flag:** Low transparency
- **Unit of analysis:** Contracting process, Buyer

#### Definition

Key planning documents are not available in the publication. These may include: procurement plans, market studies, feasibility studies among others. Check the OCDS document type codelist to see the possible documents.

#### Why is this a red flag?

Governments should provide an adequate degree of transparency across the entire cycle of the procurement process to promote fair and equitable treatment of suppliers, and to facilitate oversight. A lack of planning documents could signal poor procurement planning or integrity risks since it does not allow to verify if the planned process responds to a real need.

#### Required data fields

```
Planning documents
```

#### OCDS fields

```
planning/documents/documentType =
plannedProcurementNotice, 'procurementPlan, marketStudies, feasibilityStudy, projectPlan
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/planning/documents[]/documentType` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on OECD’s Principles for Integrity in Public Procurement

---

### R002

**Manipulation of procurement thresholds**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Buyer

#### Definition

A buyer bundles tenders below the competitive threshold.

#### Why is this a red flag?

Non competitive methods increase discretion which can facilitate a corrupt buyer to award a contract to favored bidders.

#### Required data fields

```
Tender values and currency
Tender period start date (or publication date)
Name of the procuring entity or buyer.
Procurement category
```

#### OCDS fields

```
tender/value/amount, tender/value/currency, tender/tenderPeriod/startDate, tender/procurementMethod,
tender/procuringEntity/name OR buyer/name OR tender/procuringEntity/id OR buyer/id,
Optional:
tender/procurementCategory
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/value/amount` | yes |
| `/tender/value/currency` | yes |
| `/tender/tenderPeriod/startDate` | yes |
| `/tender/procurementMethod` | yes |
| `/tender/procuringEntity/name` | yes |
| `/buyer/name` | yes |
| `/tender/procuringEntity/id` | yes |
| `/buyer/id` | yes |
| `/tender/procurementCategory` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on Compliance and strategic contract manipulation around single market regulatory thresholds – the case of Poland, Manipulation of Procurement Contracts: Evidence from the Introduction of Discretionary Thresholds, Bunching Below Thresholds to Manipulate Public Procurement

---

### R003

**The submission period is too short**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

The period to submit bids is shorter than the legal threshold. The submission period starts with contracting documents being available to potential suppliers and ends with the submission deadline for expressions of interest or bids.

#### Why is this a red flag?

A short submission period leaves less time to prepare and submit bids. This makes it harder for non-connected companies to bid and to submit; well-connected firms can use their inside knowledge to win repeatedly. A corrupt buyer can give the predetermined bidder an unfair advantage by privately informing the predetermined bidder of the opportunity in advance, and by giving other bidders less time to prepare competitive bids.

#### Required data fields

```
Tender start and end date
Procurement method used
```

#### OCDS fields

```
tender/procurementMethod
tender/procurementMethodDetails for more detail on the specific methods
tender/tenderPeriod/startDate, tender/tenderPeriod/endDate
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/tender/tenderPeriod/startDate` | yes |
| `/tender/tenderPeriod/endDate` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Shortened time span for bidding process” in Corruption in Public Procurement: Finding the Right Indicators, “Short submission period” in An Objective Corruption Risk Index Using Public Procurement Data, “Short or inadequate notice to bidders” in Guide to Combating Corruption & Fraud in Development Projects, and “Deadline for submitting bids is very short” in Fraud in Public Procurement: A collection of Red Flags and Best Practices.

---

### R004

**Failure to adequately advertise the request for bids**

- **Stage:** Tender
- **Type of red flag:** Low transparency
- **Unit of analysis:** Contracting process

#### Definition

Key tender documents (tender notice) are not available for bidders during the full tender period.

#### Why is this a red flag?

A corrupt buyer can favor a predetermined bidder and exclude other potential bidders by limiting access to bidding documents.

#### Required data fields

```
Tender start date
Tender documents
Tender documents date published
```

#### OCDS fields

```
tender/tenderPeriod/startDate, tender/documents/documentType = tenderNotice or biddingDocuments, tender/documents/datePublished
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/tenderPeriod/startDate` | yes |
| `/tender/documents[]/documentType` | yes |
| `/tender/documents[]/datePublished` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Failure to Make Bidding Documents Available” in Guide to Combating Corruption & Fraud in Development Projects

---

### R005

**Key tender information and documents are not available**

- **Stage:** Tender
- **Type of red flag:** Low transparency
- **Unit of analysis:** Contracting process

#### Definition

Key tender documents are not available. These can include: the tender notices, bidding documents, technical specifications, evaluation criteria, key dates, etc. Check the OCDS document type codelist to see the possible documents.

#### Why is this a red flag?

Governments should provide an adequate degree of transparency for the entire cycle of the procurement process to promote fair and equitable treatment of suppliers, and to facilitate oversight. Project officials can reduce competition and exclude qualified bidders by limiting access to bidding documents or not publishing key information about the tender.

#### Required data fields

```
- Tender documents
- Key dates of the tender process
```

#### OCDS fields

```
tender/documents/documentType=(tenderNotice, biddingDocuments, technicalSpecifications, evaluationCriteria), tender/documents/datePublished, tender/tenderPeriod/startDate; tender/tenderPeriod/endDate
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/documents[]/documentType` | yes |
| `/tender/documents[]/datePublished` | yes |
| `/tender/tenderPeriod/startDate` | yes |
| `/tender/tenderPeriod/endDate` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on OECD’s Principles for Integrity in Public Procurement and “Failure to Make Bidding Documents Available” in Guide to Combating Corruption & Fraud in Development Projects.

---

### R006

**Unreasonable prequalification requirements**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

The eligibility criteria are unreasonable. See also “Unreasonable technical specifications”.

#### Why is this a red flag?

Having restrictive prequalification requirements can be used to limit competition and facilitate the selection of a favored bidder, often as the result of corruption.

#### Required data fields

```
-Eligibility criteria

Optional:
-Procurement method
-Item classification scheme and id (to compare tender with similar items)
```

#### OCDS fields

```
tender/eligibilityCriteria OR
tender/documents/documentType=eligibilityCriteria
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/eligibilityCriteria` | yes |
| `/tender/documents[]/documentType` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on OECD’s Principles for Integrity in Public Procurement and “Unreasonable Prequalification Requirements” in Guide to Combating Corruption & Fraud in Development Projects.

---

### R007

**Unreasonable technical specifications**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

The technical specifications are too broad or too narrow and seem to be tailored to a supplier. See also “Unreasonable prequalification requirements”.

#### Why is this a red flag?

Project officials can deliberately draft inadequate bid specifications in order to facilitate the selection of a favored bidder.

#### Required data fields

```
- Technical specifications documents
-Item classifications
Optional fields to narrow the analysis and compare similar tenders:
-Procurement method

-Procuring entity name
-Tender value
```

#### OCDS fields

```
tender/documents/documentType=technicalSpecifications
tender/items/classification/id
Optional: tender/procurementMethod,
tender/procuringEntity/name OR buyer/name OR parties/id and parties/name with parties/roles=buyer,
tender/value/amount
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/documents[]/documentType` | yes |
| `/tender/items[]/classification/id` | yes |
| `/tender/procurementMethod` | no |
| `/tender/procuringEntity/name` | no |
| `/buyer/name` | no |
| `/tender/value/amount` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on OECD’s Principles for Integrity in Public Procurement (p 53), “Vague, Ambiguous or Incomplete Specifications” in Guide to Combating Corruption & Fraud in Development Projects, “Manipulation of tender specifications” and “Rigged technical specifications” in Fraud in Public Procurement: A collection of Red Flags and Best Practices and Prediction of Public Procurement Corruption Indices using Machine Learning Methods

---

### R008

**Unreasonable participation fees**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

The participation fee prices are not within legal parameters. Participation fees are often set as a fixed maximum or a percentage of total contract value.

#### Why is this a red flag?

A corrupt buyer can favor a predetermined bidder and exclude other potential bidders by limiting access to bidding documents by increasing their price.

#### Required data fields

```
Tender participation fees
```

#### OCDS fields

```
tender/participationFees/value/amount, tender/participationFees/value/currency,
tender/value/amount

See Participation fees extension
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/participationFees[]/value/amount` | yes |
| `/tender/participationFees[]/value/currency` | yes |
| `/tender/value/amount` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Failure to Make Bidding Documents Available” in Guide to Combating Corruption & Fraud in Development Projects

---

### R009

**Buyer increases the cost of the bidding documents**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

The participation fee prices rise during the tender period.

#### Why is this a red flag?

A corrupt buyer can favor a predetermined bidder and exclude other potential bidders by limiting access to bidding documents.

#### Required data fields

```
Tender participation fees

Tender date
```

#### OCDS fields

```
tender/participationFees/value/amount, tender/participationFees/value/currency, date

See Participation fees extension
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/participationFees[]/value/amount` | yes |
| `/tender/participationFees[]/value/currency` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Failure to Make Bidding Documents Available” in Guide to Combating Corruption & Fraud in Development Projects

---

### R010

**Unjustified use of non competitive procedure**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

The use of a non-competitive method is not correctly justified or does not comply with the legal requirements.

#### Why is this a red flag?

While there are valid reasons to use non competitive procurement methods, its use must be justified and comply with legal requirements. A corrupt contracting authority can use more opaque methods to award the tender to the favored bidder.

#### Required data fields

```
-Procurement method
-Procurement method details
-Procurement method rationale
```

#### OCDS fields

```
tender/procurementMethod, tender/procurementMethodDetails, tender/procurementMethodRationale
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/tender/procurementMethodDetails` | yes |
| `/tender/procurementMethodRationale` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Absence of tendering or inappropriate procedure” and “Cases not justifying the use of the negotiated procedure without prior publication of a contract notice” in Public Procurement guidance for practitioners

---

### R011

**Splitting purchases to avoid procurement thresholds**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process, Buyer

#### Definition

What should have been a single contract or purchase is split into two or more components, each below the relevant procurement threshold, to facilitate sole source or less competitive contract awards.

#### Why is this a red flag?

Project officials can split what should be a single contract or purchase into two or more components, each below the relevant procurement threshold, to facilitate direct or less competitive contract awards. (International Anti Corruption Research Center, 2012).

#### Required data fields

```
Procurement method used (and procurement method details if available)

Item classification scheme and categories

Tender values and currency

Tender period start date

Name of the procuring entity or buyer.
```

#### OCDS fields

```
tender/procurementMethod`,
tender/procurementMethodDetails`,
tender/items/classification/id,
tender/items/classification/scheme, tender/value/amount,
tender/value/currency, tender/tenderPeriod/startDate, tender/procuringEntity/name OR buyer/name OR tender/procuringEntity/id OR buyer/id
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/tender/procurementMethodDetails` | yes |
| `/tender/items[]/classification/id` | yes |
| `/tender/items[]/classification/scheme` | yes |
| `/tender/value/amount` | yes |
| `/tender/value/currency` | yes |
| `/tender/tenderPeriod/startDate` | yes |
| `/tender/procuringEntity/name` | yes |
| `/buyer/name` | yes |
| `/tender/procuringEntity/id` | yes |
| `/buyer/id` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Split purchases” in Guide to Combating Corruption & Fraud in Development Projects and “Artificially splitting the contract value” in Public Procurement guidance for practitioners

---

### R012

**Direct awards in contravention of the provisions of the procurement plan**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

Direct award method is used in contravention of the provisions of the procurement plan.

#### Why is this a red flag?

Direct awards, while they are justified in certain conditions, can sometimes be used to avoid competition and award contracts to specific suppliers.

#### Required data fields

```
-Procurement method
-Procurement method details
-Planning documents
```

#### OCDS fields

```
tender/procurementMethod, tender/procurementMethodDetails, planning/documents/documentType=procurementPlan OR plannedProcurementNotice
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/tender/procurementMethodDetails` | yes |
| `/planning/documents[]/documentType` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Unjustified Sole Source Awards” in Guide to Combating Corruption & Fraud in Development Projects

---

### R013

**High use of non competitive methods**

- **Stage:** Tender
- **Type of red flag:** Low transparency
- **Unit of analysis:** Buyer

#### Definition

The proportion of a buyer’s contracting processes that use non-competitive methods is a high outlier.

#### Why is this a red flag?

While there are valid reasons to use non competitive procurement methods where only a select list of suppliers can participate or the contracting process is awarded directly without competition, these methods are by default less competitive and transparent.

#### Required data fields

```
Procurement method

Buyer or procuring entity information
```

#### OCDS fields

```
tender/procurementMethod,
tender/procuringEntity/name OR buyer/name OR parties/id and parties/name with parties/roles=buyer
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/tender/procuringEntity/name` | yes |
| `/buyer/name` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Procedure type” in An Objective Corruption Risk Index Using Public Procurement Data and Uncovering High-Level Corruption: Cross-National Corruption Proxies Using Government Contracting Data, “Percentage of public contracts awarded without competition” in UNODC Statistical framework to measure corruption

---

### R014

**Short time between tender advertising and bid opening**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

Length of time between tender advertising and bid opening falls below a threshold value.

#### Why is this a red flag?

Project officials can deliberately fail to provide adequate notice for companies to prepare bids or proposals in order to benefit a favored bidder, often as the result of corruption.

#### Required data fields

```
-Tender period start date
-Bid opening date
```

#### OCDS fields

```
tender/bidOpening/date, tender/tenderPeriod/startDate, tender/procurementMethod

Check Bid opening extension
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/bidOpening/date` | yes |
| `/tender/tenderPeriod/startDate` | yes |
| `/tender/procurementMethod` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Short or Inadequate Notice to Bidders” in Guide to Combating Corruption & Fraud in Development Projects and “Length of advertisement period” in Uncovering High-Level Corruption: Cross-National Corruption Proxies Using Government Contracting Data.

---

### R015

**Long time between bid opening and bid evaluation**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

Time interval between bid opening and bid evaluation is greater than threshold value. See also R014 - Short time between tender advertising and bid opening, R003 - The submission period is too short.

#### Why is this a red flag?

A long time between bid opening and evaluation could indicate that project officials want to favor a particular contractor. It is recommended that bids are evaluated immediately after the bid submission period closes.

#### Required data fields

```
-Tender period start date
-Bid opening date
```

#### OCDS fields

```
tender/bidOpening/date,
tender/awardPeriod/startDate, tender/procurementMethod

Optional: tender/procurementMethodDetails

Check Bid opening extension
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/bidOpening/date` | yes |
| `/tender/awardPeriod/startDate` | yes |
| `/tender/procurementMethod` | yes |
| `/tender/procurementMethodDetails` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Unclear or subverted processes” in Warning signs of Fraud and Corruption in Public procurement.

---

### R016

**Tender value is higher or lower than average for this item category**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

Tender value is threshold distance from mean for item category.

#### Why is this a red flag?

A larger variation in the tender value (for the same item categories) across different tenders can indicate lower value for money. Price differences for the same item across multiple contracting processes can also provide information about how competitive and efficient the procuring entity is. In addition, lower than average tender values for the same item category could indicate a procuring entity is lowering the value to avoid competitive thresholds.

#### Required data fields

```
-Tender value amount
-Tender value currency
-Tender item classification id and scheme

Optional:
-Procurement method and procurement method details
```

#### OCDS fields

```
tender/value/amount, tender/value/currency, tender/items/classification/id, tender/items/classification/scheme,
tender/procurementMethod
Optional:
tender/procurementMethodDetails

Note: If items are not available at the tender level, award items or contract items could be used instead.
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/value/amount` | yes |
| `/tender/value/currency` | yes |
| `/tender/items[]/classification/id` | yes |
| `/tender/items[]/classification/scheme` | yes |
| `/tender/procurementMethod` | yes |
| `/tender/procurementMethodDetails` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Unreasonably High Line Item Bids” in Guide to Combating Corruption & Fraud in Development Projects.

---

### R017

**Unreasonably low or high line item**

- **Stage:** Tender
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process

#### Definition

The item value is threshold distance from the mean for the item category.

#### Why is this a red flag?

Unreasonably high line item bids can indicate the bidder is deliberately inflating their bid prices. In addition, lower than average line item bids can indicate a bidder is submitting a low bid to unfairly eliminate competitors with the intention of increasing the price through amendments or in defiance of a collusive group.

#### Required data fields

```
-Unit values amount
-Items classification schemes
```

#### OCDS fields

```
tender/items/unit/value/amount, tender/items/unit/value/currency, tender/items/classification/id, tender/items/classification/scheme

Also the bids/details/value/amount, bids/details/value/currency fields could be used.

Note: If items are not available at the tender level, award items or contract items could be used instead.
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/items[]/unit/value/amount` | yes |
| `/tender/items[]/unit/value/currency` | yes |
| `/tender/items[]/classification/id` | yes |
| `/tender/items[]/classification/scheme` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Leaking of tender information” in Fraud in Public Procurement: A collection of Red Flags and Best Practices and “Unreasonably Low Line Item Bids” and “Unreasonably High Line Item Bids” in Guide to Combating Corruption & Fraud in Development Projects.

---

### R018

**Single bid received**

- **Stage:** Tender
- **Type of red flag:** Low competition
- **Unit of analysis:** Contracting process

#### Definition

Only one tenderer submitted a bid.

#### Why is this a red flag?

In a competitive procedure, a lack of competition might correspond to a suppression of competition and can represent the ideal outcome for a corrupt buyer and predetermined bidder.

#### Required data fields

```
Procurement method used (and procurement method details if available)

Number of bidders
```

#### OCDS fields

```
tender/procurementMethod,
tender/numberOfTenderers, OR tender/tenderers/id
OR bids/details/tenderers/id
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/tender/numberOfTenderers` | yes |
| `/tender/tenderers[]/id` | yes |
| `/bids/details[]/tenderers[]/id` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Single bidder" in An Objective Corruption Risk Index Using Public Procurement Data

---

### R019

**Low number of bidders for item category**

- **Stage:** Tender
- **Type of red flag:** Low competition
- **Unit of analysis:** Contracting process

#### Definition

​​Number of bidders significantly lower than average, based on prior similar contracts (for similar items or procuring entities).

#### Why is this a red flag?

A lower number of bids indicates a decrease in competition that could facilitate the ideal outcome for a corrupt buyer to award the contract to a predetermined bidder.

#### Required data fields

```
-Procurement method used
-Item classification id and scheme.
-Number of bids received
```

#### OCDS fields

```
tender/procurementMethod, tender/items/classification/id, tender/items/classification/scheme ,(tender/procuringEntity/name OR buyer/name OR tender/procuringEntity/id OR buyer/id), (tender/numberOfTenderers OR tender/tenderers/id OR bids/details/tenderers/id)
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/tender/items[]/classification/id` | yes |
| `/tender/items[]/classification/scheme` | yes |
| `/buyer/name` | yes |
| `/tender/procuringEntity/id` | yes |
| `/tender/tenderers[]/id` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Number of bidders is significantly lower than the average in other similar tenders” in Fraud in Public Procurement: A collection of Red Flags and Best Practices

---

### R020

**Tender has a complaint**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process, Bidder

#### Definition

The contracting process has at least one complaint.

#### Why is this a red flag?

Losing or excluded bidders can submit complaints that may signal misconduct or corruption in the contracting process.

#### Required data fields

```
-Complaints
```

#### OCDS fields

```
complaints/id

Optional:
complaints/documents OR tender/documents/documentType = complaints to explore the details of the complaint.

See: complaints extension
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/complaints/id` | yes |
| `/complaints/documents[]` | no |
| `/tender/documents[]/documentType` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Complaints from Losing and Excluded Bidders” in Fraud in Public Procurement: A collection of Red Flags and Best Practices and “Complaints” in Warning signs of Fraud and Corruption in Public procurement.

---

### R021

**High use of discretionary evaluation criteria**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process, Buyer

#### Definition

The proportion of contracting processes for a buyer using the non price evaluation criteria is a high outlier.

#### Why is this a red flag?

In a poorly controlled bidding process, project officials can tamper with bids after receipt to ensure that a favored contractor is selected. Non-price evaluation criteria, for instance the Most Economically Advantageous Tender criteria (MEAT), tend to be more subjective allowing issuers to favor the well-connected company, for instance: Non-price related evaluation criteria have been found to be associated with a higher probability of a single bid received (Fazekas et. al, 2016). Research in Italy found that the association between the MEAT criterion and corruption risk is stronger the more the scoring rule assigns points to qualitative (as opposed to quantitative) parameters (Decarolis, F. and Giorgiantonio, C., 2022) ⚠️However, relying exclusively on price alone can be counterproductive to achieving other procurement outcomes and strategies (e.g. sustainability goals) and non-price evaluation criteria may be recommended in specific markets. For instance, the 2014 European Directives on public procurement prescribe the MEAT criterion as the ordinary criterion for awarding public contracts and the European Commission Single Market Scorecard Indicator 6 recommends that the use of award criteria based on price alone should be less than 80%.

#### Required data fields

```
-Tender award criteria
-Buyer id
Optional:
-Award criteria details
-Item classifications to analyze specific sectors only.
```

#### OCDS fields

```
To calculate for the buyer:
tender/awardCriteria = ‘qualityOnly’ OR ‘ratedCriteria’,
tender/procuringEntity/name OR buyer/name OR parties/id and parties/name with parties/roles=buyer
Optional:
tender/awardCriteriaDetails, to analyze the details of the award criteria. tender/items/classification/id to analyze by specific sectors.

To calculate for the contracting process:
tender/lots/awardCriteria/criteria/number/number
tender/lots/awardCriteria/criteria/type

See award criteria breakdown extension
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/awardCriteria` | yes |
| `/tender/procuringEntity/name` | yes |
| `/buyer/name` | yes |
| `/tender/awardCriteriaDetails` | no |
| `/tender/lots/awardCriteria/criteria/number/number` | no |
| `/tender/lots/awardCriteria/criteria/type` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “non-price evaluation criteria” in “An Objective Corruption Risk Index Using Public Procurement Data” and “awarding criteria” in Corruption red flags in public procurement: new evidence from Italian calls for tenders (2022) and (2020)

---

### R022

**Wide disparity in bid prices**

- **Stage:** Tender
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process

#### Definition

The bid price range in the same contracting process is greater than a threshold value.

#### Why is this a red flag?

A colluding bidder can mimic competition by coordinating a collusive agreement with their colluding partner to prearrange the bid prices beforehand and therefore there is no real competition. Extreme or unusual offer price distributions are found to signal collusion by academic literature Abrantes-Metz et al. (2006), Padhi and Mohapatra (2011).

#### Required data fields

```
Individual bid data and their amounts.
```

#### OCDS fields

```
bids/details/id, bids/details/value/amount, bids/details/value/currency, bids/details/status
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/value/amount` | yes |
| `/bids/details[]/value/currency` | yes |
| `/bids/details[]/status` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Bid price range" in Assessing the potential for detecting collusion in Swedish public procurement.

---

### R023

**Fixed multiple bid prices**

- **Stage:** Tender
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Bidder

#### Definition

The percentage difference between two tenderers’ bid prices is the same in different contracting processes.

#### Why is this a red flag?

A colluding bidder can mimic competition by coordinating a collusive agreement with their colluding partner to prearrange the bid prices beforehand and therefore there is no real competition. Very similar or equal bid prices is considered a signal of potential collusive agreements between bidders. Also extreme or unusual offer price distributions are found to signal collusion by academic literature Abrantes-Metz et al. (2006), Padhi and Mohapatra (2011)

#### Required data fields

```
Individual bid data and their amounts.
```

#### OCDS fields

```
bids/details/id, bids/details/value/amount, bids/details/value/currency,
bids/details/status
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/value/amount` | yes |
| `/bids/details[]/value/currency` | yes |
| `/bids/details[]/status` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Concerted bids” in A decision support system for fraud detection in public procurement

---

### R024

**Price close to winning bid**

- **Stage:** Award
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process, Bidder

#### Definition

The percentage difference between the winning bid and the second-lowest valid bid is a low outlier.

#### Why is this a red flag?

A colluding bidder can mimic competition by submitting a bid that is similar in price (but different in quality, for example) from its colluding partner.

#### Required data fields

```
Individual bid data and their amounts.
```

#### OCDS fields

```
bids/details/id, bids/details/value/amount, bids/details/value/currency,
bids/details/status
To identify winning bid:
bids/details/tenderers/id and awards/suppliers/id
OR awards/relatedBid

Optional, for greater accuracy:
award/status, tender/awardCriteria
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/value/amount` | yes |
| `/bids/details[]/value/currency` | yes |
| `/bids/details[]/status` | yes |
| `/awards[]/relatedBid` | yes |
| `/awards[]/status` | yes |
| `/tender/awardCriteria` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Difference between first and second relative offer prices" in Toolkit for detecting collusive bidding in public procurement and "Winning tender just below the next lowest bid" in Fraud in Public Procurement: A collection of Red Flags and Best Practices

---

### R025

**Excessive unsuccessful bids**

- **Stage:** Award
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Bidder

#### Definition

The ratio of winning bids to submitted bids for a top tenderer is a low outlier.

#### Why is this a red flag?

A colluding bidder can mimic competition by submitting deliberately losing bids (at inflated bid prices, for example) in contracting processes in which a colluding partner participates.

#### Required data fields

```
Tenderer (bidder) id (or name if ids are not available)

Bid status

Winning bidder id (supplier) or name if ids are not available
```

#### OCDS fields

```
tender/tenderers/id OR bids/details/tenderers/id OR parties/id where parties/roles = tenderer
 bids/details/status
awards/suppliers/id OR parties/id where parties/roles = supplier
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/tenderers[]/id` | yes |
| `/bids/details[]/tenderers[]/id` | yes |
| `/bids/details[]/status` | yes |
| `/awards[]/suppliers[]/id` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Superfluous losing bidders" in Toolkit for detecting collusive bidding in public procurement and "Top losers" in A decision support system for fraud detection in public procurement

---

### R026

**Prevalence of consortia**

- **Stage:** Award
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Market

#### Definition

The proportion of awards to a consortia is a high outlier in a market.

#### Why is this a red flag?

While consortia can be formed for legitimate reasons, joint bidding in a collusive setting can mitigate the burden of collusive behavior by formalizing the cooperation and facilitating rent sharing.

#### Required data fields

```
-Awarded supplier information

-Items information (to define the markets)
```

#### OCDS fields

```
awards/suppliers/id, awards/suppliers/name,
awards/status,awards/date,
tender/items/classification/id,
tender/items/classification/scheme

*award or contract items can be used instead
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/awards[]/suppliers[]/id` | yes |
| `/awards[]/suppliers[]/name` | yes |
| `/awards[]/status` | yes |
| `/awards[]/date` | yes |
| `/tender/items[]/classification/id` | yes |
| `/tender/items[]/classification/scheme` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Prevalence of consortia" in Toolkit for detecting collusive bidding in public procurement, and Assessing the potential for detecting collusion in Swedish public procurement, “Two or more companies submit a joint bid, although they should be able to participate individually” in Fraud in Public Procurement: A collection of Red Flags and Best Practices.

---

### R027

**Missing bidders**

- **Stage:** Tender
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Market

#### Definition

Potential bidders make agreements not to bid because of collusion arrangements.

#### Why is this a red flag?

Withholding bids from certain tenders is a straightforward way to restrict competition; hence the absence of bids from a previously active company in a given market can indicate collusive bidding.

#### Required data fields

```
-Number of bidders
-Procurement method
-Items information (to define the markets)
-Tender date
```

#### OCDS fields

```
tender/procurementMethod,
tender/numberOfTenderers, OR tender/tenderers/id
OR bids/details/tenderers/id,
tender/items/classification/id,
tender/items/classification/scheme,
tender/tenderPeriod/startDate

*award or contract items can be used instead. Other variables to get the date could be used also.
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/tender/numberOfTenderers` | yes |
| `/tender/tenderers[]/id` | yes |
| `/bids/details[]/tenderers[]/id` | yes |
| `/tender/items[]/classification/id` | yes |
| `/tender/items[]/classification/scheme` | yes |
| `/tender/tenderPeriod/startDate` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Missing bidders MB2" in Toolkit for detecting collusive bidding in public procurement, and Assessing the potential for detecting collusion in Swedish public procurement

---

### R028

**Identical bid prices**

- **Stage:** Tender
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Different tenderers submitted bids with the same price.

#### Why is this a red flag?

A corrupt buyer can award to a pre-determined bidder by leaking competitors' prices. Also, collusive bidders can agree on the price to submit.

#### Required data fields

```
Bid status

Bid values
```

#### OCDS fields

```
bids/details/id,
bids/details/status,
bids/details/value/amount, bids/details/value/currency,
bids/details/tenderers/id
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/status` | yes |
| `/bids/details[]/value/amount` | yes |
| `/bids/details[]/value/currency` | yes |
| `/bids/details[]/tenderers[]/id` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Bidders having the same bid price" in Assessing the potential for detecting collusion in Swedish public procurement and "Different companies include identical unit prices in their bid documents" in Fraud in Public Procurement: A collection of Red Flags and Best Practices.

---

### R029

**Bid prices deviate from Benford’s Law**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Market

#### Definition

The distribution of bid prices (or tender or contract values) in a specific market deviates from Benford’s Law distribution. The indicator can also be calculated for the whole procurement dataset, however it could be less informative.

#### Why is this a red flag?

Benford’s law states that the first digit of most naturally occurring sets of numerical data follows a particular pattern, where the number 1 appears as the leading digit about 30% of the time, the number 2 as the the leading digit about 17% of the time, and so on up to 9, which should appear as a leading digit about 4% of the time. A deviation from this pattern could be a sign of price manipulation.

#### Required data fields

```
Bid values

Items information (to define the markets)


Alternative:
Tender values or contract values
```

#### OCDS fields

```
bids/details/value/amount OR
tender/value/amount OR contracts/value/amount OR awards/value/amount,
tender/items/classification/id,
tender/items/classification/scheme
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/value/amount` | yes |
| `/tender/value/amount` | yes |
| `/contracts[]/value/amount` | yes |
| `/awards[]/value/amount` | yes |
| `/tender/items[]/classification/id` | yes |
| `/tender/items[]/classification/scheme` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Benford’s Law” in Assessing the potential for detecting collusion in Swedish public procurement, ProACT Integrity indicators and Public procurement in Brazil: Evidence of frauds using the Newcomb-Benford Law

---

### R030

**Late bid won**

- **Stage:** Award
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process, Bidder

#### Definition

The winning bid was received after the submission deadline.

#### Why is this a red flag?

A corrupt buyer can award to a predetermined bidder by disregarding the submission deadline.

#### Required data fields

```
-Bid submission date
-Bid status
-Tender period end date
```

#### OCDS fields

```
tender/tenderPeriod/endDate,
bids/details/id
bids/details/date,
bids/details/status,
To identify winning bid:
bids/details/tenderers/id and awards/suppliers/id
OR awards/relatedBid
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/tenderPeriod/endDate` | yes |
| `/bids/details[]/id` | yes |
| `/bids/details[]/date` | yes |
| `/bids/details[]/status` | yes |
| `/awards[]/relatedBid` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Bids after the deadline accepted" in Corruption in Public Procurement: Finding the Right Indicators and "Late submissions accepted" in Fraud in Public Procurement: A collection of Red Flags and Best Practices

---

### R031

**Winning bid price very close or higher than estimated price**

- **Stage:** Award
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

The ratio between the winning bid and the estimated price is a high outlier.

#### Why is this a red flag?

Bid prices are expected to fall below to the estimated price, due to healthy competition, assuming the estimated price is not biased. “A winning bid that is too close to confidential project cost estimates or budgets can indicate the leaking of bid information or an unbalanced bidding scheme” (IACRC, 2012).

#### Required data fields

```
Bid amount

Bid status

Winning bidder

Tender amount
```

#### OCDS fields

```
bids/details/id
bids/details/status,
bids/details/value/amount, bids/details/value/currency
tender/value/amount,
tender/value/currency
To identify winning bid:
bids/details/tenderers/id and awards/suppliers/id
OR awards/relatedBid
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/status` | yes |
| `/bids/details[]/value/amount` | yes |
| `/bids/details[]/value/currency` | yes |
| `/tender/value/amount` | yes |
| `/tender/value/currency` | yes |
| `/awards[]/relatedBid` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Relative contract value” in Toolkit for detecting collusive bidding in public procurement.

---

### R032

**Bidders share same beneficial owner**

- **Stage:** Tender
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Two tenderers bidding in the same contracting process share the same beneficial owner.

#### Why is this a red flag?

While shared ownership of bidders participating in the same contracting process is often not illegal, shared ownership could be a sign of collusion or coordinated companies submitting bids to simulate competition.

#### Required data fields

```
Bidder beneficial ownership information
```

#### OCDS fields

```
parties/roles` IN 'supplier' OR 'tenderer',
parties/id,
parties/beneficialOwners/name,
parties/beneficialOwners/id

See Beneficial ownership extension
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/parties[]/id` | yes |
| `/parties[]/beneficialOwners/name` | yes |
| `/parties[]/beneficialOwners/id` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Common partners” in A decision support system for fraud detection in public procurement and “Detecting shared ownership” in Beneficial ownership data in procurement.

---

### R033

**Bidders share same major shareholder**

- **Stage:** Tender
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Two tenderers bidding in the same contracting process share the same major shareholder.

#### Why is this a red flag?

Sharing the same major shareholder could indicate that the companies belong to the same economic group, thus competition is impaired and this could be a sign of collusion.

#### Required data fields

```
Bidder shareholder information
```

#### OCDS fields

```
parties/roles IN 'tenderer',
parties/id,
parties/shareholders/shareholder/id,
parties/shareholders/shareholding
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/parties[]/id` | yes |
| `/parties[]/shareholders/shareholder/id` | yes |
| `/parties[]/shareholders/shareholding` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Common economic group” in A decision support system for fraud detection in public procurement.

---

### R034

**Bids submitted in same order**

- **Stage:** Tender
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process

#### Definition

Sequence of bid submissions shows patterns in different bid rounds.

#### Why is this a red flag?

Certain bidding patterns and practices seem at odds with a competitive market and suggest the possibility of collusion. Two bidders submitting bids in the same order at different stages of the tendering process might indicate they are coordinating the submission.

#### Required data fields

```
Bidder details

Bids date

Bid status
```

#### OCDS fields

```
bids/details/id,
bids/details/date, bids/details/tenderers/id, bids/details/tenderers/name, bids/details/status
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/date` | yes |
| `/bids/details[]/tenderers[]/id` | yes |
| `/bids/details[]/tenderers[]/name` | yes |
| `/bids/details[]/status` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Bidding red flags” in Guide to Combating Corruption & Fraud in Development Projects

---

### R035

**All except winning bid disqualified**

- **Stage:** Award
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Bids are disqualified if not submitted by the single tenderer of the winning bid.

#### Why is this a red flag?

A corrupt buyer can award the predetermined bidder by disqualifying other bidders' offers.

#### Required data fields

```
-Information on the submitted bids including the status, id, and winning bidder.
-Award status
```

#### OCDS fields

```
bids/details/id
bids/details/status,
To identify winning bid:
bids/details/tenderers/id and awards/suppliers/id
OR awards/relatedBid
awards/status
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/status` | yes |
| `/awards[]/relatedBid` | yes |
| `/awards[]/status` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Exclusion of all but one bid" in An Objective Corruption Risk Index Using Public Procurement Data and "Prevalence of faulty bids" in Toolkit for detecting collusive bidding in public procurement.

---

### R036

**Lowest bid disqualified**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

The lowest submitted bid is disqualified, while the award criterion is price only.

#### Why is this a red flag?

A corrupt buyer can award the predetermined bidder by disqualifying lower-priced bids.

#### Required data fields

```
-Bid id
-Bid status
-Bid amounts
-Award criteria
```

#### OCDS fields

```
bids/details/id
bids/details/status, bids/details/value/amount, bids/details/value/currency, tender/awardCriteria
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/status` | yes |
| `/bids/details[]/value/amount` | yes |
| `/bids/details[]/value/currency` | yes |
| `/tender/awardCriteria` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "The lowest bid is rejected almost inexplicably" in Fraud in Public Procurement: A collection of Red Flags and Best Practices, "Lowest bidder not selected" in Common Red Flags of Fraud and Corruption in Procurement, and "Award to other than lowest qualified bidder" in Guide to Combating Corruption & Fraud in Development Projects

---

### R037

**Poorly supported disqualifications**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process, Bidder

#### Definition

A seemingly qualified contractor was disqualified.

#### Why is this a red flag?

Project officials can disqualify bidders at the prequalification or bidding stages for superficial or arbitrary reasons in order to facilitate the selection of a favored bidder.

#### Required data fields

```
-Award criteria
-Bid status
-Bidders details
-Evaluation reports
```

#### OCDS fields

```
tender/awardCriteria,
bids/details/id, bids/details/value/amount, bids/details/value/currency, bids/details/status, bids/details/documents = evaluationReports
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/awardCriteria` | yes |
| `/bids/details[]/id` | yes |
| `/bids/details[]/value/amount` | yes |
| `/bids/details[]/value/currency` | yes |
| `/bids/details[]/status` | yes |
| `/bids/details[]/documents[]` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Excluding qualified bidders" in Guide to Combating Corruption & Fraud in Development Projects

---

### R038

**Excessive disqualified bids**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Buyer, Bidder

#### Definition

The ratio of disqualified bids to submitted bids is a high outlier per buyer, procuring entity or tenderer.

#### Why is this a red flag?

A corrupt buyer or procuring entity can award pre-determined bidders by disqualifying other bidders' bids. A colluding bidder can mimic competition by submitting deliberately unqualified bids.

#### Required data fields

```
-Information on the bid status, id.
-Bidder id
-Buyer or procuring entity id or name.
```

#### OCDS fields

```
bids/details/id
bids/details/status, (bids/details/tenderers/id OR parties/id with parties/roles=tenderer), (tender/procuringEntity/id OR buyer/name OR parties/id with parties/roles=buyer)
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/status` | yes |
| `/buyer/name` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Excluding qualified bidders" in Guide to Combating Corruption & Fraud in Development Projects, Behind the Scenes of ProZorro: Does Ukrainian business trust public procurement?

---

### R039

**Unanswered bidder questions**

- **Stage:** Tender
- **Type of red flag:** Low transparency
- **Unit of analysis:** Contracting process

#### Definition

Bidder enquiries are not answered.

#### Why is this a red flag?

If questions are left unanswered this can signal that a procuring entity is trying to exclude particular suppliers or favor a particular firm.

#### Required data fields

```
-Tender status
-Tender enquiries
-Enquiries answers
```

#### OCDS fields

```
tender/enquiries/date, tender/enquiries/dateAnswered, tender/enquiries/answer,
tender/status

See Enquiries extension
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/enquiries/date` | yes |
| `/tender/enquiries/dateAnswered` | yes |
| `/tender/enquiries/answer` | yes |
| `/tender/status` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Precautionary measures in tendering” in OECD’s Principles for Integrity in Public Procurement

---

### R040

**High share of buyer's contracts**

- **Stage:** Award
- **Type of red flag:** Low competition
- **Unit of analysis:** Buyer, Bidder

#### Definition

The bidder's share of a buyer’s contracts is a high outlier.

#### Why is this a red flag?

A corrupt buyer can consistently award contracts to the preferred bidder.

#### Required data fields

```
-Supplier name
-Award status
-Procuring entity or buyer name
-Award date
```

#### OCDS fields

```
awards/suppliers/id, awards/suppliers/name, tender/procuringEntity/name OR buyer/name OR OR parties/id AND parties/roles=buyer or procuringEntity,
 awards/status, awards/date
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/awards[]/suppliers[]/id` | yes |
| `/awards[]/suppliers[]/name` | yes |
| `/tender/procuringEntity/name` | yes |
| `/buyer/name` | yes |
| `/parties[]/id` | yes |
| `/awards[]/status` | yes |
| `/awards[]/date` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Winner’s share of issuer’s contracts” in Anatomy of grand corruption: A composite corruption risk index based on objective data

---

### R041

**Physical similarities in documents by different bidders**

- **Stage:** Tender
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Two tenderers bidding in the same contracting process submit documents with similar information or format.

#### Why is this a red flag?

Similarities in the submitted bidding documents can indicate that the bidders are connected and that the same person prepared all the bids.

#### Required data fields

```
-Bidder information
-Bidder documents
```

#### OCDS fields

```
bids/documents/documentType='biddingDocuments', bids/details/id,
bids/details/tenderers/id
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/documents[]/documentType` | yes |
| `/bids/details[]/id` | yes |
| `/bids/details[]/tenderers[]/id` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Analysis of the submitted documentation” in Guidelines for detecting bid rigging in public procurement and OECD Guidelines for fighting bid rigging in public procurement, “Red flags with regard to bid documents” in Fraud in Public Procurement: A collection of Red Flags and Best Practices.

---

### R042

**Bidder has abnormal address or phone number**

- **Stage:** Tender
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Bidder phone number or address is atypical.

#### Why is this a red flag?

This can indicate the supplier is a fictitious company or is providing false information. In some collusive bidding cases, the winning bidder prepares and submits losing bids from non-existent companies to give the appearance of competition.

#### Required data fields

```
Bidder phone number OR

Bidder address
```

#### OCDS fields

```
parties/roles` IN 'supplier' OR 'tenderer',
parties/id (parties/contactPoint/telephone OR parties/address/streetAddress OR parties/address/postalCode)
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/parties[]/address/streetAddress` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based in “Suspicious bidders” in Warning signs of Fraud and Corruption in Public procurement.

---

### R043

**Bidder has same contact information as project official**

- **Stage:** Tender
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Bidder contact information matches buyer's contact point information.

#### Why is this a red flag?

This can indicate the supplier is a fictitious company or is providing falseinformation. In some collusive bidding cases, the winning bidder prepares and submits losing bids from non-existent companies to give the appearance of competition.

#### Required data fields

```
-Bidder contact details
-Project official (buyer)
contact details
```

#### OCDS fields

```
parties/roles, parties/id, parties/contactPoint/telephone,
parties/contactPoint/name,
parties/contactPoint/email
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/parties[]/roles` | yes |
| `/parties[]/id` | yes |
| `/parties[]/contactPoint/telephone` | yes |
| `/parties[]/contactPoint/name` | yes |
| `/parties[]/contactPoint/email` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Contractor’s address or phone number matches project official’s” in Guide to Combating Corruption & Fraud in Development Projects

---

### R044

**Business similarities between bidders**

- **Stage:** Tender
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Two tenderers bidding in the same contracting process share similar business contact information.

#### Why is this a red flag?

Similarities between suppliers may indicate that the companies are connected.

#### Required data fields

```
Bidder phone number, address, contact point or email.
```

#### OCDS fields

```
parties/roles` IN 'supplier' OR 'tenderer',
parties/id (parties/contactPoint/telephone OR parties/address/streetAddress OR parties/address/postalCode OR parties/contactPoint/email
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/parties[]/address/streetAddress` | yes |
| `/parties[]/address/postalCode` | yes |
| `/parties[]/contactPoint/email` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Connections between bidders” in Corruption in Public Procurement: Finding the Right Indicators and “Similarity in Bids” in Guide to Combating Corruption & Fraud in Development Projects

---

### R045

**Bidder is not listed in business registries**

- **Stage:** Tender
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Bidder does not appear in the supplier registry.

#### Why is this a red flag?

If the supplier or bidder is not traceable in official registries, this can indicate that it is a fictitious company or providing false information.

#### Required data fields

```
-Bidder id and name
```

#### OCDS fields

```
parties/roles` IN 'supplier' OR 'tenderer',
parties/id
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/parties[]/id` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Fictitious contractor” in Guide to Combating Corruption & Fraud in Development Projects and “Suspicious bidders” in Warning signs of Fraud and Corruption in Public procurement.

---

### R046

**Bidder is debarred or on sanctions list**

- **Stage:** Tender
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Bidder appears on an official sanctions or debarments list.

#### Why is this a red flag?

Previously sanctioned suppliers can pose a higher risk.

#### Required data fields

```
-Bidder id and name
```

#### OCDS fields

```
parties/roles` IN 'supplier' OR 'tenderer',
parties/id
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/parties[]/id` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Blacklisting” in A decision support system for fraud detection in public procurement

---

### R047

**Supplier is not traceable on the web**

- **Stage:** Award
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Supplier is not traceable through web search

#### Why is this a red flag?

If the supplier or bidder is not traceable online, this can indicate that it is a fictitious company or it is providing false information. “A project or government official can create a fictitious contractor, consultant, vendor or supplier that does not provide any actual goods or services in order to embezzle project funds” (IACRC).

#### Required data fields

```
-Supplier id and name
-Supplier website
```

#### OCDS fields

```
parties/roles= 'supplier', parties/id, parties/name  OR awards/suppliers/name, awards/suppliers/id, parties/contactPoint/url
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/parties[]/roles` | yes |
| `/parties[]/id` | yes |
| `/parties[]/name` | yes |
| `/awards[]/suppliers[]/name` | yes |
| `/awards[]/suppliers[]/id` | yes |
| `/parties[]/contactPoint/url` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Fictitious contractor” in Guide to Combating Corruption & Fraud in Development Projects

---

### R048

**Heterogeneous supplier**

- **Stage:** Award
- **Type of red flag:** Fraud
- **Unit of analysis:** Bidder

#### Definition

The variety of items supplied by a tenderer is a high outlier.

#### Why is this a red flag?

A heterogeneous supplier is more likely to be unsuitable, increasing the risk of low value for money, low quality of delivery, and/or rent extraction.

#### Required data fields

```
-Item classification id and scheme
```

#### OCDS fields

```
awards/items/classification/id, awards/items/classification/scheme,awards/suppliers/id, awards/suppliers/name
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/awards[]/items[]/classification/id` | yes |
| `/awards[]/items[]/classification/scheme` | yes |
| `/awards[]/suppliers[]/id` | yes |
| `/awards[]/suppliers[]/name` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "Component C1B" in Design and measurement of a corruption risk index from a supplier perspective in the context of COVID-19 emergency.

---

### R049

**Direct awards below threshold**

- **Stage:** Award
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Bidder

#### Definition

Supplier receives more than 1 direct award from the same buyer in period t just below the competitive threshold.

#### Why is this a red flag?

Multiple contract awards to the same company that are clustered just below a procurement threshold is a strong indicator of possible corruption.

#### Required data fields

```
-Procurement method
-Supplier name
-Award date
-Buyer or procuring entity name
```

#### OCDS fields

```
tender/procurementMethod,
awards/suppliers/id,
awards/suppliers/name,
awards/date, tender/procuringEntity/name OR buyer/name OR parties/id and parties/name with parties/roles=buyer
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/awards[]/suppliers[]/id` | yes |
| `/awards[]/suppliers[]/name` | yes |
| `/awards[]/date` | yes |
| `/tender/procuringEntity/name` | yes |
| `/buyer/name` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Multiple Awards just under procurement thresholds” in Guide to Combating Corruption & Fraud in Development Projects .

---

### R050

**High market share**

- **Stage:** Award
- **Type of red flag:** Low competition
- **Unit of analysis:** Buyer, Bidder

#### Definition

A supplier wins a high share of contracts in a particular market from the same buyer.

#### Why is this a red flag?

This indicator can be considered a corruption outcome, since the ultimate goal of institutionalized corruption is to award contracts repeatedly to the same company or group of companies.

#### Required data fields

```
-Supplier name
-Award status
-Award amount
-Award date
-Procuring entity or buyer name
-Award date
-Award items to identify markets
```

#### OCDS fields

```
awards/suppliers/id, awards/suppliers/name, tender/procuringEntity/name OR buyer/name OR OR parties/id AND parties/roles=buyer or procuringEntity,
awards/value/amount, awards/value/currency, awards/status, awards/date

Optional: awards/items/classification/id, awards/items/classification/scheme or tender or contract items, to compare awards in the same item category.
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/awards[]/suppliers[]/id` | yes |
| `/awards[]/suppliers[]/name` | yes |
| `/tender/procuringEntity/name` | yes |
| `/buyer/name` | yes |
| `/parties[]/id` | yes |
| `/awards[]/value/amount` | yes |
| `/awards[]/value/currency` | yes |
| `/awards[]/status` | yes |
| `/awards[]/date` | yes |
| `/awards[]/items[]/classification/id` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Winner’s share of issuer’s contracts” in Anatomy of grand corruption: A composite corruption risk index based on objective data

---

### R051

**High market concentration**

- **Stage:** Award
- **Type of red flag:** Low competition
- **Unit of analysis:** Market

#### Definition

A small number of companies win a high share of contracts in a particular market.

#### Why is this a red flag?

A high market concentration can be a result of collusive bidding or low competition.

#### Required data fields

```
-Supplier id or name
-Item classification (to identify the markets).
-Award or contract values
-Award date
```

#### OCDS fields

```
awards/suppliers/id, awards/suppliers/name, awards/value/amount, awards/value/currency,
awards/date, awards/status, awards/items/classification/id, awards/items/classification/scheme

*Contract of tender items could be used instead, and contract values can be used instead of award values if available.
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/awards[]/suppliers[]/id` | yes |
| `/awards[]/suppliers[]/name` | yes |
| `/awards[]/value/amount` | yes |
| `/awards[]/value/currency` | yes |
| `/awards[]/date` | yes |
| `/awards[]/status` | yes |
| `/awards[]/items[]/classification/id` | yes |
| `/awards[]/items[]/classification/scheme` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Concentrated market structure” in Toolkit for detecting collusive bidding in public procurement and Merger Guidelines U.S. Department of Justice and the Federal Trade Commission

---

### R052

**Small initial purchase from supplier followed by much larger purchases**

- **Stage:** Award
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process, Bidder

#### Definition

The supplier receives two contracts over a distinct time period, the first in a small amount, the second in a larger amount, from the same buyer.

#### Why is this a red flag?

This red flag could indicate that project officials are trying to favor a fictitious contractor. A fictitious or fraudulent contractor could start with a small purchase to test whether it is accepted by the procuring entity and then bid for a larger contract.

#### Required data fields

```
-Supplier name
-Award status
-Award amount
-Award date
-Procuring entity or buyer name
```

#### OCDS fields

```
awards/suppliers/id, awards/suppliers/name, tender/procuringEntity/name OR buyer/name, awards/value/amount, awards/value/currency, awards/status, awards/date

Optional: awards/items/classification/id, awards/items/classification/scheme or tender or contract items, to compare awards in the same item category.
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/awards[]/suppliers[]/id` | yes |
| `/awards[]/suppliers[]/name` | yes |
| `/tender/procuringEntity/name` | yes |
| `/buyer/name` | yes |
| `/awards[]/value/amount` | yes |
| `/awards[]/value/currency` | yes |
| `/awards[]/status` | yes |
| `/awards[]/date` | yes |
| `/awards[]/items[]/classification/id` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Fictitious contractor” in Guide to Combating Corruption & Fraud in Development Projects .

---

### R053

**Co-bidding pairs have same recurrent winner**

- **Stage:** Award
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Two bidders co-bid in 2 or more tenders, but only one bidder wins.

#### Why is this a red flag?

Coordinated bidding behavior can be a signal of collusion. For instance, a colluding bidder can mimic competition by submitting deliberately losing bids in contracting processes in which a colluding partner participates.

#### Required data fields

```
Winning bidder

Bid status

Bidder details
```

#### OCDS fields

```
bids/details/id,bids/details/status, bids/details/tenderers/id AND awards/suppliers/id OR (awards/relatedBid), awards/status
OR parties/id where parties/roles = supplier
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/status` | yes |
| `/bids/details[]/tenderers[]/id` | yes |
| `/awards[]/status` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on Corruption and the Network Structure of Public Contracting Markets across Government Change, “Superfluous losing bidders” in Toolkit for detecting collusive bidding in public procurement

---

### R054

**Direct award followed by change orders that exceed the competitive threshold**

- **Stage:** Award
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process, Bidder

#### Definition

A direct award is followed by contract modifications in its value that exceed the competitive threshold.

#### Why is this a red flag?

Once the contract is signed, amendments or change orders can be made. While there are cases where this can be legitimate, change orders can be manipulated to facilitate corruption or fraud, for instance, through an unjustified increase in the price, by including other items in the contracts, extending the timeline, etc. Evidence shows that thresholds can be manipulated to initially avoid more competitive procedures, and once the contract has been awarded change orders can be used to increase prices above threshold.

#### Required data fields

```
-Procurement method
-Contract status
-Contract amounts
-Contract amendments description
```

#### OCDS fields

```
tender/procurementMethod, tender/procurementDetails (to verify the competitive thresholds),
contracts/status,
awards/value/amount,
awards/value/currency,
contracts/value/amount, contracts/value/currency, contracts/amendments/description (see for changes in total value)
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/contracts[]/status` | yes |
| `/awards[]/value/amount` | yes |
| `/awards[]/value/currency` | yes |
| `/contracts[]/value/amount` | yes |
| `/contracts[]/value/currency` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on Questionable Contract Amendments in Guide to Combating Corruption & Fraud in Development Projects .

---

### R055

**Multiple direct awards above or just below competitive threshold**

- **Stage:** Award
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Buyer, Bidder

#### Definition

Supplier receives multiple direct awards from the same buyer in period t that surpasses the competitive threshold.

#### Why is this a red flag?

Public officials can have significantly higher levels of discretion awarding contracts when estimated costs are below competitive thresholds. If the same supplier receives multiple direct awards from the same buyer below threshold this could be a sign of contract splitting.

#### Required data fields

```
-Procurement method
-Buyer identifier
-Awards amount
-Award status
-Procedure date
```

#### OCDS fields

```
tender/procurementMethod,
awards/suppliers/id (or awards/suppliers/name), buyer/name (or tender/procuringEntity/name),
awards/date,
awards/value/amount, awards/value/currency
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/procurementMethod` | yes |
| `/awards[]/date` | yes |
| `/awards[]/value/amount` | yes |
| `/awards[]/value/currency` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Multiple Awards just under procurement thresholds” in Guide to Combating Corruption & Fraud in Development Projects .

---

### R056

**Winning bid does not meet the award criteria**

- **Stage:** Award
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

The winning bid does not meet the award criteria.

#### Why is this a red flag?

In a poorly controlled bidding process project officials can tamper with bids after receipt to ensure that a favored contractor is selected. (IACRC, 2012).

#### Required data fields

```
-Award criteria
-Winning bid details
-Evaluation reports
```

#### OCDS fields

```
tender/awardCriteria, bids/details/status, bids/details/documents = evaluationReports

To identify winning bid:
bids/details/tenderers/id and awards/suppliers/id
OR awards/relatedBid
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/awardCriteria` | yes |
| `/bids/details[]/status` | yes |
| `/bids/details[]/documents[]` | yes |
| `/awards[]/relatedBid` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on Manipulation of Bids in Guide to Combating Corruption & Fraud in Development Projects.

---

### R057

**Bid rotation**

- **Stage:** Award
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Bidder, Market

#### Definition

Bidders take turns in being the winner.

#### Why is this a red flag?

Members of a collusive bidding scheme can agree to rig the bidding process in order to allow each member of the group to win a contract at an inflated price on a rotating basis.

#### Required data fields

```
-Bidders details
-Bis status
-Winning bidder
-Bid values
-Item classification (to define markets)
```

#### OCDS fields

```
bids/details/tenderers/id, bids/details/tenderers/name,
awards/suppliers/id,
awards/suppliers/name, bids/details/value/amount, bids/details/value/currency,
awards/items/classification/id AND
awards/items/classification/scheme

Tender or contract items could be used instead
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/tenderers[]/id` | yes |
| `/bids/details[]/tenderers[]/name` | yes |
| `/awards[]/suppliers[]/id` | yes |
| `/awards[]/suppliers[]/name` | yes |
| `/bids/details[]/value/amount` | yes |
| `/bids/details[]/value/currency` | yes |
| `/awards[]/items[]/classification/id` | yes |
| `/awards[]/items[]/classification/scheme` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Bid rotation” in Empirical Methods for Detecting Bid-rigging Cartels, Guidelines for detecting bid rigging in public procurement, Using Bid Rotation and Incumbency to Detect Collusion: A Regression Discontinuity Approach

---

### R058

**Heavily discounted bid**

- **Stage:** Award
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process, Bidder

#### Definition

The percentage difference between the winning bid and the second-lowest valid bid is a high outlier.

#### Why is this a red flag?

An unethical bidder can offer defective goods ("lemons") if the buyer has inadequate quality criteria.

#### Required data fields

```
-Bid id
-Bid status
-Bid values
-Winning bidder
```

#### OCDS fields

```
bids/details/id,
bids/details/value/amount, bids/details/value/currency, bids/details/status,
To identify winning bid:
bids/details/tenderers/id and awards/suppliers/id
OR awards/relatedBid
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/bids/details[]/id` | yes |
| `/bids/details[]/value/amount` | yes |
| `/bids/details[]/value/currency` | yes |
| `/bids/details[]/status` | yes |
| `/awards[]/relatedBid` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on "The price offered by the winning bidder is significantly lower than the price offered by the rest of the bidders" in Fraud in Public Procurement: A collection of Red Flags and Best Practices, "Difference between lowest and second lowest bid prices" in Assessing the potential for detecting collusion in Swedish public procurement, and The Market for "Lemons": Quality Uncertainty and the Market Mechanism.

---

### R059

**Large difference between the award value and final contract amount**

- **Stage:** Contract implementation
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

The difference between the award and final contract value exceeds a threshold.

#### Why is this a red flag?

A high difference between the award value and contract value can signal inefficient contracting processes and poorer value for money. Increases in the price before the contract is signed should be reviewed carefully since it can signal the supplier is trying to generate unjustified profits. It can also be a sign of potential corruption where the contract is awarded to a favored bidder for a lower price, and then the price increases after negotiations.

#### Required data fields

```
-Award and contract amounts and currencies
-Award and contract status
```

#### OCDS fields

```
awards/id, awards/status, awards/value/amount, awards/value/currency, contracts/awardID, contracts/value/amount, contracts/value/currency, contracts/status

Note: the winning bid price could be used instead of the award value, if it's not available.
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/awards[]/id` | yes |
| `/awards[]/status` | yes |
| `/awards[]/value/amount` | yes |
| `/awards[]/value/currency` | yes |
| `/contracts[]/awardID` | yes |
| `/contracts[]/value/amount` | yes |
| `/contracts[]/value/currency` | yes |
| `/contracts[]/status` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Difference between contract award and final contract amount” in ‘Red Flags of Corruption’ in World Bank Projects An Analysis of Infrastructure Contracts

---

### R060

**Long time between award date and contract signature date**

- **Stage:** Contract implementation
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process, Bidder

#### Definition

Time interval between award date and contract signing date is above threshold value.

#### Why is this a red flag?

Project officials might find it difficult to justify the award of a contract to a preferred bidder under the procurement rules and delay the award as they attempt to create a justification. The preferred winning bidder and project officials might also be engaged in extended negotiations over the terms of bribe demands, such as the amounts and payment schedules. Finally, project officials might deliberately delay the award beyond the bid validity period in order to support the disqualification of all bidders and the need for re-bidding (IACRC, 2012).

#### Required data fields

```
Award date

Contract signature date

Procurement method
```

#### OCDS fields

```
awards/date, contracts/dateSigned, tender/procurementMethod
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/awards[]/date` | yes |
| `/contracts[]/dateSigned` | yes |
| `/tender/procurementMethod` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on Long Delays in Contract Negotiations or Award in Guide to Combating Corruption & Fraud in Development Projects .

---

### R061

**Decision period extremely short**

- **Stage:** Award
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

Time interval between bid evaluation and award date is below threshold value.

#### Why is this a red flag?

A short decision period can reflect a premeditated assessment, to favor a particular contractor.

#### Required data fields

```
-Tender end date (or bid evaluation start date)
-Award date
-Procurement method
```

#### OCDS fields

```
tender/tenderPeriod/endDate, awards/date, tender/procurementMethod
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/tenderPeriod/endDate` | yes |
| `/awards[]/date` | yes |
| `/tender/procurementMethod` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Length of decision period” in Uncovering High-Level Corruption: Cross-National Corruption Proxies Using Government Contracting Data

---

### R062

**Decision period extremely long**

- **Stage:** Award
- **Type of red flag:** Bid rigging
- **Unit of analysis:** Contracting process

#### Definition

Time interval between bid evaluation and award date is above threshold value.

#### Why is this a red flag?

A long decision period can reflect a premeditated assessment, to favor a particular contractor and signal extensive legal challenge to the tender. For instance, officials might be negotiating with the preferred bidder, attempting to create a justification to award the contract or disqualify other bids.

#### Required data fields

```
-Tender end date (or bid evaluation start date)
-Award date
-Procurement method
```

#### OCDS fields

```
tender/tenderPeriod/endDate, awards/date, tender/procurementMethod
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/tenderPeriod/endDate` | yes |
| `/awards[]/date` | yes |
| `/tender/procurementMethod` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Length of decision period” in Uncovering High-Level Corruption: Cross-National Corruption Proxies Using Government Contracting Data

---

### R063

**Contract is not published**

- **Stage:** Contract implementation
- **Type of red flag:** Low transparency
- **Unit of analysis:** Contracting process

#### Definition

Contract document is not published.

#### Why is this a red flag?

A higher rate of awards without contract information may signal a lack of integrity. No contract can signal that the interaction between the bidders and buyer is not transparent, and relevant interested parties cannot monitor the process.

#### Required data fields

```
-Contract document
-Contract status
```

#### OCDS fields

```
contracts/documents/documentType = contractSigned
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/contracts[]/documents[]/documentType` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Award contract and selection documents not all public” in Corruption in Public Procurement: Finding the Right Indicators

---

### R064

**Contract has modifications**

- **Stage:** Contract implementation
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process

#### Definition

Contract has amendments.

#### Why is this a red flag?

Once the contract is signed, amendments or change orders can be made. While this may be legitimate in some cases, change orders can be manipulated to facilitate corruption or fraud.

#### Required data fields

```
-Contract amendments
-Contract status
```

#### OCDS fields

```
contracts/status, contracts/amendments/description
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/contracts[]/status` | yes |
| `/contracts[]/amendments[]/description` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Changes in contract terms and value” in Warning signs of Fraud and Corruption in Public procurement and “Contract modification” in “An Objective Corruption Risk Index Using Public Procurement Data”

---

### R065

**Contract amendments to reduce line items**

- **Stage:** Contract implementation
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process

#### Definition

Contract modifications issued after contract award, reducing or deleting items.

#### Why is this a red flag?

Once the contract is signed, amendments or change orders can be made. While this may be legitimate in some cases, change orders can be manipulated to facilitate corruption or fraud.

#### Required data fields

```
-Contract amendments
-Items classification
-Contract status

Optional: Item quantity
```

#### OCDS fields

```
contracts/status, contracts/amendments/description, contracts/amendments/rationale

Optional:
contracts/items/id, contracts/items/quantity,
contracts/items/classification/id, contracts/items/classification/scheme,
awards/items/id,awards/items/quantity,
awards/items/classification/id, awards/items/classification/scheme
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/contracts[]/status` | yes |
| `/contracts[]/amendments[]/description` | yes |
| `/contracts[]/amendments[]/rationale` | yes |
| `/contracts[]/items[]/id` | no |
| `/contracts[]/items[]/quantity` | no |
| `/contracts[]/items[]/classification/id` | no |
| `/contracts[]/items[]/classification/scheme` | no |
| `/awards[]/items[]/id` | no |
| `/awards[]/items[]/quantity` | no |
| `/awards[]/items[]/classification/id` | no |
| `/awards[]/items[]/classification/scheme` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Changes in contract terms and value” in Warning signs of Fraud and Corruption in Public procurement.

---

### R066

**Contract amendments to increase line items**

- **Stage:** Contract implementation
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process

#### Definition

Contract modifications issued after contract award, increasing items.

#### Why is this a red flag?

Once the contract is signed, amendments or change orders can be made. While there are cases where this can be legitimate, these can be manipulated to facilitate corruption or fraud.

#### Required data fields

```
-Contract amendments
-Items classification
-Contract status

Optional: Item quantity and award or tender items
```

#### OCDS fields

```
contracts/status, contracts/amendments/description, contracts/amendments/rationale

Optional:
contracts/items/id, contracts/items/quantity,
contracts/items/classification/id, contracts/items/classification/scheme,
awards/items/id,awards/items/quantity,
awards/items/classification/id, awards/items/classification/scheme
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/contracts[]/status` | yes |
| `/contracts[]/amendments[]/description` | yes |
| `/contracts[]/amendments[]/rationale` | yes |
| `/contracts[]/items[]/id` | no |
| `/contracts[]/items[]/quantity` | no |
| `/contracts[]/items[]/classification/id` | no |
| `/contracts[]/items[]/classification/scheme` | no |
| `/awards[]/items[]/id` | no |
| `/awards[]/items[]/quantity` | no |
| `/awards[]/items[]/classification/id` | no |
| `/awards[]/items[]/classification/scheme` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Changes in contract terms and value” in Warning signs of Fraud and Corruption in Public procurement.

---

### R067

**Delivery failure**

- **Stage:** Contract implementation
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process

#### Definition

Supplier fail to deliver any goods, work or service on time.

#### Why is this a red flag?

Evidence shows that failure to deliver goods and services, or delivering low quality goods is a strong signal of corruption in the contracting process.

#### Required data fields

```
-Contract implementation details
-Contract milestones due date and delivery date
```

#### OCDS fields

```
contracts/implementation/milestones/type = delivery, contracts/status,
contracts/implementation/milestones/dueDate
contracts/implementation/milestones/dateMet
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/contracts[]/implementation/milestones[]/type` | yes |
| `/contracts[]/status` | yes |
| `/contracts[]/implementation/milestones[]/dueDate` | yes |
| `/contracts[]/implementation/milestones[]/dateMet` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Failure to Meet Contract Specifications” in Guide to Combating Corruption & Fraud in Development Projects

---

### R068

**Contract transactions exceed contract amount**

- **Stage:** Contract implementation
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process

#### Definition

Total payments to a contractor exceed the initial contract amount.

#### Why is this a red flag?

Increases in the initial contract value and/or prices of items could signal potential corruption. Cost overruns could also be a result of inefficiencies in the process or bad planning.

#### Required data fields

```
Contract value,
Contract implementation transactions amount
```

#### OCDS fields

```
contracts/value/amount, contracts/value/currency,
(contracts/implementation/transactions/value/amount,
contracts/implementation/transactions/value/currency) OR
contracts/implementation/finalValue/amount,
contracts/implementation/finalValue/currency

See Contract completion
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/contracts[]/value/amount` | yes |
| `/contracts[]/value/currency` | yes |
| `/contracts[]/implementation/finalValue/amount` | yes |
| `/contracts[]/implementation/finalValue/currency` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Inflated invoices” in Guide to Combating Corruption & Fraud in Development Projects

---

### R069

**Contract amendments to increase price**

- **Stage:** Contract implementation
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process

#### Definition

Contract modifications issued after contract award, increasing the price.

#### Why is this a red flag?

Once the contract is signed, amendments or change orders can be made. While this can be legitimate in some cases, change orders can be manipulated to facilitate corruption or fraud.

#### Required data fields

```
-Contract amendments
-Contract status

Optional: contract and award amounts
```

#### OCDS fields

```
contracts/status, contracts/amendments/description, contracts/amendments/rationale

Optional:
contracts/value/amount,
awards/value/amount
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/contracts[]/status` | yes |
| `/contracts[]/amendments[]/description` | yes |
| `/contracts[]/amendments[]/rationale` | yes |
| `/contracts[]/value/amount` | no |
| `/awards[]/value/amount` | no |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Changes in contract terms and value” in Warning signs of Fraud and Corruption in Public procurement and “Questionable Contract Amendments” in Guide to Combating Corruption & Fraud in Development Projects .

---

### R070

**Losing bidders are hired as subcontractors**

- **Stage:** Contract implementation
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process

#### Definition

Losing bidders are hired as subcontractors

#### Why is this a red flag?

While subcontracting may be legitimate, it can be used as a form of rent sharing in a collusive scheme.

#### Required data fields

```
-Bidders information
-Subcontractors information
```

#### OCDS fields

```
tender/tenderers/id OR parties/roles = tenderer AND parties/id OR bids/details/tenderers/id AND bids/details/tenderers/name,
contracts/relatedProcesses
contracts/relatedProcesses/relationship = ‘subContract’
awards/suppliers/id

See Related process
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/tender/tenderers[]/id` | yes |
| `/parties[]/roles` | yes |
| `/bids/details[]/tenderers[]/id` | yes |
| `/contracts[]/relatedProcesses` | yes |
| `/contracts[]/relatedProcesses/relationship` | yes |
| `/awards[]/suppliers[]/id` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Prevalence of subcontracting” in Toolkit for detecting collusive bidding in public procurement and “Bidding patterns” in Warning signs of Fraud and Corruption in Public procurement.

---

### R071

**A contractor subcontracts all or most of the work received**

- **Stage:** Contract implementation
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Contracting process

#### Definition

A subcontractor or subcontractors receive more than 50% of contract payment

#### Why is this a red flag?

While subcontracting may be legitimate, it can be used as a form of rent sharing in a collusive scheme.

#### Required data fields

```
-Subcontracting details
```

#### OCDS fields

```
awards/hasSubcontracting = true, awards/subcontracting/minimumPercentage OR awards/subcontracting/value/amount AND awards/value/amount
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/awards[]/hasSubcontracting` | yes |
| `/awards[]/subcontracting/minimumPercentage` | yes |
| `/awards[]/subcontracting/value/amount` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Prevalence of subcontracting” in Toolkit for detecting collusive bidding in public procurement

---

### R072

**High prevalence of subcontracts**

- **Stage:** Contract implementation
- **Type of red flag:** Collusion risks
- **Unit of analysis:** Buyer, Market

#### Definition

The ratio of contracting processes with subcontracts to total contracting processes is a high outlier per buyer or market

#### Why is this a red flag?

While subcontracting can be legitimate, it may be used as a form of rent sharing in a collusive scheme.

#### Required data fields

```
-Subcontracting details
-Buyer information
-Items information
```

#### OCDS fields

```
awards/hasSubcontracting = true, tender/procuringEntity/name OR buyer/name OR parties/id and parties/name with parties/roles=buyer

To calculate by market:
tender/items/classification/id (award or contract items could be used instead)
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/awards[]/hasSubcontracting` | yes |
| `/tender/procuringEntity/name` | yes |
| `/buyer/name` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Prevalence of subcontracting” in Toolkit for detecting collusive bidding in public procurement

---

### R073

**Discrepancies between work completed and contract specifications**

- **Stage:** Contract implementation
- **Type of red flag:** Fraud
- **Unit of analysis:** Contracting process

#### Definition

The work completed or goods or services delivered do not fulfill the initial tender or contract specifications.

#### Why is this a red flag?

Low quality or undelivered goods, works or services can be a strong indicator of fraud and corruption.

#### Required data fields

```
-Contract specifications.
-Documents and reports about the delivery
```

#### OCDS fields

```
contracts/status, contracts/documents/documentType=contractSigned, contracts/implementation/documents/documentType=’completionCertificate’ OR ‘physicalProgressReport’, ‘finalAudit’
```

#### Parsed paths (for app pack)

| Path | Required |
|------|----------|
| `/contracts[]/status` | yes |
| `/contracts[]/documents[]/documentType` | yes |
| `/contracts[]/implementation/documents[]/documentType` | yes |

#### Methodology

See Red flags Guide Annex for full methodology

#### Source

Based on “Failure to Meet Contract Specifications” in Guide to Combating Corruption & Fraud in Development Projects .

---


*Generated by `scripts/build_ocp_red_flags_pack.py`.*
