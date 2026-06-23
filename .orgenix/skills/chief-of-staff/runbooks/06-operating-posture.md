## Runbook: operating posture (discovery)

Run this **after** Slack/email access has settled, as the second half of the
"Complete org installation" task (see `onboarding.md`). It is how you learn the
founder's operating posture and decide which departments to activate. It maps
to `docs/implementations/founder-onboarding.md` (§3 gauge, §3.3 planning offer,
§4 ambition contract, §5.4 department activation).

Discovery completion gates the founder's dashboard. Until you record it, they
stay on the onboarding chat. So discovery is required — but it must stay light
and conversational, never a questionnaire.

### Principles

1. Never gate install on stage, planning, or ambition clarity.
2. Infer before you ask. If the founder already stated a goal during access
   setup, use it — do not re-ask.
3. At most one soft question if inference is weak — always skippable.
4. Mirror, don't lecture. Reflect their goal; add one anchor, not a feasibility
   sermon.
5. Offer planning once; respect refusal for this session.

### Step 1 — Gauge lifecycle stage

Infer the stage from what the founder has said. The five stages are `idea`,
`validating`, `mvp`, `pmf`, `scaling`. If you cannot tell, ask one soft,
skippable question, e.g.:

> "What are you focused on right now — still shaping the idea, or something live
> with users? Either way is fine; skip if you'd rather jump straight in."

Treat "skip" / "just go" as `idea` stage + `exec_first` planning posture until
evidence says otherwise.

### Step 2 — Planning offer (one time)

For a large cross-domain goal, offer planning once:

> "I can run a short planning pass so we don't build the wrong thing, or start
> executing and show you the first slice. Which do you prefer?"

- "plan / walk me through it" → `collaborative`.
- "just do it / start now" / ambiguous → `exec_first`.

Do not re-ask on every message.

### Step 3 — Ambition contract (large goals only)

For large goals ("$10k MRR", "build the whole product", "run growth for me"),
post one short plain-language ambition contract the founder can correct — goal
in their words, the assumptions you'll run with until told otherwise, and the
first slice. Not a plan deck. One message.

### Step 4 — Recommend & confirm outcomes

Department activation is **inference-driven, not a menu**. Infer the operating
outcomes the goal implies and confirm with one outcome-framed question. Never ask the
founder to pick departments or tools by name. Default footprint by stage:

| Stage | Recommend | Defer |
|---|---|---|
| idea | Tech (POC) | Growth paid, Support, Finance |
| validating | Tech, Growth organic | Paid social, bookkeeping |
| mvp | Tech, Growth organic, Support when users | Paid until funnel exists |
| pmf+ | As needed per goal | — |

Example confirm: "Want me to also find users for it and make sure they don't hit
problems while using it?" The founder's confirmation (or correction) decides.

The outcomes you confirm here determine the departments you will record as
**inferred** in Step 5. Every org is scaffolded with the same department rows at
install, but a department only becomes active — and only starts showing "Finish
onboarding" on the founder's dashboard — once you record it as inferred. Don't
present the founder a department or tool menu; infer, confirm in plain outcomes,
then translate to exact catalog slugs before recording.

Use department **slugs** when recording. The allowed discovery department
catalog is supplied by the platform in your prompt/config for this installation.
Keep a local mapping from founder-facing outcomes to catalog entries while you
reason, but POST only exact canonical slugs from that allowed list. Include
every confirmed outcome with a matching catalog department; omit an outcome only
when no catalog department exists for it. Do **not**
send department labels, role titles, abbreviations, or natural-language
synonyms. You do **not** list `administration` — the Chief of Staff department is
always active because it runs discovery.

### Step 5 — Record posture, then record discovery complete + inferred departments

Write a short human-readable summary to your knowledge layer at
`/admin/operating-posture.md` (stage, planning posture, ambition summary,
confirmed departments, assumption register). This is the durable record; there
is no posture schema column yet.

Then — and only once the conversation has actually concluded — record discovery
complete so the platform unblocks the dashboard, passing the slugs of the
departments you inferred and confirmed. Before posting, do a self-check:

1. List each founder-confirmed outcome in plain English.
2. Select the matching exact canonical slug from the allowed catalog.
3. Verify the `departments` array includes every selected slug and no values
   outside the allowed catalog.

> `POST /api/v1/onboarding/discovery/complete` with
> `{ "task_id": "<this task>", "departments": ["<exact-slug-from-allowed-catalog>"], "summary": "Founder confirmed the selected department activation set." }`

`departments` lists the confirmed department slugs (omit `administration`). The
call is idempotent — sending the same slugs again is safe — and stamps
`inferred_at` on each, which is what activates their dashboard onboarding
indicator. Omit or pass `[]` if the founder deferred everything; you can record
more departments later by calling again as new needs surface.

Read the JSON response before telling the founder discovery is locked in. Every
selected slug must appear in `department_slugs_accepted` / `inferred`, and
`department_slugs_rejected_unknown` must be empty. A rejected slug means the API
did not recognize it as canonical for this installation; do not treat that
department as activated.

Do **not** call this before the conversation concludes. If the founder skips or
defers, that still counts as concluded with conservative defaults (`idea` +
`exec_first`) — record discovery complete (with an empty or minimal
`departments`) so they are not trapped in onboarding.

After recording discovery, complete the onboarding task when the full acceptance
criterion is satisfied. The platform/dashboard uses the inferred departments to
surface any department onboarding indicators; do not add founder-visible actions
outside this discovery conversation.
