---
slug: founder-communication
ml_version: 0.1.0
access:
  read: org
  instructed_by: [chief, specialist]
  write: [org, dept]
  own: org
description: >
  Rules for when and how agents communicate with the founder.
  Dashboard chat (any agent) vs Slack (chiefs, high-signal only).
  Complements agent-protocol §C.
---

# Founder Communication

The founder is the single human in the loop. **Dashboard chat** is the
canonical place for back-and-forth on a task. **Slack** is for
action-required pings from chiefs (and Chief of Staff), not a full
conversation log.

Full behaviour (supervisor chain, message kinds, join requests) is in
`/_runtime/agent-protocol.md` **§C (Founder-agent communication)**.
This file adds channel-specific rules.

---

## Dashboard chat {#dashboard_chat}

**Any agent** may participate in dashboard chat on a task they own when:

- the founder opened the thread, or
- the task requires founder input (approval, context, decision).

Rules:

1. Follow **§C** in the agent protocol: `founder_message` /
   `founder_decision`, `supervisor_summary` after decisions,
   `request_supervisor_join` when stuck.
2. Specialists **do not** use Slack to reach the founder for routine
   chat — report to your chief; the chief uses Slack only when §
   [Post to the founder when](#when_to_post) applies.
3. The task thread is the **source of truth**. If Slack also fires,
   reconcile into the task before closing work.

Onboarding uses dashboard chat on task *Complete org installation*
owned by Chief of Staff — see human doc `docs/onboarding.md`.

Founder-visible copy should abstract away internal mechanics. Say what
happened, why it matters, and what action or decision is needed next.
Do not include KL paths, API endpoints, operator/debug details, task ids,
raw error output, internal phases, or implementation breadcrumbs unless
the founder explicitly asks for technical details.

Write founder-visible dashboard chat in plain text that still looks good
when rendered as unformatted text. Do not use raw Markdown bold markers,
headings, code fences, tables, or checklist syntax unless the current
surface is known to render that formatting safely. Prefer short
paragraphs and simple labelled choices.

---

## Slack: the single rule {#single_rule}

**Post to the founder on Slack only when founder action is required.**

If a human reading your message would respond *"OK, noted"* and move on,
you should not have posted. Use durable state — task results, records,
the dashboard thread — for routine progress.

**Only chiefs and Chief of Staff** send outbound Slack to the founder.
Specialists escalate to their chief per agent-protocol §B and §C.

---

## Post to the founder when {#when_to_post}

1. **Founder context is required to proceed.** A task is blocked
   because only the founder has the answer (strategic preference, prior
   commitment, undisclosed plan). Prefer dashboard `context_request` or
   `founder_message` first; use Slack when the founder is not in the
   dashboard habit yet or urgency requires it.
2. **A draft needs review** before it goes out (a customer reply that
   sets a precedent, public comms, a pricing proposal).
3. **Approval is required** by an active policy in `/_runtime/escalation.md`
   or `/<your-dept>/rules.md`.
4. **A material outcome is ready.** Something the founder asked about
   has reached a state worth their attention — a campaign launched, an
   incident resolved, a deal closed.
5. **A previously requested status update is ready.** The founder asked
   "how is X going?" and you have a synthesized answer.
6. **A material risk has emerged** that the founder should know about
   before it forces a decision (legal, security, a key customer at
   risk, a key hire considering leaving).

---

## Do not post to the founder for {#when_not_to_post}

- Routine "run complete" or "task started" notifications.
- Internal cross-team coordination (use messages and tasks).
- Status changes that don't change what the founder would do.
- Errors or retries that the runtime is handling on its own.
- Anything you can decide using existing org rules without their input.
- **Full onboarding back-and-forth** — use dashboard chat with CoS, not
  Slack spam.

If you find yourself wanting to post "FYI" repeatedly, consider whether
a recurring digest (once a day, once a week — owned by your chief
synthesis loop) is more appropriate than ad-hoc pings.

---

## Format {#format}

Every **Slack** message to the founder includes, in this order:

1. **A one-line subject** prefixed by what kind of message it is:
   - `ACTION:` — needs the founder to do or decide something.
   - `APPROVAL:` — explicit approve / reject required.
   - `BLOCKER:` — work is blocked pending founder input.
   - `REVIEW:` — draft attached; founder is the reviewer.
   - `OUTCOME:` — a result they care about is ready.
   - `RISK:` — something they should know about now.
2. **Context, in two or three sentences.** What is happening, why
   they're seeing it.
3. **The ask, as a single clear question or request.** What you need
   from them, and by when if it matters.
4. **A link** to the task in the runtime dashboard so the founder can
   see the full state and continue in dashboard chat if needed.

Keep it short. The founder can pull more from the dashboard if they
want to.

**Dashboard chat** does not require these prefixes unless you are
formally requesting approval — then use `kind=approval` or record a
`founder_decision` when they answer.

For dashboard chat as well as Slack, prefer plain-language next steps:
"Please choose one: connect Slack now, connect it later, or decline and
use Orgenix chat" is better than exposing the tool, endpoint, token, or
task machinery that will implement the choice.

Ask for one decision at a time when possible. If plan approval and
recommended access choices are part of the same onboarding decision
point, combine them into one concise message rather than sending a plan
message followed by a separate approval/access message.

---

## Channels {#channels}

- Post in your department's primary Slack channel by default.
- Use a different channel only if the message is explicitly cross-cutting
  (founder asked for a single thread, or the topic spans multiple depts
  and a shared channel was agreed). Document that exception in your
  dept's `founder-communication.md` if it becomes routine.
- Never DM the founder from an agent identity unless your dept's
  override explicitly permits it.

---

## After a founder response {#after_response}

When the founder replies (dashboard or Slack):

1. Record their answer on the task (`founder_decision`, `clarification`,
   or `approval` as appropriate).
2. If the answer is reusable (a preference that will apply to similar
   future cases), write a short operating document in your dept and
   reference it from `task.result`.
3. Update the task's `status` based on the answer (`running`,
   `waiting_founder`, `blocked`, `cancelled`, or `done` if resolved).
4. **Post `supervisor_summary` to your supervisor** per agent-protocol
   §C — required after every `founder_decision`, even if Slack was the
   surface where they replied.

---

## Department overrides {#department_overrides}

A department may tighten — but not loosen — these rules in
`/<dept>/founder-communication.md`. Typical tightenings:

- Approval thresholds (dollar amounts, customer tiers).
- Specific message kinds always go through the chief, not specialists
  (even via dashboard).
- Quiet hours during which only `BLOCKER:` and `RISK:` are permitted on
  Slack.
