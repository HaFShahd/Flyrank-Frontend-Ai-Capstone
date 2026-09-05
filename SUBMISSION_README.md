Submission README — Agribot (React)

What to submit
- The completed application (this repo).
- Prompts used during development: PROMPTS_USED.md
- Explanation of AI assistance: AI_ASSIST_SUMMARY.md
- Manual improvements and refactors: MANUAL_IMPROVEMENTS.md

How to run locally
1. Install dependencies:

```bash
npm install
```

2. Create a local env file to enable external AI (optional but recommended for richer answers):

```bash
# create .env.local and set keys (do NOT commit)
# Example (PowerShell):
# echo "VITE_OPENAI_API_KEY=sk-..." > .env.local
```

3. Start the dev server:

```bash
npm run dev
```

4. Open the app:

http://localhost:5173/

Files of interest
- `src/components/ChatUI.tsx` — main chat UI with modern layout, loading state, provider badge.
- `src/lib/assistant.ts` — assistant logic; local demo, GROQ/OpenAI optional external calls.
- `src/components/SettingsFormPrecise.jsx` — example settings form (react-hook-form + zod shim).
- `src/styles.css` — UI styles.

Notes on secrets and production
- This repo demonstrates a development flow. Do NOT commit API keys in `.env.local`.
- For production, implement a server-side proxy to keep keys secret. A template server is included in `server/` to help scaffold a proxy.

Deliverable checklist
- [ ] Repo contains source and assets
- [ ] Prompts and summaries included (PROMPTS_USED.md, AI_ASSIST_SUMMARY.md)
- [ ] Instructions to run included (this file)
- [ ] Short explanation of manual fixes included (MANUAL_IMPROVEMENTS.md)

Good luck!
