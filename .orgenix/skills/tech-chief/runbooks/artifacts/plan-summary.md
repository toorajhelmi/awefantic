# Runbook: Plan Summary

## Purpose

A short, human-readable index of every artifact produced for a task plus the cross-artifact consistency status. Sits at the top of the task folder so CoS/founder reviewers, the Review Agent, and future CoT instances can navigate the task without reading every artifact.

## When to use

Every task at L2 and above (L1 tasks usually have one or two artifacts; a plan summary is optional).

## Location

`docs/product/<feature-slug>/plan-summary.md`. One file per task.

## Required fields

| Field | Notes |
|---|---|
| `task` | The task reference. |
| `triage_ref` | Link to the triage note. |
| `artifacts` | Bullet list of every artifact produced, each with a one-line status (`approved` / `approve_with_notes` / `request_changes` / `pending`). |
| `cross_artifact_consistency_check` | Result of the §7.3 consistency check (field names, thresholds, failure-mode coverage, event producer/consumer, contract↔verification↔monitoring coverage). `pass` / `pass_with_notes` / `fail` and the items, if any. |
| `assumptions` | Bullet list of every Operating Assumption recorded for this task, with id, decision, and `surfacing`. |
| `real_time_blocks_open` | Items currently waiting on CoS-routed founder action. |
| `next_actions` | What CoT does next (P6 assignment, P9 cutover, P10 alert install, etc.). |

## Conditional fields

| Condition | Required field |
|---|---|
| Sweep modifier applied | `sweep_inventory_ref`: link to the inventory and the invariant test. |
| Novel-area work in scope | `poc_plan_ref`: link to the POC plan; `novel_areas_batch_adr_ref` if more than one POC. |
| Includes any §11.1 row that re-evaluates against a named alternative | `revisit_when_index`: pointer to the ADR(s) carrying the trigger. |

## Anti-patterns

- Carrying narrative copy that duplicates the spec ("this feature lets users…").
- Including a Review Agent rubric inside the plan summary (rubrics live only in runbook files; §7.2).
- Hand-waving cross-artifact consistency ("looks good"). The §7.3 check has explicit items.
- Listing artifacts as "approved" before the Review Agent has actually approved them.

## Short example

```markdown
# Plan Summary — Profile Page

Task: task/profile-page
Triage: docs/product/profile/triage.md

## Artifacts
- product-spec.md — approved
- ux-mockup/README.md — approve_with_notes (one error state)
- api.md — approved
- verification.md — approved
- monitoring-plan.md — approved (one new alert)
- A-2026-05-26-003 — confirmed (avatar pipeline)

## Cross-artifact consistency check
Pass. All failure-mode ids in product-spec.md (FM-01..FM-05) are referenced by verification.md and monitoring-plan.md. All endpoints in api.md have contract tests; no shorthand entries. No threshold drift.

## Assumptions
- A-2026-05-26-003: 2MB avatar cap, server-side resize. surfacing: next_batch.

## Real-time blocks open
None.

## Next actions
P6 assignment to coding-agent-001 (profile UI + API), one PR targeting `dev`.
```

---

## Review Agent rubric

- Is every artifact in the task folder represented in `artifacts` with a current status?
- Are statuses honest (no premature `approved`)?
- Is the §7.3 cross-artifact consistency check explicit and itemized?
- Is every Operating Assumption produced for this task indexed here, with `surfacing` visible?
- For sweep / novel-area / re-evaluation tasks, are the conditional fields populated?
- Does the plan summary itself avoid embedding a rubric (rubrics live only in runbook files)?
