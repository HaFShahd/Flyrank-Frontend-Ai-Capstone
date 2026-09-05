# How AI Assisted

- Scaffolding: used AI to draft component structure (`ChatUI.tsx`) and assistant helper (`assistant.ts`).
- Prompts: iterated from a one-sentence vague prompt to a more precise specification (see `PROMPTS.md`).
- Manual fixes: adjusted TypeScript types, added subsidy JSON examples, and ensured no API keys are embedded in client code.

Additional AI-assisted steps performed:
- Localization: used AI to propose translation entries and a language selector flow; I reviewed and adjusted translations manually (placeholder translations used for demo).
- Tests: used AI to draft basic unit tests; I added a test harness and mocked the assistant to assert message flow.

Manual improvements performed:
- Replaced potential in-client OpenAI usage with a server-side note and a stub function.
- Added accessibility attributes (`aria-live`) and labels for the input.
- Created sample subsidy dataset with clear, step-by-step instructions.

Notes on manual refactoring:
- Consolidated UI strings into `src/i18n.ts` and passed `lang` to the assistant helper.
- Converted project to TypeScript and adjusted component typings.
