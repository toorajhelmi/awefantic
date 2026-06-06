# Runbook: Incident Note

## Purpose

Capture every triaged incident — detection, mitigation, root cause, and follow-through — so the system learns from production reality and corrective tasks land in the task tree (`chief-of-tech-operating-doc.md` §P10).

## When to use

Whenever an alert is triaged as a real incident (not a false positive) or a user report is confirmed as a real issue. Every severity gets a note.

## Location

`docs/incidents/YYYY-MM-DD-<short-slug>.md`. One file per incident. Linked from the next user batch summary.

## Severity levels

| Sev | Definition |
|---|---|
| `sev1` | Live users blocked from a critical workflow; data loss; security breach. |
| `sev2` | Live users degraded experience or partial outage. |
| `sev3` | Non-blocking issue, internal or back-office impact. |
| `sev4` | Cosmetic or single-user issue, no broader impact. |

## Required fields

| Field | Notes |
|---|---|
| `id` | Project-unique. |
| `severity` | `sev1`–`sev4`. |
| `status` | `open` / `mitigated` / `resolved` / `closed`. |
| `detected_at` | Timestamp; source of detection (alert / synthetic / user / log). |
| `mitigated_at` | Timestamp; null until mitigated. |
| `resolved_at` | Timestamp; null until the root cause is removed. |
| `closed_at` | Timestamp; null until all corrective tasks are verified. |
| `summary` | 1–3 sentence description: what users saw, what was wrong, what was done. |
| `impact` | Quantified where possible: number of users, requests, dollar value, duration. |
| `timeline` | Bullet list of events with timestamps (detect, page, triage, mitigate, deploy, monitor, resolve). |
| `root_cause` | The actual cause, not the proximate symptom. |
| `mitigation` | What was done to stop the bleeding. |
| `corrective_actions` | List of tasks created to prevent recurrence. Each with an id, owner, and target date. |

## Conditional fields

| Condition | Field |
|---|---|
| Sev1 or sev2 | `comms`: what was communicated externally (status page, in-app banner, email) and when. |
| Touched data | `data_impact`: which records, what changed, recovery taken. |
| Touched secrets | `secret_actions`: which secret, rotation taken, access audit. |
| Cross-team / cross-system | `cross_dependencies`: which other systems contributed, their owners. |
| Detected via user report | `detection_gap`: which alert should have caught this and why it did not; corrective task to add it. |

## Anti-patterns

- Listing the symptom as the root cause.
- Filing a corrective action without an owner or a date.
- Closing the incident before corrective actions are verified.
- Sev1/sev2 with no comms field.
- A timeline without timestamps.
- Treating "noisy alert" as resolution when the system was actually broken.
- Detection-gap incidents that do not produce an alert-improvement corrective task.

## Short structure

```markdown
# Incident — 2026-05-26 — Checkout 500s on EU traffic

Severity: sev2
Status: closed
Detected: 14:08 UTC via Sentry rate alert.
Mitigated: 14:21 UTC by rolling back the deploy.
Resolved: 14:55 UTC after fix-forward.
Closed: 2026-05-27 after all corrective tasks merged.

Summary: A null Stripe customer for EU users with no prior US history caused
POST /checkout to throw. ...

Impact: 312 failed checkouts (~$5.9k GMV); 18 unique users.

Timeline:
  - 14:08 alert
  - 14:10 paged
  - 14:14 triaged
  - 14:21 rolled back
  - ...

Root cause: Code path assumed every authed user has a Stripe customer record.

Mitigation: Roll back commit abc1234.

Corrective actions:
  - CA-1: Add null-customer guard with E2E coverage. Owner CoT. Done 2026-05-26.
  - CA-2: Alert on checkout 5xx rate > 0.5%. Owner CoT. Done 2026-05-26.

Comms: Status page updated at 14:11; resolved post at 14:58.

Detection gap: No alert was specific to checkout 5xx rate; corrective CA-2 added.
```

---

## Review Agent rubric

- Are severity and status set?
- Are all required timestamps populated where the status allows?
- Is impact quantified (or explicitly N/A)?
- Is the timeline complete and time-stamped?
- Does `root_cause` name the actual cause, not the symptom?
- Are corrective actions each tied to an owner and a target date?
- For sev1/sev2: is `comms` populated?
- For data-impact incidents: is `data_impact` populated with recovery taken?
- For secret-touching incidents: is `secret_actions` populated with rotation and audit?
- For user-reported incidents: is `detection_gap` populated with an alert-improvement corrective action?
- Is the incident closed only after every corrective action is verified?
