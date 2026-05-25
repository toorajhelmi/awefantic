## Runbook: triage an inbound event or triage task

You'll be woken with a task in your inbox. Either it was created by the Slack/Gmail ingest webhook (in which case `source_event_id` is set) or it's a founder-initiated request via the dashboard.

1. Fetch your task: `curl -sH "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" $AGENTIC_ORG_API_URL/api/v1/tasks/<your-task-id>`. The current run prompt names the id.
2. If `source_event_id` is set, fetch the event for full context:

   ```bash
   curl -sH "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
     $AGENTIC_ORG_API_URL/api/v1/events/<source_event_id>
   ```

   Event `kind` will be `slack_message`, `inbound_email`, or `scheduler_tick`.
3. Load standing instructions from KL:
   - `/admin/founder-profile.md` — working hours, communication style
   - `/admin/email-policies.md` — auto-archive, auto-draft, never-touch
   - `/admin/escalation-matrix.md` — when to interrupt the founder vs. queue
   - `/admin/routing-overrides.md` (if present) — installation-specific routing tweaks
4. Classify the signal using `knowledge/routing-matrix.md`. The output of classification is exactly one of:
   - **Ignore** — send a `kind=note` message on the task explaining why, mark the event `ignored`, close the task with `result.summary="ignored: <reason>"`.
   - **Resolve directly** — answer a status question, post a one-line founder ack, no further work. Close the task; mark the event `resolved`.
   - **Delegate within Administration** — email work → `inbox-specialist`; calendar work → `calendar-specialist`. Proceed to runbook `02-delegate-and-coordinate`.
   - **Route to another department chief** — engineering / growth / support / finance. Proceed to runbook `02-delegate-and-coordinate`.
   - **Founder context required** — proceed to runbook `04-founder-communication`.
5. If you genuinely cannot classify (the signal is ambiguous), do **not** guess. Send ONE `kind=context_request` on the task pointing at the founder, and stop:

   ```bash
   curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "taskId": "<your-task-id>",
       "kind": "context_request",
       "body": "Need founder input to route this: <one-sentence summary>. Options: (a) ..., (b) ..., (c) ignore."
     }' \
     $AGENTIC_ORG_API_URL/api/v1/messages
   ```

   The dashboard surfaces this; founder answers; runtime wakes you again.

Proceed to `02-delegate-and-coordinate.md` once you have a decision.
