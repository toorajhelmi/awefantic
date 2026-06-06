# Runbook: Greenfield Onboarding (Phase, pre-P4)

## Purpose

Bootstrap a brand-new project safely. A new project requires accounts, payment instruments, identity, and credentials that physically need founder action (`chief-of-tech-operating-doc.md` §5.2). This runbook collapses all of those into one batched block that CoT routes through the parent/delegator chain to CoS.

## When to use

At the start of every L5 greenfield task, or whenever a project's foundational accounts do not yet exist.

## Outputs

- An `onboarding-block.md` artifact at `docs/operations/onboarding-block.md`, instantiated from `runbooks/artifacts/onboarding-block.md` (all sections that the project triggers — mobile, payments, UGC, PII, i18n — populated).
- A `critical-accounts.md` artifact at `docs/operations/critical-accounts.md`, instantiated from `runbooks/artifacts/critical-accounts.md`, populated as each account is created.
- A `knowledge/risk-thresholds.md` file. If a project-level override is needed it is recorded as `docs/adr/NNNN-risk-thresholds-override.md`; otherwise the project inherits the document-system defaults at `knowledge/risk-thresholds.md` in the workspace.
- A first ADR (`docs/adr/0001-stack.md`) for the project, with `docs/adr/INDEX.md` initialized.
- `docs/assumptions/INDEX.md` initialized.

## Required steps (in order)

1. **Define the project handle.** A short slug used in repo names, env vars, and account aliases.
2. **Confirm the legal entity** the founder will operate the project under. Operating Assumption if not known yet, reported as a real-time block before any account that requires it.
3. **Confirm risk thresholds.** If the project needs anything different from the workspace defaults in `knowledge/risk-thresholds.md`, write an override ADR; otherwise reference the defaults.
4. **Produce the account list.** From §11.1 and any task-specific novel-area ADRs, list every paid SaaS account needed for the v1 stack. Cross-check against the domain runbooks the project will use (e.g., `moderation.md` adds a classifier provider; `mobile.md` adds App Store Connect and Google Play Console; `email-transactional.md` adds a sender domain).
5. **Bundle the founder onboarding block.** Instantiate `runbooks/artifacts/onboarding-block.md` as `docs/operations/onboarding-block.md`. All sections triggered by the project (mobile, payments, UGC, PII, i18n) populated. One blocker routed to CoS, not drip-fed.
6. **Receive the bundle back.** As each account is created and the credentials are placed in the founder's vault, CoT updates `docs/operations/critical-accounts.md` (per `runbooks/artifacts/critical-accounts.md`) with owner, login method, MFA, recovery codes location, billing contact, and renewal dates.
7. **Set up source control first.** Repo created, `main` protected, CODEOWNERS pointing to CoT, branch naming and PR template in place. Initialize `docs/adr/INDEX.md`, `docs/assumptions/INDEX.md`, `runbooks/00-index.md`.
8. **Set up environments.** `local`, `dev`, `prod` per §9. No shared credentials between environments.
9. **Set up CI/CD.** Lint, typecheck, unit, build, E2E, deploy-to-dev on PR merge, manual or phased deploy to prod.
10. **Set up secrets.** Platform-native stores; secrets inventory in repo (names only). Each secret references the critical account that issues it.
11. **Set up monitoring stubs.** Error tracking, uptime, logging endpoints — empty but live, so later phases just add alerts.
12. **Write ADR-0001** locking in the stack as actually wired up, not as planned. Reference any domain-runbook overrides the project takes.
13. **Verify the bootstrap.** Run a synthetic transaction (signup or hello-world) end-to-end from local through dev to prod.

## Anti-patterns

- Drip-feeding the founder one account request at a time over days.
- Starting any P4 work before the founder has completed the CoS-routed onboarding block.
- Holding the only copy of any recovery credential.
- Skipping ADR-0001 ("we'll write it later").
- Setting up only some of `local` / `dev` / `prod`.
- Wiring CI without the protected-`main` rule from day one.

## Anti-pattern: skipped verification

If step 12 cannot run cleanly, the bootstrap is not done. Do not start P5 verification planning for the actual product until the synthetic transaction passes.

## Output for CoS routing

The onboarding block is ONE prepared blocker/summary for CoS to route to the founder with:

- numbered list of items
- per item: what to do, what CoT will do once it is done, an estimate of time
- explicit "do not share secrets in chat — drop them in the vault and confirm here"

The CoS-routed batch summary (§5.4) tracks open items every cycle until the block is closed.

---

## Review Agent rubric

- Is the project handle defined and used consistently across repo, accounts, and env vars?
- Is the legal entity question resolved or held as a real-time block before any account that needs it?
- Is `knowledge/risk-thresholds.md` referenced, or is a project-level override ADR present?
- Does the account list include every paid SaaS the v1 stack requires, cross-checked against the domain runbooks the project will use?
- Is the founder-facing block a single bundled CoS-routed message, instantiated from the `onboarding-block.md` artifact runbook, with all triggered sections populated?
- Is `docs/operations/critical-accounts.md` populated with all required fields for every account, with `gating` accounts carrying a recovery-drill cadence?
- Is `main` protected before any code lands?
- Are `docs/adr/INDEX.md`, `docs/assumptions/INDEX.md`, `runbooks/00-index.md` initialized?
- Are `local`, `dev`, and `prod` all configured with separated credentials?
- Is CI/CD running on PR merge before any product code lands?
- Is the secrets inventory present (names only), with each secret referencing the issuing critical account?
- Are monitoring stubs live before P5?
- Is ADR-0001 written and matches the actually-wired stack, referencing any domain-runbook overrides the project takes?
- Did the bootstrap synthetic transaction pass end-to-end?
