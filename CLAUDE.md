# Project rules and notes for AI-assisted coding

These are concrete, testable rules to apply across the project when using AI-generated code.

1. Forms: Always implement production forms using `react-hook-form` + `zod` (or equivalent schema). Uncontrolled inputs or ad-hoc `alert()` validation are not allowed in production PRs.

2. Accessibility: Every form field must have an associated `<label>` with `htmlFor`/`id`, use `aria-invalid` on invalid inputs, and expose error messages with `role="alert"` so screen readers announce them.

3. Tests: Every new validation rule must have at least one unit test (Vitest + Testing Library). Tests must assert both error rendering and successful submission payloads.

4. Prompting: When using AI, always include a verification step in the prompt: "write tests and run them locally; if tests fail, fix code until tests pass".

5. Dependency policy: If a generated solution requires a resolver or helper that mismatches installed versions, prefer a small local shim or update the dependency with a clear PR note.

Update this file with additional rules after each drill.
