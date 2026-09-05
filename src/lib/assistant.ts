import type { } from 'react'

// Assistant helper: returns canned responses or, if configured, uses OpenAI.
// NOTE: Do not embed API keys in client code. Replace this with a server endpoint in production.

type Subsidy = { id: string; name: string; summary: string; steps: string[] }

export async function getAssistantReply(
  question: string,
  ctx: { subsidies: Record<string, Subsidy[]>; lang?: string }
): Promise<string> {
  const q = question.toLowerCase()
  const lang = ctx.lang || 'en'
  // simple keyword matching for demo
  for (const s of ctx.subsidies as any) {
    if (q.includes(s.id) || q.includes(s.name?.toLowerCase())) {
      const base = `Procedure for ${s.name}:\n- ${s.steps.join('\n- ')}`
      if (lang === 'ur') return translateToUrdu(base)
      return base
    }
  }

  // fallback canned responses
  if (q.includes('how') && q.includes('apply')) {
    const eng = 'Tell me which subsidy you want to apply for (e.g., "Punjab Kissan Support").'
    return lang === 'ur' ? translateToUrdu(eng) : eng
  }

  const fallback = "I'm sorry — I don't have that info in the demo. Try asking: 'How do I apply for Punjab Kissan Support?'"
  return lang === 'ur' ? translateToUrdu(fallback) : fallback
}

function translateToUrdu(text: string) {
  // Minimal placeholder translation for demo only.
  // For production, integrate a proper localization pipeline.
  return text
    .replace(/Procedure for/g, 'عملی طریقہ کار برائے')
    .replace(/Tell me which subsidy you want to apply for/g, 'بتائیں کس سبسڈی کے لیے آپ درخواست دینا چاہتے ہیں')
    .replace(/I'm sorry — I don't have that info in the demo. Try asking:/g, 'معذرت — اس ڈیمو میں معلومات موجود نہیں۔ براہِ کرم پوچھیں:')
}
