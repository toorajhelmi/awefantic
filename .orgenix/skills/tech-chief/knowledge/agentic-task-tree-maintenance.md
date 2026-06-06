# Agentic Task Tree Creation And Maintenance

> **Status**: Design document. This explains how the system creates, places, updates, and maintains a coherent task tree over time as users add tasks of different sizes.
>
> **Runtime routing note**: In Orgenix runtime usage, CoT and other domain chiefs do not ask the founder directly. Founder-facing ambiguity or approval is reported as `task_update transition: "block"` to the delegator, and the unblock chain reaches CoS.

---

## 1. Purpose

The task tree is the system's working map of what the agent organization is doing and why.

It must support both:

- large, ambiguous goals
- tiny, concrete edits

Examples of valid incoming tasks:

- "Create a go-to-market plan."
- "Improve onboarding."
- "Change the homepage headline."
- "Fix the mobile settings screen."
- "Run a pricing experiment."

The system should not force every small task into a large strategy process. It should also not let small tasks float around without context. CoY maintains coherence by placing every task under the right parent, tracking what completed work changed, and detecting contradictions or overlaps with existing work.

---

## 2. Roles

### Chief of Staff

CoS receives the user request and clarifies language.

CoS is responsible for:

- understanding what the user asked
- fixing obvious wording ambiguity
- asking the user if the request is unclear
- passing a clarified task request to CoY

### Chief of Strategy

CoY owns the task tree.

CoY is responsible for:

- deciding where a new task belongs
- creating missing parent context when needed
- assigning the right chief owner
- detecting overlap with active tasks
- detecting contradiction with active or completed work
- tracking durable effects of completed tasks
- deciding whether to attach, merge, split, supersede, or route a founder question through CoS

Domain chiefs own execution and domain judgment. CoY owns coherence across tasks.

---

## 3. Core Concept

The visible structure is a tree, but CoY maintains more than unfinished tasks.

CoY tracks:

- active tasks
- completed tasks
- durable effects of completed tasks
- prior decisions
- assets and surfaces affected by work
- task ownership
- conflicts and overlaps

A completed task does not disappear. Its effect remains active until it is superseded, reversed, expired, or no longer relevant.

---

## 4. Minimal Objects

### Task

A task is work to be done.

Required fields:

- `title`
- `owner`
- `parent`
- `status`
- `target`
- `expected_output`

Where:

- `owner` is the chief or agent responsible.
- `parent` is the tree parent.
- `target` is the thing being changed, studied, or produced.
- `expected_output` is what should exist when the task is done.

### Parent Node

A parent node organizes tasks. It can represent either a strategic area or an asset area.

Required fields:

- `title`
- `type`
- `parent`

Parent node types:

- `goal`
- `initiative`
- `workstream`
- `asset`
- `surface`
- `component`

### Effect

An effect is the lasting result of a completed task.

Required fields:

- `description`
- `source_task`
- `target`
- `status`

Effect statuses:

- `active`
- `superseded`
- `reversed`
- `expired`

### Decision

A decision records an approved choice that future tasks should respect.

Required fields:

- `description`
- `owner`
- `status`

Decision statuses:

- `active`
- `superseded`

---

## 5. Two Parent Hierarchies

Tasks can be organized under two kinds of hierarchy.

### Strategic Hierarchy

Used when the task is about an outcome, initiative, or business direction.

```text
Goal
  -> Initiative
    -> Workstream
      -> Task
```

### Asset Hierarchy

Used when the task is about a specific product, page, feature, workflow, or component.

```text
Asset
  -> Surface
    -> Component
      -> Task
```

Small tasks usually attach to the asset hierarchy.

Large tasks usually create or attach to the strategic hierarchy.

Some tasks connect both. In that case, the tree parent should be the primary operating context, and the other relationship should be kept as a link or note.

---

## 6. Creating A New Task

When a user adds a task, CoY performs a placement pass.

### Step 1: Classify Size

CoY classifies the request as one of:

- strategic goal
- initiative
- workstream
- task
- small edit
- investigation
- experiment
- bug fix
- approval

This determines how much planning is required.

Small tasks should remain small.

### Step 2: Identify Target

CoY identifies what the task is about.

Targets can be:

- business outcome
- product area
- asset
- page
- feature
- component
- workflow
- metric
- prior decision
- prior effect

If no target can be identified, CoY asks the user or CoS for clarification.

### Step 3: Find Existing Parent

CoY searches the current tree for the nearest relevant parent.

It checks:

- active tasks
- active parent nodes
- completed effects
- active decisions
- known assets

If a matching parent exists, attach the task there.

### Step 4: Create Missing Parent Context

If no parent exists, CoY creates the smallest useful parent context.

For a tiny task, this should usually be an asset path, not a strategic initiative.

Example shape:

```text
Marketing Site
  -> Landing Page
    -> Hero Section
      -> New small task
```

The parent exists to organize work. It should not imply a large project unless the user asked for one.

### Step 5: Assign Owner

CoY assigns the task to the appropriate chief or agent.

Examples:

- product behavior -> CoP
- technical implementation -> CoT
- marketing copy or acquisition surface -> CoG
- budget or pricing -> CoF
- risk, privacy, compliance -> CoR
- ambiguous strategic direction -> CoY

If ownership is unclear, CoY asks the likely chiefs to recommend ownership.

### Step 6: Check Coherence

Before accepting the placement, CoY checks for:

- overlap with active tasks
- contradiction with active tasks
- contradiction with active decisions
- contradiction with active effects
- dependency on unfinished work
- missing parent context

CoY then accepts, attaches, merges, splits, blocks, or asks the user.

---

## 7. Placement Outcomes

Every new task ends in one of these outcomes.

### Attach

The task fits under an existing parent.

Use when the task is clearly part of existing work.

### Create Parent And Attach

The task is valid but no parent exists.

Use when the task targets a known asset, surface, or goal without an existing node.

### Merge

The task duplicates or substantially overlaps another active task.

Use when two tasks would produce the same output or require the same work.

### Split

The task contains multiple separable outcomes.

Use when one request includes distinct work for different owners.

### Link As Related

The task belongs in one place but affects another area.

Use when a single tree parent is not enough to capture relationship.

### Block For Clarification

The task cannot be placed or assigned without more information.

Use when target, owner, or intent is unclear.

### Mark As Contradiction

The task conflicts with active work, active decisions, or active effects.

Use when both cannot be true at the same time.

---

## 8. Maintaining Completed Work

When a task completes, CoY records its effect.

A completed task creates an effect if it changes the state of something.

Examples of effects:

- homepage hero copy changed
- onboarding flow simplified
- pricing model updated
- technical architecture decision adopted
- experiment launched
- risk policy added
- feature removed

The effect stays active after the task is done.

This lets CoY reason about future tasks.

---

## 9. Superseding And Reversing Effects

Later tasks may modify or override earlier effects.

CoY should not delete the old effect. It should mark it as superseded or reversed.

### Superseded

Use when a newer task replaces an older state.

Example:

```text
Old effect: Homepage headline changed to focus on small teams.
New task: Rewrite homepage headline for enterprise buyers.
```

The old effect becomes `superseded`.

### Reversed

Use when a task intentionally undoes a prior change.

Example:

```text
Old effect: Pricing removed from homepage.
New task: Add pricing back to homepage.
```

The old effect becomes `reversed`.

### Expired

Use when an effect was temporary.

Example:

```text
Old effect: Holiday campaign banner added.
Current date passes campaign end.
```

The effect becomes `expired`.

---

## 10. Detecting Overlaps

Overlap means two tasks are trying to do substantially the same work.

CoY checks for overlap by comparing:

- target
- expected output
- owner
- parent
- timing
- wording similarity

Overlap does not always mean duplication. Sometimes two chiefs need to collaborate.

CoY can recommend:

- merge tasks
- keep both but link them
- assign one owner and one contributor
- split shared work into separate outputs

---

## 11. Detecting Contradictions

Contradiction means two tasks, decisions, or effects cannot all remain true.

CoY checks contradictions across:

- active tasks
- completed effects
- active decisions
- assumptions
- target assets

Common contradiction types:

- goal contradiction
- audience contradiction
- copy or messaging contradiction
- product behavior contradiction
- budget contradiction
- timeline contradiction
- risk contradiction
- ownership contradiction

When contradiction is detected, CoY should identify:

- what conflicts
- why it conflicts
- which task, decision, or effect is older
- whether the newer request should supersede the older state
- whether user approval is required

---

## 12. CoY Recommendations

CoY should produce recommendations as concrete tree maintenance actions.

Examples:

- attach this task under an existing parent
- create a new asset parent
- merge with an active task
- split into two tasks
- mark prior effect as superseded
- ask user to confirm strategic shift
- assign to a different chief
- add a prerequisite task
- block until another task completes

Recommendations should be short and actionable.

CoY can apply safe structural recommendations automatically.

User approval is needed when:

- the new task changes strategic direction
- an active decision would be superseded
- a high-impact effect would be reversed
- budget, risk, or scope changes materially

---

## 13. Small Task With No Parent

If the user starts with a small task and there is no parent yet, CoY creates lightweight asset context.

Process:

1. Identify the target asset.
2. Create the smallest useful asset path.
3. Attach the task under that path.
4. Assign the right owner.
5. Record the effect when complete.

Example shape:

```text
Website
  -> Main Page
    -> Message Area
      -> Create clear colorful message
```

This does not create a large strategic initiative. It only creates enough structure for future coherence.

If a larger initiative appears later, CoY can link or re-parent the old task as context.

---

## 14. Large Task With Existing Small Effects

If a large task is added later, CoY checks existing effects.

Example shape:

```text
Existing effect:
Main page message was made shorter and more colorful.

New task:
Redesign main page messaging strategy.
```

CoY should:

- attach the new task under the appropriate strategic parent
- link the existing effect as context
- decide whether the old effect remains active
- mark it superseded only if the new work replaces it

Completed small tasks become useful context for later larger work.

---

## 15. Active Task Added Under Completed Effect

Sometimes the best parent is not an active task but a completed effect.

Example shape:

```text
Active effect:
Checkout flow simplified.

New task:
Improve conversion on simplified checkout.
```

CoY can create a new parent around the affected asset and link the prior effect.

```text
Checkout
  -> Conversion Improvements
    -> Improve conversion on simplified checkout
```

The prior effect remains context, not a parent task that reopens.

---

## 16. Re-Parenting

CoY may re-parent tasks when better context appears.

Use re-parenting when:

- a new initiative explains several existing tasks
- a small task was initially placed under an asset but later belongs under a broader workstream
- two parallel branches are merged
- a parent was created too broadly or too narrowly

Re-parenting should preserve history.

Do not rewrite old task meaning. Move the task and record why the parent changed.

---

## 17. Task Tree Hygiene

CoY should periodically clean the tree.

Checks:

- orphan tasks
- duplicate tasks
- stale blocked tasks
- completed tasks without effects
- effects without targets
- active effects contradicted by newer work
- parent nodes with no active tasks and no useful history
- tasks assigned to the wrong owner

Hygiene should not hide history. It should keep the active view readable while preserving past context.

---

## 18. User-Facing Views

The user should not see every internal link by default.

Default view:

- active tasks
- relevant completed effects
- blockers
- pending approvals
- recent changes

Expanded view:

- full history
- superseded effects
- contradictions
- placement decisions
- re-parenting history

The goal is to make the tree understandable while keeping CoY's reasoning available when needed.

---

## 19. Summary

CoY maintains a coherent task tree across time.

For every new task, CoY:

1. classifies the task size
2. identifies the target
3. finds or creates the right parent
4. assigns an owner
5. checks active work
6. checks completed effects
7. detects overlaps and contradictions
8. recommends attach, merge, split, block, or supersede
9. records durable effects after completion

The tree is not only a list of unfinished work. It is a living structure that remembers what has changed, what is still true, and what later work overrides.
