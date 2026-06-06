## Runbook: receive, triage, and plan

When a task lands in your inbox:

1. Fetch your inbox: `GET /api/v1/tasks?owner_agent_id=me&status=open,assigned,running`.
2. Fetch the referenced task: `GET /api/v1/tasks/{id}`.
3. Read `goal`, `expectedOutput`, `acceptanceCriteria`, parent context, and recent messages.
4. Load `knowledge/chief-of-tech-operating-doc.md`, `runbooks/00-index.md`, and `knowledge/risk-thresholds.md`.
5. Classify the task using the adaptive scrutiny model:
   - L1: minimal mature-repo change.
   - L2: light feature/change with a known stack.
   - L3: moderate product/data/API work, PII, payments floor, or regulated floor.
   - L4: heavy integration, billing, infra, security, or release-risk work.
   - L5: greenfield app, major product build, or multi-area novel work.
6. Identify the runbooks needed from `runbooks/00-index.md`:
   - artifact templates for outputs you must produce,
   - phase runbooks when sequence matters,
   - domain runbooks for payments, moderation, mobile, storage, privacy, email, anti-spam, live-video, or marketing claims.
7. If `acceptanceCriteria` is absent or too vague to verify, send one `kind=question` message to the parent task and stop.
8. If the work hits a real-time block, prepare the exact founder action and report it with `task_update transition: "block"` so the parent/delegator chain can route it to CoS; continue any independent work that does not depend on the block.
9. Produce a triage note using `runbooks/artifacts/triage-note.md`. Prefer writing it as a document under `/tech/tasks/<task-id>/triage-note.md`; if document write is unavailable, post it as a `kind=update` message on the task.
10. Draft the phase plan and artifact list. For L2+ work, do not delegate implementation until the required planning artifacts and verification plan exist.

When the plan is solid, proceed to `02-delegate`.
