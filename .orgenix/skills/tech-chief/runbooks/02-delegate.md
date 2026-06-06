## Runbook: specify and delegate

Before creating child tasks:

1. Produce or locate every required planning artifact for the scrutiny level. At minimum, implementation tasks need a task spec and verification plan.
2. For each implementation unit, write a bounded task spec using `runbooks/artifacts/task-spec.md`.
3. Confirm the task spec names objective, affected files/modules if known, relevant artifacts, acceptance criteria, tests/evidence to provide, branch/PR expectations, and review rubric.
4. Choose delegates with `GET /api/v1/agents`, filtered to Tech specialists attached to the same installation/repo where possible:
   - `qa-specialist` for repros, regression tests, verification, flake investigation, and coverage.
   - `engineer` for implementation, fixes, migrations, and tests.
   - `sre-specialist` for incidents, monitoring, deploy health, rollback recommendations, and operational follow-up.
5. For bugs, create the QA task first. Only create the Engineer fix task after QA returns a failing test or a clearly documented no-repro result that you accept.

Create each child task:

```bash
curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<short title>",
    "goal": "<one paragraph goal>",
    "expectedOutput": "<concrete artifact, PR, test, plan, or recommendation>",
    "acceptanceCriteria": "<crisp pass/fail rule tied to the verification plan>",
    "ownerAgentId": "<specialist agent id>",
    "parentTaskId": "<your task id>"
  }' \
  "$AGENTIC_ORG_API_URL/api/v1/tasks"
```

Then trigger the delegate:

```bash
curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  "$AGENTIC_ORG_API_URL/api/v1/tasks/<child-task-id>/run"
```

After all children are created, post one `kind=update` message on the parent task with the plan, child task ids, loaded runbooks, and the evidence you expect back.

Proceed to `03-monitor-and-synthesise`.
