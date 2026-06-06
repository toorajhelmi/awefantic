# Runbook: Marketing Claims Domain

## Purpose

Define the integration shape, failure handling, and operating posture for any user-facing claim about the product: pricing, performance, availability, guarantees, health/financial/professional claims, accessibility statements, "we are X" identity claims. Tied to `risk-thresholds.md` §3 (consumer protection / product claims) and to the §3 modifier "Regulated work" (FTC truth-in-advertising, equivalents). There is no §11.1 row for marketing claims; this runbook is the canonical posture.

## When to use

Any task that introduces, modifies, or operates a surface that makes a claim a user could rely on: landing pages, pricing pages, feature lists, comparison pages, in-app onboarding copy, ads, email campaigns, app store descriptions, social posts that originate from the product, press releases, public roadmap pages, status-page wording.

## Required posture (regardless of jurisdiction)

| Posture item | Requirement |
|---|---|
| Claim inventory | Every claim with potential user reliance is listed in `docs/marketing/claims-inventory.md` with: claim text, surfaces it appears on, evidence (link to feature, test, contract, metric), owner, last verified date. |
| Claim ↔ behavior linkage | Every claim points to a verifiable artifact: an API contract, a verification scenario, a metric, an SLO, a feature flag state, a regulator-approved source. Claims without a linkage are defects. |
| Pricing source of truth | Pricing claims are derived from a single source (provider price catalog, ADR-locked pricing artifact), not free-text-edited per page. Drift between source and copy is caught by an invariant test. |
| Performance / SLO claims | Any "fast", "instant", "real-time", "99.X% uptime" claim is paired with the measured metric and the time window. Aspirational claims are explicitly marked or rewritten. |
| Comparison claims | Comparisons to named competitors require a dated, reproducible methodology (corpus, methodology document, measurement date). Anonymous comparisons ("the leading X") follow the same evidence rule. |
| Endorsement / testimonial | Endorsements are real, with consent on file (in `docs/marketing/endorsements/`); paid endorsements are disclosed per FTC guidelines (or jurisdiction equivalent). |
| Health / financial / professional claims | These are real-time blocks per `risk-thresholds.md` §3 unless the project has an existing ADR covering the category. |
| Accessibility claims | Statements about accessibility (WCAG level, screen-reader support) are matched to an accessibility test report, not asserted from belief. |
| Localization | Claims are localized per the project's locale plan; literal translation is checked against legal equivalents (especially price-related and superlative-related claims). |
| Disclosure & disclaimer | When a claim has known caveats (free trial limits, "subject to availability", "results vary"), the disclosure is visible at the point of claim, not buried in fine print. |
| Versioning | The claims inventory is versioned; material changes are recorded. Marketing surfaces include a build timestamp and a link to the inventory version they were generated from. |
| Pre-launch review | Every marketing surface is reviewed by the Review Agent under this runbook's rubric before publish. |

## Required outputs (per marketing-claims task)

- An update to `docs/marketing/claims-inventory.md` for any new, removed, or modified claim. The update lists the claim, surfaces, evidence, owner, and date.
- An ADR for any new claim category (e.g., adding a health claim, a guarantee, a pricing tier with new wording), or for a change in posture that affects multiple surfaces.
- A verification plan covering: claim ↔ behavior linkage for every claim; pricing source-of-truth invariant test; performance-claim measurement plan; comparison-claim methodology; disclosure presence.
- A monitoring plan with: drift alerts (when a claim's underlying metric or source moves out of line with the claim), comparison-data freshness, accessibility test freshness.
- An OA (with `surfacing: out_of_cycle` if the claim is a new pricing or guarantee statement; `real_time_block` if regulated category per `risk-thresholds.md` §3).

## Failure modes (each must be addressed)

| Failure | Where addressed |
|---|---|
| A claim contradicts current product behavior | Real-time block per `risk-thresholds.md` §3; §5.1 precedence rule: ship corrected copy, surface divergence. |
| A pricing claim diverges from the source-of-truth catalog | Invariant test fails the build; correction blocks publish. |
| A performance claim ("p95 ≤ 200ms") is true now but degrades | Drift alert on the underlying metric; surface in periodic summary; correct or retract the claim. |
| A comparison-to-competitor claim is based on an outdated methodology | Comparison-data freshness alert; refresh or retract. |
| An endorsement is paid but undisclosed | Audit catches; corrective edit; FTC-style disclosure added. |
| A health / financial / professional claim is made without ADR | Pre-merge check on the claims inventory flags the new category; real-time block. |
| Accessibility statement does not match test report | Pre-merge check; correct the statement or fix the surface. |
| Localization mistranslates a superlative or price | Pre-publish review per locale; legal-equivalents check. |
| A claim is removed from the inventory but still appears on a surface | Synthetic transaction scrapes published surfaces and reconciles with the inventory; orphan claims are defects. |
| A feature flag changes default and a claim becomes false | Flag-change checklist includes a claims-inventory check. |
| App store listing copy drifts from product behavior over time | Periodic claims audit (P11 monthly); the listing is part of the inventory. |
| Press release / external post drifts from product behavior | The inventory covers external surfaces; press templates are versioned in the repo. |
| Pricing tier added in provider catalog but not in copy | Sync job between provider catalog and the source-of-truth artifact; alert on drift. |

## Anti-patterns

- A pricing page free-text-edited per surface ("Save 50%" pasted manually).
- "p99 < 50ms" claims with no measurement or window.
- "We comply with X" statements without a documented compliance posture artifact.
- Comparison-to-competitor claims with no methodology link.
- Endorsements without consent on file.
- Health / financial / professional claims that "feel reasonable" without an ADR.
- A claims inventory that exists but is not consulted before publish.
- Disclosures placed in footers when the claim is in the hero.
- Localized superlatives translated literally without legal-equivalents check (especially "best", "guaranteed", "free", "no risk").
- Roadmap statements treated as claims of availability.

## Cross-references

- `risk-thresholds.md` §3 (consumer protection / product claims tiers).
- §3 modifier "Regulated work" (FTC truth-in-advertising, etc.).
- §5.1 verification-vs-operate precedence (claim contradicts behavior).
- `runbooks/artifacts/verification-plan.md` for claim ↔ behavior linkage and invariant tests.
- `runbooks/artifacts/monitoring-plan.md` for drift and freshness alerts.
- `runbooks/domains/payments.md` for pricing source-of-truth (provider catalog).
- `runbooks/domains/email-transactional.md` for marketing-vs-transactional separation (this runbook excludes marketing email).

---

## Review Agent rubric

- Is every claim on the change set's surfaces present in the claims inventory with evidence, owner, and last-verified date?
- Does every claim point to a verifiable artifact (contract, scenario, metric, source-of-truth catalog), not "we believe"?
- Are pricing claims derived from a single source, and is the source-of-truth invariant test in place?
- Are performance / SLO claims paired with a measured metric and time window, not aspirational?
- Are comparison claims paired with a dated, reproducible methodology?
- Are endorsements real, with consent on file, and paid endorsements disclosed?
- Are health / financial / professional / accessibility claims covered by ADRs or surfaced as real-time blocks per `risk-thresholds.md` §3?
- Is localization of claims checked for legal-equivalents per locale (not literal translation of superlatives)?
- Are disclosures placed at the point of claim, not in fine print?
- Are external surfaces (app store listings, press) inside the inventory?
- Does the verification plan include a claim-drift check (synthetic scrape vs. inventory)?
- Does the monitoring plan track drift on the underlying metrics?
- Are claims removed from the inventory also removed from every surface (no orphans)?
- For any net-new claim, is the OA recorded with the correct `surfacing` tier per `risk-thresholds.md`?
