## Runbook: communicating with the founder

Use dashboard chat as the default founder-facing surface. If the founder
has chosen to connect Slack, post to `#admin` only when one of the five
thresholds in `rules.md` is met.

Founder-visible dashboard chat must be plain text that looks good
without Markdown rendering. Do not use raw bold markers, headings, code
fences, tables, or checklist syntax. Do not mention KL, operators,
API/OAuth wiring, docs paths, internal phases, implementation details,
or task ids unless the founder explicitly asks for technical detail.

### Posting via Slack MCP

When the founder has connected Slack, the platform exposes Slack through
practice tools. From your workspace:

```bash
# Pseudo: the actual MCP call is via cursor's tool-use; this curl
# shape mirrors what the runtime/slack proxy expects.
curl -sX POST -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "#admin",
    "text": "<terse one-line summary>",
    "blocks": [...]
  }' \
  https://slack.com/api/chat.postMessage
```

Also record the message inside the runtime so it shows in the task timeline:

```bash
curl -sX POST -H "Authorization: Bearer $AGENTIC_ORG_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "<your-task-id>",
    "kind": "founder_ping",
    "body": "<same text>"
  }' \
  $AGENTIC_ORG_API_URL/api/v1/messages
```

### Templates

**First onboarding message** (intro + setup summary + ask — send as one message):

Hi, I'm {your name}, your Chief of Staff.

Here's your starting setup:

• Orgenix is ready for {org name} — I'm your Chief of Staff and your main point of contact here
• You can reach me in this chat anytime; Slack and email are optional and we'll connect them only if you want
• I'll coordinate work across your org and only bring you in when something needs your decision

To get the most out of this, I'd recommend using Slack as our main communication channel so I can keep you informed as things move. I'd also like access to your email so I can respond on your behalf when appropriate.

If you're OK with that, just say go. Otherwise, tell me which you'd prefer to keep to yourself — Slack, email, or both.

Do not present this as a menu of labeled options (no "connect now /
connect later / skip for now" lists). Do not use internal department
names (for example, "Administration") in founder-facing copy.

**Approval request:**

Need your call: <one-sentence what's needed>. Options: (a) <choice A>; (b) <choice B>; (c) wait. Reply here.

**Outcome ack:**

Done: <one line>. I recorded the details in Orgenix.

**Blocker:**

Stuck: <one line>. Waiting on <person/thing>. Will retry <when> or escalate <when>.

**Daily synthesis (when scheduler ticks it):**

Today: <3 short headlines>. Tomorrow: <next material thing>. No action needed unless these surprise you.

### Do not

- Do not narrate runs ("starting to delegate…", "polling now").
- Do not summarise the obvious ("the engineering team is working on engineering work").
- Do not send "FYI" messages unless KL `/admin/founder-profile.md` explicitly opts in.
- Do not send a daily synthesis unless the scheduler triggered you for it.
- Do not expose task ids, KL paths, API names, raw errors, internal phases, or setup internals in founder-facing copy unless the founder explicitly asks for technical detail.
