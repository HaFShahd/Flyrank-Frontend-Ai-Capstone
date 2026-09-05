# Prompts Used

Round 1 (vague):
"Create a simple chatbot UI for farmers with a text input that returns canned subsidy steps."

Round 2 (precise)
"Implement `src/components/ChatUI.tsx`, `src/lib/assistant.ts`, and `data/subsidies.json`. Provide a chat UI with messages, timestamps, and a form to ask subsidy-related questions. Use TypeScript and Vite. The assistant should return step-by-step procedures for subsidies when asked. Add placeholder data for Pakistani subsidies. Include instructions on how to replace the assistant stub with a secure OpenAI-backed server endpoint."

Round 3 (localization & tests):
"Extend `ChatUI` to support English and Urdu locales with a language selector, and update `getAssistantReply` to accept `lang` and return Urdu responses when requested. Add unit tests in `src/__tests__/ChatUI.test.tsx` mocking `getAssistantReply` to verify chat rendering and message flow."
