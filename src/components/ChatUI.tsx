import React, { useEffect, useRef, useState } from 'react'
import { getAssistantReply } from '../lib/assistant'
import subsidies from '../../data/subsidies.json'
import i18n from '../i18n'

type Message = { id: string; from: 'user' | 'bot'; text: string; time: string }

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [lang, setLang] = useState<'en' | 'ur'>('en')
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState<string>('local')
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), from: 'user', text: input, time: new Date().toLocaleTimeString() }
    setMessages((m) => [...m, userMsg])
    setInput('')

    setLoading(true)
    setProvider('local')
    try {
      const res = await getAssistantReply(input, { subsidies, lang })
      const text = res?.text ?? ''
      if (res?.provider) setProvider(res.provider)
      const botMsg: Message = { id: Date.now().toString() + '-b', from: 'bot', text, time: new Date().toLocaleTimeString() }
      setMessages((m) => [...m, botMsg])
    } catch (err) {
      const botMsg: Message = { id: Date.now().toString() + '-b', from: 'bot', text: 'Sorry — failed to fetch an answer.', time: new Date().toLocaleTimeString() }
      setMessages((m) => [...m, botMsg])
    } finally {
      setLoading(false)
    }
  }

  const t = i18n[lang]

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="chat-title">Farmers Aid — Agribot</div>
        <div className="chat-controls">
          <label htmlFor="lang" className="sr-only">Language</label>
          <select id="lang" value={lang} onChange={(e) => setLang(e.target.value as any)}>
            <option value="en">English</option>
            <option value="ur">اردو</option>
          </select>
        </div>
      </header>

      <div className="messages" ref={listRef} role="log" aria-live="polite">
        {messages.length === 0 && <div className="empty">Ask the agribot about subsidies, crop guidance, or policy.</div>}
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.from === 'user' ? 'user' : 'bot'}`}>
            <div className="bubble">
              <div className="meta"><strong>{m.from === 'user' ? t.you : t.bot}</strong> <span className="time">{m.time}</span></div>
              <div className="text">{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot" aria-hidden>
            <div className="bubble">
              <div className="meta"><strong>{t.bot}</strong> <span className="time">{new Date().toLocaleTimeString()}</span></div>
              <div className="text">Typing…</div>
            </div>
          </div>
        )}
      </div>

      <form className="input-bar" onSubmit={send}>
        <input id="question" aria-label={t.askLabel} placeholder={t.askPlaceholder || 'Type your question...'} value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit" className="send">{t.send}</button>
      </form>
      <div style={{ padding: 8, fontSize: 12, color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>AI source: <strong style={{ textTransform: 'capitalize' }}>{provider}</strong></div>
        {loading ? <div>Loading…</div> : <div />}
      </div>
    </div>
  )
}
