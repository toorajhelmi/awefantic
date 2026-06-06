# Agentic Task Planning System

> **Status**: Design document. This captures the approach developed for an agentic planning system that receives ambiguous user goals, disambiguates them, coordinates AI chiefs, produces practical hierarchical task plans, and uses proof-of-concept work to keep plans realistic.
>
> **Runtime routing note**: In the Orgenix task runtime, any phrase in this reference doc that says a domain chief asks, surfaces, or escalates to the user means the chief reports a blocker to its delegator. The parent/delegator chain routes founder-facing questions to CoS; CoT never asks the founder directly.

---

## 1. Context

We want a system that can take an ambiguous, high-level user goal and turn it into a practical, executable task hierarchy. The system is composed of AI agents with roles, skills, shared knowledge access, and a parent-child hierarchy. Parent agents can delegate work, review child outputs, detect conflicts, and escalate decisions.

The motivating example was a user asking for a live-only social app where users post live videos, nearby live posters are detected as being at the same event, AI generates multi-angle event video, attendees are connected into an event-oriented social experience, and the business reaches a large MRR target in six months.

That example exposed several requirements:

1. The system must handle ambiguous language before planning.
2. The system must not rely on one planner agent inventing the whole plan.
3. Domain chiefs should own domain plans and assumptions.
4. Strategy should coordinate chiefs, not micromanage every specialist.
5. POCs are first-class planning artifacts, not optional afterthoughts.
6. Negative outcomes must be modeled explicitly.
7. The final output must be implementable as data, events, states, and typed artifacts.

---

## 2. Core Design Decisions

### 2.1 Only The Original Requester Is Human

The original user is the only human actor assumed by the planning system. All other actors are AI agents.

This changes how capability gaps are handled. A missing capability does not mean "hire a person" by default. It means one or more of the following is missing:

- skill definition
- tool access
- data access
- compute budget
- permission
- context
- time budget
- model capability

Recovery is therefore usually:

- configure a specialist AI agent
- attach a skill
- grant tool or data access
- allocate compute or budget
- route founder permission or approval through the parent/delegator chain to CoS
- reduce scope only when a hard constraint blocks the plan

### 2.2 Chief Of Staff Owns Intake And Disambiguation

There is no separate "runner" actor. The user task is passed to the Chief of Staff.

The Chief of Staff performs linguistic and intent disambiguation:

- receives the original user request
- repairs obvious typos
- parses intent
- detects ambiguous terms
- distinguishes linguistic ambiguity from domain uncertainty
- asks the user concise blocking questions
- creates a clarified planning brief
- passes the clarified brief to the Strategy Chief

The Chief of Staff does not decide domain-specific feasibility. For example, it can note that "3D video editing" is part of the desired product capability, but it should not decide whether 3D reconstruction is feasible.

### 2.3 Strategy Chief Routes Work To Domain Chiefs

The Strategy Chief receives the clarified planning brief and decides who should work on it.

The Strategy Chief:

- selects relevant domain chiefs
- defines their planning mandates
- coordinates cross-chief planning
- resolves strategic tradeoffs
- escalates user-facing decisions
- owns the final recommendation

The Strategy Chief should not normally delegate directly to every specialist. It delegates to domain chiefs. Domain chiefs decide whether specialists are needed inside their domain.

### 2.4 Domain Chiefs Produce Complete Domain Plans

Each domain chief is an AI chief agent capable of completing its own domain plan.

Specialist delegation is optional. A chief involves specialists only when doing so improves the output:

- parallel investigations are useful
- specialized tools are required
- a POC needs focused execution
- independent critique is useful
- the context is too large
- repeated execution is needed
- separate evidence artifacts are required

Even when specialists are used, the chief owns the final domain plan.

### 2.5 Assumptions Are Chief-Owned

The system must not create assumptions generically. The Chief of Staff may flag ambiguity, but assumptions should be proposed and owned by the relevant chief.

Examples:

- Strategy Chief owns assumptions about business target interpretation.
- Product Chief owns assumptions about user behavior.
- Tech Chief owns assumptions about architecture feasibility.
- AI/Video Chief owns assumptions about video generation paths.
- Growth Chief owns assumptions about acquisition channels.
- Finance Chief owns assumptions about cost, pricing, and budget.
- Legal/Risk Chief owns assumptions about consent, privacy, and compliance.

### 2.6 POCs Keep Plans Realistic

A plan is not considered practical just because agents can describe it. High-impact, low-confidence assumptions require proof.

For the live social app example, the system should not silently decide that 3D reconstruction is excluded. The AI/Video Chief should compare possible in-app implementation paths:

- 2D generated recap
- 2.5D composition
- full 3D reconstruction

Then it should create a POC branch to compare quality, latency, compute cost, and source footage constraints.

---

## 3. Actor Model

| Actor | Type | Responsibility |
|---|---|---|
| Original user | Human requester | Provides the goal and approves assumptions, budget, risk, scope, and final plan. |
| Chief of Staff | AI intake agent | Receives the task, performs linguistic disambiguation, asks blocking clarification questions, and creates the clarified brief. |
| Strategy Chief | AI parent agent | Receives the clarified brief, selects domain chiefs, sets mandates, integrates strategic tradeoffs, and requests user approval. |
| Domain Chief | AI chief agent | Creates the full domain plan directly and owns the final domain artifact. |
| Specialist Agent | Optional AI child agent | Used when a chief wants parallel evidence, tool-heavy work, focused critique, POC execution, or repeated execution. |
| Integrator | AI coordination agent | Merges reviewed domain plans, detects conflicts, validates dependencies, and assembles plan versions. |
| Feasibility Lead | AI evaluation agent | Turns high-impact uncertainty into POCs and evidence gates. |

---

## 4. End-To-End Planning Flow

```text
User
  -> Chief of Staff
      -> intake
      -> linguistic disambiguation
      -> clarified planning brief
  -> Strategy Chief
      -> strategic routing
      -> domain chief selection
      -> mandate definition
  -> Domain Chiefs
      -> parallel domain planning
      -> chief-owned assumptions
      -> optional specialist inclusion
      -> domain plan review
  -> Cross-Chief Review
      -> assumption challenges
      -> conflict detection
      -> dependency discovery
  -> Feasibility
      -> POC planning
      -> POC execution
      -> evidence review
  -> Integration
      -> hierarchical executable task tree
      -> plan validation
  -> Strategy Chief + User
      -> approval, revision, pause, or rejection
```

---

## 5. Activities

| ID | Activity | Primary owner | Purpose | Negative branch |
|---|---|---|---|---|
| A0 | Intake | Chief of Staff | Receive raw user request and context. | Empty or unsafe request asks for correction. |
| A1 | Linguistic disambiguation | Chief of Staff | Parse intent, repair typos, detect blocking ambiguity. | Blocking ambiguity enters `WaitingForUser`. |
| A2 | Strategic routing | Strategy Chief | Select domain chiefs and define mandates. | Missing chief creates capability configuration task. |
| A3 | Parallel domain planning | Domain Chiefs | Produce complete local plans, assumptions, risks, dependencies, and POCs. | Blocked chief emits `BlockedDomainPlan`. |
| A4 | Optional specialist inclusion | Domain Chief | Add specialist agents for evidence, POCs, tools, or critique. | Missing specialist creates capability gap. |
| A5 | Chief review | Domain Chief | Review child artifacts against acceptance criteria. | Weak artifacts are rejected or escalated. |
| A6 | Cross-domain critique | All Chiefs | Detect contradictions, missing dependencies, and unrealistic assumptions. | Disagreements route to conflict resolution. |
| A7 | Conflict resolution | Integrator | Resolve compatible conflicts and escalate strategic tradeoffs. | Unresolved material conflict marks plan not ready. |
| A8 | POC planning | Feasibility Lead | Convert low-confidence assumptions into proof tasks. | Too expensive or impossible proofs require decision. |
| A9 | POC execution and evidence review | POC Owner + Reviewer | Run proofs and update confidence. | Failed evidence revises or rejects plan branch. |
| A10 | Integrated plan assembly | Integrator | Merge plans, decisions, dependencies, POCs, and milestones. | Missing owners, cycles, or impossible dates return to repair. |
| A11 | Approval gate | Strategy Chief + User | Approve, revise, pause, or reject plan. | Rejection routes changes back to affected activities. |

---

## 6. Assumption Governance

### 6.1 Why Assumptions Need A Process

Ambiguous tasks require assumptions, but assumptions must not be invisible. A hidden assumption can make the final plan look coherent while encoding a wrong business target, impossible technical scope, or unacceptable risk.

The system separates three concepts:

- **Ambiguity**: something unclear in language, intent, domain facts, feasibility, or constraints.
- **Assumption**: an explicit claim proposed by an owner so planning can proceed.
- **Decision**: an approval, rejection, or modification of an assumption by the authorized actor.

### 6.2 Ambiguity Classes

| Class | Owner | Example |
|---|---|---|
| Linguistic ambiguity | Chief of Staff | "100K MRR users" could mean `$100k MRR`, `100k active users`, or `100k paying users`. |
| Strategic ambiguity | Strategy Chief | Whether to optimize for revenue, users, defensibility, or speed. |
| Product ambiguity | Product Chief | Whether users will tolerate live-only posting. |
| Technical ambiguity | Tech Chief | Whether event clustering works accurately enough. |
| AI capability ambiguity | AI/Video Chief | Whether 3D reconstruction is feasible, or whether 2D/2.5D recap is better. |
| Growth ambiguity | Growth Chief | Which acquisition wedge can scale. |
| Financial ambiguity | Finance Chief | Whether unit economics work under likely compute and CAC costs. |
| Legal/risk ambiguity | Legal/Risk Chief | Whether auto-connecting attendees is acceptable without explicit opt-in. |

### 6.3 Assumption Lifecycle

```text
DetectedAmbiguity
  -> ProposedAssumption
  -> AssumptionReview
  -> AcceptedForPlanning
  -> NeedsPOC
  -> UserApprovalRequired
  -> Approved / Rejected
  -> Superseded
```

Meaning:

- `DetectedAmbiguity`: Chief of Staff or a chief identifies uncertainty.
- `ProposedAssumption`: owning chief proposes a claim with alternatives.
- `AssumptionReview`: affected chiefs challenge or accept it.
- `AcceptedForPlanning`: Strategy Chief allows provisional use.
- `NeedsPOC`: assumption is high-impact, low-confidence, or runbook-required.
- `UserApprovalRequired`: assumption changes business target, budget, risk, or scope.
- `Approved` / `Rejected`: authorized actor decides.
- `Superseded`: later evidence or user decision replaces it.

### 6.4 Assumption Record

```ts
type Assumption = {
  id: string;
  sessionId: string;
  ownerChiefId: string;
  sourceAmbiguityId?: string;
  claim: string;
  alternatives: string[];
  scope: "strategy" | "product" | "tech" | "ai_video" | "growth" | "finance" | "legal_risk";
  impact: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
  reversible: boolean;
  needsUserApproval: boolean;
  needsPOC: boolean;
  evidenceIds: string[];
  status:
    | "proposed"
    | "accepted_for_planning"
    | "challenged"
    | "needs_poc"
    | "user_approval_required"
    | "approved"
    | "rejected"
    | "superseded";
};
```

### 6.5 Assumption Rules

Low-impact and reversible assumptions may be accepted by the owning chief.

High-impact and reversible assumptions may be accepted provisionally, but must remain visible in downstream artifacts.

High-impact and low-confidence assumptions require a POC or explicit waiver.

Business target, budget, risk tolerance, and scope assumptions require user approval.

Cross-domain assumptions require review by affected chiefs.

---

## 7. Delegation Model

The Strategy Chief delegates planning to domain chiefs. It does not normally pick individual specialists.

Each domain chief follows this loop:

```text
receive mandate
  -> draft complete domain plan directly
  -> identify uncertainty, evidence gaps, and tool needs
  -> optionally involve specialists
  -> review specialist artifacts
  -> merge accepted artifacts
  -> submit owned domain plan
```

Specialist inclusion is a domain-chief decision. It is triggered by:

- need for parallel work
- need for tool-heavy execution
- need for focused POC execution
- need for independent critique
- large context or data volume
- repeated execution
- lack of confidence in a domain assumption

The chief remains accountable for the output.

---

## 8. Event Model

The implementation should be event-driven, even though there is no "runner" actor. The platform records events, applies transition rules, persists artifacts, and triggers the next agent action.

Events must be explicit because we need observability, replayability, and review.

```ts
type PlanningEvent = {
  id: string;
  sessionId: string;
  type: string;
  actorId: string;
  actorRole: string;
  targetId?: string;
  payload: unknown;
  occurredAt: string;
  handledAt?: string;
};
```

Important event types:

- `NewGoalReceived`
- `AmbiguousOutcome`
- `ClarifiedBriefReady`
- `DomainNeeded`
- `ChiefPlanningStarted`
- `AssumptionProposed`
- `AssumptionChallenged`
- `AssumptionNeedsPOC`
- `SkillGap`
- `NoQualifiedAgent`
- `ToolUnavailable`
- `DomainPlanSubmitted`
- `ConflictDetected`
- `DecisionRequired`
- `BudgetExceeded`
- `HighUncertainty`
- `EvidenceSubmitted`
- `EvidenceFailed`
- `EvidenceInconclusive`
- `PlanIncoherent`
- `ApprovalGranted`

---

## 9. State Machine

```text
Idle
  -> Intake
  -> Disambiguation
  -> WaitingForUser | StrategicRouting
  -> Rostering
  -> DomainPlanning
  -> AssumptionReview | Delegating | CrossReview
  -> ConflictResolution
  -> POCPlanning
  -> POCExecution
  -> EvidenceReview
  -> Integration
  -> Approval
  -> ReadyForExecution
```

Representative transitions:

| Current state | Trigger | Actor | Action | Next state |
|---|---|---|---|---|
| `Idle` | `NewGoalReceived` | Chief of Staff | Create planning session. | `Intake` |
| `Intake` | `EnoughContext` | Chief of Staff | Draft raw brief. | `Disambiguation` |
| `Disambiguation` | `BlockingAmbiguity` | Chief of Staff | Ask user targeted question. | `WaitingForUser` |
| `Disambiguation` | `ClarifiedBriefReady` | Chief of Staff | Pass clarified brief to Strategy Chief. | `StrategicRouting` |
| `StrategicRouting` | `DomainNeeded` | Strategy Chief | Select chiefs and mandates. | `Rostering` |
| `Rostering` | `ChiefsAssigned` | Strategy Chief | Start parallel planning. | `DomainPlanning` |
| `DomainPlanning` | `AssumptionProposed` | Owning Chief | Record chief-owned assumption. | `AssumptionReview` |
| `AssumptionReview` | `AssumptionNeedsPOC` | Feasibility Lead | Create proof branch. | `POCPlanning` |
| `DomainPlanning` | `DomainPlanSubmitted` | Strategy Chief | Send to cross-review. | `CrossReview` |
| `CrossReview` | `ConflictDetected` | Any Chief | Open conflict record. | `ConflictResolution` |
| `POCExecution` | `EvidenceSubmitted` | POC Reviewer | Review evidence. | `EvidenceReview` |
| `EvidenceReview` | `EvidenceFailed` | POC Reviewer | Revise or reject branch. | `DomainPlanning` |
| `Integration` | `PlanCoherent` | Integrator | Submit for approval. | `Approval` |
| `Approval` | `Approved` | Strategy Chief + User | Freeze plan version. | `ReadyForExecution` |

---

## 10. Required Artifacts

### 10.1 Clarified Planning Brief

```ts
type ClarifiedPlanningBrief = {
  id: string;
  sessionId: string;
  rawUserGoal: string;
  parsedIntent: string;
  correctedLanguage: Array<{ original: string; interpretedAs: string }>;
  knownConstraints: string[];
  candidateOutcomes: string[];
  ambiguityIds: string[];
  blockingQuestions: string[];
  nonBlockingNotes: string[];
  createdBy: "chief_of_staff";
};
```

### 10.2 Domain Plan

```ts
type DomainPlan = {
  id: string;
  sessionId: string;
  ownerChiefId: string;
  mandate: string;
  objectives: string[];
  tasks: TaskNode[];
  assumptions: string[];
  risks: string[];
  dependencies: string[];
  conflictsRaised: string[];
  pocsRequested: string[];
  confidence: "low" | "medium" | "high";
  status: "draft" | "submitted" | "needs_revision" | "approved_for_integration";
};
```

### 10.3 Task Node

```ts
type TaskNode = {
  id: string;
  sessionId: string;
  parentId?: string;
  ownerAgentId: string;
  objective: string;
  status:
    | "ready"
    | "blocked"
    | "provisional"
    | "in_progress"
    | "completed"
    | "rejected";
  inputs: string[];
  expectedArtifactType: string;
  acceptanceCriteria: string[];
  dependencies: string[];
  budget?: {
    money?: number;
    compute?: string;
    timebox?: string;
  };
  failurePolicy: string;
};
```

### 10.4 Conflict Record

```ts
type ConflictRecord = {
  id: string;
  sessionId: string;
  raisedByAgentId: string;
  affectedOwnerIds: string[];
  affectedTaskIds: string[];
  contradiction: string;
  evidenceIds: string[];
  options: Array<{
    label: string;
    consequence: string;
    recommendedBy?: string;
  }>;
  decisionAuthority: "strategy_chief" | "domain_chief" | "original_user";
  status: "open" | "resolved" | "escalated" | "waived";
  resolution?: string;
};
```

### 10.5 POC

```ts
type POC = {
  id: string;
  sessionId: string;
  assumptionId: string;
  ownerAgentId: string;
  reviewerAgentId: string;
  method: string;
  inputs: string[];
  budget: {
    money?: number;
    compute?: string;
    timebox: string;
  };
  passCriteria: string[];
  failCriteria: string[];
  result?: "passed" | "failed" | "inconclusive";
  evidenceIds: string[];
  confidenceChange?: {
    before: "low" | "medium" | "high";
    after: "low" | "medium" | "high";
  };
};
```

### 10.6 Plan Version

```ts
type PlanVersion = {
  id: string;
  sessionId: string;
  version: number;
  rootTaskId: string;
  taskTreeSnapshot: TaskNode[];
  assumptions: Assumption[];
  conflicts: ConflictRecord[];
  pocs: POC[];
  risks: string[];
  budgetSummary: string;
  confidenceSummary: string;
  approvalStatus:
    | "draft"
    | "blocked"
    | "pending_user_approval"
    | "approved"
    | "rejected";
};
```

---

## 11. Knowledge, Skills, And Runbooks

The planning system needs shared knowledge and agent-specific runbooks.

### 11.1 Shared Knowledge

Shared knowledge includes:

- company strategy
- product assets
- codebase inventory
- prior plans
- prior POC results
- market research
- finance assumptions
- legal/risk policies
- previous decisions
- customer evidence

Each knowledge item should carry:

- source
- freshness
- owner
- confidence
- citations
- access permissions

### 11.2 Skill Registry

```ts
type Skill = {
  id: string;
  name: string;
  description: string;
  inputSchema: unknown;
  outputSchema: unknown;
  allowedTools: string[];
  requiredPermissions: string[];
  evidenceRequirements: string[];
  evaluatorId?: string;
};
```

### 11.3 Runbooks

Runbooks tell chiefs how to reason inside their domain.

For example, an AI/Video Chief runbook might say:

- never assume 3D reconstruction is impossible without checking feasibility
- compare video generation paths by quality, latency, cost, and data requirements
- require POC for any high-impact video generation claim
- treat in-app product capability as the target, even if implementation uses external APIs, codecs, libraries, or cloud compute internally

Runbooks are generic domain policy. They should not hardcode a specific user example.

---

## 12. Negative Outcomes And Recovery

| Negative outcome | Event emitted | Responsible actor | Recovery behavior |
|---|---|---|---|
| Blocking ambiguity | `AmbiguousOutcome` | Chief of Staff | Ask the original user a targeted question. |
| No configured AI chief | `CapabilityGap` | Strategy Chief | Configure chief or request permission/budget/scope decision. |
| No specialist capability | `CapabilityGap` | Domain Chief | Configure specialist, attach tools/data/compute, or continue within chief. |
| Tool or data unavailable | `ToolUnavailable` | Assigned Agent | Request access, use substitute method, or mark blocked. |
| Budget exceeded | `BudgetExceeded` | Finance Chief | Reduce scope, reprioritize, or request approval. |
| Assumption challenged | `AssumptionChallenged` | Affected Chief | Route to cross-chief review. |
| POC too expensive | `BudgetExceeded` or `DecisionRequired` | Finance Chief | Ask for budget, design cheaper proof, or waive explicitly. |
| POC failed | `EvidenceFailed` | POC Reviewer | Reject assumption, revise branch, or recommend no-go. |
| POC inconclusive | `EvidenceInconclusive` | Feasibility Lead | Tighten hypothesis or rerun only if decision value justifies cost. |
| Plan missing owner | `PlanIncoherent` | Integrator | Return task to owning chief. |
| Circular dependency | `PlanIncoherent` | Integrator | Repair DAG before approval. |
| User does not answer | `UserUnresponsive` | Chief of Staff | Pause, or use a pre-approved default if policy allows it. |

---

## 13. POC And Evidence Model

POCs are used when an assumption is both important and uncertain.

POC planning should define:

- assumption being tested
- owner
- reviewer
- method
- data needed
- tool access needed
- budget
- timebox
- pass criteria
- fail criteria
- expected artifact
- confidence update rule

Evidence should be compared against the decision it supports. A POC does not need to prove everything. It needs to answer the smallest question that blocks a practical plan.

For example, for the live social app, the AI/Video Chief should not immediately choose or exclude 3D reconstruction. It should create a POC comparing in-app 2D recap, 2.5D composition, and 3D reconstruction using the same small set of source clips. The selection should be based on quality, latency, compute cost, and feasibility inside the app experience.

---

## 14. Implementation Architecture

### 14.1 Core Services

The implementation can be built from these services:

| Service | Responsibility |
|---|---|
| Planning Session Service | Creates sessions, stores current state, links artifacts and plan versions. |
| Event Log Service | Appends all planning events and supports replay/debugging. |
| Agent Registry | Stores agent profiles, hierarchy, skills, permissions, and availability. |
| Skill Registry | Defines skills, schemas, tools, permissions, and evaluation requirements. |
| Knowledge Service | Provides shared knowledge retrieval with citations and freshness metadata. |
| Artifact Store | Stores briefs, domain plans, assumptions, POCs, conflicts, decisions, and plan versions. |
| Transition Service | Applies state transitions and invokes the next responsible actor. |
| Validation Service | Checks owners, dependencies, conflicts, evidence gates, and approval gates. |
| Approval Service | Presents questions, assumptions, budgets, and final plans to the original user. |
| POC Execution Service | Runs or coordinates proof tasks and evidence review. |

The services are implementation infrastructure, not planning actors. The named actors remain Chief of Staff, Strategy Chief, domain chiefs, specialists, Integrator, Feasibility Lead, and the original user.

### 14.2 Minimal Database Tables

```sql
planning_session(
  id,
  raw_user_goal,
  status,
  current_state,
  clarified_brief_id,
  active_plan_version_id,
  created_at,
  updated_at
)

agent_profile(
  id,
  actor_type,
  role,
  parent_agent_id,
  skills,
  permissions,
  compute_budget,
  availability,
  review_authority
)

planning_event(
  id,
  session_id,
  type,
  actor_id,
  actor_role,
  target_id,
  payload,
  occurred_at,
  handled_at
)

artifact(
  id,
  session_id,
  task_id,
  author_agent_id,
  type,
  content,
  citations,
  confidence,
  review_status,
  created_at
)

task_node(
  id,
  session_id,
  parent_id,
  owner_agent_id,
  objective,
  status,
  inputs,
  expected_artifact_type,
  acceptance_criteria,
  dependencies,
  budget,
  failure_policy
)

assumption(
  id,
  session_id,
  owner_chief_id,
  source_ambiguity_id,
  claim,
  alternatives,
  scope,
  impact,
  confidence,
  reversible,
  needs_user_approval,
  needs_poc,
  evidence_ids,
  status
)

conflict_record(
  id,
  session_id,
  raised_by_agent_id,
  affected_owner_ids,
  affected_task_ids,
  contradiction,
  evidence_ids,
  options,
  decision_authority,
  status,
  resolution
)

poc(
  id,
  session_id,
  assumption_id,
  owner_agent_id,
  reviewer_agent_id,
  method,
  inputs,
  budget,
  pass_criteria,
  fail_criteria,
  result,
  evidence_ids,
  confidence_change
)

decision(
  id,
  session_id,
  requested_by_agent_id,
  authority,
  options,
  recommendation,
  selected_option,
  rationale,
  decided_at
)

plan_version(
  id,
  session_id,
  version,
  root_task_id,
  task_tree_snapshot,
  assumptions_snapshot,
  conflicts_snapshot,
  pocs_snapshot,
  risks,
  budget_summary,
  confidence_summary,
  approval_status,
  created_at
)
```

---

## 15. Pseudo-Implementation

```ts
async function createPlan(rawUserGoal: string) {
  const session = await PlanningSessionService.create(rawUserGoal);

  const rawBrief = await ChiefOfStaff.createRawBrief({
    session,
    rawUserGoal,
  });

  const disambiguation = await ChiefOfStaff.disambiguate(rawBrief);

  if (disambiguation.blockingQuestions.length > 0) {
    return ApprovalService.askUser({
      sessionId: session.id,
      questions: disambiguation.blockingQuestions,
      reason: "The answer changes strategy, budget, risk, or success metric.",
    });
  }

  const clarifiedBrief = await ChiefOfStaff.createClarifiedBrief(disambiguation);

  const routing = await StrategyChief.route({
    session,
    clarifiedBrief,
  });

  const domainPlans = await parallel(
    routing.chiefs.map((chief) =>
      chief.createDomainPlan({
        session,
        clarifiedBrief,
        mandate: routing.mandates[chief.id],
      })
    )
  );

  const assumptionReview = await StrategyChief.reviewAssumptions({
    session,
    assumptions: domainPlans.flatMap((plan) => plan.assumptions),
  });

  const pocs = await FeasibilityLead.createPOCs({
    session,
    assumptions: assumptionReview.assumptionsNeedingPOC,
  });

  const conflicts = await Integrator.detectConflicts({
    session,
    domainPlans,
    assumptions: assumptionReview.allAssumptions,
  });

  const resolutions = await StrategyChief.resolveOrEscalate({
    session,
    conflicts,
  });

  const pocResults = await FeasibilityLead.executeAndReviewPOCs({
    session,
    pocs,
  });

  const integratedPlan = await Integrator.assemblePlan({
    session,
    domainPlans,
    assumptions: assumptionReview.allAssumptions,
    conflicts,
    resolutions,
    pocResults,
  });

  const validation = await ValidationService.validatePlan(integratedPlan);

  if (!validation.ok) {
    return StrategyChief.routeRepairs({
      session,
      integratedPlan,
      validationErrors: validation.errors,
    });
  }

  return ApprovalService.requestFinalApproval({
    session,
    plan: integratedPlan,
  });
}
```

Inside each chief:

```ts
async function createDomainPlan(input: DomainPlanningInput): Promise<DomainPlan> {
  const draft = await this.planDirectly(input);

  const assumptions = await this.proposeAssumptions(draft);
  const specialistNeeds = await this.identifySpecialistNeeds(draft, assumptions);

  const specialistArtifacts = await parallel(
    specialistNeeds.map((need) => this.invokeSpecialist(need))
  );

  const reviewedArtifacts = await this.reviewSpecialistArtifacts(specialistArtifacts);

  return this.mergeIntoOwnedDomainPlan({
    draft,
    assumptions,
    reviewedArtifacts,
  });
}
```

---

## 16. Plan Validation

Before approval, the system must validate:

- every task has an owner
- every task has an expected artifact
- every task has acceptance criteria
- dependencies form a DAG
- no unresolved material conflicts remain
- no high-impact assumption is hidden
- high-impact low-confidence assumptions have POCs or explicit waivers
- budget-sensitive branches have finance review
- user-facing business choices have user approval
- plan branches have confidence labels
- rejected or failed evidence is not used as support

---

## 17. Example: Live Social App Planning Outputs

The live social app simulation generated these kinds of outputs.

Strict path:

```text
Chief of Staff receives the task.
Chief of Staff detects "100K MRR users" ambiguity.
Chief of Staff asks whether the user means $100k MRR, 100k active users, or 100k paying users.
Strict path pauses before Strategy Chief routing.
```

Provisional path:

```text
Chief of Staff creates a clarified brief with unresolved metric ambiguity.
Strategy Chief routes work to Product, Tech, AI/Video, Growth, Finance, Legal/Risk, and Feasibility.
Chiefs propose assumptions.
AI/Video Chief proposes multiple in-app generation paths rather than excluding 3D reconstruction.
Feasibility Lead creates POCs for demand, event clustering, video generation options, unit economics, and privacy-safe connection.
Integrator blocks final approval until target metric, budget, and risk tolerance are resolved.
```

Important outputs:

- Provisional outcomes by domain.
- Chief-owned assumption register.
- Cross-domain conflicts.
- POC backlog.
- Hierarchical task tree.
- Gaps in the planning system itself.

Gaps exposed:

- Need formal provisional-planning approval.
- Need quantitative growth/revenue estimator.
- Need capability creation rules for AI specialists, skills, tools, data, and compute.
- Need cheap-proof design policy for POCs.
- Need numeric evidence scoring for option comparisons.
- Need explicit conflict resolution authority policy.
- Need DAG/dependency validator.
- Need structured user approval UX.

---

## 18. MVP Build Plan

### Phase 1: Planning Data Model

Build:

- planning sessions
- agents
- events
- artifacts
- assumptions
- tasks
- conflicts
- POCs
- decisions
- plan versions

Success criteria:

- can record a planning session end-to-end
- can replay event history
- can inspect artifacts and owners

### Phase 2: Chief Of Staff And Strategy Chief

Build:

- Chief of Staff disambiguation prompt/runbook
- clarified brief schema
- blocking question flow
- Strategy Chief routing prompt/runbook
- domain chief mandate generation

Success criteria:

- ambiguous tasks produce targeted questions
- clarified tasks route to appropriate chiefs

### Phase 3: Domain Chief Planning

Build:

- domain chief runbooks
- domain plan schema
- assumption proposal schema
- optional specialist task contract
- chief review flow

Success criteria:

- each chief can produce a complete domain plan
- assumptions are explicit and owned
- optional specialist artifacts are reviewed before use

### Phase 4: Cross-Review And Conflict Detection

Build:

- cross-chief review loop
- conflict records
- dependency extraction
- conflict resolution authority rules

Success criteria:

- conflicting budget, scope, risk, and dependency claims are detected
- conflicts are either resolved, escalated, or block approval

### Phase 5: POC Planning And Evidence

Build:

- POC schema
- proof task generation
- evidence artifact schema
- confidence update rubric
- cheap-proof policy

Success criteria:

- high-impact low-confidence assumptions generate proof tasks
- POC results change assumptions and plan branches

### Phase 6: Integrated Plan Assembly

Build:

- task tree assembler
- DAG validator
- owner validator
- acceptance criteria validator
- approval packet generator

Success criteria:

- final plan is hierarchical, executable, owned, dependency-valid, and approval-ready

---

## 19. Open Design Questions

1. How should the system decide when provisional planning is allowed after a blocking ambiguity?
2. What numeric confidence model should replace simple low/medium/high labels?
3. How should agent capability creation work: spawn from templates, compose skills, or fine-tune/runbook specialization?
4. How should user approval be batched so the system does not ask too many questions?
5. Which conflicts can be resolved by policy, and which must always go to the user?
6. How should POC cost be estimated before tools are invoked?
7. How should the system compare radically different technical paths, such as 2D recap vs 3D reconstruction?
8. How should prior decisions and POC evidence be reused across future planning sessions?

---

## 20. Summary

The system is a federated, chief-led planning protocol:

- Chief of Staff receives and disambiguates the task.
- Strategy Chief routes the clarified brief to domain chiefs.
- Domain chiefs produce complete plans and own assumptions.
- Specialists are optional and chief-controlled.
- Cross-chief review detects conflicts and challenges assumptions.
- Feasibility Lead turns uncertain assumptions into POCs.
- Integrator assembles and validates the hierarchical task tree.
- Strategy Chief presents the plan to the original user for approval.

The implementation should be event-driven and artifact-based, with explicit state transitions, typed records, replayable decisions, and validation gates. The goal is not merely to generate a plausible plan, but to produce a practical plan that the same agentic system can execute or validate through evidence.
