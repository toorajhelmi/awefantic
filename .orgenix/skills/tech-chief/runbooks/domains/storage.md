# Runbook: File / Media Storage Domain

## Purpose

Define the integration shape, failure handling, and operating posture for any user-uploaded file or media surface — independent of provider. Tied to §11.1 row "File / media storage" and the storage default (Supabase Storage with Cloudflare R2 fallback). Pairs with `domains/moderation.md` (uploaded media is UGC) and `domains/privacy-dsar.md` (uploaded media is data-subject data).

## When to use

Any task that introduces, modifies, or operates a surface where users upload, read, share, or delete files: avatars, photo uploads, video uploads, voice recordings, document attachments, recording from live video, AI-generated media stored on the user's behalf.

## Required posture (regardless of provider)

| Posture item | Requirement |
|---|---|
| Upload path | Signed-URL uploads from the client to the provider, gated by a backend issuing endpoint. No direct write from client to bucket without a signature. |
| Size cap | A per-file size cap is set at the signing layer per content type; oversize uploads fail at the edge, not after upload. |
| MIME validation | The signing endpoint asserts allowed MIME types and the client cannot widen them; the server re-checks the actual content on receipt or via a webhook. |
| Server-side processing | For images and video, server-side processing produces deterministic sizes / variants; raw uploads are not served directly to other users unless explicitly required. |
| Moderation pipeline | Every UGC upload goes through `moderation.md` before becoming visible to other users. |
| Quota per user | A per-user storage quota is set; quota exhaustion has a documented UI state. Quota is tracked alongside the projection of provider storage. |
| Public vs. private | Each bucket is explicitly public, private, or signed-only; defaults are private. The decision per bucket is recorded in an ADR. |
| Encryption at rest | Provider-managed encryption is enabled. If the project requires customer-managed keys (regulated work), the KMS choice is an ADR. |
| Access control | Read/write access is enforced server-side (RLS or equivalent), not client-side; signed URLs have a documented TTL. |
| Retention | Retention windows are explicit per content type; deletion is verifiable, not just soft-deletion in the application DB. |
| Hard delete on DSAR | Provider-side deletion runs on data-subject requests within the policy SLA (`privacy-dsar.md`). |
| CDN egress | Egress costs are monitored with a per-month aggregate guard (`monitoring-plan.md`); when egress dominates, the §11.1 trigger for switching to Cloudflare R2 fires. |
| Critical-account inventory | The storage provider (and the CDN, if separate) is in `critical-accounts.md` with renewal/quota tracking. |
| Backup posture | For provider-native point-in-time recovery: enabled and tested. For projects where the provider's backup is insufficient: documented backup destination and cadence. |
| Reconciliation | Provider state vs. local application state is reconciled daily (orphan blobs cleaned, missing-blob references flagged). |
| Synthetic transactions | An external synthetic upload + read + delete runs on a schedule to detect regressions. |

## Required outputs (per storage task)

- An ADR for the bucket layout, per-bucket public/private posture, retention windows, and quota.
- API contract entries for: upload-signing endpoint, read/serve endpoint (or CDN URL pattern), delete endpoint, quota-status endpoint, DSAR-deletion endpoint. **Full schema for every endpoint** (api-contract exhaustiveness rule).
- A data-model section in the spec showing the local projection of stored objects (id, owner, type, size, status, moderation outcome, retention expiry).
- A verification plan covering: signed-upload success and failure paths, size/MIME enforcement at the edge, server-side processing variants, RLS / access-control checks, quota states, retention expiry, DSAR deletion.
- A monitoring plan with: upload failure rate, signing-endpoint latency, server-side processing job health, moderation outcomes per upload, egress cost (with aggregate × max-volume guard), per-user quota distribution.
- An `assumptions/` entry for retention defaults and quota defaults.
- Entries in `critical-accounts.md` for the storage provider and CDN.

## Failure modes (each must be addressed)

| Failure | Where addressed |
|---|---|
| Client uploads without going through the signing endpoint | Bucket policy denies un-signed writes; alert on denied writes. |
| Oversize upload | Rejected at the signing layer (signed-URL conditions) and at the bucket policy as a backstop. |
| MIME mismatch (client claims one, content is another) | Server-side detection at receipt or via webhook; quarantine and reject. |
| Server-side processing fails | Upload marked failed; user-visible state; retry job; original retained per retention only as long as needed for retry. |
| Moderation classifier rejects an upload | Per `moderation.md`; original deleted or quarantined per severity. |
| Quota exhausted | Pre-upload check returns quota error; upload UI shows path to manage existing files. |
| Storage provider outage | Uploads fail with retriable error; cached reads continue from CDN; status-page link surfaced. |
| Bucket policy regression | Drift detection on bucket config (read-only check); §7.3 cross-artifact check enforces declared posture. |
| Orphan blobs (no DB row) | Daily reconciliation finds and deletes; report retained. |
| Missing blobs (DB row, no blob) | Daily reconciliation flags; user-facing state updated. |
| DSAR deletion | Application-DB soft-delete is followed by provider-side hard-delete within the DSAR SLA; deletion is verified. |
| Retention expiry | Scheduled job deletes provider-side blobs after the retention window; deletion is verified and logged. |
| Egress spike (a single viral asset) | Aggregate cost guard fires; CDN rate-limit or per-asset cap as defined; out-of-cycle OA. |
| CDN cache poisoning (serving the wrong asset) | Signed URLs with short TTL; cache-key namespacing per user/asset; alerting on mismatched-content reports. |
| Public bucket accidentally created | Drift detection denies it; an explicit ADR is required to introduce a public bucket. |
| Backup verification fails | Quarterly DR drill (§P11) detects; corrective task opened. |

## Anti-patterns

- Client-side size or MIME checks without server enforcement.
- Public buckets by default.
- Soft-delete in the application DB without verifying provider-side hard-delete on DSAR.
- Quota tracked only in code, with no reconciliation against the provider.
- Serving raw user uploads to other users without a moderation pipeline.
- CDN egress monitored only per-unit without an aggregate-per-month guard.
- Signed URLs with multi-day TTLs (default should be minutes for writes, single-digit minutes for sensitive reads).
- Encryption-at-rest assumed but not actually verified in the provider config.
- A single bucket for "all things" without per-content-type posture decisions.
- DSAR deletion documented in `privacy-dsar.md` but not actually wired to provider-side hard-delete.

## Cross-references

- §11.1 row "File / media storage" (and its R2-fallback trigger).
- `runbooks/domains/moderation.md` for the moderation pipeline on every UGC upload.
- `runbooks/domains/privacy-dsar.md` for DSAR deletion semantics and retention.
- `runbooks/domains/live-video.md` for recording-to-storage paths.
- `runbooks/artifacts/api-contract.md` for the signing / serve / delete / quota endpoints (no shorthand).
- `runbooks/artifacts/verification-plan.md` for failure-mode coverage; the storage failure modes have a high false-skip rate.
- `runbooks/artifacts/monitoring-plan.md` for egress aggregate guards and reconciliation alerts.

---

## Review Agent rubric

- Are all uploads signed-URL gated by a backend issuing endpoint?
- Are per-file size caps and allowed MIME types enforced at the signing layer AND at the bucket policy?
- Is server-side processing in place for media types that need deterministic variants?
- Are public/private/signed-only postures explicit per bucket, with public buckets justified by an ADR?
- Is access control enforced server-side (RLS or equivalent), not only client-side?
- Are signed-URL TTLs short (minutes), not days?
- Is encryption at rest verified in provider config, not just assumed?
- Are retention windows explicit per content type, and is the retention job actually wired and verified?
- Is DSAR deletion wired to provider-side hard-delete with verification?
- Is per-user quota enforced server-side, with a documented UI state and reconciliation against the provider?
- Are CDN egress costs monitored with a per-month aggregate × max-volume guard within the stated budget?
- Is daily reconciliation in place for orphan blobs and missing blobs?
- Are synthetic upload + read + delete transactions probing from outside the platform?
- Are all storage endpoints specified with full schema in the API contract (no shorthand)?
- Is the storage provider in `critical-accounts.md` with the right tier, renewal, and recovery path?
- For UGC: is `moderation.md` applied before media is visible to other users?
- Has the §11.1 R2-fallback trigger been evaluated (storage > 500 GB OR egress cost dominates OR media served outside platform CDN)?
