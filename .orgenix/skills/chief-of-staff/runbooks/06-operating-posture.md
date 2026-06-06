## Runbook: operating posture (onboarding discovery)

Use after Slack/email access has settled on **Complete org installation**. The dashboard stays gated until discovery is recorded via `POST /api/v1/onboarding/discovery/complete`.

### Goals (one conversation, not a form)

1. **Gauge lifecycle stage** — building product, selling to customers, or scaling.
2. **One-time planning offer** — offer a single planning pass; founder may skip.
3. **Recommend and confirm departments** — infer which dept slugs to activate; omit `administration`.

### Founder-facing rules

- Conversational: **at most one soft, skippable question** per turn. Never a questionnaire or numbered intake.
- Plain text; no internal dept names like "Administration", no task IDs, no KL paths.
- Pick up naturally after access setup; **do not** repeat the original onboarding intro or ask to restart.
- All founder-visible replies on the canonical onboarding task via `POST /api/v1/messages` with `kind=agent_reply`.

### Opening message (first discovery turn)

Run `.orgenix/scripts/post-discovery-opener.sh` (or post the same copy via `POST /api/v1/messages`). If `/api/v1/me` fails with an expired token, call `POST /api/v1/auth/agent-token` with the current bearer and `{}`, then retry with the returned `token`.

One short message that acknowledges connections are done, asks lifecycle in one line, mentions the optional planning pass, and signals you will recommend which teams to turn on after they answer.

### After the founder replies

- If they answer lifecycle: recommend departments in plain language (tech/product work, growth/marketing, support, finance — only what fits their stage). Confirm or adjust based on their reaction. When calling `discovery/complete`, use installation slugs (often `tech`, not `engineering`).
- If they skip planning: respect it; still confirm department activation choices.
- When the conversation has **actually concluded** (explicit agreement on active departments, or clear "just CoS for now"):

```bash
curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "<canonical onboarding task id>",
    "departments": ["tech", "growth"]
  }' \
  $AGENTIC_ORG_API_URL/api/v1/onboarding/discovery/complete
```

Use department **slugs** only (e.g. `tech`, `growth`, `support`, `finance`). Omit `administration`. Read `available_department_slugs` from the `discovery/complete` response if a slug is rejected. Do not call `discovery/complete` until the thread reflects a concluded agreement.
