Security notes — local env setup

To enable the agribot to query an external AI (Groq or similar), set the API key in a local environment file. Do NOT commit secrets to source control.

1. Create a local env file (Vite uses `.env.local` or `.env`):

```bash
# create a local env file (do this on your machine)
echo "VITE_GROQ_API_KEY=your_key_here
# optionally set a custom endpoint
# echo "VITE_GROQ_ENDPOINT=https://api.groq.ai/v1/answers" >> .env.local
```

2. Make sure `.env.local` is ignored by git. If you don't have a `.gitignore` entry, add one:

```
.env.local
```

3. Restart the dev server after changing `.env.local`.

Notes:
- For production, store the key in your deployment environment and do not commit it to source control.
- The code will fall back to the built-in demo responses if the key is missing or the external call fails.
