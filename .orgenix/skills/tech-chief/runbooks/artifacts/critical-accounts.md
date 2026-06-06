# Runbook: Critical Accounts Inventory

## Purpose

The single, current list of every external account the live system depends on (`chief-of-tech-operating-doc.md` §9 "Secrets And Critical Accounts"). Used by CoT during onboarding, by every go-live, by quarterly secret rotation, by failure recovery, and by the user as the auditable record of "where their product lives."

## When to use

Every project. Created during the greenfield onboarding block (or audited at project import for existing repos). Updated whenever an account is added, removed, or changes ownership.

## Location

`docs/operations/critical-accounts.md`. One per project. Names only; no values.

## Required fields

A row per account. Every account has:

| Field | Notes |
|---|---|
| `account_id` | Stable, project-unique short name (e.g., `apple-asc`, `cloudflare-zone`, `stripe-prod`). |
| `service` | The service this account is with (App Store Connect, Cloudflare, Stripe, etc.). |
| `purpose` | Why the system depends on this account. |
| `tier` | `gating` (loss locks users out) / `paid_critical` (loss has direct cost) / `support` (loss degrades but does not break). |
| `owner` | The user is the ultimate owner. The operating party is the user or CoT-with-the-user's-vault. |
| `login_method` | Email + password, SSO, OAuth via a provider, etc. |
| `mfa_method` | What MFA is configured (TOTP, hardware key, SMS, recovery codes). The vault location of recovery codes is referenced by name, never inlined. |
| `recovery_codes_location` | Named reference to the vault entry (e.g., `1password://covu-os/recovery/apple-asc`). |
| `billing_contact` | Who is billed; which payment method; renewal date. |
| `renewal_date` | Next renewal or expiration; CoT schedules a reminder one month ahead. |
| `secrets_associated` | The named secrets in the secrets inventory (no values) that this account issues. |
| `notes` | Anything special: app-specific passwords, IP allowlists, regional rules, expired-card history. |

## Conditional fields

| Condition | Required field |
|---|---|
| `tier` = `gating` | `recovery_drill_cadence`: when CoT verifies that recovery actually works (default: quarterly per §P11). |
| Account requires the user's legal identity (Stripe, App Store Connect, Google Play, business banking, tax registrations) | `legal_owner`: the legal entity that holds the account; `user_action_required`: yes (real-time block per §5.2). |
| Account is shared between multiple projects | `shared_with`: the projects that share it; rotation requires coordination. |
| Domain or DNS account | `apex_domain`, `nameservers`. |
| Payment processor | `processor_mode`: `test` / `live`; `webhook_endpoints`; `webhook_signing_secret` (name only). |
| App store account | `bundle_ids` / `package_names`; `team_id` / `developer_id`; current `submission_state`. |

## Anti-patterns

- Inlining a password, secret, recovery code, or token. The inventory is names only.
- Listing CoT as the legal owner. The user is always the legal owner of identity-bearing accounts.
- Letting CoT hold the only copy of a recovery credential (§13 forbids).
- A `gating` account with no `recovery_drill_cadence`.
- Updating the inventory on rotation without superseding the prior entry (use append + status, not in-place edit).

## Short example

```yaml
- account_id: apple-asc
  service: Apple App Store Connect
  purpose: iOS app distribution and review.
  tier: gating
  owner: user (legal); cot operates with user vault.
  legal_owner: <user legal entity>
  user_action_required: yes (account creation in vault inventory pass; real-time block per §5.2)
  login_method: Apple ID via SSO
  mfa_method: TOTP + recovery codes
  recovery_codes_location: 1password://covu-os/recovery/apple-asc
  billing_contact: <user>; annual developer fee on <date>
  renewal_date: 2027-04-15
  secrets_associated:
    - apple-asc-issuer-id
    - apple-asc-key-id
    - apple-asc-private-key
  recovery_drill_cadence: quarterly
  bundle_ids: [com.example.app.ios]
  team_id: ABC1234567
  submission_state: in_review
  notes: Apple Sign In is required by §4.8 if any third-party social sign-in is offered.
```

---

## Review Agent rubric

- Is every account listed `tier`-classified, with an honest tier (gating vs. paid_critical vs. support)?
- Does every `gating` account have a `recovery_drill_cadence`?
- Is every account's `recovery_codes_location` a vault reference, never an inlined value?
- For every identity-bearing account, is the `legal_owner` the user and `user_action_required` correctly flagged?
- Is the `renewal_date` set for every account that has one (domain, developer accounts, certificates)?
- Are the named secrets in `secrets_associated` actually present in the secrets inventory? Orphans are defects.
- Does the inventory cover the surface implied by the project's §11.1 rows (domain registrar, DNS, hosting, db, auth, payments where applicable, email sender, error tracker, analytics, monitoring)? Missing rows are defects.
- For payment processors, is `processor_mode` set and consistent with the verification plan and monitoring plan?
- Is the inventory free of secret values, passwords, or recovery codes?
