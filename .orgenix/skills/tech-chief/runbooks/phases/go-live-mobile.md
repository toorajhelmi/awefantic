# Runbook: Go-Live (Mobile)

## Purpose

Ship a mobile app through the iOS App Store and Google Play. A mobile feature is not done until the build is approved and visible on the store in the founder's target regions (`chief-of-tech-operating-doc.md` §P9).

## When to use

The first time a mobile app reaches production for a project, and any time a new build undergoes store review (major release).

## Outputs

- A populated `docs/runbooks/go-live-mobile-<project-slug>.md` recording every step taken, build IDs, reviewer notes, and recovery paths.
- Updated `critical-accounts.md` with App Store Connect and Google Play Console entries.
- Live listings visible in the target regions.

## Required steps (in order)

1. **Developer accounts.** Apple Developer / App Store Connect and Google Play Console. Real-time block per §5.2 — founder identity required via CoS. Recovery codes and backup admin set up.
2. **App identity.** Bundle ID / application ID locked. Signing keys generated and stored in the platform's encrypted store with a documented recovery path.
3. **Store metadata.** Title, subtitle, short description, full description, keywords (iOS), categories, content rating, age rating. Strings live in the repo so they can be reviewed and translated.
4. **Visual assets.** App icon, screenshots per required device class, preview videos (if used), feature graphic (Android). All in the repo under `apps/mobile/store/`.
5. **Privacy disclosures.** Apple App Privacy and Google Data Safety completed and aligned with the actual data collection. Source of truth: a `privacy-manifest.md` in the repo.
6. **Pricing and availability.** Configure prices per region, availability list, and any IAP products. Digital subscriptions go through StoreKit / Play Billing (§11.1).
7. **Tester acquisition.** For new accounts that need real testers (e.g., Google Play closed-testing requirements), assemble the tester list. If the founder must provide testers, this is a real-time block routed through CoS.
8. **Internal / closed tracks.** Submit a TestFlight build (iOS) and an internal-track build (Android). Run the required beta duration.
9. **Pre-submission self-review.** Walk a fresh reviewer's checklist: install on clean device, sign up, complete the primary workflow, hit every advertised feature, check permissions prompts, check Apple's and Google's most common rejection categories.
10. **Submit for review.** Track the submission with build ID, submission ID, and ETA.
11. **Follow up until live.** Respond to reviewer messages within the SLA the founder has set; for messages requiring founder identity, legal review, or product changes, report a real-time block for CoS routing.
12. **Phased release.** Apple phased release or Google staged rollout; monitor crash-free sessions and review velocity per stage. Halt and roll back on regression.
13. **Verify visibility.** Confirm the app is searchable and installable in every target region by inspecting the listing from a region-shifted account.
14. **Add to monitoring.** Mobile crash reporter, store-rating monitor, review-response routing.
15. **Announce internally.** Update the next CoS-routed batch summary with the listing URL, release notes, and any open follow-ups.

## Anti-patterns

- Submitting without a self-review.
- Treating reviewer rejection messages as final — they often invite revision; read carefully and respond promptly.
- Changing product behavior unilaterally to satisfy a reviewer; behavior changes route through CoS for founder decision.
- 100% rollout without phasing.
- Marking the go-live closed before the listing is visible in target regions.
- Storing the only copy of signing keys outside the founder's vault.

## Required failure handling

| Failure | Action |
|---|---|
| Account creation blocked (identity, payment) | Real-time block; pause submission work. |
| Build rejection — metadata | Fix in metadata, resubmit. |
| Build rejection — code | Fix in code, new build, new submission. |
| Build rejection — product policy | Report a real-time block for CoS-routed founder decision before any product change. |
| Tester requirement unmet | Block; route tester acquisition as a real-time block through CoS. |
| Crash rate spikes during phased release | Halt rollout, roll back the active stage, treat as an incident. |
| Listing not visible in target region | Investigate region/age-rating settings; do not declare go-live closed. |

---

## Review Agent rubric

- Are developer accounts created with recovery codes in the founder's vault?
- Are signing keys stored with a documented recovery path?
- Is store metadata living in the repo, reviewable and translatable?
- Are visual assets complete for all required device classes?
- Are privacy disclosures aligned with the actual data collection (compared to the source-of-truth manifest)?
- Are IAP products configured through StoreKit / Play Billing for any digital goods?
- Were testers acquired in accordance with store requirements before submission?
- Did the pre-submission self-review pass on clean devices?
- Are submission, review, and approval timestamps and IDs recorded?
- Were reviewer messages handled per SLA, and any policy-change requests escalated?
- Is the rollout phased, with halt-on-regression rules in place?
- Was visibility verified from a region-shifted account before close?
- Are mobile monitoring (crash reporter, review monitor) live before close?
- Was the go-live announced in the next CoS-routed batch summary?
