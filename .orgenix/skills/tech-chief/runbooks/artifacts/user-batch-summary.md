# Runbook: User Batch Summary

## Purpose

The periodic, human-readable status report CoT prepares for CoS-routed founder review (`chief-of-tech-operating-doc.md` §5.4). It is the channel through which Operating Assumptions are confirmed or overridden and through which the founder stays oriented without being asked questions all week.

## When to use

- On a fixed cadence (default weekly).
- Out of cycle whenever a high-impact Operating Assumption is taken (`blast_radius` ∈ {`live_users`, `strategic`} or `reversibility` = `one-way`).

## Location

`docs/summaries/YYYY-MM-DD.md`. CoT attaches or links it on its task; CoS decides how to deliver it through the founder's preferred channel (email/Slack/dashboard) as decided by an ADR.

## Required sections

| Section | Notes |
|---|---|
| `header` | Date, period covered, project. |
| `top_assumptions` | Ranked list of the most important Operating Assumptions since the last summary. Each row: id, decision, reversibility, blast radius, link to the record, recommended founder action (`confirm` / `override` / `escalate`). Cap at 10; everything else linked but not inlined. |
| `live_system_health` | Uptime, error rate, latency vs. SLO, cost vs. budget, key product metrics. Highlight anything outside its band. |
| `recent_ships` | What went live since the last summary, with one-line outcomes. |
| `recent_reviews` | Reviews completed and their outcomes (`approve` / `fix` / `redo` / `escalate` / `rollback`); open corrective actions. |
| `new_tooling` | Any new defaults adopted (novel-area ADRs, §11.2). One line each. |
| `open_real_time_blocks` | The list waiting on CoS-routed founder action (§5.2), with the exact next step the founder needs to take. |
| `recommended_actions` | What the founder is asked to do this cycle, ranked. Short. |

## Conditional sections

| Condition | Section |
|---|---|
| There is an open incident | `open_incidents`: severity, status, ETA, owner. |
| There was an incident in the period | `incident_summary`: link to incident notes, root causes, corrective actions. |
| Cost or usage spiked | `cost_alert`: driver, mitigation taken, status. |
| Compliance or legal item pending | `compliance_pending`: which regulation, the founder action required. |
| A scheduled maintenance task is due | `maintenance_due`: which task, deadline. |

## Anti-patterns

- A summary that reads as a changelog. The founder does not need every PR. Distill.
- Burying a `one-way` decision in the middle of a long list. Promote it.
- Listing assumptions without a recommended founder action.
- Skipping the open-real-time-blocks section even when there are none ("None" must appear; silence is ambiguous).
- Including system metrics without bands (a number without "vs. SLO" is noise).
- Summarizing without linking back to the records (CoS/founder reviewers must be able to drill in).

## Short structure

```markdown
# Summary — 2026-05-26 (week 21)

## Top Operating Assumptions
| id | decision | reversibility | blast radius | action |
|---|---|---|---|---|
| A-...-007 | EU pricing fixed, not FX-derived | hard | live users | confirm |
| A-...-008 | Avatars capped at 2MB | easy | module | confirm |

## Live system health
Uptime 99.97% (SLO 99.9). p95 API 180ms (SLO 200). Error rate 0.4%. Cost MTD $137 (budget $200).

## Recent ships
- Contact form (S3): live, 12 submissions, no errors.

## Recent reviews
- Profile page: approved with one minor fix-in-place; merged.

## New tooling
- None.

## Open real-time blocks
- Stripe live keys: prepared in vault, awaiting your confirmation.

## Recommended actions
1. Confirm/override Operating Assumptions above.
2. Provide Stripe live keys.
```

---

## Review Agent rubric

- Is the header complete (date, period, project)?
- Is `top_assumptions` ranked by blast radius × reversibility, capped at 10, with a recommended founder action per row?
- Is `live_system_health` reported with bands (vs. SLO / budget), not raw numbers?
- Is every recent ship and review linkable?
- Is `open_real_time_blocks` populated (or explicitly "None")?
- Are recommended actions concrete and short?
- For any conditional section that should appear (open incident, cost spike, compliance pending, maintenance due), is it present and current?
- Is anything `one-way` or `live_users` promoted to the top?
- Does the summary distill, or does it merely list?
- Is every assumption / ship / review linked back to its source record?
