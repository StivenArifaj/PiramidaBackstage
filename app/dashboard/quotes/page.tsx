'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Quote } from '@/types/api'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const M = 'var(--font-mono)'
const D = 'var(--font-display)'

type QuoteEvent = {
  id: string
  title: string
  reference_code: string
  organizer_name: string
  status: string
  start_at: string
}

type QuoteWithEvent = Quote & { event: QuoteEvent | null }

type Filter = 'all' | 'pending' | 'accepted'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtEur(amount: number) {
  return new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(amount)
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid #e8e6dd' }}>
      {[90, 120, 200, 120, 100, 100, 90].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <motion.div
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.07 }}
            style={{ height: 10, width: w * 0.7, background: '#e8e6dd', maxWidth: '100%' }}
          />
        </td>
      ))}
    </tr>
  )
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteWithEvent[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/quotes')
      .then(r => r.json())
      .then(d => {
        setQuotes(d.quotes ?? [])
        setLoading(false)
      })
  }, [])

  async function handleAccept(quoteId: string) {
    setAccepting(quoteId)
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, { method: 'PATCH' })
      if (!res.ok) return
      setQuotes(prev =>
        prev.map(q =>
          q.id === quoteId
            ? { ...q, accepted_at: new Date().toISOString(), event: q.event ? { ...q.event, status: 'confirmed' } : null }
            : q
        )
      )
    } finally {
      setAccepting(null)
    }
  }

  const pending  = quotes.filter(q => !q.accepted_at)
  const accepted = quotes.filter(q => !!q.accepted_at)

  const filtered = filter === 'pending' ? pending : filter === 'accepted' ? accepted : quotes

  const totalRevenue = accepted.reduce((s, q) => s + q.total, 0)
  const pendingRevenue = pending.reduce((s, q) => s + q.total, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f0ede4', display: 'flex', flexDirection: 'column' }}>

      {/* ── Page header ── */}
      <div style={{ background: '#1a1a1a', padding: '28px 36px 0', flexShrink: 0 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Link href="/dashboard" style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#6b6966' }}>dashboard</Link>
          <span style={{ color: '#3a3835', fontSize: 10 }}>/</span>
          <span style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c8da2b' }}>Quotes</span>
        </div>

        {/* Title + stats */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: D, fontSize: '32px', fontWeight: 500, color: '#f5f5f0', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              quote register
            </h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', background: 'rgba(255,255,255,0.07)', color: '#9a9890' }}>
                {quotes.length} total
              </span>
              {pending.length > 0 && (
                <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', background: 'rgba(249,199,79,0.2)', color: '#f9c74f' }}>
                  {pending.length} pending · {fmtEur(pendingRevenue)}
                </span>
              )}
              {accepted.length > 0 && (
                <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', background: '#c8da2b', color: '#3a4400' }}>
                  {accepted.length} accepted · {fmtEur(totalRevenue)}
                </span>
              )}
            </div>
          </div>
          <Link href="/book" style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: '#3a4400', background: '#c8da2b', padding: '9px 20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><line x1="5.5" y1="1" x2="5.5" y2="10" stroke="currentColor" strokeWidth="1.8"/><line x1="1" y1="5.5" x2="10" y2="5.5" stroke="currentColor" strokeWidth="1.8"/></svg>
            new booking
          </Link>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 0, marginLeft: -36, paddingLeft: 36 }}>
          {(['all', 'pending', 'accepted'] as Filter[]).map(f => {
            const active = filter === f
            const count = f === 'all' ? quotes.length : f === 'pending' ? pending.length : accepted.length
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: M, fontSize: '9.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '10px 18px', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: active ? '#f0ede4' : 'transparent',
                  color: active ? '#1a1a1a' : '#6b6966',
                  borderTop: `2px solid ${active ? '#c8da2b' : 'transparent'}`,
                  marginTop: 2,
                  transition: 'all 0.15s',
                }}
              >
                {f === 'pending' && <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: active ? '#f9c74f' : '#3a3835', flexShrink: 0 }} />}
                {f === 'accepted' && <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: active ? '#c8da2b' : '#3a3835', flexShrink: 0 }} />}
                {f === 'all' ? 'all quotes' : f}
                <span style={{ fontFamily: M, fontSize: '9px', padding: '1px 6px', background: active ? '#e8e6dd' : 'rgba(255,255,255,0.08)', color: active ? '#1a1a1a' : '#6b6966' }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ flex: 1, overflowX: 'auto', background: '#fafaf5' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <colgroup>
            <col style={{ width: 108 }} />
            <col style={{ width: 120 }} />
            <col />
            <col style={{ width: 130 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 130 }} />
          </colgroup>

          <thead>
            <tr style={{ background: '#f0ede4', borderBottom: '2px solid #1a1a1a', position: 'sticky', top: 0, zIndex: 5 }}>
              {['status', 'quote id', 'event', 'organizer', 'generated', 'valid until', 'total (eur)'].map(h => (
                <th key={h} style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', textAlign: 'left', padding: '11px 16px', fontWeight: 500, borderRight: '1px solid #e8e6dd' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && [0, 1, 2].map(i => <SkeletonRow key={i} />)}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '72px 0', textAlign: 'center' }}>
                  <p style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c0bdb4', margin: '0 0 6px' }}>
                    No quotes match
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#c0bdb4', margin: 0 }}>
                    Quotes are auto-generated when a booking is submitted
                  </p>
                </td>
              </tr>
            )}

            {filtered.map((q, i) => {
              const isAccepted = !!q.accepted_at
              const isAcceptingThis = accepting === q.id

              return (
                <motion.tr
                  key={q.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: EASE, delay: i * 0.05 }}
                  style={{ borderBottom: '1px solid #e8e6dd', background: isAccepted ? 'rgba(200,218,43,0.04)' : 'transparent' }}
                >
                  {/* Status */}
                  <td style={{ padding: '15px 16px', borderRight: '1px solid #e8e6dd' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: isAccepted ? '#c8da2b' : '#f9c74f', flexShrink: 0 }} />
                      <span style={{ fontFamily: M, fontSize: '9.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: isAccepted ? '#5a6612' : '#7a3a00' }}>
                        {isAccepted ? 'accepted' : 'pending'}
                      </span>
                    </div>
                  </td>

                  {/* Quote ID */}
                  <td style={{ padding: '15px 16px', borderRight: '1px solid #e8e6dd', fontFamily: M, fontSize: '8.5px', color: '#9a9890', letterSpacing: '0.06em' }}>
                    {q.id.slice(0, 12)}…
                  </td>

                  {/* Event */}
                  <td style={{ padding: '13px 16px', borderRight: '1px solid #e8e6dd' }}>
                    {q.event ? (
                      <>
                        <p style={{ fontFamily: D, fontSize: '14px', fontWeight: 500, color: '#1a1a1a', margin: '0 0 3px', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {q.event.title}
                        </p>
                        <p style={{ fontFamily: M, fontSize: '8.5px', color: '#9a9890', margin: 0 }}>
                          {q.event.reference_code} · {fmtDate(q.event.start_at)}
                        </p>
                      </>
                    ) : (
                      <span style={{ fontFamily: M, fontSize: '9px', color: '#c0bdb4' }}>unknown event</span>
                    )}
                  </td>

                  {/* Organizer */}
                  <td style={{ padding: '15px 16px', borderRight: '1px solid #e8e6dd', fontFamily: M, fontSize: '9.5px', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.event?.organizer_name ?? '—'}
                  </td>

                  {/* Generated */}
                  <td style={{ padding: '15px 16px', borderRight: '1px solid #e8e6dd', fontFamily: M, fontSize: '9px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {fmtDate(q.generated_at)}
                  </td>

                  {/* Valid until */}
                  <td style={{ padding: '15px 16px', borderRight: '1px solid #e8e6dd', fontFamily: M, fontSize: '9px', color: q.valid_until && new Date(q.valid_until) < new Date() ? '#e63946' : '#6b7280', whiteSpace: 'nowrap' }}>
                    {q.valid_until ? fmtDate(q.valid_until) : '—'}
                  </td>

                  {/* Total + action */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <p style={{ fontFamily: M, fontSize: '14px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
                          {fmtEur(q.total)}
                        </p>
                        <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: 0 }}>
                          +{fmtEur(q.tax)} VAT
                        </p>
                      </div>
                      {!isAccepted && (
                        <button
                          onClick={() => handleAccept(q.id)}
                          disabled={isAcceptingThis}
                          style={{
                            fontFamily: M, fontSize: '8.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
                            padding: '6px 14px', border: '2px solid #c8da2b',
                            background: isAcceptingThis ? '#f0ede4' : '#c8da2b',
                            color: '#5a6612', cursor: isAcceptingThis ? 'default' : 'pointer',
                            flexShrink: 0, transition: 'all 0.15s',
                          }}
                        >
                          {isAcceptingThis ? '…' : 'accept'}
                        </button>
                      )}
                      {isAccepted && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke="#c8da2b" strokeWidth="1.4" />
                          <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#5a6612" strokeWidth="1.5" />
                        </svg>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '2px solid #1a1a1a', padding: '10px 32px', background: '#fafaf5', display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <span style={{ fontFamily: M, fontSize: '9px', color: '#9a9890', letterSpacing: '0.06em' }}>
          {filtered.length} of {quotes.length} quotes shown
        </span>
        <div style={{ flex: 1 }} />
        {accepted.length > 0 && (
          <span style={{ fontFamily: M, fontSize: '9px', color: '#5a6612', letterSpacing: '0.06em' }}>
            confirmed revenue: {fmtEur(totalRevenue)}
          </span>
        )}
        {pending.length > 0 && (
          <span style={{ fontFamily: M, fontSize: '9px', color: '#7a3a00', letterSpacing: '0.06em' }}>
            pipeline: {fmtEur(pendingRevenue)}
          </span>
        )}
      </div>
    </div>
  )
}
