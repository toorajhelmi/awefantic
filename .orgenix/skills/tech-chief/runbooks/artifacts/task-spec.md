# Runbook: Coding Agent Task Spec

## Purpose

Define the bounded unit of work CoT hands to a coding agent (`chief-of-tech-operating-doc.md` §P6). Every coding-agent run is preceded by a task spec; no coding agent works against ambient context.

## When to use

Every time CoT delegates code-writing or schema-changing work to a coding agent. Not required when CoT executes the work itself (which is allowed for small infra and doc edits).

## Location

`docs/product/<feature-slug>/tasks/<NN-short-slug>.md`. One file per coding-agent task. Each task is small enough that one PR closes it.

## Required fields

| Field | Notes |
|---|---|
| `id` | Stable, project-unique (e.g., `T-2026-05-26-007`). |
| `objective` | One sentence: what changes when this task is done. |
| `parent_task` | Link to the higher-level task in the task tree. |
| `target_files` | Files or modules the coding agent may touch. Anything outside is out-of-scope and rejected at PR review. |
| `inputs` | The artifacts the coding agent reads (product spec, mockup, API contract, verification plan, ADRs). Links, not copies. |
| `acceptance_criteria` | A subset of the verification plan's criteria that this task is responsible for. Each is observable. |
| `test_cases_to_pass` | Specific cases (unit, contract, E2E) the coding agent must make pass before opening a PR. References by id where the verification plan defines them. |
| `branch_name` | The branch the coding agent works on. |
| `pr_template_entries_to_fill` | Specific PR template fields the coding agent must complete (intent, trade-offs, screenshots, test results). |
| `tools_allowed` | Least-privilege tool list. Coding agents do not modify CI, infra, secrets, or contracts (see §6). |
| `out_of_scope` | What this task explicitly does not change, even if related (links to follow-up tasks if any). |

## Conditional fields

| Condition | Required field |
|---|---|
| Touches a contract | `contract_ref`: link to the API contract entry; rule that the contract may not be changed. |
| Touches the schema | `migration_required`: yes/no; if yes, link to the migration plan. |
| Sweep task | `inventory_ref`: link to the sweep inventory. Coding agent edits only assets in the inventory. |
| Touches a regulated area | `compliance_ref`: link to the compliance posture artifact and the specific checklist items in scope. |

## Anti-patterns

- "Implement the spec" as the objective. Decompose to bounded units.
- Test cases listed only as "must pass CI". Cite the actual cases by id.
- No `out_of_scope` — coding agents will quietly expand scope.
- Giving the coding agent broad tool access ("filesystem + LLM"). Use least-privilege.
- Embedding a Review Agent rubric inside the task spec (rubrics live only in runbook files; §7.2).

## Short example

```yaml
id: T-2026-05-26-007
objective: Implement /api/v1/users/me PATCH for display_name and bio updates.
parent_task: task/profile-page
target_files:
  - apps/web/app/api/v1/users/me/route.ts
  - apps/web/lib/users.ts (only updateUser helper)
  - apps/web/test/api/users-me.contract.test.ts
inputs:
  - docs/product/profile/spec.md
  - docs/product/profile/api.md (PATCH /api/v1/users/me)
  - docs/product/profile/verification.md (#1, #4, #5 contract cases)
acceptance_criteria:
  - Endpoint accepts the request shape in api.md.
  - Returns 200 on success, 400 on validation error, 401 on no auth, 403 on cross-user attempt.
  - Updates only display_name and bio.
test_cases_to_pass:
  - verification.md contract case #1, #4, #5
  - unit: updateUser helper (success + 3 error paths)
branch_name: feat/profile-patch-me
pr_template_entries_to_fill:
  - intent (one paragraph)
  - trade-offs
  - test results (link)
  - screenshots (N/A for API-only)
tools_allowed:
  - filesystem (read+write within target_files)
  - LLM
  - test runner
out_of_scope:
  - avatar upload (separate task T-...)
  - display-name uniqueness (separate task T-...)
```

---

## Review Agent rubric

- Is `objective` a single observable change, not a feature description?
- Are `target_files` actually scoped (not "the whole app")?
- Are `acceptance_criteria` a subset of the verification plan, with verifiable conditions?
- Are `test_cases_to_pass` specific (citing case ids), not "all tests"?
- Is `tools_allowed` least-privilege? In particular, are CI / infra / secrets / contract edits excluded?
- Is `out_of_scope` non-empty for any task larger than a one-file edit?
- For contract / schema / regulated / sweep tasks, are the conditional fields populated?
- Does the task spec avoid embedding a rubric (rubrics live only in runbook files)?
