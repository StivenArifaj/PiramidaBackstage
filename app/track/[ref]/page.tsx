'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BrandStrip } from '@/components/ui/brand-strip'

const M = 'var(--font-mono)'
const D = 'var(--font-display)'
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

// ── Floor directions ──────────────────────────────────────────────────────────
const FLOOR_DIRECTIONS: Record<string, { label: string; directions: string }> = {
  l0:        { label: 'Ground Floor · L0',    directions: 'Enter via the main public entrance on Rruga e Elbasanit. The space is on the ground level — no stairs required.' },
  l3:        { label: 'Level L+3',            directions: 'Enter via the main entrance and take the internal ramps upward. Follow Pyramid signage to Level L+3.' },
  l_minus_1: { label: 'Basement · B1',        directions: 'Access via the main external stairwell and descend to the Basement level. Follow B1 floor markings.' },
  exterior:  { label: 'Exterior / Park',      directions: 'Located in the surrounding Piramida park area. No elevator required — navigate along the exterior paths.' },
  roof:      { label: 'Rooftop',              directions: 'Take the external climbing route on the Pyramid\'s concrete surface, or use internal ramps to reach the rooftop.' },
}

// ── Status pipeline config ────────────────────────────────────────────────────
const STATUS_STEPS = ['requested', 'quoted', 'confirmed'] as const
type KnownStatus = typeof STATUS_STEPS[number]

function stepIndex(status: string): number {
  const i = STATUS_STEPS.indexOf(status as KnownStatus)
  return i === -1 ? 0 : i
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface PublicEvent {
  id: string
  reference_code: string
  title: string
  event_type?: string
  status: string
  start_at: string
  end_at: string
  attendees_count: number
  space: { name: string; floor: string; photo_urls: string[] } | null
}

interface PublicQuote {
  id: string
  total: number
  currency: string
  valid_until?: string
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TrackPage() {
  const { ref } = useParams<{ ref: string }>()

  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [quote, setQuote] = useState<PublicQuote | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/track/${ref}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); return }
        setEvent(data.event)
        setQuote(data.quote)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [ref])

  const handleAcceptQuote = useCallback(async () => {
    if (!quote || accepting || accepted) return
    setAccepting(true)
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, { method: 'PATCH' })
      if (res.ok) {
        setAccepted(true)
        setEvent(prev => prev ? { ...prev, status: 'confirmed' } : prev)
        setQuote(null)
      }
    } finally {
      setAccepting(false)
    }
  }, [quote, accepting, accepted])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.origin + '/invite/' + ref).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [ref])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-concrete-char)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrandStrip />
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.3)' }}>loading booking…</p>
        </motion.div>
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound || !event) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-concrete-char)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '80px 32px' }}>
        <BrandStrip />
        <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#e63946' }}>booking not found</p>
        <p style={{ fontFamily: D, fontSize: '36px', fontWeight: 500, color: 'var(--color-concrete-bone)', margin: 0 }}>Reference <span style={{ color: 'rgba(245,245,240,0.3)' }}>{ref}</span> not found.</p>
        <p style={{ fontFamily: M, fontSize: '12px', color: 'rgba(245,245,240,0.4)', maxWidth: 420, textAlign: 'center', lineHeight: 1.6 }}>Check the reference code in your confirmation email and try again, or contact us at info@piramida.al.</p>
        <Link href="/book" style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-lime-ink)', background: 'var(--color-lime)', padding: '12px 28px' }}>
          make a new booking
        </Link>
      </div>
    )
  }

  const status = event.status
  const activeStep = stepIndex(status)
  const isConfirmed = status === 'confirmed' || accepted
  const isQuoted = status === 'quoted' && !accepted
  const isPending = status === 'requested'
  const floor = event.space?.floor ?? ''
  const directions = FLOOR_DIRECTIONS[floor]

  const startDate = new Date(event.start_at)
  const endDate = new Date(event.end_at)
  const dateStr = startDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = `${startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-concrete-char)', color: 'var(--color-concrete-bone)' }}>
      <BrandStrip />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 32px 120px' }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 8px' }}>
            booking tracker
          </p>
          <h1 style={{ fontFamily: D, fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-bone)', margin: '0 0 6px', lineHeight: 1.05 }}>
            {event.title}
          </h1>
          <p style={{ fontFamily: M, fontSize: '11px', color: 'rgba(245,245,240,0.35)', letterSpacing: '0.06em', margin: 0 }}>
            Ref: <span style={{ color: 'rgba(245,245,240,0.6)' }}>{event.reference_code}</span>
            {event.event_type && <> · {event.event_type}</>}
          </p>
        </motion.div>

        {/* ── Status pipeline ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.4 }}
          style={{ margin: '40px 0', display: 'flex', alignItems: 'center', gap: 0 }}
        >
          {STATUS_STEPS.map((step, i) => {
            const done = i < activeStep
            const active = i === activeStep
            const color = done || active ? 'var(--color-lime)' : 'rgba(245,245,240,0.15)'
            const textColor = done || active ? 'var(--color-lime)' : 'rgba(245,245,240,0.25)'
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 28, height: 28,
                    border: `2px solid ${color}`,
                    background: done ? 'var(--color-lime)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s',
                  }}>
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="var(--color-lime-ink)" strokeWidth="2" />
                      </svg>
                    ) : active ? (
                      <div style={{ width: 8, height: 8, background: 'var(--color-lime)' }} />
                    ) : null}
                  </div>
                  <span style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: textColor, whiteSpace: 'nowrap' }}>
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: done ? 'var(--color-lime)' : 'rgba(245,245,240,0.1)', margin: '0 8px', marginBottom: 18, transition: 'background 0.3s' }} />
                )}
              </div>
            )
          })}
        </motion.div>

        {/* ── Event summary card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.45, ease: EASE }}
          style={{ border: '1px solid rgba(245,245,240,0.1)', padding: '28px', marginBottom: 24 }}
        >
          <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.28)', margin: '0 0 20px' }}>event details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
            {[
              { label: 'date', value: dateStr },
              { label: 'time', value: timeStr },
              { label: 'venue', value: event.space?.name ?? 'To be confirmed' },
              { label: 'floor', value: directions?.label ?? event.space?.floor ?? '—' },
              { label: 'guests', value: `${event.attendees_count} attendees` },
              { label: 'status', value: status },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.28)', margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontFamily: M, fontSize: '12px', color: label === 'status' ? 'var(--color-lime)' : 'var(--color-concrete-bone)', margin: 0, letterSpacing: '0.02em' }}>{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Status-specific panels ── */}

        {/* Pending: under review */}
        {isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{ border: '1px solid rgba(245,245,240,0.08)', padding: '24px', background: 'rgba(245,245,240,0.02)', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#f4a261' }} />
              <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f4a261', margin: 0 }}>request received</p>
            </div>
            <p style={{ fontFamily: M, fontSize: '13px', color: 'rgba(245,245,240,0.55)', margin: 0, lineHeight: 1.65 }}>
              The Piramida Ops Team is reviewing your request. Check back here to see your official quote.
            </p>
          </motion.div>
        )}

        {/* Quoted: show price + accept button */}
        {isQuoted && quote && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ease: EASE }}
            style={{ border: '2px solid var(--color-lime)', padding: '28px', marginBottom: 24 }}>
            <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 8px' }}>
              quote ready
            </p>
            <p style={{ fontFamily: M, fontSize: '12px', color: 'rgba(245,245,240,0.5)', margin: '0 0 20px', lineHeight: 1.65 }}>
              The Piramida Ops Team has approved your request and issued a quote. Click &ldquo;Accept Invoice&rdquo; below to sign the agreement and lock in your reservation.
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontFamily: D, fontSize: '42px', fontWeight: 500, color: 'var(--color-concrete-bone)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
                  €{quote.total.toFixed(2)}
                </p>
                <p style={{ fontFamily: M, fontSize: '9px', color: 'rgba(245,245,240,0.35)', margin: '6px 0 0', letterSpacing: '0.08em' }}>
                  {quote.currency}{quote.valid_until ? ` · valid until ${new Date(quote.valid_until).toLocaleDateString('en-GB')}` : ''}
                </p>
              </div>
              <button
                onClick={handleAcceptQuote}
                disabled={accepting}
                style={{
                  fontFamily: M, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
                  background: accepting ? 'rgba(200,218,43,0.5)' : 'var(--color-lime)',
                  color: 'var(--color-lime-ink)',
                  border: 'none', padding: '14px 32px',
                  cursor: accepting ? 'wait' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {accepting ? 'confirming…' : 'Accept Invoice'}
              </button>
            </div>
            <p style={{ fontFamily: M, fontSize: '10px', color: 'rgba(245,245,240,0.3)', margin: '16px 0 0', lineHeight: 1.6 }}>
              By accepting you confirm all booking details above. Our operations team will be notified immediately.
            </p>
          </motion.div>
        )}

        {/* Confirmed: share + directions */}
        {isConfirmed && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, ease: EASE }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Confirmation badge */}
            <div style={{ border: '1px solid rgba(200,218,43,0.3)', background: 'rgba(200,218,43,0.05)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 32, height: 32, border: '2px solid var(--color-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3 3 6-6" stroke="var(--color-lime)" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 3px' }}>confirmed</p>
                <p style={{ fontFamily: M, fontSize: '11px', color: 'rgba(245,245,240,0.5)', margin: 0 }}>Your event is locked in. See you at the Pyramid.</p>
              </div>
            </div>

            {/* Share event */}
            <div style={{ border: '1px solid rgba(245,245,240,0.1)', padding: '24px' }}>
              <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.28)', margin: '0 0 16px' }}>share event</p>
              <p style={{ fontFamily: M, fontSize: '11px', color: 'rgba(245,245,240,0.45)', margin: '0 0 16px', lineHeight: 1.6 }}>
                Send this link to your attendees so they can see the confirmed event details and venue directions.
              </p>
              <button
                onClick={handleCopyLink}
                style={{
                  fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase',
                  background: copied ? 'var(--color-lime)' : 'transparent',
                  color: copied ? 'var(--color-lime-ink)' : 'var(--color-lime)',
                  border: '1px solid var(--color-lime)',
                  padding: '11px 24px',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {copied ? '✓ link copied' : 'copy invite link'}
              </button>
            </div>

            {/* Venue directions */}
            {directions && (
              <div style={{ border: '1px solid rgba(245,245,240,0.1)', padding: '24px' }}>
                <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.28)', margin: '0 0 10px' }}>venue directions</p>
                <p style={{ fontFamily: M, fontSize: '11px', fontWeight: 600, color: 'var(--color-concrete-bone)', margin: '0 0 8px', letterSpacing: '0.04em' }}>{directions.label}</p>
                <p style={{ fontFamily: M, fontSize: '12px', color: 'rgba(245,245,240,0.5)', margin: 0, lineHeight: 1.7 }}>{directions.directions}</p>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(245,245,240,0.07)' }}>
                  <p style={{ fontFamily: M, fontSize: '9px', color: 'rgba(245,245,240,0.25)', margin: 0, letterSpacing: '0.06em' }}>
                    Pyramid of Tirana · Rruga e Elbasanit · Tirana, Albania
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Footer links ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ marginTop: 48, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/spaces" style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'rgba(245,245,240,0.3)', borderBottom: '1px solid rgba(245,245,240,0.12)', paddingBottom: 2 }}>
            browse spaces
          </Link>
          <Link href="/book" style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'rgba(245,245,240,0.3)', borderBottom: '1px solid rgba(245,245,240,0.12)', paddingBottom: 2 }}>
            new booking
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
