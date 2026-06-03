#!/usr/bin/env bash
# Post the discovery opener on Complete org installation (idempotent if already posted).
set -euo pipefail

TASK_ID="${1:-a52941ea-0093-4fdd-b2ca-53298748d3c6}"
API_URL="${AGENTIC_ORG_API_URL:-}"
TOKEN="${AGENTIC_ORG_API_TOKEN:-}"

if [[ -z "$TOKEN" || -z "$API_URL" ]]; then
  echo "error: AGENTIC_ORG_API_TOKEN and AGENTIC_ORG_API_URL must be set" >&2
  exit 1
fi

ME=$(curl -sS -H "Authorization: Bearer $TOKEN" "$API_URL/api/v1/me")
if echo "$ME" | grep -q '"error"'; then
  echo "error: agent token rejected: $ME" >&2
  exit 1
fi

BODY=$(cat <<'EOF'
Your connections are in place — Slack and Gmail are live on my side.

Next I want to line up who actually runs day-to-day work with you. In one line: are you mostly still building Lyteral, already talking to customers, or scaling what is working?

If useful, I can do a one-time planning pass on that — or skip it and tell me what you want handled first. Either way I will suggest which parts of the org to switch on.
EOF
)

export TASK_ID BODY
PAYLOAD=$(python3 -c 'import json,os; print(json.dumps({"taskId":os.environ["TASK_ID"],"kind":"agent_reply","body":os.environ["BODY"]}))')
curl -sS -f -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$API_URL/api/v1/messages"

echo "ok: discovery opener posted to task $TASK_ID"
