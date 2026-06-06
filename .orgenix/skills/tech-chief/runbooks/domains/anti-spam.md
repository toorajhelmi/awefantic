# Runbook: Anti-Spam / Abuse Domain

## Purpose

Define the integration shape, failure handling, and operating posture for protection against automated and human abuse — on public forms, read-only enumeration paths, login flows, and signup. Tied to §11.1 row "Anti-spam for public forms"; extends the row's forms-only scope to cover read-endpoint enumeration and login abuse.

## When to use

Any task that introduces, modifies, or operates an externally-reachable surface that can be exploited for automated abuse: public forms (contact, lead capture, comment), signup, login, password reset, paginated public-read endpoints, public search, share-target endpoints, email-send triggers, file-upload endpoints, OTP/SMS send.

## Required posture (regardless of provider)

| Posture item | Requirement |
|---|---|
| Honeypot | Every public form has a hidden honeypot field that bots fill; server rejects with a successful-looking response. |
| Per-IP rate limit (write surfaces) | Per-IP and per-account rate limits are enforced server-side with documented windows. Limits are recorded as ADRs at L3+. |
| Per-IP and per-key rate limit (read surfaces) | Public read endpoints that can enumerate users, content, or addresses have per-IP and (where applicable) per-key rate limits. Defaults are conservative; widening requires an ADR. |
| Anti-enumeration | Endpoints that respond differently for "exists" vs. "does not exist" (login, password reset, signup uniqueness check) return uniform responses by default. Where the UX requires a different response, the difference is rate-limited and logged. |
| Captcha escalation | A captcha (default hCaptcha per §11.1) is wired but disabled by default; abuse signals enable it per-IP, per-account, or globally. The enabling and disabling are policy-driven, not code-change-driven. |
| Bot detection signals | Multiple weak signals (cookie, ASN, user agent, header coherence, request rate, request pattern) are combined into a score; a single signal does not gate access. |
| Abuse logging | Rejected requests are logged with anonymized signals (no IP retained beyond statutory retention); aggregated for analysis. |
| Allowlist / blocklist | A maintenance-grade allowlist (your own monitoring synthetic agents, partner integrations) and a blocklist (known abusive IP ranges, known abusive accounts) are first-class artifacts, not hardcoded. |
| Token brute-force protection | Tokens (verification, magic link, OTP, reset) have short TTL, low entropy budgets per IP/account, and exponential backoff. |
| Account-takeover signals | Login attempts that exceed normal patterns (impossible travel, sudden device change, password spray) trigger step-up auth or temporary lockout. |
| Webhook abuse | Endpoints that accept inbound webhooks verify signatures and replay windows (per `api-contract.md` and `payments.md`). |
| Content moderation overlap | Posts, comments, and other UGC ride on `moderation.md`; anti-spam adds rate + bot signals, moderation adds content classification. |
| Cost protection | Each public surface that triggers a paid downstream (SMS send, transactional email, classifier call) has its own per-IP and per-account budget; aggregate guards in `monitoring-plan.md` protect against cost-amplification attacks. |

## Required outputs (per anti-spam task)

- An ADR for any change in rate-limit defaults, captcha policy, or anti-enumeration posture.
- API contract entries for any surface that adds, changes, or removes a rate-limited path (the contract names the limit; the limit is not implicit).
- A verification plan covering: honeypot rejection, rate-limit triggers (per-IP, per-account, per-key), captcha escalation policy, anti-enumeration uniformity, token brute-force backoff, account-takeover step-up triggers, allowlist passthrough.
- A monitoring plan with: rejected-request rate by surface, captcha-enable events, blocked-account events, token-brute-force triggers, impossible-travel signals, cost-amplification alerts on paid-downstream surfaces.
- An `assumptions/` entry for default rate-limit values (with `revisit_when` triggers like "rejection rate > 5% of legitimate traffic" or "abuse incidents per week > N").
- Updates to `allowlist.md` and `blocklist.md` in `docs/operations/` if those files change.

## Failure modes (each must be addressed)

| Failure | Where addressed |
|---|---|
| Legitimate user hits a rate limit | UX surfaces a clear retry-after; if a class of legitimate users repeatedly hits the limit, the limit is raised via OA with `revisit_when` and surfaced out-of-cycle. |
| Rate-limit bypass via distributed IPs | Per-account and per-key limits as the second layer; abuse-signal scoring catches distributed patterns. |
| Captcha provider outage | Open-fail to a stricter rate limit; or open-fail to no-captcha for short windows with an alert; documented in the ADR. |
| Allowlisted synthetic agent gets blocked | Synthetic agent fails; on-call paged; allowlist is the fix path. |
| Anti-enumeration regression (response differs between exists/does-not-exist) | Pre-merge test asserts uniform responses; a regression is a §13-grade defect. |
| Token brute-force succeeds before lockout | Audit log; lockout policy reviewed; user notified; corrective ADR. |
| Account takeover succeeds despite signals | Incident note; signals re-tuned; user notified. |
| Cost-amplification attack on a paid downstream | Per-IP / per-account budget caps fire; aggregate guard activates; provider switched to throttled mode if available. |
| Honeypot false positive (legitimate browser autofills) | Honeypot field is `autocomplete="off"`, hidden from screen readers, and not labeled in a way autofill targets; failure surfaces a generic retry. |
| Blocklist over-broad (false positive class) | Periodic review; legitimate-rejection metric alerts; surgical un-blocks. |
| Webhook replay | Signature + replay window; per `api-contract.md`. |
| OTP/SMS abuse (toll fraud) | Per-recipient and per-IP caps; carrier-network signals; suspension on patterns. |

## Anti-patterns

- Single layer of defense (only captcha, only rate limit).
- Captcha that everyone sees from the first request (UX hostile and ineffective vs. distributed bots).
- Rate limits expressed as constants in code without an ADR or `revisit_when`.
- Anti-enumeration done by a client-side toast (response body still differs).
- Login that returns "user not found" vs. "wrong password" without rate-limiting and logging.
- Logs that retain raw IPs beyond statutory retention.
- A hardcoded allowlist or blocklist in source instead of a versioned artifact.
- Paid-downstream surfaces (SMS, transactional email, classifier) without their own per-IP and per-account budgets.
- A captcha provider in §11.1 as the only line of defense.

## Cross-references

- §11.1 row "Anti-spam for public forms" (this runbook extends to read endpoints, login, and paid-downstream surfaces).
- `runbooks/domains/email-transactional.md` for OTP/email-send rate limits.
- `runbooks/domains/moderation.md` for UGC content layer (different defense purpose).
- `runbooks/domains/payments.md` for webhook signature/replay handling.
- `runbooks/artifacts/api-contract.md` for explicit rate limits per endpoint.
- `runbooks/artifacts/verification-plan.md` for honeypot, rate-limit, anti-enumeration coverage.
- `runbooks/artifacts/monitoring-plan.md` for abuse and cost-amplification alerts.

---

## Review Agent rubric

- Does every public form have a honeypot, and does the server respond uniformly to honeypot-triggered submissions?
- Are per-IP AND per-account rate limits enforced on write surfaces, with values recorded in an ADR or OA?
- Are public read endpoints that can enumerate users / content / addresses rate-limited, with anti-enumeration uniform responses where the UX permits?
- Is a captcha wired but escalation-driven (not first-request)?
- Are bot signals combined into a score, not single-signal-gated?
- Are tokens (verification, magic link, OTP, reset) protected with short TTLs and exponential backoff?
- Are account-takeover signals (impossible travel, password spray) implemented with step-up auth or lockout?
- Are paid-downstream surfaces (SMS, email, classifier) protected with per-IP, per-account, AND aggregate cost guards?
- Are abuse logs anonymized within statutory retention, not retaining raw IPs indefinitely?
- Are allowlist and blocklist first-class versioned artifacts (`docs/operations/`)?
- Does the verification plan cover honeypot, rate limit, anti-enumeration, token backoff, captcha escalation, allowlist passthrough?
- Does the monitoring plan track rejected-request rate, captcha-enable events, lockouts, impossible-travel, cost-amplification?
- Is every rate limit named in the API contract, with no shorthand?
- Are rate-limit values paired with `revisit_when` triggers in their OA?
