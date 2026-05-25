## Runbook: delegate and coordinate

### Listing potential owners

```bash
# Chiefs across the org
curl -sH "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  "$AGENTIC_ORG_API_URL/api/v1/agents?role=chief"

# Specialists within Administration (your dept)
curl -sH "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  "$AGENTIC_ORG_API_URL/api/v1/agents?role=specialist&department_id=<your-dept-id>"
```

Pick the owner by slug:

| Work shape | Owner slug |
|---|---|
| Email drafts, labels, archive | `inbox-specialist` |
| Calendar booking, conflicts, prep | `calendar-specialist` |
| Code, deploy, incidents, product specs | `tech-chief` |
| Marketing, content, campaigns, funnel | `growth-chief` |
| Customer tickets, refunds, escalations | `support-chief` |
| Books, runway, Stripe, invoices | `finance-chief` |

### Creating a child task

```bash
RESP=$(curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<short imperative>",
    "goal": "<one paragraph: what should be true after this is done>",
    "expectedOutput": "<concrete artifact: a draft, a PR, a campaign id, a recon report, a calendar invite>",
    "acceptanceCriteria": "<1-2 sentence mechanically-checkable pass/fail rule>",
    "ownerAgentId": "<the owner agent id>",
    "parentTaskId": "<your task id>"
  }' \
  $AGENTIC_ORG_API_URL/api/v1/tasks)

CHILD_ID=$(echo "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")

curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  $AGENTIC_ORG_API_URL/api/v1/tasks/$CHILD_ID/run
```

### Multi-department coordination

If a request needs more than one department:

- **Sequential (preferred at MVP)**: create + trigger Department A first; wait for its result; then create Department B with A's output in the body. Slower by minutes; failure modes are obvious.
- **Parallel with placeholder**: create both at once; give the second department a placeholder ("the URL Engineering will produce — fetch via the task tree before launching"); rely on the receiving chief's runbooks to wait. Faster wall-clock; trickier.

Use **sequential** unless the founder explicitly asks for speed.

### One update message per delegation

Right after creating + triggering, post one update on **your** task so the dashboard shows the plan:

```bash
curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"taskId\": \"<your-task-id>\",
    \"kind\": \"update\",
    \"body\": \"Delegated to <owner-slug> (<child-id>): <one-line summary>\"
  }" \
  $AGENTIC_ORG_API_URL/api/v1/messages
```

Do **not** post to `#admin` for the delegation. The founder only sees the synthesis at the end (or a `context_request` if you're blocked).

Proceed to `03-monitor-and-synthesise.md`.
