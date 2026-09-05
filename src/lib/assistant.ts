import type { } from 'react'

// Assistant helper: returns canned responses or, if configured, uses OpenAI.
// NOTE: Do not embed API keys in client code. Replace this with a server endpoint in production.

type Subsidy = { id: string; name: string; summary: string; steps: string[] }

export async function getAssistantReply(question: string, ctx: { subsidies: Record<string, Subsidy[]> }): Promise<string> {
  const q = question.toLowerCase()
  // simple keyword matching for demo
  for (const s of ctx.subsidies as any) {
    if (q.includes(s.id) || q.includes(s.name?.toLowerCase())) {
      return `Procedure for ${s.name}:\n- ${s.steps.join('\n- ')}`
    }
  }

  // fallback canned responses
  if (q.includes('how') && q.includes('apply')) {
    return 'Tell me which subsidy you want to apply for (e.g., "Punjab Kissan Support").'
  }

  return "I'm sorry — I don't have that info in the demo. Try asking: 'How do I apply for Punjab Kissan Support?'"
}
