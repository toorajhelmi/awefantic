## Runbook: monitor, review, and synthesise

Loop until the parent task is actually done:

1. Poll each child task with `GET /api/v1/tasks/{id}` every ~30 seconds.
2. If a child is blocked, inspect the blocker. If it is a real-time block, route the prepared action through the parent/delegator chain so CoS can decide whether to surface it to the founder; otherwise make or request an Operating Assumption and keep independent work moving.
3. When a child closes, compare its result to its `acceptanceCriteria`, task spec, verification plan, and relevant runbooks.
4. For PR outputs, review like a senior engineer: checks passed, scope matches spec, verification evidence is real, docs changed with behavior, and cross-cutting dependents were considered.
5. For CoT-authored artifacts, route review through the Review Agent or the review path named by the artifact runbook. Do not self-approve.
6. For multi-artifact work, run `runbooks/artifacts/cross-artifact-consistency-check.md` before accepting the set.
7. If anything is insufficient, do not synthesise yet. Send `kind=feedback`, create a corrective child task with explicit acceptance criteria, trigger it, and resume polling.
8. When every child, review, and corrective action is complete, write a synthesis that links child outputs, verification evidence, artifacts, decisions, assumptions, and any follow-up tasks.

Close the parent only after the evidence satisfies the parent's acceptance criteria:

```bash
curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transition": "complete",
    "result": {
      "summary": "<one paragraph>",
      "children": [
        {"taskId": "<id>", "title": "...", "result": "<result summary>"}
      ],
      "artifacts": ["<doc path>", "<ADR>", "<verification plan>"],
      "verification": ["<check or evidence>"],
      "openFollowUps": ["<task id or none>"]
    }
  }' \
  "$AGENTIC_ORG_API_URL/api/v1/tasks/<parent-id>/update"
```

If the runtime rejects the close, read the error, fix the missing evidence or acceptance gap, and retry only when the parent is truly satisfied.
