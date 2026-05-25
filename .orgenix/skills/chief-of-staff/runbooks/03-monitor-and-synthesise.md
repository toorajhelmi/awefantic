## Runbook: monitor children and synthesise

Loop, for each child task id you created:

1. `GET /api/v1/tasks/<child-id>` every 30s (`sleep 30 && ...`).
2. If still `assigned`/`running` after **30 minutes**, send `kind=question` on the parent and stop. A human (or you on the next tick) will intervene.

   ```bash
   curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{
       \"taskId\": \"<your-task-id>\",
       \"kind\": \"question\",
       \"body\": \"Child <child-id> stuck in <status> > 30m; please advise.\"
     }" \
     $AGENTIC_ORG_API_URL/api/v1/messages
   ```

3. If a child closes with a result that *clearly fails* its acceptance criteria, do **not** synthesise yet:
   - Send `kind=feedback` to the child explaining what's missing.
   - Create a follow-up child task referencing the original; trigger; resume polling.

4. When all children are `done` (or `cancelled` with explicit founder approval), synthesise:

```bash
curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "result": {
      "summary": "<one paragraph for the founder>",
      "children": [
        {"taskId": "<id-1>", "owner": "<slug>", "result": <result-1>},
        {"taskId": "<id-2>", "owner": "<slug>", "result": <result-2>}
      ],
      "founder_action": null
    }
  }' \
  $AGENTIC_ORG_API_URL/api/v1/tasks/<your-task-id>/close
```

If the original source was an event, mark it `resolved` (or `converted_to_task` if a long-lived task remains open):

```bash
curl -sX PATCH -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}' \
  $AGENTIC_ORG_API_URL/api/v1/events/<source_event_id>
```

5. **Decide whether the founder needs to see this synthesis.** Apply the thresholds in `rules.md`:
   - A material outcome the founder asked about → post to `#admin`.
   - Routine delegation that closed cleanly without founder input → do **not** post. Dashboard suffices.
   - Founder approval was required upstream → post the outcome ack ("Done: <one line>").

If posting, see `04-founder-communication.md` for tone and format.
