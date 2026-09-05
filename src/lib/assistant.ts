import type { } from 'react'


type Subsidy = { id: string; name: string; summary: string; steps: string[] }

export async function getAssistantReply(
  question: string,
  ctx: { subsidies: Record<string, Subsidy[]>; lang?: string }
): Promise<{ text: string; provider?: string }> {
  const q = question.toLowerCase()
  const lang = ctx.lang || 'en'
  // simple keyword matching for demo
  for (const s of ctx.subsidies as any) {
    if (q.includes(s.id) || q.includes(s.name?.toLowerCase())) {
      const base = `Procedure for ${s.name}:\n- ${s.steps.join('\n- ')}`
      if (lang === 'ur') return translateToUrdu(base)
      return { text: base, provider: 'local' }
    }
  }

  // fallback canned responses
  if (q.includes('how') && q.includes('apply')) {
    const eng = 'Tell me which subsidy you want to apply for (e.g., "Punjab Kissan Support").'
    return lang === 'ur' ? translateToUrdu(eng) : eng
  }

  const fallback = "I couldn't fetch expanded guidance right now. Please ask about a specific subsidy or try again."
  // If an OpenAI key is available, prefer OpenAI for richer, policy-aware replies.
  const OPENAI_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined
  if (OPENAI_KEY) {
    try {
      const oa = await queryOpenAI(question, { key: OPENAI_KEY }, ctx)
      if (oa) return { text: oa, provider: 'openai' }
    } catch (err) {
      // ignore and continue to other providers
    }
  }

  // Next try GROQ-style endpoint if present
  const GROQ_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY as string | undefined
  const GROQ_ENDPOINT = (import.meta as any).env?.VITE_GROQ_ENDPOINT as string | undefined
  if (GROQ_KEY) {
    try {
      const ext = await queryExternalAI(question, { key: GROQ_KEY, endpoint: GROQ_ENDPOINT }, ctx)
      if (ext) return { text: ext, provider: 'groq' }
    } catch (err) {
      // ignore and fall back to demo reply
    }
  }

  return { text: lang === 'ur' ? translateToUrdu(fallback) : fallback, provider: 'local' }
}

async function queryExternalAI(question: string, opts: { key: string; endpoint?: string }, ctx?: { subsidies?: any; lang?: string }) {
  const endpoint = opts.endpoint || 'https://api.groq.ai/v1/answers'
  const body: any = { question, lang: ctx?.lang || 'en' }
  if (ctx?.subsidies) body.subsidies = ctx.subsidies

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.key}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error('external AI request failed')
  const data = await res.json()
  // Try common response shapes. Adjust if your provider returns something else.
  if (typeof data.answer === 'string') return data.answer
  if (typeof data.text === 'string') return data.text
  if (Array.isArray(data.answers) && data.answers[0]) return String(data.answers[0])
  return JSON.stringify(data)
}

async function queryOpenAI(question: string, opts: { key: string }, ctx?: { subsidies?: any; lang?: string }) {
  const endpoint = 'https://api.openai.com/v1/chat/completions'
  const system = `You are Agribot, an assistant specialized in Pakistani agricultural subsidies, programs, and government policies. Use the provided subsidies data as authoritative context when relevant. Be concise, factual, and when referencing procedures list clear steps. If information is not available, say you don't have details but suggest next steps (extension office, official portal). Respond in the requested language.`
  const userContent = `Question: ${question}\n\nSubsidies data (JSON): ${JSON.stringify(ctx?.subsidies || {})}`

  const body = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userContent }
    ],
    max_tokens: 800,
    temperature: 0.1,
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.key}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error('OpenAI request failed: ' + txt)
  }

  const data = await res.json()
  const msg = data?.choices?.[0]?.message?.content
  if (typeof msg === 'string') return msg
  return null
}

function translateToUrdu(text: string) {
  // Minimal placeholder translation for demo only.
  return text
    .replace(/Procedure for/g, 'عملی طریقہ کار برائے')
    .replace(/Tell me which subsidy you want to apply for/g, 'بتائیں کس سبسڈی کے لیے آپ درخواست دینا چاہتے ہیں')
    .replace(/I couldn't fetch expanded guidance right now. Please ask about a specific subsidy or try again./g, 'معذرت — معلومات فی الحال دستیاب نہیں۔ براہِ کرم کسی مخصوص سبسڈی کے بارے میں پوچھیں یا دوبارہ کوشش کریں۔')
}
