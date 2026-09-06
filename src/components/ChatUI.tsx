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
  const streamController = useRef<AbortController | null>(null)
  const atBottomRef = useRef(true)
  const [showJump, setShowJump] = useState(false)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    if (atBottomRef.current) {
      el.scrollTop = el.scrollHeight
      setShowJump(false)
    } else {
      setShowJump(true)
    }
  }, [messages])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
      atBottomRef.current = atBottom
      if (atBottom) setShowJump(false)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), from: 'user', text: input, time: new Date().toLocaleTimeString() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    
    setLoading(true)
    setProvider('local')

    // create an empty bot message which we'll append tokens to
    const botId = Date.now().toString() + '-b'
    const botMsg: Message = { id: botId, from: 'bot', text: '', time: new Date().toLocaleTimeString() }
    setMessages((m) => [...m, botMsg])

    // start streaming from server
    const ctrl = new AbortController()
    streamController.current = ctrl
    try {
      const res = await fetch('/api/stream-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, lang }),
        signal: ctrl.signal,
      })

      if (!res.ok || !res.body) throw new Error('stream request failed')

      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let partial = ''
      let firstToken = false
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value, { stream: true })
        // server sends lines like: data: {...}\n\n
        const lines = chunk.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          if (!trimmed.startsWith('data:')) continue
          const payload = trimmed.replace(/^data:\s*/, '')
          try {
            const obj = JSON.parse(payload)
            if (obj.type === 'token' && obj.text) {
              if (!firstToken) {
                firstToken = true
              }
              partial += obj.text
              // update the bot message text
              setMessages((msgs) => msgs.map((m) => (m.id === botId ? { ...m, text: partial } : m)))
            } else if (obj.type === 'done') {
              // finalize
            } else if (obj.type === 'error') {
              setMessages((msgs) => msgs.map((m) => (m.id === botId ? { ...m, text: 'Error: ' + (obj.error || 'unknown') } : m)))
            }
          } catch (err) {
            // ignore parse errors
          }
        }
      }
    } catch (err) {
      if ((err as any).name === 'AbortError') {
        // keep partial message
      } else {
        setMessages((m) => [...m, { id: Date.now().toString() + '-b2', from: 'bot', text: 'Sorry — failed to fetch an answer.', time: new Date().toLocaleTimeString() }])
      }
    } finally {
      setLoading(false)
      streamController.current = null
    }
  }

  const stopStreaming = () => {
    if (streamController.current) streamController.current.abort()
  }

  const jumpToLatest = () => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    atBottomRef.current = true
    setShowJump(false)
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
        {loading ? (
          <button type="button" onClick={stopStreaming} className="send">Stop</button>
        ) : (
          <button type="submit" className="send">{t.send}</button>
        )}
      </form>
      {showJump && <div style={{ position: 'absolute', right: 16, bottom: 84 }}><button onClick={jumpToLatest}>Jump to latest</button></div>}
      <div style={{ padding: 8, fontSize: 12, color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>AI source: <strong style={{ textTransform: 'capitalize' }}>{provider}</strong></div>
        {loading ? <div>Loading…</div> : <div />}
      </div>
    </div>
  )
}
