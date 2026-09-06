# Foundations Drill — Settings Form (Round 1 vs Round 2)

Goal
Build a small settings form twice: once with a single vague prompt and once with a precise, verified prompt. Show concrete differences, tests, and rules learned.

Round 1 — Vague prompt (one sentence)
"Create a simple settings form with username, email, and timezone and some basic validation." 

What I accepted: a minimal implementation that uses native inputs, an alert on save, and a single ad-hoc validation check. See `src/components/SettingsFormVague.jsx`.

Round 2 — Precise prompt (file refs, constraints, verification)
Prompt summary I used for round two:
"Implement `src/components/SettingsFormPrecise.jsx` using `react-hook-form` for form state and `zod` for schema validation. Add accessible labels, `aria-invalid` on invalid fields, and render error messages with `role=\"alert\"`. Write unit tests in `src/components/SettingsFormPrecise.test.jsx` using Vitest + Testing Library that assert validation errors appear and that valid input calls `onSave`. Make tests runnable with `npm test` and document the test command in WORKFLOW.md." 

Concrete diffs (specifics, not vibes)
- Validation approach: `SettingsFormVague.jsx` performs ad-hoc checks and `alert()`; `SettingsFormPrecise.jsx` uses a typed `zod` schema plus a resolver for deterministic validation. 
- Accessibility: `Vague` had basic labels; `Precise` adds `aria-invalid`, `role="alert"` for error text, and explicit `htmlFor`/`id` pairs. 
- Test coverage: `Vague` has no tests; `Precise` includes `SettingsFormPrecise.test.jsx` verifying validation messages and submission payload. 
- Error handling: `Precise` surfaces per-field messages from schema issues rather than a single blocking alert.

Verification & issues encountered
- I added tests and attempted to run them locally (`npx vitest run --environment jsdom`). During setup I adjusted package versions and added a small local zod-resolver shim to avoid resolver version mismatches. The repository contains the test file; run `npm install` then `npm test` to execute them locally. If you see environment errors, ensure `vitest`'s `environment` is `jsdom` (configured in `package.json`).

One AI mistake I caught
- The model-generated vague form used `alert()` for user feedback and omitted accessible error markup; I replaced that in round two with structured error elements and a validation schema. This demonstrates an AI tendency to produce quick, non-production UX patterns unless prompted otherwise.

Time and effort (approx.)
- Round 1 (vague): 20 minutes — scaffold + accept output + minor fixes. 
- Round 2 (precise): 90–120 minutes — write precise prompt, implement `react-hook-form` + validation, write tests, debug test environment, and push branch.

Implications / Rules
- Prefer the precise workflow: require schema-based validation, tests, and accessibility checks before merging. See updated `CLAUDE.md` for concrete rules.

How to run
1. Install: `npm install`
2. Run dev server: `npm run dev` (open http://localhost:5173)
3. Run tests: `npm test` or `npx vitest run --environment jsdom`
