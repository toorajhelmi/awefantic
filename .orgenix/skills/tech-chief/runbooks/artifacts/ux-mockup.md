# Runbook: UX Mockup

## Purpose

Define the visible behavior of a feature before any UI code is written, so coding agents implement to a fixed target and the Review Agent can compare output to intent.

## When to use

Any task that changes or adds a UI surface, at L2 and above.

## Location

- HTML/React previews under `docs/design/<feature-slug>/` for click-throughs.
- Exported screenshots under `docs/design/<feature-slug>/screens/`.
- A short `README.md` in the feature folder summarizing the mockup set.

## Required fields (all levels at or above L2)

| Field | Notes |
|---|---|
| `feature` | What feature the mockup belongs to. Link to its product spec. |
| `fidelity` | `wireframe-markdown` / `wireframe` / `mid` / `high`. Drives the level of visual detail. `wireframe-markdown` is valid for pre-P4 planning runs, sim runs, copy-only sweeps, or any case where the project does not yet have a UI app to host a click-through preview. |
| `screens` | List of screens covered. |
| `states_per_screen` | For every screen: empty / loading / populated / error / edge cases. All five must be present unless explicitly N/A and justified. |
| `responsiveness` | Breakpoints covered (e.g., `mobile`, `tablet`, `desktop`). |
| `interactions` | Click-through path between screens, including back/cancel paths. |
| `inputs` | Every form field with type, validation, and constraints. |
| `copy` | All visible strings, including button labels, error messages, and empty-state text. |
| `accessibility` | Required: keyboard navigation order, focus states, contrast bands, labels for screen readers. |

## Conditional fields (required at the listed level or above)

| Level | Field |
|---|---|
| L3+ | Permissions per screen: which user types see what. |
| L3+ | A click-through preview deployed to a URL the Review Agent can visit, **unless** `fidelity` = `wireframe-markdown` (pre-P4, sim mode, or copy-only sweep). In that case the markdown-rendered screens and the explicit interaction map below substitute for the deployed preview; the deployed preview is required once P4 infrastructure is in place. |
| L4+ | Localized copy plan (which strings translate, which do not). |
| L4+ | Loading / error budget: target P95 for loading state; error state for every failure mode from the spec. |
| L5 | Design system reference: which tokens, components, and patterns are reused vs. introduced. |

## Fidelity levels

| Level | Use when | What it looks like |
|---|---|---|
| `wireframe-markdown` | Pre-P4 planning runs, sim runs, copy-only sweeps, projects without a hostable UI app yet. | ASCII / markdown diagrams of each screen state + an explicit interaction map. No live preview. Valid pre-merge state when no UI runtime exists. |
| `wireframe` | L2 quick changes, internal tools. | Grayscale boxes, real copy, click-through works. |
| `mid` | L3 standard features. | Real layout, real type, real copy, indicative color. |
| `high` | L4+ user-visible launches. | Real visuals, all states, responsive, click-through deployed. |

## Anti-patterns

- Showing only the happy path. Empty / loading / error / edge are not optional.
- Drawing the screen without naming every interaction (clicks, hovers, focus, keyboard).
- Approving copy as "TBD". Copy is part of the mockup.
- Skipping accessibility until "after launch".
- Using stock placeholder text instead of real copy.
- High-fidelity visuals for L2 work (over-fidelity is waste).

## Short structure

```
docs/design/profile/
  README.md
  preview/                  (React or static HTML preview)
  screens/
    profile-view-empty.png
    profile-view-loading.png
    profile-view-populated.png
    profile-view-error.png
    profile-edit.png
    profile-edit-error.png
  interactions.md           (click-through + keyboard flow)
  copy.md                   (every visible string)
  a11y.md                   (focus, contrast, labels)
```

---

## Review Agent rubric

- Is every screen represented with all five states (empty / loading / populated / error / edge), or is each omission justified?
- Are all interactions explicit (clicks, hovers, focus, keyboard, back/cancel)?
- Is every input fully specified (type, validation, constraints, error message)?
- Is every visible string present in `copy`?
- Is the accessibility plan concrete (focus order, contrast, labels)?
- Does the click-through preview match the screen list?
- Is the fidelity appropriate for the level (no over- or under-fidelity)?
- At L3+: are permissions per screen specified? Is the preview deployed, or is `fidelity` set to `wireframe-markdown` with a justified reason (pre-P4 / sim / copy-only sweep)?
- At L4+: is there a localization plan and a state-per-failure-mode coverage?
- Does every failure mode from the product spec have a matching error state here?
