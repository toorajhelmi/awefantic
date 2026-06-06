# Runbook: Payments Domain

## Purpose

Define the integration shape, failure handling, and operating posture for any payments work — independent of provider. Tied to the §11.1 rows "Payments (web)" and "Payments (mobile, digital goods)" and "Sales tax / VAT".

## When to use

Any task that introduces, modifies, or operates a payment flow: subscriptions, one-time purchases, marketplace flows, refunds, dunning, taxes, payouts.

## Required posture (regardless of provider)

| Posture item | Requirement |
|---|---|
| PCI scope | Prefer provider-hosted checkout (Stripe Checkout, App Store / Play purchase sheet) to keep PCI scope minimal. SAQ-A by default. Justify deviations in an ADR. |
| Source of truth | The provider is authoritative. Local DB holds a synced projection updated via webhooks/events. Never make billing decisions from local data alone without reconciliation. |
| Idempotency | Every state-changing call to the provider uses an idempotency key tied to the originating event/intent. |
| Webhook signing | Every incoming webhook is signature-verified before being acted on. Secrets are rotated on the documented cadence (§9). |
| Reconciliation | A reconciliation job runs daily comparing provider state to local state. Drift triggers an alert and an incident (`incident-note.md`). |
| Failure handling | Every failure mode is named, has a defined surface (user-visible message, retry job, dead-letter queue, manual queue), and is tested by the verification plan. |
| Currency and tax | Currency is explicit per price; tax engine handles tax at the provider's edge where supported; tax decisions are recorded in an ADR. |
| Refunds and disputes | Refund and dispute flows are first-class — UI surface, audit log, and an SLA. |
| Dunning | Failed renewals follow a defined dunning schedule with user comms. |
| Trial handling | Trial state is local plus provider; trial conversion is tested end-to-end. |
| Receipts and invoices | Provider-hosted PDFs preferred; localization plan if applicable. |

## Required outputs (per payments task)

- An ADR locking in the provider, the integration shape (hosted vs. embedded), and tax handling.
- An API contract (`api-contract.md`) for any backend endpoint involved.
- A data model section in the product spec showing the local projection of provider state.
- A verification plan (`verification-plan.md`) covering the failure-modes table below.
- A reconciliation job with an alert.
- Monitoring rules: payment failure rate, webhook 5xx, refund rate, dunning queue depth, MRR step-down.
- A daily reconciliation row added to `docs/runbooks/maintenance.md` if not already present.

## Failure modes (each must be addressed)

| Failure | Where addressed |
|---|---|
| Provider down | Graceful degradation: queue, retry, user-visible message; status-page link. |
| Webhook delivery failure / replay | Idempotent handler with replay window; missed-event reconciliation. |
| Webhook signature mismatch | Reject with alert; never act on unsigned events. |
| Local DB and provider diverge | Daily reconciliation; alert on drift; auto-heal where safe, otherwise manual queue. |
| Card decline at signup | UI surface; abandoned-cart path; retry policy. |
| Renewal decline (dunning) | Scheduled retries; user comms; eventual cancel with grace period; access lost only after a documented grace. |
| Refund needed | Admin UI or runbook; audit trail; provider-initiated; user comms. |
| Chargeback / dispute | Inbound webhook route; evidence collection; access action (suspend / keep) per policy. |
| Tax calculation wrong | Reconciliation between computed and reported tax; alert above a drift threshold. |
| Currency rounding / FX surprises | Fixed prices per currency where possible; documented rounding policy; reconcile against provider report. |
| Subscription state mismatch | Reconciliation; canonical resolution via provider; local state corrected. |
| Proration unexpected | Tested in verification plan for plan-change and trial conversion. |
| Compliance event (VAT registration threshold, sales-tax nexus) | Reported in user batch summary as a real-time block. |
| Provider API key rotation needed | Scheduled per §P11; verified by synthetic transaction. |
| Provider account suspended | Critical incident; documented recovery path including support contact and timeline. |

## Anti-patterns

- Making access decisions from a stale local cache without reconciliation.
- Trusting an unsigned webhook.
- Skipping idempotency keys "because the endpoint is rare".
- Hard-coding tax rates instead of using a tax engine.
- Treating refunds as an edge case to handle later.
- A dunning flow with no grace period.
- Recording payment-touching decisions outside an ADR.
- Reporting MRR from local data without a daily reconciliation against the provider.

## Cross-references

- §11.1 rows: Payments (web), Payments (mobile, digital goods), Sales tax / VAT.
- §P10 monitoring: payment health alerts.
- §P11 maintenance: daily reconciliation, quarterly key rotation, quarterly tax-rule review.
- `runbooks/artifacts/api-contract.md` for endpoint shape.
- `runbooks/artifacts/verification-plan.md` for failure-mode coverage.

---

## Review Agent rubric

- Is PCI scope minimized (hosted checkout) or is the deviation justified by an ADR?
- Is the provider treated as source of truth, with a local projection synced via signed webhooks?
- Does every provider-mutating call carry an idempotency key tied to the originating event?
- Are webhook signatures verified before any action, with rotation on cadence?
- Is a daily reconciliation job present and alerting on drift?
- Is every failure mode in the table addressed by a named surface (UI / retry / dead-letter / manual queue) and tested?
- Are currency and tax handling decisions captured in an ADR?
- Are refund, dispute, and dunning flows treated as first-class (not afterthoughts)?
- Are payment monitoring rules in place (failure rate, webhook 5xx, refund rate, dunning depth, MRR step-down)?
- Do tax thresholds (nexus, VAT registration) feed the user batch summary?
- Does this task's verification plan reference the failure-modes table above?
