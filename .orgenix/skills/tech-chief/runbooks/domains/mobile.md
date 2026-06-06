# Runbook: Mobile Domain

## Purpose

Define the integration shape, failure handling, and operating posture for any mobile-app surface — independent of store. Tied to §11.1 rows "Mobile", "App store submission (iOS)", "App store submission (Android)", and the payments-mobile row. Pairs with `phases/go-live-mobile.md` (the procedural checklist for the first go-live).

## When to use

Any task that introduces, modifies, or operates a mobile-platform surface: a new feature in an existing app, a new app, a store metadata update, a release-train change, IAP introduction or change, native API integration (camera, microphone, location, push, biometrics, contacts).

## Required posture (regardless of platform)

| Posture item | Requirement |
|---|---|
| Build & submit toolchain | EAS (or equivalent) is set up; CI runs EAS Build on tagged releases; EAS Submit handles store upload. |
| Channels & tracks | iOS: Internal → TestFlight (internal then external) → App Store. Android: Internal → Closed (alpha/beta) → Open beta if used → Production. Promotion gates are documented. |
| Critical accounts | Apple App Store Connect and Google Play Console are `tier: gating` in `critical-accounts.md`; bundle IDs, team IDs, and developer IDs are recorded; recovery codes live in the user's vault. |
| Privacy disclosures | Apple App Privacy and Google Data Safety are filled and kept in sync with actual data collection. Material changes trigger an update before the next release. |
| Apple §4.8 (Sign in with Apple) | If any third-party social sign-in is offered (Google, Facebook, etc.), Sign in with Apple is also offered, with at least equivalent placement. |
| App Tracking Transparency (iOS) | If the app uses `IDFA` or tracks across third-party apps/sites, the ATT prompt is implemented per Apple guidelines; the privacy nutrition label matches. |
| In-app purchases (mobile, digital goods) | Use Apple StoreKit / Google Play Billing per store policy (or RevenueCat over them, per §11.1). Stripe is only allowed for non-digital goods or external commerce per the store's external-purchase rules. |
| External purchase posture | If the app offers external web purchases for non-digital goods, the user-facing links and disclosures conform to current store policy (this changes; revisit at each major iOS/Android release). |
| Push notifications | APNs / FCM credentials are stored in the secrets inventory with rotation; push permission is requested at a moment the user understands the value. |
| Permission rationale | Every privacy-sensitive permission (camera, microphone, location, contacts, photo library, biometrics, health, motion) has a pre-prompt explaining why, before the system dialog. |
| Offline & flaky network | The app has a defined offline posture per surface (cache-and-show, queue-and-retry, hard-block) and explicit error states. |
| Background work | Background fetch, background push, background location, background audio are each declared with the matching Info.plist / manifest entries; battery cost is justified. |
| Crash & release health | Per-version crash-free rate is tracked; a release-health alert pages on-call if the crash-free rate drops below the SLO. |
| Forced upgrade | A mechanism exists to force-upgrade users off versions with critical bugs (server-driven `min_app_version`). |
| Localization | If the app ships in multiple locales, store metadata and in-app copy are aligned per locale; missing-locale fallback is documented. |
| Age rating | Age rating in both stores matches the actual content, including UGC and live video implications. |
| Accessibility | iOS VoiceOver and Android TalkBack pass on every primary screen; dynamic type and high-contrast modes work. |
| Submission timing | First-submission lead time is at least 7 days before a target launch date for iOS and at least 14 days for Android (testing-cohort requirements). |
| Submission failure | App store rejection is a documented failure mode with a recovery loop (§10). Resubmit is not done blindly; the reviewer note is classified first. |

## Required outputs (per mobile task)

- An ADR for any new native integration, IAP introduction, or change to release-train policy.
- Store metadata artifacts under `apps/mobile/store/` (titles, subtitles, descriptions, keywords, screenshots per device class, preview videos).
- Privacy-disclosure files (App Privacy YAML or equivalent; Data Safety form export) stored in the repo.
- API contract entries for any backend used by the mobile app, with full schema (no shorthand).
- A verification plan covering: every primary user flow on iOS and Android, every permission-prompt path, every push variant, every IAP product, every offline state, every accessibility check.
- A monitoring plan with: per-version crash-free rate, per-version ANR rate (Android), launch time, key flow funnels, IAP completion rate, push delivery rate, force-upgrade adoption.
- Entries in `critical-accounts.md` for App Store Connect, Google Play Console, APNs cert/key, FCM credentials, and any IAP-bridge service (RevenueCat).
- A release runbook (`go-live-mobile.md` is the master) instance per release type.

## Failure modes (each must be addressed)

| Failure | Where addressed |
|---|---|
| App store rejection (metadata) | Classify the reviewer note; fix metadata; resubmit; document in `docs/incidents/`. |
| App store rejection (policy: IAP, ATT, §4.8) | Classify; either bring the build into compliance or escalate to the user; do not change product behavior unilaterally (§10). |
| Build fails on CI (EAS, signing, capabilities) | Block the release; investigate signing cert / provisioning profile / capability mismatch; resolve and re-run. |
| Provisioning profile or signing cert expires | Calendar-driven; the `critical-accounts.md` renewal date drives a reminder; rotation runbook documented. |
| TestFlight / closed-track tester drop-out | Plan with reserve testers; Google Play's tester-count and duration requirements for new accounts are pre-staged. |
| Push fails after release | Per-platform delivery monitoring; APNs/FCM credential rotation runbook; user-visible push-history view if available. |
| IAP receipt validation failure | Server-side validation against StoreKit / Play Billing; idempotent grant logic; failed-grant queue with manual recovery. |
| RevenueCat (or bridge) outage | Cache last-known entitlement state for a documented window; fall back to direct receipt validation. |
| Privacy disclosure drift (app collects more than disclosed) | Caught by the §7.3 cross-artifact consistency check (spec ↔ disclosure ↔ code); blocked at release. |
| Crash-free rate drop after release | Auto-roll-back or staged rollout pause; release-health alert pages on-call. |
| Critical bug requires forced upgrade | `min_app_version` raised server-side; user-facing copy explains the upgrade. |
| Permission denied by user | Graceful degradation; clear path to settings; never block the app outside the gated feature. |
| Offline write loss | Queue-and-retry with conflict resolution; user notified of unsynced work. |
| ATT denied (iOS) | Track-without-IDFA path; revenue impact monitored. |
| Sign in with Apple revocation | User offered re-authentication; data not orphaned. |

## Anti-patterns

- Treating "code merged" as "shipped" (mobile is not live until the build is approved and visible in stores).
- Submitting iOS without §4.8 when third-party social sign-in is offered.
- Privacy nutrition labels filled in once and never re-synced with the data the app actually collects.
- Permission prompts without a pre-prompt rationale.
- IAP receipt validation done client-side only.
- Stripe used for digital subscriptions on mobile (store policy).
- Release-health alerts without a corresponding rollback path.
- A first-time Android submission scheduled less than 14 days before a target launch.
- Apple/Google credentials held only by CoT (§13: the user always has the recovery copy).
- Permission disclosures that disagree with the actual SDK list.

## Cross-references

- §11.1 rows: Mobile, App store submission (iOS), App store submission (Android), Payments (mobile, digital goods), Push notifications.
- `phases/go-live-mobile.md` for the first-go-live procedural checklist.
- `runbooks/artifacts/critical-accounts.md` for App Store Connect, Google Play Console, APNs, FCM, and IAP-bridge entries.
- `runbooks/artifacts/api-contract.md` for backend endpoints used by mobile (no shorthand).
- `runbooks/artifacts/monitoring-plan.md` for release health and IAP completion.
- `runbooks/domains/payments.md` for mobile-IAP failure handling.
- `runbooks/domains/moderation.md` for any UGC inside the app.

---

## Review Agent rubric

- Is the build & submit toolchain wired into CI, with EAS Build / EAS Submit (or equivalents) running on tagged releases?
- Are channels and tracks documented (Internal → TestFlight/Closed → Production) with promotion gates?
- Are App Store Connect and Google Play Console entered in `critical-accounts.md` as `tier: gating` with renewal dates?
- Are Apple App Privacy and Google Data Safety filled and in sync with the app's actual data collection?
- If third-party social sign-in is offered (iOS), is Sign in with Apple offered with at least equivalent placement?
- If IDFA or cross-app tracking is used (iOS), is the ATT prompt implemented and the nutrition label aligned?
- Are digital-goods subscriptions on mobile using StoreKit / Play Billing (or RevenueCat over them), and is Stripe restricted to non-digital goods?
- Are push credentials in the secrets inventory with a rotation policy?
- Does every privacy-sensitive permission have a pre-prompt rationale before the system dialog?
- Is per-version crash-free rate tracked with an alert below SLO?
- Is a force-upgrade mechanism (`min_app_version`) wired?
- Is the first-submission lead time at least 7 days (iOS) / 14 days (Android)?
- Does the verification plan cover offline states, permission paths, IAP receipts, and accessibility on both platforms?
- For UGC features inside the app, is `moderation.md` applied (including CSAM)?
- Are all backend endpoints used by the mobile app specified with full schema (no shorthand)?
- Does the monitoring plan track IAP completion rate, push delivery, and release health?
