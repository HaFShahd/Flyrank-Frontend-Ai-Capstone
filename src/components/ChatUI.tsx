import React, { useState } from 'react'
import { getAssistantReply } from '../lib/assistant'
import subsidies from '../../data/subsidies.json'

type Message = { id: string; from: 'user' | 'bot'; text: string; time: string }

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), from: 'user', text: input, time: new Date().toLocaleTimeString() }
    setMessages((m) => [...m, userMsg])
    setInput('')

    // assistant returns step-by-step guidance or canned answers
    const reply = await getAssistantReply(input, { subsidies })
    const botMsg: Message = { id: Date.now().toString() + '-b', from: 'bot', text: reply, time: new Date().toLocaleTimeString() }
    setMessages((m) => [...m, botMsg])
  }

  return (
    <div>
      <div aria-live="polite" style={{ border: '1px solid #ddd', padding: 12, minHeight: 200 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ textAlign: m.from === 'user' ? 'right' : 'left', margin: '8px 0' }}>
            <div><strong>{m.from === 'user' ? 'You' : 'AgriBot'}</strong> <small>{m.time}</small></div>
            <div>{m.text}</div>
          </div>
        ))}
      </div>

      <form onSubmit={send} style={{ marginTop: 8 }}>
        <label htmlFor="question">Ask about subsidies or steps to apply</label>
        <input id="question" value={input} onChange={(e) => setInput(e.target.value)} style={{ width: '100%', padding: 8 }} />
        <button type="submit" style={{ marginTop: 8 }}>Send</button>
      </form>
    </div>
  )
}
