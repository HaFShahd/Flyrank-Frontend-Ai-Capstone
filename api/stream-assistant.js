// Vercel serverless streaming endpoint — relays Anthropic (Claude) streaming or simulates locally.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { prompt } = req.body || {}
  const GROQ_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || process.env.GROQ_KEY
  const GROQ_ENDPOINT = process.env.VITE_GROQ_ENDPOINT || process.env.GROQ_ENDPOINT || 'https://api.groq.ai/v1/answers'
  const OPENAI_KEY = process.env.OPENAI_API_KEY

  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders && res.flushHeaders()

  const send = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // If GROQ is configured, fetch the answer then stream it token-by-token
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
        await new Promise((r) => setTimeout(r, 40))
      }
      send({ type: 'done' })
      return res.end()
    } catch (err) {
      send({ type: 'error', error: String(err) })
      return res.end()
    }
  }

  // If OpenAI key is present, proxy OpenAI streaming directly
  if (OPENAI_KEY) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'You are a concise assistant.' }, { role: 'user', content: prompt }], stream: true }),
      })

      if (!resp.ok || !resp.body) {
        const txt = await resp.text()
        send({ type: 'error', error: txt })
        return res.end()
      }

      const reader = resp.body.getReader()
      const dec = new TextDecoder('utf-8')
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += dec.decode(value, { stream: true })
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
              send({ type: 'raw', text: payload })
            }
          }
        }
      }

      send({ type: 'done' })
      return res.end()
    } catch (err) {
      send({ type: 'error', error: String(err) })
      return res.end()
    }
  }

  // Fallback demo stream when no keys are configured
  const demo = `Demo: Here are steps you can take:\n1) Check eligibility\n2) Gather docs\n3) Submit application\n4) Follow up.`
  const parts = demo.split(/(\s+)/)
  let idx = 0
  const iv = setInterval(() => {
    if (idx >= parts.length) {
      send({ type: 'done' })
      clearInterval(iv)
      return res.end()
    }
    send({ type: 'token', text: parts[idx++] })
  }, 45)
}
