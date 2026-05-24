# Orgenix org installation — founder onboarding

This document is the human-facing counterpart to the **Complete org installation** task owned by **Chief of Staff (Avery)** in the dashboard. It explains how CoS fits your workflow and what “done” means for setup.

---

## Your relationship with Chief of Staff (CoS)

Avery (Chief of Staff) is your **single default router** for inbound signals triaged through Administration (`#admin` when Slack is wired). CoS:

- Converts messages, email, scheduler ticks, and dashboard asks into **one clear next action**
- Delegates Specialist work inside Administration (inbox, calendar) and routes **department chief tasks** for engineering, growth, support, and finance  
- **Synthesizes** outcomes back to you when a founder-facing threshold applies (approval, blocker, strategic fork, material outcome)

CoS **does not** write product code, answer customer tickets, generate creative assets, or approve refunds (Support owns the gate below policy thresholds).

Detailed behaviour lives in `/admin/` knowledge and the org **agent-protocol** shipped with your runtime (`/_runtime/agent-protocol.md`).

---

## Standard installation plan (MVP)

| Step | Owner | Typical completion |
|------|--------|---------------------|
| 1. Orgenix workspace + onboarding doc | Cursor / repo | Workspace clone; this file tracks human steps |
| 2. Slack (bot, channels, ingest) | Founder + runtime | Founder completes OAuth / channel picks in dashboard |
| 3. Google (workspace, Calendar, Gmail) | Founder + runtime | Founder completes OAuth scopes in dashboard |
| 4. Departments & practices | Operator / KL | Departments, agents, and practices enabled per install playbook |
| 5. Knowledge library (KL) seed | Chiefs / operator | Org charter, dept rules, routing matrix present under KL paths |

**Plan agreement.** Treat the MVP table above as the default install skeleton. Founder confirms or adjusts it **in dashboard chat** on task *Complete org installation* — that acknowledgement is what satisfies “installation plan agreed” for audit.

---

## Onboarding-task tracker (completed vs deferred)

Use this section as a checklist. CoS mirrors these rows in **task updates** (`kind=update`) so dashboard chat stays authoritative.

| Onboarding task | Status | Evidence / deferral reason |
|-----------------|--------|---------------------------|
| Workspace initialized | Completed | Repo contains `.orgenix/` and `docs/onboarding.md` |
| Founder briefed on CoS role | Completed | This section + dashboard thread |
| Human onboarding doc maintained | Completed | File `docs/onboarding.md` in version control |
| Slack connected | Deferred | Requires founder-facing OAuth / channel wiring in Orgenix; no tokens in unattended agent runs |
| Google connected | Deferred | Requires founder consent for scopes; completes in dashboard |
| Departments/agents fully provisioned | Deferred | Depends on installer scope and KL; completes when practices are bound in your org |
| Routing matrix customized | Deferred | Optional `/admin/routing-overrides.md` in KL once you know your workflows |

Deferred items remain **explicitly queued** until you or the operator finishes them — they are not dropped.

---

## What to do next (founder)

1. Open dashboard task **Complete org installation**, read Avery’s latest `update` messages, and **reply ACK** if the MVP plan is correct (or propose edits — that becomes the recorded agreement).  
2. Complete **Slack** and **Google** connectors in the dashboard when prompted.  
3. Ask Avery to delegate anything operational (-calendar, inbox drafts, routing) once integrations are green.

---

## Related paths (conceptual)

- Org-level protocols: agent lifecycle, escalation, founder comms (`/_runtime/` in KL, when mounted)  
- Administration standing instructions: `/admin/founder-profile.md`, `/admin/email-policies.md`, `/admin/escalation-matrix.md`, `knowledge/routing-matrix.md`

If any of those are missing for your tenant, flag it in dashboard chat — that is treated as an **upstream configuration** gap, not something to paper over silently.
