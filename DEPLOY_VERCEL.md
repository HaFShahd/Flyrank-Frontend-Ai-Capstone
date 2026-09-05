Deploying to Vercel (Preview) — steps to get a live streaming preview

1) Push your repo to GitHub (if not already):

   git init
   git add .
   git commit -m "Add streaming chat and Vercel API"
   git remote add origin <your-repo-url>
   git push -u origin main

2) Import the repo into Vercel:
- Go to https://vercel.com/new and select your Git provider + repository.
- For "Framework Preset" choose "Other" (this repo uses Vite + static frontend + serverless functions under /api).

3) Environment variables (in Vercel Dashboard > Settings > Environment Variables):
- `ANTHROPIC_API_KEY` — required for Claude streaming (set for Preview and Production environments).
- Optionally `OPENAI_API_KEY` — used by the local Express server as a fallback. Not required when Anthropic is set.

4) Build & Output settings (defaults should work):
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

5) Streaming endpoint route in this project:
- The serverless streaming endpoint is `api/stream-assistant.js` (Vercel will expose it at `https://<your-deployment>.vercel.app/api/stream-assistant`).
- The client calls `/api/stream-assistant` relative to the frontend, so preview should wire automatically.

6) Local testing before deploy:
- Start local Express server (for local dev server-based streaming):

```bash
# in repo root
node server/index.js
npm install
npm run dev
```

- Or test the serverless endpoint locally using Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

7) Verify behavior:
- Open the Vite preview URL or the Vercel deployment preview URL.
- Ask the chat a question; if `ANTHROPIC_API_KEY` is set, responses should stream token-by-token.
- Use the Stop button to abort a stream; the partial assistant message should remain.

Notes
- Vercel serverless functions support streaming response bodies but behavior can vary; if you need a persistent Node process, consider deploying the `server` folder to a small VPS or Render/Heroku.
- If you prefer OpenAI/other providers, set `OPENAI_API_KEY` in the environment and the local `server/index.js` will continue to support OpenAI streaming as a fallback.

If you want, I can prepare a GitHub Actions workflow to automatically run `npm run build` and push a preview, but I cannot run the actual Vercel deployment from this environment — you (or CI) should finish the import and set environment variables in the Vercel dashboard.