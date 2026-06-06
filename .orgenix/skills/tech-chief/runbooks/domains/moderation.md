# Runbook: Content Moderation Domain

## Purpose

Define the integration shape, failure handling, and operating posture for any user-generated content (UGC) surface — independent of provider. Tied to §11.1 row "Content moderation (image/video/text)" and to the §3 UGC modifier's "moderation defaults already in place" trigger. When this runbook is wired into a project with the required posture, the UGC modifier does not bump the scrutiny level (§3); when it is absent, every UGC surface bumps.

## When to use

Any task that introduces, modifies, or operates a surface where one user's content is visible to another user: avatars, profiles, posts, comments, DMs that are forwardable, names, bios, search queries that are echoed back, livestreams, audio clips, image/video uploads.

## Required posture (regardless of provider)

| Posture item | Requirement |
|---|---|
| Classifier coverage | Every UGC media type entering the system (text, image, video, audio, livestream) passes a classifier appropriate to its modality. No type is exempt without an ADR. |
| Pre-vs-post moderation | Each surface explicitly chooses pre-publish (block before visible) or post-publish (publish then sweep) with an ADR. Defaults: pre-publish for video and audio; post-publish for text and image at low volume. |
| Severity tiers | Classifier outputs map to at least three tiers: `auto-block`, `human-queue`, `allow`. Thresholds are recorded in an ADR. |
| Human review queue | A queue exists for `human-queue` items with a documented SLA (default: < 24h for image/text, < 1h for live video). |
| User reporting | Every surface that displays UGC has a user-reporting affordance reachable in ≤ 2 taps. Reports route to the same queue. |
| Takedown | Every published item can be removed by an admin within the policy SLA (default: < 1h for `auto-block`-equivalent severity, < 24h for everything else). Removal is auditable. |
| Acceptable-use policy | A user-facing acceptable-use policy exists, is referenced from sign-up and from every UGC surface, and is versioned. Material changes notify existing users. |
| Age gating | If the surface is reachable by minors, age gating and minor-specific defaults are in place (no DM-from-strangers, no precise-location sharing, no monetization). |
| CSAM (US §2258A — mandatory) | For services with US users, CSAM detection runs on every image/video upload; positive hits trigger immediate block, evidence preservation, and submission to the NCMEC CyberTipline within 24h. The v1 procedure is documented in this project even if automation is staged. The reporting contact is the user (or the user's designated legal entity). Failure to report is a federal violation. |
| DMCA | A DMCA designated agent is registered at the US Copyright Office; takedown and counter-notice endpoints exist (web and mobile), follow §512 timing, and produce auditable records. |
| Repeat-offender policy | A documented policy for accounts that accumulate violations, with thresholds and consequences (suspension, ban, appeal path). |
| Appeal | Every removal has an appeal path that does not depend on the original moderator. |
| Logging and retention | Moderator actions, classifier scores, user reports, takedowns, and CSAM hits are logged with retention sufficient for legal hold (default: 7 years for CSAM evidence; 90 days for routine moderator actions). |
| Cost guard | Classifier API spend has both a per-unit cap and an aggregate-per-month guard (`monitoring-plan.md` cost_guards). Aggregate must fit budget at documented max-volume. |
| Operational separation | Live-video moderation runs on a separate alert track from async moderation; outage of async classifiers does not block ingest. |

## Required outputs (per moderation task)

- An ADR locking in classifier provider(s) per modality, pre-vs-post mode per surface, severity thresholds, and SLA.
- The acceptable-use policy artifact (`docs/policy/acceptable-use.md`, versioned).
- A CSAM v1 procedure (`docs/runbooks/operations/csam-procedure.md` or inline in this project), even if NCMEC submission is partly manual.
- A DMCA procedure with designated-agent registration confirmation.
- API contracts for: report endpoint, admin queue endpoints, takedown endpoint, appeal endpoint, DMCA takedown and counter-notice endpoints. **All require full schema (`api-contract.md` exhaustiveness rule); no shorthand.**
- A verification plan covering the failure-modes table below.
- A monitoring plan covering classifier health, queue depth, takedown latency, classifier cost, CSAM hits, repeat-offender flags.
- An entry in `critical-accounts.md` for the classifier provider, the DMCA designated-agent registration, and the NCMEC reporting contact.

## Failure modes (each must be addressed)

| Failure | Where addressed |
|---|---|
| Classifier API down | Pre-publish: hold content with user-visible "in review" state; post-publish: continue publishing, alert on backlog. Fallback classifier per modality if available. |
| Classifier returns wrong tier | Calibration data captured for a periodic threshold review (P11 monthly). Appeal path activates. |
| Human queue backlogged beyond SLA | Alert on queue depth > threshold for > SLA window; surface in periodic summary; consider raising auto-block threshold temporarily. |
| Reporter is malicious (mass-reporting) | Rate limit per reporter; auto-prioritization by reporter history; report-abuse policy in acceptable-use. |
| Takedown of legitimate content | Appeal path; appeal reviewer is not the original moderator; appeal SLA documented. |
| CSAM hit | Immediate auto-block + user account suspension; evidence preserved in tamper-evident store; NCMEC submission within 24h via the v1 procedure; legal hold flag set on the account. |
| Repeat-offender accumulation | Threshold reached → suspension/ban per policy; user notified with appeal path. |
| DMCA takedown received | Acknowledge within statutory window; remove or disable access; notify uploader; counter-notice path available. |
| DMCA counter-notice received | Re-enable per §512(g) timing unless the complainant files suit. |
| Live-video infraction | Stream terminated immediately; recording preserved per retention policy; account flagged for review. |
| Minor detected on adult-restricted surface | Age-gate failure path; account locked pending verification; logged. |
| Policy update requires re-consent | In-app prompt at next session; users who decline lose access to UGC posting until consent. |
| Classifier cost spike | Cost-monitoring alert; per-unit cap reduced or aggregate budget raised via OA. |
| Moderator over-action | Audit log review; periodic agreement sampling (P11 monthly). |

## Anti-patterns

- "We'll add moderation in v2." UGC without moderation is a §3 UGC modifier bump every time, and is a legal exposure for US §2258A.
- Pre-publish moderation without an SLA (users see indefinite "in review").
- A user-reporting affordance buried deeper than 2 taps.
- CSAM detection without a written reporting procedure.
- DMCA endpoints documented as "TODO" or as one-line shorthand in the API contract.
- Single-modality coverage (text only, image only) on a multi-modal surface.
- Classifier thresholds chosen without recorded calibration evidence.
- Treating moderator actions as un-auditable.
- Repeat-offender policy that exists in the acceptable-use doc but not in the system (no enforcement).
- Cost guards as per-unit caps only, without an aggregate × max-volume guard.

## Cross-references

- §3 modifier "User-generated content visible to other users" (this runbook neutralizes the bump).
- §11.1 row "Content moderation (image/video/text)".
- `runbooks/artifacts/api-contract.md` for endpoint shape (exhaustiveness applies to reports, takedowns, DMCA, CSAM).
- `runbooks/artifacts/verification-plan.md` for failure-mode coverage.
- `runbooks/artifacts/monitoring-plan.md` for cost guards, queue depth, classifier health, CSAM hits.
- `runbooks/artifacts/critical-accounts.md` for classifier provider, DMCA designated agent, NCMEC contact.
- `runbooks/domains/privacy-dsar.md` for retention/erasure boundary between moderation logs and data-subject requests.

---

## Review Agent rubric

- Is every modality entering the system covered by an appropriate classifier?
- Is pre-vs-post mode chosen per surface and recorded in an ADR?
- Are severity tiers and thresholds explicit, with calibration evidence?
- Is the human-review queue sized to its SLA, with monitoring on depth?
- Is the user-reporting affordance reachable in ≤ 2 taps on every UGC surface?
- Is the takedown SLA explicit, and does the monitoring plan track it?
- Does the acceptable-use policy exist, is it versioned, and is it referenced from sign-up and every UGC surface?
- If minors are reachable, is age gating in place and are minor-specific defaults explicit?
- For US-serving services: is a CSAM detection path wired on every image/video upload, with a v1 NCMEC procedure that is actually written (not deferred)?
- Is the DMCA designated agent registered, and are takedown/counter-notice endpoints fully specified in the API contract (no shorthand)?
- Is the repeat-offender policy enforced in code, not only documented?
- Does every removal have an appeal path that does not depend on the original moderator?
- Are moderator actions, classifier scores, reports, takedowns, and CSAM hits logged with retention sufficient for legal hold?
- Do classifier cost guards have both per-unit caps AND aggregate × max-volume guards within the stated monthly budget?
- Is live-video moderation operationally separated from async moderation?
- Does the verification plan cover every row of the failure-modes table?
- Is every endpoint in the moderation surface listed with full schema in the API contract?
