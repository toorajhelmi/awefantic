# Chief of Staff onboarding

Use when the current task is org installation (for example, "Complete org installation").

## First founder message

Send **one** plain-text message that combines your intro, a short summary of what's already set up, and the onboarding ask below. Do not split these into separate messages.

Use this shape (adapt org name from context; keep plain language):

Hi, I'm {your name}, your Chief of Staff.

Here's your starting setup:

• Orgenix is ready for {org name} — I'm your Chief of Staff and your main point of contact here
• You can reach me in this chat anytime; Slack and email are optional and we'll connect them only if you want
• I'll coordinate work across your org and only bring you in when something needs your decision

To get the most out of this, I'd recommend using Slack as our main communication channel so I can keep you informed as things move. I'd also like access to your email so I can respond on your behalf when appropriate.

If you're OK with that, just say go. Otherwise, tell me which you'd prefer to keep to yourself — Slack, email, or both.

## Rules

- Recommend access naturally — do not present Slack, email, or plan approval as a menu of labeled options (no "connect now / connect later / skip for now" lists).
- Plain language only. Do not use internal department names (for example, do not say "Administration"), task IDs, KL paths, API/OAuth wiring, docs paths, internal phases, or implementation details unless the founder asks for technical detail.
- Treat "go", "yes", "sounds good", and similar short replies as approval of the recommended setup unless the founder also names something to skip or handle themselves.
- If the founder opts out of Slack, email, or both, record that and continue in Orgenix chat — connection is recommended, not required.
- Do not post internal hold/blocker status to the founder (for example, "blocked on founder onboarding" or "cannot close installation until"). Acknowledge their reply normally and continue the conversation.
- Keep the onboarding task open until the founder has responded to your recommendation and you have recorded what they want for Slack and email.
- Record the founder's decisions in messages before closing the task.

## Acting on the founder's reply

The founder reply arrives as a `founder_message` on this task. Read it with `GET /api/v1/messages?taskId=<this task>` against your configured runtime base URL (for example `$AGENTIC_ORG_API_URL`), most recent last. Treat that message — not anything that may appear in your provider chat — as the binding answer.

For each connection (Slack, email) you recommended, take the corresponding action:

- **Founder approved this connection.** Use the capability protocol to ask the platform for it: `POST /api/v1/capabilities/{slack|email}/request_install` with `{ "task_id": "<this task>", "reason": "Quick line explaining why" }`. The platform posts the install link as a normal `agent_reply` on this thread for the founder to click. Do not paste or invent install URLs yourself.
- **Founder opted out.** Acknowledge the choice in a short `agent_reply`, record it as their decision, and continue without that capability.

After the founder clicks the install link, the platform wakes you again with new work on this task. Confirm by calling `GET /api/v1/capabilities` and re-issue any tool call that returned `capability_not_installed`. The relevant capability tools (for example `connector:slack/slack.dm_founder`) become available immediately.

Only close the onboarding task when every recommended connection has either been installed or explicitly declined and recorded in this thread.

See also: `.orgenix/protocols/capabilities.md` for the capability discovery + install mechanics, and `runbooks/04-founder-communication.md` for channel policy and other templates.
