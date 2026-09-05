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

// Streaming assistant endpoint (SSE-style relay)
app.post('/api/stream-assistant', async (req, res) => {
  const { prompt } = req.body || {}
  const OPENAI_KEY = process.env.OPENAI_API_KEY

  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders && res.flushHeaders()

  // Helper to send SSE data
  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // If no key, simulate a streaming reply for local demo
  const GROQ_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || process.env.GROQ_KEY
  const GROQ_ENDPOINT = process.env.VITE_GROQ_ENDPOINT || process.env.GROQ_ENDPOINT || 'https://api.groq.ai/v1/answers'

  // If GROQ key is present, call the GROQ endpoint (non-streaming) then stream the text token-by-token
  if (GROQ_KEY) {
    try {
      const r = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({ question: prompt }),
      })

      if (!r.ok) {
        const txt = await r.text()
        send({ type: 'error', error: `GROQ error: ${txt}` })
        return res.end()
      }

      const data = await r.json()
      let answer = ''
      if (typeof data.answer === 'string') answer = data.answer
      else if (typeof data.text === 'string') answer = data.text
      else if (Array.isArray(data.answers) && data.answers[0]) answer = String(data.answers[0])
      else answer = JSON.stringify(data)

      const parts = answer.split(/(\s+)/)
      for (const p of parts) {
        send({ type: 'token', text: p })
        // small delay to simulate streaming
        await new Promise((res) => setTimeout(res, 35))
      }
      send({ type: 'done' })
      return res.end()
    } catch (err) {
      send({ type: 'error', error: String(err) })
      return res.end()
    }
  }

  if (!OPENAI_KEY) {
    const demo = `Thanks — I can help. Here are quick steps for that request:\n1) Check eligibility\n2) Gather documents\n3) Submit via portal\n4) Follow up with local office.`
    const parts = demo.split(/(\s+)/)
    let idx = 0
    const iv = setInterval(() => {
      if (idx >= parts.length) {
        send({ type: 'done' })
        clearInterval(iv)
        return res.end()
      }
      send({ type: 'token', text: parts[idx++] })
    }, 50)
    return
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are a concise assistant.' }, { role: 'user', content: prompt }],
        stream: true,
      }),
    })

    if (!resp.ok || !resp.body) {
      const txt = await resp.text()
      send({ type: 'error', error: txt })
      return res.end()
    }

    const reader = resp.body.getReader()
    const decoder = new TextDecoder('utf-8')

    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      // OpenAI stream sends lines starting with "data: "
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        if (trimmed === 'data: [DONE]') {
          send({ type: 'done' })
          res.end()
          return
        }
        if (trimmed.startsWith('data:')) {
          const payload = trimmed.replace(/^data:\s*/, '')
          try {
            const parsed = JSON.parse(payload)
            const delta = parsed.choices?.[0]?.delta
            const text = delta?.content || parsed.choices?.[0]?.message?.content || ''
            if (text) send({ type: 'token', text })
          } catch (err) {
            // pass raw payload
            send({ type: 'raw', text: payload })
          }
        }
      }
    }

    send({ type: 'done' })
    res.end()
  } catch (err) {
    send({ type: 'error', error: String(err) })
    res.end()
  }
})

app.listen(3000, () => console.log('Assistant proxy running on http://localhost:3000'))
