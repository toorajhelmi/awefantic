# Runbook: API Contract

## Purpose

Define the shape of every API endpoint before any code is written, so coding agents implement to a fixed contract and the Review Agent can verify behavior against it.

## When to use

Any task that adds or changes an API surface (internal or external), at L2+ for new surfaces, L3+ for changes to existing surfaces.

## Location

- Source of truth in machine-readable form: `apps/<surface>/openapi.yaml` (or TypeSpec).
- Human-readable companion: `docs/product/<feature-slug>/api.md`.

## Required fields (per endpoint)

| Field | Notes |
|---|---|
| `method` | HTTP method. |
| `path` | Full path including version segment (e.g., `/api/v1/users`). |
| `summary` | One-line purpose. |
| `auth` | Who can call: anonymous / authenticated / scoped (which scope/role). |
| `request` | Body / query / params schemas, with required vs. optional, types, constraints. |
| `response_success` | Status code and body schema for each success case. |
| `response_errors` | For every error path: status code, body shape, when it triggers. |
| `idempotency` | Whether the endpoint is idempotent; if so, the idempotency key location. |
| `rate_limit` | Limit, window, and what happens on overflow. |
| `versioning` | Which API version it belongs to; breaking-change policy below. |

## Conditional fields

| Condition | Required field |
|---|---|
| Auth required | `permissions`: which roles/scopes have access; how forbidden responses look. |
| Touches PII | `pii_fields`: list, plus the retention and erasure plan. |
| Touches money | `pricing_currency`, `idempotency` required, full reconciliation note. |
| Long-running | `pattern`: sync / 202 + polling / webhook / streaming, with full lifecycle. |
| Emits side effects (email, push, webhook, queue) | `side_effects`: each effect, where it goes, retry/dead-letter policy. |

## Breaking change rules

A change is breaking if any of:

- a required field is added to a request
- a response field is removed or renamed
- an error code's status changes
- the auth requirement increases
- the rate limit decreases
- side-effect behavior changes for the same input

Breaking changes require: a new API version, a deprecation window for the prior version, and an ADR (`adr.md`) that records the change.

## Exhaustiveness rule

Every endpoint listed in the API surface must have its full field set populated. "Shorthand" entries (one-line summaries without request/response/error detail) are not contract entries; they are TODO items. The Review Agent treats any shorthand entry as a defect. Webhooks, callbacks, and DMCA/legal/incident endpoints are subject to the same rule — these are exactly the endpoints whose error paths are most often skipped.

**Reserved / placeholder endpoints are not exempt.** A "reserved" entry that lists a method and path but leaves request/response/errors as `(reserved)` or `TBD` is a TODO item with a stable URL, not a contract entry. Two valid handlings:

1. **Remove the entry from the v1 contract.** The URL is not reserved until the contract lists it; if URL reservation matters for forward compatibility, record the reservation in an ADR (`adr.md`), not the contract.
2. **Ship a real minimal entry.** If the endpoint exists in the v1 surface even as a stub, give it a real request/response/error set — e.g., a single `501 Not Implemented` response with a typed error envelope and explicit `auth` and `rate_limit`. The endpoint then ships its honest current behavior.

The Review Agent rejects `(reserved)` or `TBD` placeholders. There is no third option.

## Anti-patterns

- Documenting only the happy path.
- Returning the same status code for unrelated errors.
- Idempotency claimed but the contract has no idempotency key.
- "TBD" rate limit. Choose one, log it as an Operating Assumption if needed.
- Coupling the contract to the storage schema (the contract is the boundary; the schema is implementation).
- Adding new fields to a stable response without versioning.
- Listing an endpoint with only a summary line and assuming the verification plan will pick up the slack.

## Short example

```yaml
- method: POST
  path: /api/v1/billing/checkout
  summary: Start a subscription checkout session.
  auth: authenticated
  permissions: own user only
  request:
    body:
      required: [planId]
      properties:
        planId: { type: string }
  response_success:
    status: 200
    body: { url: string }
  response_errors:
    - status: 401
      when: caller is not authenticated
    - status: 404
      when: planId is unknown
    - status: 409
      when: caller already has an active subscription
  idempotency: planId+userId for 24h
  rate_limit: 10/min per user
  side_effects:
    - external: stripe.checkout.session created
```

---

## Review Agent rubric

- Are method, path, summary, and auth populated for **every endpoint listed in the surface**, with no shorthand entries and no `(reserved)` / `TBD` placeholders? (Reservations live in an ADR; stubs ship a real `501` envelope.)
- Is the request schema complete (required vs. optional, types, constraints)?
- Is every success status and body documented?
- Is every error path documented with its trigger condition?
- Is the idempotency claim honest given the body shape?
- Is rate-limit specified (not "TBD")?
- If PII is touched, is retention/erasure documented?
- If money is touched, is reconciliation referenced?
- For long-running operations, is the lifecycle fully described?
- For endpoints with side effects, are retry and dead-letter policies documented?
- If this is a change to an existing endpoint, is the change either non-breaking or accompanied by versioning + an ADR?
- Does the contract avoid leaking the storage schema?
- For webhooks and any endpoint with signature/replay sensitivity: is the signature scheme, replay window, and replay-handling explicit?
