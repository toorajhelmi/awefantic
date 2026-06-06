# Runbook: Privacy / DPA / DSAR Domain

## Purpose

Define the integration shape, failure handling, and operating posture for any surface that collects, processes, or exposes personal data — independent of jurisdiction. Tied to §11.1 row "GDPR / DPA / DSAR posture" and to the §3 modifier "PII-touching". When this runbook is wired into a project, the PII-touching modifier still floors at L3 but the posture is consistent across surfaces.

## When to use

Any task that introduces, modifies, or operates a surface that collects personal data beyond an opaque user id: email, name, address, location, photo, voice, IP, behavioral analytics, payment information, age, identity verification data, biometric data, health data, employment data, communications content.

## Required posture (regardless of jurisdiction)

| Posture item | Requirement |
|---|---|
| Lawful basis (per surface) | Each new personal-data flow declares a lawful basis (consent / contract / legitimate interest / legal obligation / vital interest / public interest, per GDPR; equivalent under UK GDPR / CCPA). Recorded in an ADR. |
| Special-category data | Health, biometrics, race, religion, sexual orientation, precise location for non-functional purposes, minors: triggers a real-time block per `risk-thresholds.md` §4 unless an existing project ADR explicitly covers it. |
| Privacy notice | A user-facing privacy notice exists at `docs/policy/privacy.md`, is versioned, and is referenced from sign-up and every surface that newly collects personal data. Material changes notify existing users. |
| Cookie / tracker banner | If non-essential trackers (analytics not strictly necessary for the service, ads, third-party embeds) are used, a consent banner is in place with granular controls (per-purpose). Default state is reject. |
| Processor inventory | Every third-party processor receiving personal data is listed in `docs/operations/processors.md` with the data category, location, DPA reference, and sub-processor allowance. |
| DPA in place | A signed Data Processing Addendum exists with every processor before any production traffic. Standard Contractual Clauses (SCCs) attached where data crosses jurisdictions that need them. |
| Default retention | Each data category has an explicit default retention; deletion is verifiable end-to-end (application DB + storage + processors). |
| DSAR endpoints | The service can answer four DSAR types: access (export), portability, rectification, erasure. Each has a documented procedure with SLAs aligned to GDPR's 30-day default (or shorter where required). |
| DSAR contact | A DSAR / privacy contact email is published in the privacy notice and is monitored. |
| Children's data (COPPA / under-13 rules) | If users under the relevant minor threshold can sign up, age gating and minor-specific defaults apply (see `moderation.md`); explicit verifiable parental consent paths exist for under-13 in the US. |
| PII in logs | Personal data is not logged. The logger redacts known PII fields; a periodic audit (P11) samples logs for leakage. |
| PII in error reports | Error trackers (Sentry, etc.) are configured to scrub headers, request bodies, and user object beyond an opaque id. |
| Cross-border transfers | When data crosses jurisdictions, the transfer mechanism (SCCs, adequacy decision, BCRs) is recorded; the processor inventory tracks it. |
| Breach notification | A breach-response plan exists: detection → severity classification → notification to user, regulators, and processors within statutory timelines (72h under GDPR for high-risk). |
| Records of processing | A minimal Records of Processing Activities (ROPA) exists, derived from the processor inventory and per-surface lawful basis. |
| Annual review | A privacy review runs annually (P11 cadence): processor inventory, retention compliance, DSAR fulfillment metrics, breach drills. |

## Required outputs (per PII-touching task)

- An ADR declaring lawful basis per new personal-data flow.
- A processor inventory update if any new third-party processor is introduced (and a DPA in place before live).
- A privacy notice update if any new category or purpose is introduced; versioned.
- API contract entries for: DSAR submission endpoint, DSAR status endpoint, DSAR data-export endpoint, erasure endpoint, consent endpoint(s). **Full schema for every endpoint** (api-contract exhaustiveness rule).
- A data-model section showing where the new data is stored, retained, and deleted.
- A verification plan covering: consent capture (where applicable), DSAR fulfillment for each category, log redaction, error-report scrubbing, retention expiry, cross-border-transfer paths.
- A monitoring plan with: DSAR queue depth, DSAR turnaround, consent-banner acceptance/rejection metrics, log-redaction audit alerts, breach-detection alerts.
- An entry in `critical-accounts.md` for the DSAR mailbox and for any privacy-management vendor.

## Failure modes (each must be addressed)

| Failure | Where addressed |
|---|---|
| DSAR not answered within SLA | Queue depth alert; on-call follows up; user receives statutory extension notice if applicable; metric tracked. |
| DSAR data export missing a data category | Export pipeline is data-driven from the processor inventory; new categories trigger a pipeline update; tested per `verification.md`. |
| Erasure leaves data behind (processor, backup, log) | Erasure is end-to-end: app DB → storage (`storage.md`) → processors (per inventory) → log scrub; verified by DSAR test. |
| Backup contains erased data | Backups are excluded from erasure for the legal retention period; users informed; backups expire on schedule. |
| Processor changes sub-processors without notice | Sub-processor monitoring; periodic policy check; processor flagged in next periodic summary. |
| PII appears in logs or error reports | Log/error redaction tested by P11 audit; leakage triggers immediate scrub and an incident note. |
| Cookie banner not shown when required | Detected by E2E test in pre-merge and by synthetic transaction in prod. |
| Cookie banner consent ignored by trackers | Trackers gated server-side or by tag manager; consent state propagated. |
| Cross-border transfer without basis | Processor inventory blocks the surface from going live; ADR required. |
| Breach detected | Severity classified; statutory clock starts; user/regulator notification per timeline; incident note; corrective tasks. |
| New consent purpose introduced without re-consent | Required for material changes; re-consent prompt; tracked. |
| Minor signs up on adult-restricted surface | Age gate fails; account locked; logged per `moderation.md`. |
| User exercises right to object to processing under legitimate interest | Object handler exists; processing stops; documented. |
| Special-category data captured without ADR | Real-time block per `risk-thresholds.md`; surface blocked from going live. |

## Anti-patterns

- "Privacy posture: we'll do it before launch." Posture is part of P1 (spec) at L3+ when PII is touched.
- A processor inventory that does not match the actual SDKs in the app.
- DSAR endpoints documented but unbuilt; reliance on a manual mailbox without an SLA.
- Erasure that stops at the app DB and silently leaves data in processors or backups.
- A cookie banner that fires trackers before consent.
- Log redaction tested once at integration and never again.
- Treating "anonymous analytics" as out of scope; pseudonymous user ids are still personal data under GDPR.
- A privacy notice that lists categories the system never collects (or vice versa).
- Breach response plan with no detection mechanism.

## Cross-references

- §3 modifier "PII-touching" (floor L3).
- §11.1 row "GDPR / DPA / DSAR posture".
- `risk-thresholds.md` §4 (special-category data → real-time block).
- `runbooks/domains/storage.md` for storage-side hard-delete on DSAR.
- `runbooks/domains/moderation.md` for minors and CSAM retention.
- `runbooks/domains/payments.md` for PCI scope and processor-PII boundaries.
- `runbooks/artifacts/api-contract.md` for DSAR endpoints exhaustiveness.
- `runbooks/artifacts/verification-plan.md` for DSAR test scenarios.
- `runbooks/artifacts/critical-accounts.md` for DSAR mailbox and any privacy-management vendor.

---

## Review Agent rubric

- Is lawful basis declared per new personal-data flow in an ADR?
- Is the privacy notice up to date, versioned, and referenced from every collection surface?
- Are special-category data flows either covered by an existing ADR or surfaced as a real-time block?
- Is the processor inventory accurate, with a DPA and (where applicable) SCCs for each processor?
- Are DSAR endpoints (access / portability / rectification / erasure) fully specified in the API contract (no shorthand) and actually wired?
- Is the DSAR SLA explicit and monitored, with a queue-depth alert?
- Is erasure end-to-end (app DB → storage → processors → logs), with backup exclusion documented?
- Is PII redaction in logs and error reports tested and re-audited (not "set and forget")?
- Is the consent banner (if applicable) in place with per-purpose granular controls and default-reject, and are trackers gated by consent?
- Is breach detection wired with a documented response plan and statutory-timeline awareness?
- For users under the relevant minor threshold: is age gating in place, with under-13 verifiable parental consent if applicable?
- For cross-border data flows: is the transfer mechanism recorded in the processor inventory?
- Does the verification plan cover DSAR fulfillment for every data category in the system?
- Is the DSAR contact in `critical-accounts.md` and is the mailbox monitored?
