# Runbook: Cross-Artifact Consistency Check

## Purpose

The written record of the §7.3 cross-artifact consistency check that CoT runs on every multi-artifact change set before submitting it to the Review Agent. The check is itself a first-class artifact — not a checklist in CoT's head — so the reviewer (and a future CoT) can audit *what was checked, against what, with what result.*

## When to use

Every multi-artifact change set at L3 and above. A multi-artifact change set is any task whose output includes two or more of: spec, ADR, API contract, verification plan, mockups, monitoring plan, Operating Assumptions, task specs.

## Location

`docs/product/<feature-slug>/cross-artifact-consistency-check.md`. One file per change set. Replaces nothing else; it sits alongside `plan-summary.md` and is referenced from it.

## Required fields

| Field | Notes |
|---|---|
| `task` | The task this check covers. |
| `change_set` | The list of artifacts in scope, with their current verdict status (`approved`/`approve_with_notes`/`request_changes`/`pending`). |
| `rolled_up_verdict` | One of `pass` / `pass_with_notes` / `fail`. The roll-up rule: any item `fail` → set is `fail`; any item `pass_with_note` and no `fail` → set is `pass_with_notes`; all `pass` → set is `pass`. |
| `items` | The numbered list below. Each row carries its own verdict, the evidence cited, and the explicit defect (if any). |

## Required items (every L3+ change set checks all of these)

For each item below, the artifact records: the verdict (`pass` / `pass_with_note` / `fail`), the artifacts compared, the specific evidence (file paths + section refs or line ranges), and — if not `pass` — the defect found and the corrective action.

1. **Field-name parity** — status enums, identifier shapes, error codes, event names match across spec, API contract, verification plan, monitoring plan, and any mockup interaction map.
2. **Threshold parity** — numeric thresholds (latency budgets, retention windows, rate limits, cost caps, retry counts, percentiles) match across spec, ADR(s), verification plan, monitoring plan, and any cost-related artifact.
3. **Failure-mode coverage** — every `failure_mode_id` declared in the product spec appears in the verification plan's `failure_mode_coverage` table with a verification scenario, a monitoring rule, or an explicit `accepted_silent` rationale (no `?` cells, no orphan ids).
4. **Event producer/consumer pairing** — every event named in the spec has at least one producer (an endpoint or job that emits it) and at least one consumer (a test, a metric, or another artifact that depends on it). Orphans on either side are a defect.
5. **Event producer-set agreement** — for every event, the *set* of producers named in the Operating Assumption that binds the event matches the set named in the API contract, the spec, and the verification plan. One-producer-named-in-one-place-and-two-in-another is a defect, not a wording difference.
6. **Endpoint inventory** — every API endpoint referenced in the verification plan, monitoring plan, mockup interaction map, or task spec exists in the API contract; every endpoint in the contract is either exercised by the verification plan or marked `out_of_scope_v1` with a successor task reference. No `(reserved)` / `TBD` placeholders in the contract (per `api-contract.md` exhaustiveness rule).
7. **Alert ↔ metric source** — every alert in the monitoring plan references a metric that the spec or API contract actually produces.
8. **String-id agreement** — every string id referenced by a mockup interaction map or accessibility map appears in the canonical copy/strings artifact (no orphan ids on either side).
9. **Spec ↔ ADR agreement** — every claim the spec makes about behavior governed by an ADR (permissions, RLS, data lifecycle, rate limits) matches the ADR. Where the spec is read-only on an ADR-governed concern, it references the ADR.
10. **Monitoring ↔ spec/ADR alert basis** — every alert in the monitoring plan that exists because of a stated behavior (SLO, rate-limit policy, retention) traces back to the spec or ADR that justifies it.
11. **Performance budget presence** — if the spec states any p-percentile target, the verification plan carries a `performance_budget` block with methodology (corpus, warm-up, percentile, run count, environment).
12. **Cost-guard coherence** — every per-unit cost cap × the documented max-volume fits the stated monthly budget for that line (verification plan `aggregate_cost_guard`); per-line monitoring items sum to ≤ the stated total monthly budget.
13. **Index parity** — every ADR file in `adr/` is listed in `adr/INDEX.md`; every Operating Assumption file in `assumptions/` is listed in `assumptions/INDEX.md`; every artifact in the change set is listed in `plan-summary.md`.
14. **Rubric isolation** — no producer artifact in the change set embeds a Review Agent rubric (rubrics live only in runbook files; §7.2, §13).
15. **Roadmap ↔ workflow agreement** — if the spec carries a v1/later roadmap, every primary workflow in the spec is either in v1 or has a roadmap row that calls it out as deferred.
16. **`revisit_when` presence** — every ADR and Operating Assumption in the change set has a non-empty `revisit_when` field (which may be `none`).

## Conditional items

| Condition | Additional item |
|---|---|
| Sweep modifier applied | **Sweep inventory parity** — every asset listed in the sweep inventory is in the PR change set; every changed asset is in the sweep inventory. |
| Novel-area work in scope | **POC ↔ ADR parity** — every adopted ADR in the change set has a POC plan whose acceptance criteria the ADR cites; every POC with a `decision_recipe: adopt` outcome has a corresponding ADR. |
| Mobile in scope | **Privacy-disclosure parity** — the Apple App Privacy / Google Data Safety entries match the data categories the spec declares the app collects. |
| UGC in scope | **Moderation-runbook parity** — the moderation posture declared in the spec matches `domains/moderation.md` (or an ADR overrides it). |
| PII in scope | **Lawful-basis parity** — every personal-data flow in the spec has a recorded lawful basis (per `domains/privacy-dsar.md`). |
| Payments in scope | **Reconciliation parity** — every external state that the spec declares CoT depends on has a reconciliation job declared in the monitoring plan (per `domains/payments.md`). |

## Anti-patterns

- A consistency check whose items all read "pass" without naming the artifacts compared or citing the evidence.
- Skipping items as "N/A" without a one-line reason.
- Treating the check as a post-hoc summary after the Review Agent has already run.
- Submitting a `pass_with_notes` set where the note is "I'll fix this in the next PR" without an open follow-up task.
- Embedding a Review Agent rubric inside this artifact (rubrics live only in runbook files).
- Letting the check drift from §7.3 — if §7.3 changes, the required-items list here changes too.

## Short structure

```markdown
# Cross-artifact consistency check — <feature-slug>

Task: task/<slug>
Rolled-up verdict: pass_with_notes

| # | Item | Verdict | Compared artifacts | Evidence | Defect / Note |
|---|---|---|---|---|---|
| 1 | Field-name parity | pass | spec.md, api.md, verification.md, monitoring-plan.md | spec.md §status, api.md §enum, verification.md §AC-3 | — |
| 5 | Event producer-set agreement | fail | A-010, api.md §3, spec.md §workflow-5, verification.md §side_effect_tests | A-010 names one producer; api.md and spec.md name two | Fix A-010 to name both PATCH /me and PUT /commit. |
...
```

---

## Review Agent rubric

- Is the change set actually multi-artifact (≥2 of spec, ADR, API contract, verification, mockups, monitoring)?
- Is the rolled-up verdict consistent with the per-item verdicts (any `fail` → `fail`; any `pass_with_note` → `pass_with_notes`)?
- Does every required item (1–16) have a verdict, the compared artifacts named, and explicit evidence cited?
- For items marked `pass`, is the evidence actually verifiable (file path + section ref or line range)?
- For items marked `pass_with_note`, is the note an honest declaration (e.g., "metric is manual-canary until v2") or a hidden defect?
- For items marked `fail`, is the defect specific and is the corrective action listed?
- Are all conditional items that apply to this change set present?
- Does the check itself avoid embedding a Review Agent rubric?
- Is the check referenced from `plan-summary.md`?
- Independent spot-check: pick three `pass` items and verify them against the cited evidence. If any are wrong, the check itself fails.
