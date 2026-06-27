# Risk Thresholds

> **Status**: Project-level safe defaults. Referenced by `knowledge/chief-of-tech-operating-doc.md` §3, §5.2, and §5.3. Override per project via an ADR; never edit this file without a paired ADR linking back.

The thresholds below decide which side of three lines a decision falls on:

- **Real-time block (§5.2)** — work on the dependent path stops; CoT reports `block` and the parent/delegator chain routes any founder action to CoS.
- **Out-of-cycle Operating Assumption (§5.3, `surfacing: out_of_cycle`)** — CoT proceeds, but routes the notice to CoS ahead of the periodic summary.
- **Next-batch Operating Assumption (§5.3, `surfacing: next_batch`)** — CoT proceeds; the assumption appears in the next CoS-routed summary.

If a decision matches more than one row, the strictest tier wins.

---

## 1. Money / Cost

| Threshold | Tier | Notes |
|---|---|---|
| Monthly cost line on a paid service that could exceed **10× its stated budget** at the documented max-volume | real-time block | The cost line's `aggregate_per_month` (per-unit cap × max documented volume) exceeds 10× the budget. Reduce the cap or route for founder sign-off through CoS before continuing. |
| Monthly cost line that could exceed **3× its stated budget** but ≤10× | out-of-cycle | Surface within 24h. |
| Monthly cost line that fits within the stated budget at max-volume | next-batch | Recorded as an OA only if the line is new or the cap changed materially. |
| Any individual non-recurring spend ≥ **$500** (project credit-card transaction, vendor commit, paid migration tooling) | real-time block | The founder authorizes the charge via CoS. |
| Any individual non-recurring spend ≥ **$100** but < $500 | out-of-cycle | Surface within 24h. |
| Any commitment to a paid plan with **annual prepayment** | real-time block | The founder owns the commitment. |

Override rule: a project ADR may raise the cost thresholds if the user has set a higher monthly budget envelope. The override must reference the budget ADR and not silently exceed it.

Payment handling rule: chiefs act through connected vendor tools when available.
They may collect the minimum required non-secret transaction details in chat,
explain why each detail is needed, and use those details only for the relevant
tool call. Chiefs never ask for raw credit card details, passwords, one-time
codes, private keys, or other secrets that belong in the vendor UI. If a vendor
charge is needed, first check payment-method readiness through the connected
vendor account when the API/tool exposes it. If billing is missing or cannot be
verified, route the founder to add payment in that vendor's UI and stop before
purchase. Execute a charge only after explicit founder approval of the exact
vendor, item, price, term, renewal setting, and ownership/contact details.
Verify the external outcome before treating the work as complete.

## 2. Irreversibility / Blast radius

| Threshold | Tier | Notes |
|---|---|---|
| `reversibility = one-way` AND `blast_radius ∈ {system, live_users, strategic}` | real-time block | Cannot be reversed; affects users or strategy. The founder must sign off via CoS. |
| `reversibility = one-way` AND `blast_radius ∈ {module, local}` | out-of-cycle | Cannot be reversed but contained. |
| `reversibility = effect-one-way` AND `blast_radius ∈ {system, live_users, strategic}` | out-of-cycle | Decision is reversible but effects produced under it (data deleted, emails sent, payments processed) are not. Surface within 24h with the planned mitigation. |
| `reversibility = hard` AND `blast_radius ∈ {live_users, strategic}` | out-of-cycle | Reversible but expensive. |
| Anything else | next-batch | Default. |

## 3. Consumer protection / product claims

| Threshold | Tier | Notes |
|---|---|---|
| Any public claim that **contradicts current product behavior** (pricing, availability, performance, health, financial, accessibility) | real-time block | The founder owns the claim. Ship the corrected version; route the divergence via CoS (§5.1 precedence). |
| Any new public claim in a **regulated category** (health, financial, professional advice, accessibility, environmental, employment) | real-time block | The founder approves the wording via CoS. |
| New marketing copy that **changes a pricing or guarantee statement** | out-of-cycle | Surface within 24h even if the claim is consistent with product behavior. |
| New marketing copy that does not change a claim (rewording, layout, A/B variant on tone) | next-batch | Default. |

## 4. Security / Privacy / Compliance

| Threshold | Tier | Notes |
|---|---|---|
| Any decision creating a **net-new processing of regulated PII** (special-category data: health, race, religion, biometrics, precise location for non-functional purpose, minors) | real-time block | The founder owns the processing lawful-basis decision; route through CoS. |
| Any **new third-party data processor** receiving PII | out-of-cycle | DPA in place before live; processor inventory updated. |
| Decision affecting **data-subject rights** (DSAR turnaround, deletion semantics, export format, retention) where defaults from `runbooks/domains/privacy-dsar.md` do not directly apply | out-of-cycle | Surface within 24h. |
| Any change to **auth scope, permissions, or token lifetime** affecting live users | out-of-cycle | Surface within 24h with a rollback plan. |
| Adoption of a new **encryption-at-rest** key surface or KMS | out-of-cycle | |
| Any decision touching **CSAM, NCMEC, or other mandatory legal reporting** procedure | real-time block | The founder holds the reporting contact and legal liability; route through CoS. |
| Routine security choices within accepted runbooks (rotation cadence, alert thresholds within policy, dependency updates) | next-batch | Default. |

## 5. Legal entity / Identity

| Threshold | Tier | Notes |
|---|---|---|
| Creating or modifying a **legal entity, banking, or tax registration** | real-time block | The founder is the legal owner. |
| **Statutory registration** thresholds (VAT/OSS, sales-tax nexus, business licenses) crossed in the last reporting period | real-time block | The founder files; route through CoS. |
| Onboarding a **paid SaaS account** in the founder's identity (Stripe, App Store Connect, Google Play, domain registrar, etc.) | real-time block | Bundled into the greenfield onboarding block where possible and routed through CoS. |
| Renewal of an existing critical account | next-batch | Default, unless the renewal involves price change > 20% (then out-of-cycle). |

## 6. Strategic scope

| Threshold | Tier | Notes |
|---|---|---|
| **KPI definition, target user, or success criteria** is ambiguous in a way that will shape downstream artifacts | real-time block | §5.2 ambiguous-strategic-inputs clause. CoT proposes interpretations and the user picks. |
| **Stack-segment change** (e.g., consumer vs. B2B, free vs. paid, regional vs. global) implied by a tech decision | real-time block | Escalate to CoY in parallel. |
| Pivot of a **roadmap row** that was previously communicated to the user | out-of-cycle | |
| Internal naming, defaults, copy that does not change strategic posture | next-batch | Default. |

## 7. Recovery / Operational

| Threshold | Tier | Notes |
|---|---|---|
| Loss of access to a `tier: gating` critical account, with no working recovery path | real-time block | Founder action is needed even with vaults in place; route through CoS. |
| Routine secret rotation (cadence per §P11) | next-batch | Default. |
| First-time configuration of a new monitoring or on-call tool | next-batch | Default. |

---

## How to override

A project may need different thresholds — e.g., a B2B project with a higher cost envelope, or a healthcare project with stricter PII handling.

To override:

1. Write an ADR titled `XXXX-risk-thresholds-override.md` that lists exactly which rows above are being overridden and the new value.
2. The ADR is reviewed by the Review Agent under the `adr.md` rubric.
3. The new values become the project's effective thresholds; this file remains the document-system-wide default.
4. Periodic summaries reference the override ADR whenever a threshold is hit.

Never edit this file without a paired override ADR. Edits without ADRs are caught by the §8 hygiene audit.

---

## Cross-references

- `knowledge/chief-of-tech-operating-doc.md` §3 (modifier table), §5.1 (verification-vs-operate precedence), §5.2 (real-time blocks), §5.3 (Operating Assumptions and `surfacing`).
- `runbooks/artifacts/operating-assumption.md` (the `surfacing` field maps to the tiers here).
- `runbooks/artifacts/onboarding-block.md` (the greenfield onboarding pass uses this file's defaults; an explicit override ADR can adjust them).
