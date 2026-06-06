# Runbook: Monitoring Plan

## Purpose

Define the alerts, dashboards, SLOs, cost guards, and reconciliation cadences that watch a feature or surface once live (`chief-of-tech-operating-doc.md` §P10, §P11). The monitoring plan is a peer of the verification plan: verification covers pre-merge correctness; monitoring covers in-prod correctness.

## When to use

Every L3+ task that adds a user-facing surface, a background job, a paid third-party integration, or a regulated process. L1–L2 tasks add monitoring only when their change touches a surface that did not previously have a rule.

## Location

`docs/product/<feature-slug>/monitoring-plan.md` (or `docs/operations/monitoring/<feature>.md` for cross-feature surfaces).

## Required fields

| Field | Notes |
|---|---|
| `feature` | The feature or surface. Link to its product spec. |
| `slos` | The service-level objectives: availability, latency (percentile), error rate, freshness, etc. Each has a target and a measurement window. |
| `alerts` | Each alert is a row: `id`, `metric`, `condition`, `threshold`, `window`, `severity` (`P1`/`P2`/`P3`), `routing` (who is notified), `failure_mode_id` it detects (cite the product spec), `runbook_link` (mitigation steps). |
| `dashboards` | Named dashboards built for this surface; what they show; who reads them. |
| `cost_guards` | Per-line: the cost line (third-party API, GPU minutes, storage, egress), the per-unit cap, the documented max-volume, the resulting aggregate per month, the monthly budget for that line. `aggregate ≤ budget` is a hard rule; if it does not hold, raise the budget (and record as an `out_of_cycle` Operating Assumption per §5.3) or lower the cap. |
| `reconciliation_jobs` | For every external system whose state must match local state (payments, email delivery, queues, identity provider, etc.): cadence, drift detection, alert routing. |
| `synthetic_transactions` | The critical user journeys probed from outside the platform (signup, login, key write, key read, payment, push). |
| `failure_mode_coverage` | A table mapping every `failure_mode_id` from the product spec to an alert id, a synthetic-transaction id, or an explicit `accepted_silent` note with rationale. |

## Conditional fields

| Condition | Required field |
|---|---|
| Touches money | `payment_health`: failed charges, refund rate, webhook failure rate, dispute rate; reconciliation cadence (default: daily). |
| Touches PII | `privacy_alerts`: unauthorized-access patterns, anomalous export, DSAR queue depth. |
| Touches UGC | `moderation_alerts`: queue depth, classification failure rate, takedown latency. |
| Touches mobile | `crash_alerts`: per-version crash-free rate; release-health rules. |
| Has a paid third-party API on the request path | `vendor_health`: error rate, latency, fallback activation, monthly cost vs. budget. |
| Has a hard external deadline (regulatory reporting, audit log) | `regulatory_alerts`: missed submission, format violation. |

## Anti-patterns

- Cost guards listed as per-unit caps without the aggregate × max-volume guard.
- Cost-line items that sum to more than the stated monthly budget for the whole feature (a structural defect, not a wording issue).
- Alerts without `routing` (no one is paged).
- Alerts without `runbook_link` (no one knows what to do).
- Alerts without `failure_mode_id` (orphan: detects a thing nobody declared).
- SLOs without measurement windows.
- Monitoring plan that omits reconciliation for an external system the feature depends on.
- Embedding a Review Agent rubric inside this artifact (rubrics live only in runbook files; §7.2).

## Short example

```yaml
feature: profile-page
slos:
  - latency: GET /api/v1/users/{id} p95 ≤ 300ms over 5m
  - availability: 99.9% monthly for the surface
  - freshness: avatar updates visible within 5s
alerts:
  - id: ALT-01
    metric: api.users.errors.5xx
    condition: rate > 1% over 5m
    threshold: 1%
    window: 5m
    severity: P2
    routing: on-call
    failure_mode_id: FM-02
    runbook_link: docs/runbooks/incidents/api-5xx-spike.md
cost_guards:
  - line: supabase storage egress
    per_unit_cap: n/a (metered)
    max_volume: 50GB/month (project plan ceiling)
    aggregate_per_month: included in plan
    budget: $25/mo
synthetic_transactions:
  - signup-and-avatar-upload (every 5m, all regions)
failure_mode_coverage:
  FM-01 (oversize avatar): pre-merge contract test + ALT-? (none — accepted_silent: rejected at edge, no operational concern)
  FM-02 (storage write failure): ALT-01
  FM-03 (resize timeout): ALT-02
  FM-04 (display-name conflict): pre-merge contract test only (accepted_silent: user-visible 409 is the response)
  FM-05 (auth missing): pre-merge contract test only (accepted_silent: 401 is the response)
```

---

## Review Agent rubric

- Are SLOs explicit (target + window), not aspirational?
- Does every alert have `routing`, `runbook_link`, `severity`, and a `failure_mode_id` it detects?
- For every cost line: does `per_unit_cap × max_volume` actually fit within `budget`? If not, is the discrepancy flagged as an `out_of_cycle` Operating Assumption with a documented decision (raise budget or lower cap)?
- Does the sum of all monthly cost-line budgets match the feature's stated total monthly budget?
- Does every `failure_mode_id` from the product spec appear in `failure_mode_coverage` with an alert id, a synthetic-transaction id, or an explicit `accepted_silent` rationale? (No `?` cells; no orphan ids.)
- For external-state dependencies, is a reconciliation job present with cadence and drift threshold?
- For payments / PII / UGC / mobile / vendor / regulatory work, are the conditional sections present?
- Are synthetic transactions probing actual user journeys from outside the platform, not just internal liveness?
- Does the plan exist before the feature is promoted to prod?
