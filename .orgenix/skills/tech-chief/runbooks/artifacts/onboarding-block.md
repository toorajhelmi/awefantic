# Runbook: Greenfield Onboarding Block

## Purpose

The single consolidated checklist of every real-time founder action required to start a greenfield project (`chief-of-tech-operating-doc.md` §5.2). Produced by the `greenfield-onboarding` phase runbook and routed to the founder through CoS. One per project, replaced (not amended) when the project's account surface materially changes.

## When to use

Project start (greenfield). Also when an existing project takes on a new identity-bearing account (e.g., first payment processor, first app store account, first regulated registration) — those additions get their own batched onboarding pass rather than ad-hoc real-time blocks.

## Location

`docs/operations/onboarding-block.md`. The CoS-routed founder-facing artifact; pairs with `docs/operations/critical-accounts.md` (the persistent inventory).

## Required fields

| Field | Notes |
|---|---|
| `project` | The project this onboarding pass covers. |
| `produced_by` | The CoT instance producing the block. |
| `produced_at` | Timestamp. |
| `goal` | One paragraph: what the founder achieves by completing this block. |
| `risk_thresholds_ref` | Link to `knowledge/risk-thresholds.md` (§3). Created in this pass if it does not exist. |
| `account_creation_items` | Numbered list of accounts the founder must create. Each item lists: service, why it's needed, what the founder does, where the credentials are stored after creation, and the §11.1 row or ADR that drove the choice. |
| `credential_handover_items` | Numbered list of API keys / tokens the founder must hand to CoT's vault. Each item lists: service, what scope, where it goes in the vault, and what work it unblocks. |
| `statutory_registrations` | Numbered list of legal-entity actions (VAT/OSS, sales-tax nexus, business licenses, DSAR contact). Each item lists: jurisdiction, action, deadline, and what it unblocks. |
| `domain_decisions` | Domain candidates proposed by CoT, with the founder's pick highlighted; registrar; purchase mode (founder's billing instrument vs. CoT-with-founder-vault). |
| `policy_decisions` | Items that need a founder-level policy decision before downstream artifacts are produced: acceptable-use posture for UGC; refund/dispute posture; data-retention defaults; KPI definitions and target-user clarifications. |
| `out_of_scope` | What is explicitly deferred to later onboarding passes. |
| `estimated_founder_time` | A best-faith estimate per section. |

## Conditional fields

| Condition | Required field |
|---|---|
| Project involves mobile | `apple_asc_section`, `google_play_section`: full sub-checklists per `phases/go-live-mobile.md`. |
| Project involves payments | `payment_processor_section`: business identity, banking, processor mode, webhook handover. |
| Project involves UGC | `moderation_policy_section`: acceptable-use draft for the founder to confirm via CoS; T&S posture; CSAM reporting contact if jurisdiction requires (US §2258A). |
| Project involves PII | `dsar_contact_section`: legal contact for DSAR / data-subject requests. |
| Project ships in multiple jurisdictions | `i18n_legal_section`: which jurisdictions are in scope; which require statutory registrations. |

## Anti-patterns

- Surfacing onboarding items one at a time during the project (each becomes a separate real-time block; §5.2 prohibits this for greenfield).
- Skipping the `policy_decisions` section because the items "feel like product decisions" — strategic policy belongs in the onboarding block; downstream artifacts depend on them (§5.2 ambiguous-strategic-inputs clause).
- Estimating founder time as "an hour" without per-section breakdown.
- Embedding a Review Agent rubric inside the artifact (rubrics live only in runbook files; §7.2).

## Short structure

```markdown
# Onboarding Block — <project>

Produced by: cot-2026-05-26-001
Produced at: 2026-05-26
Goal: Stand up all identity-bearing accounts, credentials, and policy decisions required to ship v1 of <project>.
Risk thresholds: see knowledge/risk-thresholds.md.

## Account creation (~45 min)
1. Apple Developer Program — required for iOS submission. ...
2. Google Play Console — required for Android submission. ...
3. Stripe account — required for paid plans. ...
...

## Credential handover (~15 min)
1. Stripe restricted key (subscriptions + customers scope) → vault://covu/stripe-prod ...
2. ...

## Statutory registrations
1. EU VAT OSS — required if EU customers exceed €10k/year ...

## Domain
Candidates: <a>, <b>, <c>. CoT recommends <a> ...

## Policy decisions
- Acceptable-use posture (UGC): ...
- Refund posture: ...
- KPI clarifications: ...

## Out of scope
- DSAR runbook (next onboarding pass when first PII feature ships)
- Apple Sign-In (required by §4.8 once any third-party social sign-in is offered)

Estimated founder time: ~90 min total.
```

---

## Review Agent rubric

- Are all sections that the project triggers actually populated (mobile, payments, UGC, PII, i18n)?
- Is every account creation item paired with a clear "why" and a §11.1 / ADR reference?
- Are credential handover items scoped (least-privilege keys), not "give CoT a root key"?
- Is `risk_thresholds_ref` present and the file actually created?
- Are policy decisions framed as choices (with CoT's recommendation), not just open questions?
- Are statutory registrations specific (jurisdiction, action, deadline), not "consult a lawyer"?
- Are domain candidates listed (3 minimum) with CoT's recommendation?
- Is `estimated_founder_time` per-section, not lump-sum?
- Does the block avoid embedding a rubric (rubrics live only in runbook files)?
- Is every later real-time block in §5.2 either covered here or explicitly deferred in `out_of_scope`?
