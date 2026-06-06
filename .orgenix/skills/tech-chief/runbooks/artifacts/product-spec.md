# Runbook: Product Spec

## Purpose

Define what is being built and why, before any tech decision or code. Output of P1 (Product & UX Definition).

## When to use

Any task at L2 or above. L1 tasks skip this runbook (per §4 phase-skip table).

## Location

`docs/product/<short-slug>.md`. One file per coherent feature or product surface.

## Required fields (all levels at or above L2)

| Field | Notes |
|---|---|
| `title` | The feature or product surface. |
| `owner` | The CoT instance that produced this spec. |
| `status` | `draft` / `under_review` / `approved` / `superseded`. |
| `problem` | The user problem in 1–3 sentences. Who has it, when, what is the current pain. |
| `goals` | What this spec is intended to achieve. Outcome-oriented, not feature-list. |
| `non_goals` | Explicitly what is out of scope. At least one. |
| `users` | The user types this affects. Roles, not personas. |
| `primary_workflows` | Numbered list. Each is a short paragraph or bullet sequence describing the user moving through the product. |
| `success_criteria` | Measurable. How will we know it worked. |
| `assumptions` | Links to Operating Assumption records this spec depends on. |

## Conditional fields (required at the listed level or above)

| Level | Field |
|---|---|
| L3+ | `data_model_summary`: entities and their relationships (1 paragraph). |
| L3+ | `permissions`: who can read/write what. |
| L3+ | `integrations`: external systems involved. |
| L4+ | `non_functional_requirements`: latency, scale, cost ceiling, regulatory. |
| L4+ | `risks`: each risk with mitigation. |
| L4+ | `failure_modes`: how the feature can fail and where each failure is handled (UI / API / job / background) and surfaced to the user. Each entry has a stable `id` (e.g., `FM-01`), a short title, a trigger, a surface (UI / API / job / background), a user-facing message or behavior, and a recovery path. The id is the join key with `verification.md` and the monitoring plan; verification and monitoring artifacts cite ids, not titles. |
| L5 | `roadmap`: a thin path from MVP to mature; what is in v1 vs. later. |
| L5 | `dependencies`: cross-task dependencies on other CoX or specialists. |

## Anti-patterns

- Writing the spec around a chosen solution. (Frame the problem first; the solution belongs in ADRs and design notes.)
- Goals that are feature lists.
- "Non-goals: none." (There are always non-goals; if there aren't, scope is undefined.)
- Skipping `failure_modes` for L4+. Most production incidents come from failure-mode gaps.
- Spec without `assumptions` — every spec rests on assumptions.

## Short example structure

```markdown
# Product Spec — User Profiles

Status: draft
Owner: CoT
Problem: Authed users have no way to recognize each other. They want to know who they are interacting with.
Goals: Authed users can identify and remember each other; ground future social features.
Non-goals: Public discovery; SEO; messaging; reputation.
Users: Authed end users.
Primary workflows:
  1. View own profile, edit display name and bio, upload avatar.
  2. View another user's profile from any place their name appears.
Success criteria: 80% of active users complete a profile within their first session.
Assumptions: A-2026-05-26-003 (avatar pipeline), A-... (display-name uniqueness).
```

---

## Review Agent rubric

- Is the problem statement user-centric and concrete (who, when, current pain)?
- Are goals outcome-oriented, not feature-list-shaped?
- Is `non_goals` non-empty and meaningful?
- Are at least two primary workflows fully described?
- Are success criteria measurable?
- Are all referenced Operating Assumptions linked and current?
- At L3+: are data model summary, permissions, and integrations present?
- At L4+: are NFRs, risks (with mitigations), and failure modes present, does every failure mode say where it is handled, and does every failure mode have a stable `id` that the verification and monitoring artifacts can cite?
- At L5: is there a thin roadmap and a dependency list?
- Is the spec free of premature solution detail (no tech stack, no schema, no UI implementation)?
