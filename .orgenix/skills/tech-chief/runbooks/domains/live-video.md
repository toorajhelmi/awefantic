# Runbook: Live Video Domain

## Purpose

Define the integration shape, failure handling, and operating posture for any live-video ingest, broadcast, and recording surface — independent of provider. Tied to §11.1 row "Live video ingest". Pairs with `domains/moderation.md` (every live-video surface is a UGC surface) and `domains/storage.md` (recordings are user-uploaded media).

## When to use

Any task that introduces, modifies, or operates a real-time video path: a user publishing live, viewers watching live, multi-publisher rooms, live-to-VOD recording, multi-angle stitching, broadcast simulcast, low-latency interactive paths.

## Required posture (regardless of provider)

| Posture item | Requirement |
|---|---|
| Latency target | Each surface declares a target latency band: `broadcast` (3–10s glass-to-glass acceptable), `low-latency` (<1s required for interactivity). Latency is measured, not assumed. |
| Publisher capacity | Maximum concurrent publishers per project tier is stated; the project's cost guards (`monitoring-plan.md`) use this as the max-volume. |
| Subscriber capacity | Maximum concurrent subscribers per stream is stated; egress cost guards use this as the max-volume. |
| Network adaptation | Publishers run adaptive bitrate; minimum publisher uplink and a fallback "audio-only" mode are documented. |
| Recording | Each surface explicitly decides record-by-default vs. opt-in. Recording UI and consent prompts match the choice. |
| Retention | Recording retention is explicit; deletion is part of `privacy-dsar.md`. |
| Moderation | Live-video moderation runs on a separate alert track from async moderation (per `moderation.md`). At minimum: per-frame classifier sampling, audio classifier, stream-termination affordance for moderators, automatic termination on `auto-block` tier. |
| CSAM | Pre-recording sampling pipeline runs for every publisher session; live hit terminates stream, preserves evidence, opens an incident. |
| Geographic and age policy | Surfaces restricted to certain regions or age groups enforce gating before ingest begins, not at view time only. |
| Critical-account inventory | Live-video provider account is `tier: gating` in `critical-accounts.md`; outage path is documented. |
| Cost guards | Per-publisher-minute and per-subscriber-minute caps exist; aggregate per-month at max-volume fits the budget (per `monitoring-plan.md`). |
| Failure isolation | Failures in stitching, recording-to-storage, or transcoding do not interrupt the live broadcast. |
| Synthetic transactions | Synthetic publishers run on a schedule from outside the platform to detect ingest regressions. |

## Required outputs (per live-video task)

- An ADR locking in the provider, latency band per surface, recording posture, retention, and capacity ceilings.
- For greenfield or net-new providers: a POC plan (`poc-plan.md`) measuring glass-to-glass latency, failure rate, and cost per publisher-minute against the candidate's documented characteristics. Sequenced POCs (ingest → stitching → multi-angle generation) carry `buffer_days` per the POC-plan template.
- API contracts for: publisher-token, viewer-token, recording webhook, moderator-terminate endpoint, geographic-policy enforcement. **Full schema for every endpoint** (api-contract exhaustiveness rule).
- A verification plan covering the failure modes below; performance budget specified with methodology (corpus, environment, repetitions) per `verification-plan.md`.
- A monitoring plan with: ingest health, viewer health, publisher and viewer cost lines (both aggregate-bounded), synthetic-publisher freshness, recording-job freshness, moderation-classifier health on the live track.
- An `assumptions/` entry for any retention or recording-default decision.
- Entries in `critical-accounts.md` for the live-video provider and any separate transcoding/CDN providers.

## Failure modes (each must be addressed)

| Failure | Where addressed |
|---|---|
| Publisher uplink fails mid-stream | Fallback to audio-only or graceful termination; viewer-visible "publisher reconnecting" state. |
| Publisher exceeds capacity tier | Reject ingest with documented error; surface in monitoring; user-facing upgrade path if applicable. |
| Subscriber egress spikes | Aggregate-bounded cost guard fires; per-stream subscriber cap if defined; surfacing rule applied (out-of-cycle on first hit). |
| Stitching/multi-angle pipeline fails | Live broadcast continues; multi-angle result marked failed; user notified post-stream. |
| Recording-to-storage fails | Live broadcast continues; recording marked failed; retry job; user notified post-stream. |
| Transcoding lag | Viewer state shows "tuning in"; SLO tracked; if persistent, fallback bitrate served. |
| Moderation classifier fails on live track | Auto-block tier raised conservatively for the duration; moderator queue prioritized; alert on classifier outage. |
| Live CSAM hit | Stream terminated; evidence preserved; account suspended; NCMEC procedure (`moderation.md`) invoked. |
| Live policy violation requires immediate takedown | Moderator-terminate endpoint terminates; recording (if any) flagged for retention/legal-hold per policy. |
| Geographic violation | Ingest rejected at token issuance; viewers see region-restricted state. |
| Live-video provider outage | Status-page link; user notification; fallback to a recorded backup if available; outage logged. |
| Provider account suspended | `tier: gating` critical-account recovery procedure activates; the user is needed. |
| Synthetic publisher fails | Pages on-call; investigated as a P2 unless customer-impact correlated. |
| Cost overrun on a single popular stream | Aggregate cost guard catches; consider per-stream subscriber cap; out-of-cycle OA. |

## Anti-patterns

- "Latency is fine" without measurement.
- Recording-by-default without an explicit consent UI per jurisdiction.
- Treating live-video moderation as an extension of async moderation (different SLA, different alert track).
- Cost guards expressed only per-unit ($0.005/min) without an aggregate-per-month at max-volume.
- A live-video provider in §11.1 without a POC for the project's specific latency band.
- A stitching or multi-angle pipeline that blocks the live broadcast on failure.
- Recording retention without an aligned DSAR deletion path.
- A single ADR covering ingest + stitching + multi-angle without acknowledging the dependency graph (use the §11.2 batch-ADR with `buffer_days` between sequenced POCs).
- A geographic restriction enforced only on the viewer side (rejecting after the stream is live is a cost and policy hole).
- API contracts for publisher-token / viewer-token endpoints in shorthand form.

## Cross-references

- §11.1 row "Live video ingest".
- §11.2 novel-area path for any non-default provider; required POC plan.
- `runbooks/domains/moderation.md` for live-track classification, CSAM, takedown.
- `runbooks/domains/storage.md` for recording retention.
- `runbooks/domains/privacy-dsar.md` for recording deletion and DSAR boundary.
- `runbooks/artifacts/api-contract.md` for endpoint exhaustiveness.
- `runbooks/artifacts/poc-plan.md` for the ingest / stitching / multi-angle POCs.
- `runbooks/artifacts/monitoring-plan.md` for cost guards and synthetic publishers.

---

## Review Agent rubric

- Is each surface's latency band declared and measured (not assumed)?
- Are publisher and subscriber capacities stated, and do cost guards use them as max-volume?
- Is recording-by-default vs. opt-in explicit per surface, with matching consent UI?
- Is retention aligned with the privacy/DSAR posture?
- Is live-video moderation on a separate alert track from async moderation, with its own SLA?
- For US-serving services: is a CSAM sampling pipeline wired on every publisher session, with the `moderation.md` NCMEC v1 procedure available?
- Are ingest / stitching / multi-angle POCs sequenced with explicit `buffer_days`?
- Are all endpoints in the live-video surface specified with full schema (no shorthand)?
- Does the verification plan cover every failure mode, with a performance budget methodology?
- Does the monitoring plan include synthetic publishers running from outside the platform?
- Do cost guards include aggregate × max-volume guards within the stated monthly budget?
- Is the live-video provider entry in `critical-accounts.md` `tier: gating` with a recovery path?
- Are stitching, recording, and transcoding failures isolated from the live broadcast?
- Is geographic policy enforced at ingest (token issuance), not only at view time?
