# Runbook: Operating Assumption Record

## Purpose

Capture every decision CoT made on behalf of the founder without explicit founder input, so it can be reviewed, challenged, and overridden later through CoS (`chief-of-tech-operating-doc.md` §5.3).

## When to use

Whenever CoT chooses between options for anything that previously would have asked the founder, except for items in §5.2 (which block through the parent/delegator chain instead).

## Location

One file per assumption under `docs/assumptions/`, named `YYYY-MM-DD-<short-slug>.md`. Indexed by task tree.

## Required fields

| Field | Notes |
|---|---|
| `id` | Stable, project-unique (e.g., `A-2026-05-26-001`). |
| `timestamp` | When the decision was taken. |
| `task` | Link or reference to the task in the task tree. |
| `decision` | The choice taken, in one sentence. |
| `options_considered` | At least the chosen option plus one alternative, even if the alternative was "do nothing". |
| `rationale` | Why this option, why not the others. Cite evidence (links, runbook references, numbers). |
| `reversibility` | `easy` (revertible in a PR) / `hard` (requires migration, customer comms) / `one-way` (data, integrations, commitments that can't be undone) / `effect-one-way` (the decision itself is `easy` or `hard` to reverse, but cumulative effects produced under it are `one-way` — e.g., data already deleted under a retention policy, emails already sent, payments already processed). |
| `blast_radius` | `local` / `module` / `system` / `live_users` / `strategic`. |
| `confidence` | `high` / `medium` / `low`. |
| `surfacing` | `next_batch` (default; included in the periodic summary) / `out_of_cycle` (routed to CoS ahead of the next periodic summary; reserved for `live_users` or `strategic` blast radius, `one-way`/`effect-one-way` reversibility, decisions made under §5.1 verification-vs-operate precedence, or any item exceeding the configured risk threshold) / `real_time_block` (the decision turned out to require founder action and is blocked through the parent/delegator chain). |
| `review_status` | `pending` / `pending_user_batch` / `resolved_real_time` (the founder resolved it through CoS at the moment of recording, e.g., during a chat turn) / `confirmed` / `overridden` / `superseded`. |
| `revisit_when` | An explicit trigger that should cause this assumption to be re-evaluated (e.g., "p95 search latency > 200ms at >50k corpus", "monthly cost > $X", "DAU > 50k", "first payment dispute"), or `none`. Required even when set to `none`. |

## Conditional fields

| Condition | Required field |
|---|---|
| `reversibility` ∈ {`one-way`, `effect-one-way`} | `irreversibility_note`: what cannot be undone and the proposed mitigation. |
| Touches a regulated area (§3) | `compliance_note`: which regulation, which clause, how the choice complies. |
| Supersedes a prior assumption | `supersedes`: the prior assumption id; the prior record is updated. |
| The decision is also an ADR | `adr_ref`: the ADR id. The full architectural surface lives in the ADR; this OA exists only as an index entry (§5.3 boundary rule). |

## Anti-patterns

- Recording the decision without alternatives.
- Recording rationale as a single sentence with no evidence.
- Leaving `review_status` blank.
- Burying a `one-way` decision among `easy` ones in the CoS-routed summary.
- Logging the same assumption repeatedly across tasks instead of pointing tasks at one canonical record.

## Short example

```yaml
id: A-2026-05-26-003
timestamp: 2026-05-26T14:15:00Z
task: task/profile-page
decision: Use signed upload URLs with a 2MB cap and server-side resize.
options_considered:
  - chosen: signed upload + server resize
  - alternative: client-side resize only
  - alternative: no cap, lazy CDN resize
rationale: |
  Signed upload limits abuse; server resize gives deterministic sizes;
  matches §11.1 File/media storage row.
reversibility: easy
blast_radius: module
confidence: high
surfacing: next_batch
revisit_when: "abuse rate of uploads > 1% of attempts in any 24h window"
review_status: pending_user_batch
```

---

## Review Agent rubric

The Review Agent answers each question. Any "no" produces a corrective task (§7.4).

- Are all required fields present and non-empty (including `revisit_when`, even if `none`)?
- Are at least two options considered, including the alternative not taken?
- Does the rationale cite evidence (runbook, ADR, metric, regulation), not just opinion?
- Is `reversibility` honest? Does the decision actually fit the chosen bucket? In particular, if the *decision* is easy but its *effects* are one-way (data, sent emails, processed payments), is `effect-one-way` used?
- Is `blast_radius` honest? Does it actually fit the chosen bucket?
- Is `surfacing` honest? Anything with `live_users` or `strategic` blast radius, `one-way`/`effect-one-way` reversibility, or made under §5.1 precedence should be at least `out_of_cycle`.
- If `reversibility` ∈ {`one-way`, `effect-one-way`}, is there an irreversibility note with a mitigation?
- If the area is regulated, is the compliance note present and specific?
- If this assumption supersedes another, is the link present and the prior record updated?
- Is the decision consistent with existing ADRs, runbooks, and §11.1 defaults? If not, is the deviation justified?
- If the decision is also an ADR, is `adr_ref` set and the OA limited to an index entry (no duplicate content)?
- Is `revisit_when` a specific, measurable trigger, or a tautology like "if circumstances change"?
