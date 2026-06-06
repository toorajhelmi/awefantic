# Runbook: Verification Plan

## Purpose

Define what "done" means for a task before any code is written. Coding agents implement against the verification plan; the Review Agent validates that all required evidence exists and passes (`chief-of-tech-operating-doc.md` §P5, §7).

## When to use

Every task at L2 and above (L1 collapses to a 1-line acceptance per §4).

## Location

`docs/product/<feature-slug>/verification.md` (or alongside the task definition in the task tree).

## Required fields (all levels at or above L2)

| Field | Notes |
|---|---|
| `task` | The task this plan verifies. Link to product spec. |
| `acceptance_criteria` | Bullet list. Each is a concrete, observable condition. |
| `e2e_scenarios` | Numbered list. Each scenario is "Given X / When Y / Then Z" in plain English. Realizable as a Playwright test. Each scenario lists which `failure_mode_id`s from the product spec it covers (if any). |
| `failure_mode_coverage` | A table mapping every `failure_mode_id` declared in the product spec to (a) the verification scenario(s) that target it, (b) the monitoring rule that detects it in prod, or (c) an explicit `out_of_scope` note. Gaps (`?` cells) are defects. |
| `unit_test_targets` | Modules where unit coverage is required. |
| `out_of_scope` | What this task explicitly does not verify. |

## Conditional fields (required at the listed level or above)

| Condition | Field |
|---|---|
| API surface added or changed | `contract_tests`: per-endpoint cases including all error paths. |
| UI changed | `visual_regression`: which screens are snapshotted; tolerance band. |
| Performance-sensitive | `performance_budget`: metric, percentile, target, methodology. |
| Touches auth, payments, or PII | `security_checks`: what is verified and how (auth-scope, IDOR, secrets, dependency CVEs, PCI scope as relevant). |
| Touches a regulated area | `compliance_checks`: which rules, which checklist, which evidence. |
| Touches a side effect (email, push, webhook, queue) | `side_effect_tests`: what is sent, where it lands, retry behavior. |
| Sweep change across N similar assets | `inventory_check`: how the plan asserts coverage of all N. |
| Touches money or any external system whose state must match local state | `reconciliation_check`: cadence and drift threshold. |
| Has per-unit cost guards (LLM tokens, GPU minutes, moderation calls, media seconds) | `aggregate_cost_guard`: the per-unit cap multiplied by the documented max-volume must not exceed the stated monthly budget for that line; if it does, either raise the budget (and record as `out_of_cycle` Operating Assumption) or lower the cap. |

## Anti-patterns

- Writing the plan after code (the plan is the source of "done", not a post-hoc summary).
- E2E scenarios that test implementation (clicking specific selectors) instead of behavior.
- "All tests pass" as an acceptance criterion (it is not a criterion, it is a precondition).
- Acceptance criteria without an out-of-scope section.
- Performance budgets without methodology (corpus size, warm-up, percentile, run count).
- Security checks reduced to "secret scan + npm audit".

## Short structure

```markdown
# Verification Plan — Profile Page

Task: task/profile-page
Acceptance criteria:
  - Authed user can edit display name, bio, and avatar.
  - Other authed users see the updated profile within one request.
  - Unauth user is redirected to sign-in.

E2E scenarios:
  1. Given a new user, when they upload an avatar < 2MB, then it appears within 2s.
  2. Given an authed user A viewing user B's profile, when B updates their bio,
     then a reload on A shows the new bio.
  3. Given an unauth user, when they visit /u/123, then they are redirected to /sign-in.

Visual regression: profile-view, profile-edit (empty/loading/populated/error).
Contract tests: PATCH /api/v1/users/me (all error paths).
Out of scope: profile discovery, moderation flow, public read.
```

---

## Review Agent rubric

- Are acceptance criteria concrete and observable, not "the feature works"?
- Do E2E scenarios describe behavior, not selectors?
- Is every `failure_mode_id` from the product spec present in `failure_mode_coverage` with a verification scenario, a monitoring rule, or an explicit `out_of_scope` note? (No `?` cells; no orphan ids.)
- Is there an explicit `out_of_scope` section?
- For API changes: is every endpoint in the contract covered by a contract test, including every error path? Is no endpoint represented only by shorthand? (Exhaustiveness check.)
- For UI changes: are all required states (empty/loading/populated/error/edge) covered by visual regression?
- For performance-sensitive work: is the methodology specified (corpus size, warm-up, percentile, run count)?
- For security-relevant work: are checks specific (auth-scope, IDOR, secrets, dependency CVEs, PCI scope as relevant)?
- For regulated work: is the checklist named and evidence specified?
- For sweep changes: is there an inventory check that fails on any missing asset?
- For external-state work: is the reconciliation cadence specified?
- For cost-relevant work: does `aggregate_cost_guard` actually multiply out, and does the result fit within the stated monthly budget?
- Does the plan exist before any code in the task is merged?
