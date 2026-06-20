'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatbotPanel, type ChatMessage } from './chatbot-panel'
import type { ChatResponse } from '@/types/api'

const REDIRECT_RE = /\[REDIRECT_TO_SPACE:([a-zA-Z0-9-]+)\]/

const M = 'var(--font-mono)'

// Stable session ID for the lifetime of the page
function genSessionId() {
  return `pb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

interface ChatbotCubeProps {
  isAdmin?: boolean
}

export function ChatbotCube({ isAdmin = false }: ChatbotCubeProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const sessionId = useRef(genSessionId())

  // Intercept [REDIRECT_TO_SPACE:CODE] tags from the AI and navigate immediately
  useEffect(() => {
    const last = history[history.length - 1]
    if (!last || last.role !== 'assistant') return
    const match = last.content.match(REDIRECT_RE)
    if (match) {
      router.push('/spaces/' + match[1].toUpperCase())
    }
  }, [history, router])

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
          isAdmin,
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
  }, [input, history, isTyping, isAdmin])

  // Admin panel anchors bottom-right to avoid overlapping the dark sidebar
  const positionStyle = isAdmin
    ? { position: 'fixed' as const, bottom: '32px', right: '32px', zIndex: 200, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end' }
    : { position: 'fixed' as const, bottom: '32px', left: '32px',  zIndex: 50,  display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end' }

  return (
    <div style={positionStyle}>
      {/* Chat panel — visible when open */}
      {open && (
        <div style={{ marginBottom: '10px' }}>
          <ChatbotPanel
            history={history}
            isTyping={isTyping}
            input={input}
            isAdmin={isAdmin}
            onInputChange={setInput}
            onSend={handleSend}
            onClose={() => setOpen(false)}
          />
        </div>
      )}

      {/* Cube toggle button */}
      <button
        aria-label={open ? 'Close AI assistant' : isAdmin ? 'Open Ops Director AI' : 'Open Piramida AI assistant'}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: open
            ? (isAdmin ? '#c8da2b' : 'var(--color-lime)')
            : (isAdmin ? '#1a1a1a' : 'var(--color-concrete-char)'),
          border: open
            ? `2px solid ${isAdmin ? '#5a6612' : 'var(--color-lime-ink)'}`
            : `2px solid ${isAdmin ? '#c8da2b' : 'rgba(245,245,240,0.18)'}`,
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
          <span style={{ fontFamily: M, fontSize: '18px', lineHeight: 1, color: isAdmin ? '#5a6612' : 'var(--color-lime-ink)' }}>×</span>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect x="1"  y="1"  width="8" height="8" stroke={isAdmin ? '#c8da2b' : 'rgba(245,245,240,0.7)'} strokeWidth="1.5"/>
              <rect x="13" y="1"  width="8" height="8" stroke={isAdmin ? '#c8da2b' : 'rgba(245,245,240,0.7)'} strokeWidth="1.5"/>
              <rect x="1"  y="13" width="8" height="8" stroke={isAdmin ? '#c8da2b' : 'rgba(245,245,240,0.7)'} strokeWidth="1.5"/>
              <rect x="13" y="13" width="8" height="8" stroke={isAdmin ? 'rgba(200,218,43,0.5)' : 'rgba(245,245,240,0.4)'} strokeWidth="1.5"/>
            </svg>
            <span style={{ fontFamily: M, fontSize: '6px', letterSpacing: '0.16em', textTransform: 'uppercase', color: isAdmin ? 'rgba(200,218,43,0.7)' : 'rgba(245,245,240,0.4)', lineHeight: 1 }}>
              {isAdmin ? 'ops' : 'ai'}
            </span>
          </>
        )}
      </button>
    </div>
  )
}
