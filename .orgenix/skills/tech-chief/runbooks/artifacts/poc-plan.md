# Runbook: POC Plan

## Purpose

Define the smallest experiment that would disprove a candidate for a novel-area decision (`chief-of-tech-operating-doc.md` §11.2). One POC plan per candidate. Used both for single-candidate verification passes and for multi-candidate comparisons.

## When to use

Every §11.2 path. Optional for §11.1 re-evaluations only if the scoped re-evaluation needs measured evidence the existing rows don't supply.

## Location

`docs/poc/<area-slug>/<candidate-slug>.md`. For multi-candidate comparisons, a single `docs/poc/<area-slug>/README.md` indexes the candidates and the comparison matrix.

## Required fields

| Field | Notes |
|---|---|
| `area` | The framed requirement: inputs, outputs, latency, throughput, cost ceiling, regulatory needs, integration constraints, lifetime expectation. Copied or referenced from the §11.2 research note. |
| `candidate` | The tool, service, or technique under test. One per POC plan. |
| `hypothesis` | "If we use <candidate> for <area>, then <observable result> will hold within <budget>." One sentence. |
| `disprove_condition` | The smallest observable outcome that falsifies the hypothesis. |
| `acceptance_criteria` | Measurable criteria that, if met, justify adopting the candidate. Each is a number, not a feeling. |
| `metrics` | Every metric measured: name, unit, expected value, measurement method. At minimum: latency (with percentile), throughput, cost per unit, failure rate, integration complexity (lines or hours), lock-in surface. |
| `methodology` | How the POC is run: corpus / load shape / inputs, environment, repetitions, warm-up, statistical handling. POCs run in a sandbox; never against prod data. |
| `time_budget` | Wall-clock cap on the POC (hours or days). Exhausting the budget without measured evidence is itself a finding. |
| `cost_budget` | Dollar cap on the POC. Exhausting it ends the POC. |
| `outputs` | What the POC produces: a small repo branch, a recording, raw measurements, a write-up. |
| `decision_recipe` | How the measured evidence maps to a decision: which threshold means "adopt", which means "reject", which means "inconclusive → safer candidate". |

## Conditional fields

| Condition | Required field |
|---|---|
| The candidate would introduce a paid third-party service | `cost_model`: per-unit cost × max documented volume; matched against the monthly budget for that line. |
| The candidate would introduce a real-time block (paid SaaS onboarding requiring user identity) | `user_block`: a one-line note that the user is on the critical path; the POC may run in test mode but adoption requires the user. |
| Part of a §11.2 novel-areas batch | `batch_adr`: id of the batch ADR; `upstream_dependencies`: which POCs (if any) must finish first; `buffer_days`: explicit buffer days between upstream sign-off and this POC's measurement start (default 2 working days; required when sequencing > 1 POC). |
| The area is regulated | `compliance_evidence`: which clauses the candidate satisfies; how the POC verifies them. |

## Anti-patterns

- A POC that aims to "evaluate" without naming a disprove condition.
- Measuring only happy path. POCs must include failure modes.
- Time or cost budget set so high that the POC never terminates.
- POC adoption based on unrun candidates ("looked promising").
- Sequencing dependent POCs without buffer; an upstream slip cascades silently.
- Embedding a Review Agent rubric inside the POC plan (rubrics live only in runbook files; §7.2).

## Short example

```yaml
area: low-latency live-video ingest for 5-user simultaneous broadcast in a city block
candidate: LiveKit cloud
hypothesis: LiveKit cloud delivers <500ms glass-to-glass latency at 5 simultaneous publishers + 50 subscribers in one region for <$0.005/min total cost.
disprove_condition: any measurement above 800ms glass-to-glass or above $0.01/min total.
acceptance_criteria:
  - p95 glass-to-glass latency ≤ 500ms across 30 runs.
  - failure rate < 1% over 30 publish sessions.
  - cost per publisher-minute ≤ $0.005 at the test volume.
metrics:
  - glass-to-glass-latency: ms, p95, recorded with synthetic clock overlay
  - failure rate: %, defined as session that fails to publish within 10s
  - cost per publisher-minute: USD, taken from the provider's live cost dashboard
methodology:
  corpus: 5 publishers in the same room, 50 subscribers via headless browser, 60s sessions
  environment: us-east region, free-tier project, real network (not loopback)
  repetitions: 30 sessions; warm-up 3 sessions discarded
time_budget: 2 days
cost_budget: $50
outputs:
  - branch: poc/livekit-cloud
  - measurements: docs/poc/live-video/livekit-measurements.csv
  - write-up: docs/poc/live-video/livekit-results.md
decision_recipe:
  - all acceptance_criteria met → adopt; write ADR-NN
  - any criterion missed by ≤ 20% → re-run with adjusted load; if still missed, reject
  - any criterion missed by > 20% → reject; move to next candidate
batch_adr: ADR-0023 (novel-areas batch: live video + multi-angle stitching)
upstream_dependencies: [] (ingest is the upstream)
buffer_days: 2
```

---

## Review Agent rubric

- Is the area framed in measurable terms (latency, throughput, cost ceiling, regulatory)?
- Is there a single, specific `disprove_condition`?
- Are `acceptance_criteria` actual numbers, not "fast enough" / "cheap enough"?
- Is `methodology` reproducible (corpus, load shape, environment, repetitions, warm-up)?
- Are `time_budget` and `cost_budget` real caps?
- Does `decision_recipe` cover all three outcomes (adopt / re-run / reject)?
- For paid candidates, does `cost_model` × max-volume fit the monthly budget?
- For batch POCs, does `buffer_days` exist between upstream sign-off and downstream measurement, and is the batch ADR up to date with the sequencing?
- Does the POC plan exist before any code is written for the POC?
