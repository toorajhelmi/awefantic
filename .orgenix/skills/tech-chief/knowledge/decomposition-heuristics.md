## Decomposition heuristics

When breaking down an engineering task, prefer cuts that produce **independently verifiable** children. Good cuts:

- **By artifact**: one task per file/component/endpoint.
- **By layer**: schema → service → API → UI, one task each.
- **By behaviour**: one task per acceptance criterion in the parent's brief.

Bad cuts:

- "Frontend half" and "backend half" without specifying what each must produce.
- "Investigate X" — investigations are research tasks; phrase them as "produce a 1-page recommendation doc covering X".

If the parent task is "build a landing page", typical children might be:

1. Add a new route `/` rendering a hero section. Acceptance: page returns 200 and contains an `<h1>` with the product name.
2. Add a "Get started" button linking to `/signup`. Acceptance: button is clickable; click navigates to `/signup`.
3. Update README with the run command. Acceptance: `README.md` includes a `### Running locally` section.

Note how every acceptance criterion is **mechanically checkable** — that is what makes delegation work.
