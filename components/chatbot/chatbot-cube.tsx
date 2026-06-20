'use client'

import { useState, useRef, useCallback } from 'react'
import { ChatbotPanel, type ChatMessage } from './chatbot-panel'
import type { ChatResponse } from '@/types/api'

const M = 'var(--font-mono)'

// Stable session ID for the lifetime of the page
function genSessionId() {
  return `pb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function ChatbotCube() {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const sessionId = useRef(genSessionId())

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const nextHistory = [...history, userMsg]
    setHistory(nextHistory)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId.current,
          message: text,
          history: nextHistory.slice(0, -1),
        }),
      })
      const data: ChatResponse = await res.json()
      setHistory(h => [...h, { role: 'assistant', content: data.reply }])
    } catch {
      setHistory(h => [...h, { role: 'assistant', content: 'Sorry — could not reach the assistant. Please try again.' }])
    } finally {
      setIsTyping(false)
    }
  }, [input, history, isTyping])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {/* Chat panel — visible when open */}
      {open && (
        <div style={{ marginBottom: '10px' }}>
          <ChatbotPanel
            history={history}
            isTyping={isTyping}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onClose={() => setOpen(false)}
          />
        </div>
      )}

      {/* Cube toggle button */}
      <button
        aria-label={open ? 'Close Piramida AI assistant' : 'Open Piramida AI assistant'}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: open ? 'var(--color-lime)' : 'var(--color-concrete-char)',
          border: `2px solid ${open ? 'var(--color-lime-ink)' : 'rgba(245,245,240,0.18)'}`,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          padding: 0,
          transition: 'background-color 0.15s, border-color 0.15s',
        }}
      >
        {open ? (
          <span style={{ fontFamily: M, fontSize: '18px', lineHeight: 1, color: 'var(--color-lime-ink)' }}>×</span>
        ) : (
          <>
            {/* 2×2 grid of squares — Piramida "cube" mark */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="8" height="8" stroke="rgba(245,245,240,0.7)" strokeWidth="1.5"/>
              <rect x="13" y="1" width="8" height="8" stroke="rgba(245,245,240,0.7)" strokeWidth="1.5"/>
              <rect x="1" y="13" width="8" height="8" stroke="rgba(245,245,240,0.7)" strokeWidth="1.5"/>
              <rect x="13" y="13" width="8" height="8" stroke="rgba(245,245,240,0.4)" strokeWidth="1.5"/>
            </svg>
            <span style={{ fontFamily: M, fontSize: '6px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.4)', lineHeight: 1 }}>
              ai
            </span>
          </>
        )}
      </button>
    </div>
  )
}
