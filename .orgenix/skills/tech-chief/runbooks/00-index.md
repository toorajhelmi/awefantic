# Runbook Registry

This index lists every runbook in the system. A runbook not listed here is not live. CoT loads runbooks per Section 14 of `knowledge/chief-of-tech-operating-doc.md`.

Each runbook is a template (required fields, conditional fields, anti-patterns, short example) followed by a paired **Review Agent rubric** as its last section.

---

## Artifact templates (`artifacts/`)

Shape and required content for outputs CoT produces. Loaded when CoT is about to produce that artifact.

| Runbook | Used by phases | Purpose |
|---|---|---|
| [triage-note.md](artifacts/triage-note.md) | P0 | The classification artifact at the head of every task: scrutiny level, modifiers, phase plan, runbooks loaded, real-time blocks expected. |
| [plan-summary.md](artifacts/plan-summary.md) | post-P5 | Per-task index of artifacts + cross-artifact consistency status. |
| [task-spec.md](artifacts/task-spec.md) | P6 | The bounded unit of work CoT hands to a coding agent. |
| [operating-assumption.md](artifacts/operating-assumption.md) | all phases | Record format for any decision taken without user input. |
| [adr.md](artifacts/adr.md) | P2, P3, P4, P9, P11, §11.2 | Architecture Decision Record. Locks a choice; supersedes prior ADRs cleanly. |
| [product-spec.md](artifacts/product-spec.md) | P1 | The product framing for any feature or product. Fields scale with scrutiny level. |
| [ux-mockup.md](artifacts/ux-mockup.md) | P1 | Format, fidelity, and required states for UI mockups. |
| [api-contract.md](artifacts/api-contract.md) | P2 | Endpoint, request/response, errors, breaking-change rules. |
| [verification-plan.md](artifacts/verification-plan.md) | P5 | E2E scenarios, harness selection, acceptance criteria. Source of "done". |
| [cross-artifact-consistency-check.md](artifacts/cross-artifact-consistency-check.md) | post-P5 | The §7.3 multi-artifact consistency check, recorded as an auditable artifact (not a checklist in CoT's head). |
| [monitoring-plan.md](artifacts/monitoring-plan.md) | P10 (and P11 for cadences) | SLOs, alerts, cost guards, reconciliation cadences, synthetic transactions, failure-mode coverage. |
| [poc-plan.md](artifacts/poc-plan.md) | §11.2 | The smallest experiment that would disprove a candidate for a novel-area decision. |
| [critical-accounts.md](artifacts/critical-accounts.md) | §9, P9, P11 | The persistent inventory of every external account the live system depends on. |
| [onboarding-block.md](artifacts/onboarding-block.md) | pre-P4 (greenfield) | The user-facing batched checklist of real-time actions to start a project. |
| [user-batch-summary.md](artifacts/user-batch-summary.md) | §5.4 | The periodic summary CoT delivers to the user. |
| [incident-note.md](artifacts/incident-note.md) | P10 | Postmortem record for every triaged incident. |

## Phase runbooks (`phases/`)

Checklists for repeatable phase work where the sequence matters.

| Runbook | Phase | Purpose |
|---|---|---|
| [greenfield-onboarding.md](phases/greenfield-onboarding.md) | pre-P4 | The batched user-onboarding block for a brand-new project (§5.2). |
| [go-live-web.md](phases/go-live-web.md) | P9 | Steps to take a web app live on its own domain. |
| [go-live-mobile.md](phases/go-live-mobile.md) | P9 | Steps to ship a mobile app through the stores. |

## Founder onboarding

| Runbook | Used by phases | Purpose |
|---|---|---|
| [04-onboarding.md](04-onboarding.md) | Tech onboarding | Open the Chief of Tech founder chat, request required capabilities, and close setup only after access is connected or explicitly deferred. |

## Domain runbooks (`domains/`)

Canonical implementation patterns for common functionalities. Tied to §11.1 rows.

| Runbook | §11.1 row(s) | Purpose |
|---|---|---|
| [payments.md](domains/payments.md) | Payments (web), Payments (mobile, digital goods), Sales tax / VAT | Integration shape, failure handling, reconciliation, and review for any payments work. |
| [moderation.md](domains/moderation.md) | Content moderation (image/video/text); §3 UGC modifier trigger | Classifier coverage, severity tiers, queue/appeal/takedown, CSAM v1 NCMEC, DMCA, repeat-offender, cost guards. Wired posture neutralizes the §3 UGC bump. |
| [live-video.md](domains/live-video.md) | Live video ingest | Ingest, multi-angle/stitching, recording, latency bands, live moderation, synthetic publishers, cost guards. |
| [mobile.md](domains/mobile.md) | Mobile, App store submission (iOS/Android), Push notifications, Payments (mobile) | Build & submit toolchain, store metadata + privacy disclosures, §4.8, ATT, IAP, release health, force-upgrade. |
| [storage.md](domains/storage.md) | File / media storage | Signed-URL uploads, size/MIME enforcement, quotas, retention, DSAR hard-delete, egress aggregate guards. |
| [privacy-dsar.md](domains/privacy-dsar.md) | GDPR / DPA / DSAR posture; §3 PII modifier | Lawful basis, processor inventory + DPAs, DSAR endpoints (access/portability/rectification/erasure), log redaction, breach response. |
| [email-transactional.md](domains/email-transactional.md) | Email; Email compliance & template management | Sending domain + SPF/DKIM/DMARC, suppression table, idempotent send, List-Unsubscribe sweep invariant, deliverability monitoring. |
| [anti-spam.md](domains/anti-spam.md) | Anti-spam for public forms (extended to read endpoints, login, paid-downstream surfaces) | Honeypot + multi-layer rate limits, anti-enumeration, captcha escalation, token brute-force protection, paid-downstream cost guards. |
| [marketing-claims.md](domains/marketing-claims.md) | (no §11.1 row; consumer-protection exposure) | Claims inventory, claim ↔ behavior linkage, pricing source-of-truth, performance/SLO claim methodology, comparison/endorsement disclosure, drift detection. |

---

## Adding or changing a runbook

- New runbook: create file under the right folder, add row here, link it from §11.1 or §4 or §14.2 if applicable, and add its rubric as the last section.
- Update: edit the runbook; if the update changes shape, also update its rubric.
- Override per project: a project ADR can supersede a runbook locally; the runbook stays the default.
- Retire: mark superseded in this index with a pointer to the replacement; do not delete history.

CoT runs the hygiene audit (§8) periodically to catch orphans, contradictions, and missing rubrics.
