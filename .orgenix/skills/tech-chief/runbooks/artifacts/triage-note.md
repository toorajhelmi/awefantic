# Runbook: Triage Note

## Purpose

Record CoT's P0 classification of an incoming task: scrutiny level, modifiers applied, phase plan, runbooks loaded, real-time blocks identified, and any phase skips justified. The triage note is the first artifact in every task folder; downstream artifacts reference it.

## When to use

Every task, at every scrutiny level (including L1 — the triage note may be a single screenful).

## Location

`docs/product/<feature-slug>/triage.md` (or alongside the task definition in the task tree). One file per task.

## Required fields

| Field | Notes |
|---|---|
| `task` | The task reference. |
| `cot_instance` | The CoT agent producing the triage (for audit). |
| `level` | One of `L1` / `L2` / `L3` / `L4` / `L5`. |
| `modifiers_applied` | Every §3 modifier this task triggers, with a one-line reason. Modifiers considered and rejected are also listed with their reason. |
| `level_floor_applied` | If a modifier raised the floor (e.g., regulated → L3 minimum), note which modifier and the resulting floor. |
| `materially_new` | A one-paragraph answer to "does this change introduce a materially new risk surface, or extend an existing one?" (§3 qualifier). |
| `repo_state` | `greenfield` / `addition` / `change` / `sweep`. |
| `existing_assets_affected` | The ADRs, specs, runbooks, and code paths the task touches. |
| `stack_decisions_locked` | Which §11.1 rows are already pinned for this project; which need decisions (P3 or §11.2). |
| `phase_plan` | The set of phases that will run, with skipped phases justified (§4 table). |
| `partial_phases` | Any phase running as partial (§4); which steps are included, which are skipped, why. |
| `runbooks_loaded` | Every runbook (artifact / phase / domain) the task will touch. Missing runbooks become doc-friction events (§14.2) and produce corrective tasks. |
| `real_time_blocks` | Items expected to require the user (§5.2). |
| `out_of_cycle_items_expected` | Items expected to be high-impact assumptions (§5.3 `surfacing: out_of_cycle`). |
| `verification_owner` | Where the verification plan will live. |
| `review_channel` | Which §7.2 reviewer applies (Review Agent + which rubric, harness, CoY, user). |

## Conditional fields

| Condition | Required field |
|---|---|
| `level` ∈ {`L4`, `L5`} | `poc_plan_ref`: link to the POC plan if any novel-area work is in scope. |
| `repo_state` = `greenfield` | `onboarding_block_ref`: link to the onboarding-block artifact. |
| Sweep modifier applied | `sweep_inventory_owner`: which artifact will hold the inventory before any asset is edited. |
| Multi-artifact change set expected | `consistency_check_owner`: which artifact will hold the cross-artifact consistency check (§7.3). |

## Anti-patterns

- Picking a level without naming the modifiers considered.
- Listing modifiers without saying which were rejected.
- "Phase plan: all phases" without justification at L4/L5.
- Skipping phases without naming the justification.
- Loading runbooks lazily ("we'll figure out which runbooks as we go").

## Short example

```yaml
task: task/profile-page
cot_instance: cot-2026-05-26-001
level: L3
modifiers_applied:
  - PII-touching: avatar + display name => floor L3 (already met)
  - rejected User-generated content: no other-user-visible posting yet
materially_new: Yes — first PII-storage surface in this project; no prior privacy posture artifact exists.
repo_state: addition
existing_assets_affected:
  - adr/0001-stack.md
  - existing auth module
stack_decisions_locked: web frontend, db, auth, storage
phase_plan: P0, P1, P2, P5, P6, P7, P8, P12; P3 skipped (stack locked); P4 skipped (infra exists); P9 skipped (already live, no new surface); P10 partial (one new alert for avatar-upload failure); P11 unchanged
partial_phases:
  - P10: one new alert only; on-call routing unchanged
runbooks_loaded:
  - artifacts/product-spec.md
  - artifacts/ux-mockup.md
  - artifacts/api-contract.md
  - artifacts/verification-plan.md
  - artifacts/operating-assumption.md
  - artifacts/monitoring-plan.md
real_time_blocks: []
out_of_cycle_items_expected: []
verification_owner: docs/product/profile/verification.md
review_channel: Review Agent + product-spec rubric, ux-mockup rubric, api-contract rubric, verification-plan rubric, monitoring-plan rubric
```

---

## Review Agent rubric

- Is `level` consistent with `modifiers_applied`, `level_floor_applied`, and `materially_new`?
- Is at least one rejected modifier listed (or is rejection explicitly stated as "no other modifiers considered apply")?
- Is `phase_plan` consistent with §4 (no required phases skipped without justification; no skipped phase without a reason)?
- Is every runbook the task will touch listed in `runbooks_loaded`?
- For every listed runbook, does it actually exist? Missing runbooks become doc-friction events.
- Are `real_time_blocks` and `out_of_cycle_items_expected` realistic given the task and §5.2/§5.3?
- Is `review_channel` specific (which rubric, not "the Review Agent will figure it out")?
- For sweep / multi-artifact change sets, are the corresponding owners assigned?
