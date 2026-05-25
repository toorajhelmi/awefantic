## Runbook: proactive surfacing (scheduler tick)

When the scheduler wakes you (`source_event_id` points at an event with `kind=scheduler_tick`), do a sweep of the org state and post to the founder only what's worth their attention.

1. Fetch the current state in one pass:

   ```bash
   # Tasks blocked or waiting on review > N hours
   curl -sH "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
     "$AGENTIC_ORG_API_URL/api/v1/tasks?status=blocked,waiting_review&stale_hours=4"

   # Finance runway alerts surfaced by finance-chief
   curl -sH "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
     "$AGENTIC_ORG_API_URL/api/v1/messages?kind=runway_alert&unanswered=true"

   # Growth funnel deltas (chief posts these weekly)
   curl -sH "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
     "$AGENTIC_ORG_API_URL/api/v1/messages?kind=funnel_update&unanswered=true"
   ```

2. Apply the founder-action thresholds (`rules.md`). Drop anything that fails them.

3. If you find candidate items in KL too — e.g. `/admin/external-events.md` lists an investor conference next week and there is no task on the calendar — draft ONE task to surface it and ask the founder to approve before delegating further:

   ```bash
   curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Decision: attend <event>?",
       "goal": "Founder to decide if we attend <event> on <date>. If yes, CoS will delegate calendar + travel.",
       "expectedOutput": "Founder ack (yes/no) on the task.",
       "acceptanceCriteria": "Founder has replied yes or no via Slack or task message.",
       "ownerAgentId": "<your-agent-id>"
     }' \
     $AGENTIC_ORG_API_URL/api/v1/tasks
   ```

4. Compose a single Slack synthesis message per `04-founder-communication.md`. Aim for **≤ 5 bullets**, each one a thing the founder can act on or ignore in one second.

5. Close your scheduler tick task with `result.summary` listing what you surfaced and what you suppressed (for audit).

If the sweep finds nothing actionable, post nothing. Close the task with `result.summary="nothing actionable"`.
