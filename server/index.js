// Example server to forward assistant requests to OpenAI securely.
// Do NOT store API keys in client-side code. This is a minimal Express example.

const express = require('express')
const fetch = require('node-fetch')
const app = express()
app.use(express.json())

app.post('/api/assistant', async (req, res) => {
  const { prompt } = req.body
  const key = process.env.OPENAI_API_KEY
  if (!key) return res.status(500).json({ error: 'OPENAI_API_KEY not set in server env' })

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await response.json()
    return res.json({ reply: data.choices?.[0]?.message?.content || '' })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

app.listen(3000, () => console.log('Assistant proxy running on http://localhost:3000'))
