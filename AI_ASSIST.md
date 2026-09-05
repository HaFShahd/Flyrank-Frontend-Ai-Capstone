# How AI Assisted

- Scaffolding: used AI to draft component structure (`ChatUI.tsx`) and assistant helper (`assistant.ts`).
- Prompts: iterated from a one-sentence vague prompt to a more precise specification (see `PROMPTS.md`).
- Manual fixes: adjusted TypeScript types, added subsidy JSON examples, and ensured no API keys are embedded in client code.

Manual improvements performed:
- Replaced potential in-client OpenAI usage with a server-side note and a stub function.
- Added accessibility attributes (`aria-live`) and labels for the input.
- Created sample subsidy dataset with clear, step-by-step instructions.
