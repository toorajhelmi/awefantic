# Runbook: Architecture Decision Record (ADR)

## Purpose

Lock in a technical or product decision so future work has a single, citable source of truth. ADRs are immutable once accepted; later decisions are new ADRs that supersede prior ones (§8).

## When to use

- Picking a stack, tool, or third-party service (P3, §11.2).
- Picking a data model, API contract, or auth/permission shape (P2).
- Changing an existing technical decision.
- Adopting a runbook with project-specific changes (override).

## Location

`docs/adr/NNNN-<short-slug>.md`, monotonically increasing number, no gaps. The first ADR (`0001-stack.md`) is the project stack.

## Required fields

| Field | Notes |
|---|---|
| `id` | The ADR number. |
| `title` | One short noun phrase. |
| `status` | `proposed` / `accepted` / `accepted_with_contingent_successor` (the decision is accepted, but a pre-staged superseding ADR exists for a defined re-evaluation trigger; see §11.2 scoped re-evaluation) / `superseded` / `deprecated`. |
| `date` | Acceptance date. |
| `context` | What is the problem being decided? What constraints exist? |
| `options` | At least two real options with brief description and key trade-offs. |
| `decision` | The chosen option, in one paragraph. |
| `consequences` | What is now true. What new work is implied. What is foreclosed. |
| `revisit_when` | An explicit trigger that should cause this ADR to be re-evaluated (e.g., "p95 search latency > 200ms at >50k corpus", "DAU > 50k", "monthly cost > $X"), or `none`. Required even when set to `none`. |
| `supersedes` | List of ADR ids superseded by this one, or "none". |

## Conditional fields

| Condition | Required field |
|---|---|
| Has measured evidence (POC, benchmark, cost model) | `evidence`: links and key numbers. |
| Supersedes an ADR | The prior ADR's `status` becomes `superseded` and is amended with a pointer here. |
| Overrides a runbook | `runbook_override`: which runbook, which fields, why. |
| Reverses a prior decision | `reversal_note`: what is being undone and the cleanup plan. |
| `status` = `accepted_with_contingent_successor` | `contingent_successor`: id of the pre-staged superseding ADR (status `proposed`); summary of the trigger that activates it; expected migration cost. |
| Part of a §11.2 novel-areas batch | `batch_adr`: id of the parent batch ADR that lists sequencing and shared budget. |

## Anti-patterns

- Stating the decision without options.
- Listing options without trade-offs.
- Leaving `consequences` as "TBD".
- Editing an accepted ADR in place instead of writing a superseding ADR.
- Treating the ADR as a design doc — keep it to the decision, link to specs and POCs for detail.

## Short example structure

```markdown
# 0007 — Switch user search from Postgres FTS to Algolia

Status: accepted
Date: 2026-08-12
Supersedes: none (extends 0001-stack)

## Context
Search p95 has been over 250 ms for three consecutive weeks at 1.2M user rows.
The §11.1 trigger (p95 > 200 ms or corpus > 1M) has fired.

## Options
1. Stay on Postgres FTS; tune indexes and add caching.
2. Move to Algolia, keep Postgres as source of truth.
3. Move to OpenSearch.

## Decision
Move to Algolia. ...

## Consequences
- New paid service in §11.1 (logged as an Operating Assumption confirmed by the user in batch summary on 2026-08-10).
- Migration runbook required.
- ...
```

---

## Review Agent rubric

- Is the title a single, specific decision?
- Is the context concrete (numbers, dates, links), not "we wanted to scale"?
- Are at least two real options presented, each with explicit trade-offs?
- Does the decision section actually pick one option and say why?
- Does `consequences` list both new work and foreclosed options?
- If evidence is required (P3, §11.2), is it cited?
- If this supersedes an ADR, is the prior ADR's status updated and linked?
- If this overrides a runbook, is the override scope explicit?
- Is the ADR free of design-doc bloat? (specs and code samples belong elsewhere)
- Is `supersedes` either populated or "none"?
- Is `revisit_when` a specific, measurable trigger, or a tautology like "if circumstances change"?
- If `status` = `accepted_with_contingent_successor`, does `contingent_successor` exist, is its trigger consistent with `revisit_when`, and is the successor ADR file actually present in `proposed` state?
- If part of a §11.2 novel-areas batch, is `batch_adr` set and does the batch ADR list this ADR with the right sequencing?
- Is the ADR listed in `docs/adr/INDEX.md`?
