# Runbook: Transactional Email Domain

## Purpose

Define the integration shape, failure handling, and operating posture for any transactional email surface — independent of provider. Tied to §11.1 rows "Email" and "Email compliance & template management".

## When to use

Any task that introduces, modifies, or operates an email path: account verification, password reset, magic-link login, receipts, notifications, system alerts to users, transactional confirmations, customer-support replies sent from the app, contact-form acknowledgement.

This runbook does NOT cover marketing email (CAN-SPAM / CASL / GDPR marketing-consent rules add requirements not detailed here; treat marketing email as a separate domain).

## Required posture (regardless of provider)

| Posture item | Requirement |
|---|---|
| Sending domain | A dedicated sending domain or subdomain (e.g., `mail.<project>.com`) with SPF, DKIM, DMARC records. DMARC starts at `p=none` and escalates to `quarantine` then `reject` once deliverability is stable. |
| From address policy | The `From:` address is a real, monitored mailbox (or routed). `no-reply` addresses are allowed for one-way notifications but the Reply-To still routes to a monitored mailbox. |
| Reply-To | Every transactional email has a `Reply-To` that goes to a monitored mailbox or a ticketing system. |
| List-Unsubscribe | Every email (including transactional) includes the `List-Unsubscribe` and `List-Unsubscribe-Post` headers; transactional emails clarify that unsubscribe applies to non-essential notifications only. |
| Template management | Templates are versioned in the repo (MJML or equivalent); rendering is server-side; preview tooling exists for every template. |
| Suppression table | A central suppression table holds bounces, complaints, and explicit opt-outs. Every send checks suppression before dispatch. |
| Plain-text alternative | Every HTML email has a plain-text alternative. |
| Authentication failure handling | Sends that fail SPF/DKIM/DMARC at the provider are quarantined; the provider's authentication-failure reports feed an alert. |
| Webhook ingestion | Provider webhooks (delivered, opened, bounced, complained, dropped) are ingested into the suppression table and metrics. |
| Idempotency | Sends use an idempotency key tied to the originating event (verification token, order id, etc.) to prevent double-send on retry. |
| Rate limit & throttling | Per-recipient and per-account rate limits are enforced server-side; transactional bursts (e.g., password-reset abuse) are detected and throttled. |
| Identity & masking | Recipient PII is redacted in logs; bounce/complaint reports do not leak addresses into general-purpose logs. |
| Localization | If multi-locale, every template has a per-locale variant and a documented fallback. |
| Accessibility | Templates pass color-contrast, real-text-not-image, and screen-reader checks. |
| Critical-account inventory | Email provider account is in `critical-accounts.md`; sender-domain DNS is in the DNS critical-account entry. |
| Reconciliation | Sends recorded locally vs. accepted at the provider are reconciled daily (per §P11). |

## Required outputs (per email task)

- An ADR for any new template family, any change to the sending domain or auth posture, or adoption of a new provider.
- API contract entries for: send-trigger endpoint(s) (or background job), webhook ingestion endpoint, suppression-status endpoint, preview endpoint (admin). **Full schema for every endpoint** (api-contract exhaustiveness rule).
- Template artifacts under `apps/<surface>/emails/<template-name>/` with MJML source, plain-text source, per-locale variants, and a preview output.
- A verification plan covering: every template renders for every locale; suppression check rejects suppressed recipients; bounce/complaint webhook updates suppression; idempotent send under retry; rate limit triggers; List-Unsubscribe header present; authentication passes.
- A monitoring plan with: send success rate, bounce rate, complaint rate, suppression growth, webhook lag, authentication failure rate.
- An `assumptions/` entry for sender-domain choice and default rate-limit values.
- Entries in `critical-accounts.md` for the email provider and for the sending domain's DNS records.

## Failure modes (each must be addressed)

| Failure | Where addressed |
|---|---|
| Authentication regression (SPF/DKIM/DMARC misalignment after a DNS change) | DNS critical-account renewal+drift detection; pre-merge check on DNS PR; synthetic email test from outside catches regression. |
| Bounce flood | Suppression table updates per-address; per-domain bounce-rate alert; provider may throttle the account if rate stays high. |
| Spam complaint flood | Complaint-rate alert; opt-in audit; possible reputation damage; pause to investigate cause. |
| Suppression check failed (sent to suppressed) | Pre-send check is the only allowed path; sends bypassing the check are a §13-grade defect; alert on any bypass. |
| Duplicate send under retry | Idempotency key required; retries hit cache; deduplication metric. |
| Template render failure | Pre-merge: every template renders against fixture data. Run-time: render errors fall back to plain-text minimal version or fail-open per ADR. |
| Localization missing for a recipient locale | Fallback to default locale per ADR; metric counts fallback events; corrective task. |
| Webhook delivery failure | Provider retries; local job reconciles webhook deltas; reconciliation alert. |
| Provider outage | Send queue persists; retry job; user-visible expectation set if delay > SLA. |
| Recipient address invalid at provider | Bounce → suppression; user notified at next signed-in session for the address-bound flow. |
| Mailbox/Reply-To unmonitored | P11 monthly audit; mailbox owner accountable in `critical-accounts.md`. |
| Header sweep regression (List-Unsubscribe missing on a template) | Sweep invariant test per `verification.md` (§7.3 sweep clause); fails CI on any template without the header. |
| Email contains PII it shouldn't | Pre-merge template-content audit; never log full body. |
| Sender reputation degradation | Deliverability monitoring; warm-up plan for new domains; corrective actions documented. |

## Anti-patterns

- A single sending domain shared between transactional and marketing email.
- `no-reply` From-address without a monitored Reply-To.
- Templates managed in the provider UI instead of versioned in the repo.
- Sending without checking the suppression table.
- HTML-only emails with no plain-text alternative.
- Idempotency claimed but the send path has no key tied to the originating event.
- Webhook events ingested without authentication.
- Storing bounce reports in general-purpose logs without redaction.
- Updating templates in a sweep (e.g., adding List-Unsubscribe) without an invariant test that fails on any missing template.

## Cross-references

- §11.1 rows "Email" and "Email compliance & template management".
- `runbooks/domains/privacy-dsar.md` for PII handling in bounces and complaints.
- `runbooks/artifacts/api-contract.md` for send/webhook/suppression endpoints (no shorthand).
- `runbooks/artifacts/verification-plan.md` for template render, idempotency, suppression, header sweep invariants.
- `runbooks/artifacts/monitoring-plan.md` for deliverability and reconciliation alerts.
- `runbooks/artifacts/critical-accounts.md` for the email provider and DNS records.

---

## Review Agent rubric

- Is a dedicated sending domain or subdomain set up with SPF, DKIM, and DMARC, and is DMARC actually enforced (not stuck at `p=none` indefinitely)?
- Is the `From:` address paired with a Reply-To routed to a monitored mailbox?
- Is `List-Unsubscribe` (and `List-Unsubscribe-Post`) present on every template, enforced by an invariant test?
- Are templates versioned in the repo with MJML/plain-text/per-locale variants?
- Does every send check the suppression table before dispatch, with no bypass path?
- Do provider webhooks update the suppression table and feed deliverability metrics?
- Are sends idempotent under retry, with keys tied to the originating event?
- Are per-recipient and per-account rate limits in place server-side?
- Is recipient PII redacted in logs and not present in general-purpose error reports?
- Is the email provider in `critical-accounts.md`, and are the sending-domain DNS records in the DNS critical-account entry?
- Are all email-related endpoints specified with full schema (no shorthand)?
- Does the verification plan cover header sweep invariants, suppression, idempotency, render, and locale fallback?
- Is daily reconciliation in place between locally-recorded sends and provider-accepted sends?
- Are deliverability metrics (bounce rate, complaint rate, authentication failures) alerting?
