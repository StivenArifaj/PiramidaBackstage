'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

const M = 'var(--font-mono)'
const D = 'var(--font-display)'
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

interface EventDetail {
  id: string
  reference_code: string
  title: string
  organizer_name: string
  organizer_email: string
  status: string
  start_at: string
  end_at: string
  attendees_count: number
  event_type?: string
  spaces: { name: string; floor: string }[]
}

const STATUS_COLORS: Record<string, string> = {
  confirmed:   '#c8da2b',
  quoted:      '#378ADD',
  requested:   '#9a9890',
  in_progress: '#f4a261',
  completed:   '#3a5a12',
  cancelled:   '#e63946',
  red_alert:   '#e63946',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}
function formatTime(start: string, end: string) {
  const fmt = (s: string) => new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${fmt(start)} – ${fmt(end)}`
}

export default function EventDetailPage() {
  const { ref }  = useParams<{ ref: string }>()
  const router   = useRouter()

  const [event,     setEvent]     = useState<EventDetail | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)
  const [validating, setValidating] = useState(false)
  const [validated,  setValidated]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/events?ref=${encodeURIComponent(ref)}`)
      .then(r => r.json())
      .then(data => {
        // The events list API returns { events: [...] }
        const match = (data.events ?? []).find((e: EventDetail) => e.reference_code === ref.toUpperCase())
        if (match) setEvent(match)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [ref])

  const handleValidate = useCallback(async () => {
    if (!event) return
    setValidating(true)
    setError(null)
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to validate')
      }
      setValidated(true)
      setEvent(prev => prev ? { ...prev, status: 'in_progress' } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setValidating(false)
    }
  }, [event])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9a9890' }}>loading event…</p>
      </div>
    )
  }

  if (notFound || !event) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#e63946' }}>event not found</p>
        <p style={{ fontFamily: M, fontSize: '12px', color: '#6b7280' }}>Reference <strong>{ref}</strong> not found in the system.</p>
        <button onClick={() => router.back()} style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', background: '#1a1a1a', color: '#c8da2b', border: 'none', padding: '10px 20px', cursor: 'pointer' }}>
          ← go back
        </button>
      </div>
    )
  }

  const spaceName = event.spaces.map(s => s.name).join(', ') || 'TBC'
  const alreadyIn = event.status === 'in_progress' || event.status === 'completed'

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>event check-in</h1>

      {/* Top bar */}
      <div style={{ height: 54, borderBottom: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fafaf5', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard/scanner" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890' }}>← scanner</Link>
          <span style={{ display: 'block', width: 1, height: 18, background: '#e8e6dd' }} />
          <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>entry check-in</span>
        </div>
        <span style={{
          fontFamily: M, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: STATUS_COLORS[event.status] ?? '#9a9890',
          border: `1px solid ${STATUS_COLORS[event.status] ?? '#9a9890'}`,
          padding: '3px 10px',
        }}>
          {event.status.replace('_', ' ')}
        </span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 32px 80px', width: '100%' }}>

        {/* Reference */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
          <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 6px' }}>
            scanned ticket · {event.reference_code}
          </p>
          <h2 style={{ fontFamily: D, fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 500, color: '#1a1a1a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {event.title}
          </h2>
          {event.event_type && (
            <p style={{ fontFamily: M, fontSize: '9px', color: '#9a9890', margin: 0, letterSpacing: '0.06em' }}>{event.event_type}</p>
          )}
        </motion.div>

        {/* Detail card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
          style={{ border: '1.5px solid #e8e6dd', background: '#fafaf5', padding: '28px', marginTop: 28, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
            {[
              { label: 'Organizer',      value: event.organizer_name },
              { label: 'Contact',        value: event.organizer_email || '—' },
              { label: 'Space',          value: spaceName },
              { label: 'Date',           value: formatDate(event.start_at) },
              { label: 'Time',           value: formatTime(event.start_at, event.end_at) },
              { label: 'Attendees',      value: `${event.attendees_count} people` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontFamily: M, fontSize: '12px', color: '#1a1a1a', margin: 0, fontWeight: label === 'Organizer' ? 600 : 400 }}>{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Validate entry button */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4, ease: EASE }}>
          {validated || alreadyIn ? (
            <div style={{ border: '2px solid #3a5a12', background: '#e8f4d8', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12" stroke="#3a5a12" strokeWidth="2"/>
                <path d="M8 14l4 4 8-8" stroke="#3a5a12" strokeWidth="2.5"/>
              </svg>
              <div>
                <p style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3a5a12', margin: '0 0 3px' }}>entry validated</p>
                <p style={{ fontFamily: M, fontSize: '12px', color: '#3a5a12', margin: 0 }}>
                  {event.organizer_name} has been checked in. Status updated to <strong>in progress</strong>.
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleValidate}
              disabled={validating || event.status === 'cancelled'}
              style={{
                width: '100%',
                fontFamily: M, fontSize: '13px', textTransform: 'uppercase',
                background: event.status === 'cancelled' ? '#e8e6dd' : (validating ? '#3a5a12' : '#1a8a2e'),
                color: event.status === 'cancelled' ? '#9a9890' : '#fff',
                border: 'none',
                padding: '22px 32px',
                cursor: event.status === 'cancelled' || validating ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                letterSpacing: '0.16em',
              }}
            >
              {validating ? 'validating…' : event.status === 'cancelled' ? 'booking cancelled' : '✓ validate entry'}
            </button>
          )}

          {error && (
            <p style={{ fontFamily: M, fontSize: '9px', color: '#e63946', background: '#ffeaea', border: '1px solid #e63946', padding: '10px 14px', margin: '12px 0 0', letterSpacing: '0.06em' }}>
              {error}
            </p>
          )}
        </motion.div>

        {/* Quick nav */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <Link href={`/track/${ref}`} style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890', border: '1px solid #e8e6dd', padding: '8px 14px' }}>
            client view
          </Link>
          <Link href="/dashboard/events" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890', border: '1px solid #e8e6dd', padding: '8px 14px' }}>
            all events
          </Link>
          <Link href="/dashboard/scanner" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890', border: '1px solid #e8e6dd', padding: '8px 14px' }}>
            scan another
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
