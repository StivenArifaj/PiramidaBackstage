'use client'

import { useEffect, useRef } from 'react'

const M = 'var(--font-mono)'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatbotPanelProps {
  history: ChatMessage[]
  isTyping: boolean
  input: string
  isAdmin?: boolean
  onInputChange: (v: string) => void
  onSend: () => void
  onClose: () => void
}

export function ChatbotPanel({ history, isTyping, input, isAdmin = false, onInputChange, onSend, onClose }: ChatbotPanelProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [history, isTyping])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div
      style={{
        width: '380px',
        maxHeight: '520px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-concrete-char)',
        border: '2px solid rgba(245,245,240,0.14)',
        borderBottom: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(245,245,240,0.08)',
          flexShrink: 0,
        }}
      >
        <div>
          <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: 0 }}>
            {isAdmin ? 'ops director' : 'piramida ai'}
          </p>
          <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', color: 'rgba(245,245,240,0.28)', margin: '3px 0 0' }}>
            {isAdmin ? 'metrics · quotes · conflicts · bookings' : 'book spaces · generate quotes · check conflicts'}
          </p>
        </div>
        <button
          aria-label="Close chat"
          onClick={onClose}
          style={{
            fontFamily: M,
            fontSize: '14px',
            color: 'rgba(245,245,240,0.35)',
            background: 'none',
            border: '1px solid rgba(245,245,240,0.1)',
            padding: '4px 10px',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Message list */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          minHeight: '200px',
          maxHeight: '360px',
        }}
      >
        {history.length === 0 && !isTyping && (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '24px 0' }}>
            <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.18)', margin: 0 }}>
              {isAdmin
                ? <>ask for metrics, pending quotes,<br />conflicts, or create a booking.</>
                : <>ask me to book a space,<br />generate a quote, or check availability.</>
              }
            </p>
          </div>
        )}

        {history.map((msg, i) => {
          const isUser = msg.role === 'user'
          const displayContent = msg.content.replace(/\[REDIRECT_TO_SPACE:[a-zA-Z0-9-]+\]/g, '').trim()
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              <p style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.22)', margin: '0 0 4px' }}>
                {isUser ? 'you' : (isAdmin ? 'ops director' : 'piramida ai')}
              </p>
              <div
                style={{
                  maxWidth: '82%',
                  padding: '9px 13px',
                  backgroundColor: isUser ? 'var(--color-lime)' : 'rgba(245,245,240,0.06)',
                  border: isUser ? '1px solid var(--color-lime-ink)' : '1px solid rgba(245,245,240,0.08)',
                }}
              >
                <p
                  style={{
                    fontFamily: M,
                    fontSize: '11px',
                    lineHeight: 1.6,
                    color: isUser ? 'var(--color-lime-ink)' : 'rgba(245,245,240,0.75)',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {displayContent}
                </p>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <p style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.22)', margin: '0 0 4px' }}>
              piramida ai
            </p>
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(245,245,240,0.06)',
                border: '1px solid rgba(245,245,240,0.08)',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map(j => (
                <span
                  key={j}
                  style={{
                    width: '5px',
                    height: '5px',
                    backgroundColor: 'rgba(245,245,240,0.4)',
                    display: 'inline-block',
                    animation: `pb-blink 1.2s ease-in-out ${j * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input row */}
      <div
        style={{
          borderTop: '1px solid rgba(245,245,240,0.08)',
          padding: '10px',
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <textarea
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          style={{
            flex: 1,
            fontFamily: M,
            fontSize: '11px',
            letterSpacing: '0.02em',
            color: 'var(--color-concrete-bone)',
            backgroundColor: 'rgba(245,245,240,0.05)',
            border: '1px solid rgba(245,245,240,0.1)',
            padding: '9px 12px',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={onSend}
          disabled={!input.trim()}
          style={{
            fontFamily: M,
            fontSize: '10px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            backgroundColor: input.trim() ? 'var(--color-lime)' : 'rgba(245,245,240,0.06)',
            color: input.trim() ? 'var(--color-lime-ink)' : 'rgba(245,245,240,0.2)',
            border: 'none',
            padding: '0 16px',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            alignSelf: 'stretch',
          }}
        >
          send
        </button>
      </div>

      <style>{`
        @keyframes pb-blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
