'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SpaceWithAvailability } from '@/types/api'

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.04em',
  color: 'var(--color-concrete-char)', backgroundColor: 'var(--color-concrete-bone)',
  border: '2px solid var(--color-concrete-char)', padding: '10px 12px', width: '100%',
  outline: 'none',
}
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'var(--color-concrete-gray)', display: 'block', marginBottom: '6px',
}

type UiState = 'form' | 'conflict'

interface BookingPanelProps {
  space: SpaceWithAvailability
  // YYYY-MM-DD strings for dates that already have active bookings.
  // Used only to warn the user on that specific day — never to lock the whole form.
  bookedDates?: string[]
}

export function BookingPanel({ space, bookedDates = [] }: BookingPanelProps) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('14:00')
  const [attendees, setAttendees] = useState(Math.min(50, space.capacity_pax))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uiState, setUiState] = useState<UiState>('form')
  const [priorityMessage, setPriorityMessage] = useState('')

  const durationHrs = Math.max(1, (new Date(`2000-01-01T${endTime}`).getTime() - new Date(`2000-01-01T${startTime}`).getTime()) / 3600000)
  const estimatedTotal = Math.round(durationHrs * space.hourly_rate_eur * 1.18)

  // True only when this specific selected date has an existing active booking —
  // used for a per-date inline warning, NOT a global form lockout.
  const isDateBooked = date !== '' && bookedDates.includes(date)

  // Maintenance mode is the ONLY reason the entire panel locks.
  const isMaintenanceLocked = space.is_active === false || space.availability === 'blocked'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !name || !email) return
    setSubmitting(true)
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Event at ${space.name}`,
        organizer_name: name,
        organizer_email: email,
        attendees_count: attendees,
        start_at: new Date(`${date}T${startTime}`).toISOString(),
        end_at: new Date(`${date}T${endTime}`).toISOString(),
        preferred_space_codes: [space.code],
      }),
    })
    setSubmitting(false)
    if (res.status === 409) {
      setUiState('conflict')
      return
    }
    if (res.ok) {
      const data = await res.json()
      router.push(`/book/confirmation?ref=${data.event.reference_code}`)
    }
  }

  async function handlePrioritySubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `[PRIORITY] Event at ${space.name}`,
        organizer_name: name,
        organizer_email: email,
        attendees_count: attendees,
        start_at: new Date(`${date}T${startTime}`).toISOString(),
        end_at: new Date(`${date}T${endTime}`).toISOString(),
        preferred_space_codes: [space.code],
        is_priority_request: true,
        notes: priorityMessage,
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/book/confirmation?ref=${data.event.reference_code}`)
    }
  }

  // ── Maintenance / Kill Switch lockout ────────────────────────────────────────
  if (isMaintenanceLocked) {
    return (
      <div style={{ border: '2px solid #f4a261', padding: '32px', backgroundColor: 'var(--color-concrete-bone)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="1" width="16" height="16" stroke="#f4a261" strokeWidth="1.6"/>
            <line x1="5" y1="9" x2="13" y2="9" stroke="#f4a261" strokeWidth="2"/>
          </svg>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f4a261', margin: 0 }}>
            space under maintenance
          </p>
        </div>

        <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--color-concrete-char)', margin: '0 0 12px', lineHeight: 1.3 }}>
          This space is currently unavailable for bookings.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-concrete-gray)', margin: '0 0 24px', lineHeight: 1.7 }}>
          The Ops Team has taken this space offline for scheduled maintenance or preparation. Please check back soon or explore other available spaces.
        </p>

        <div style={{ backgroundColor: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.3)', padding: '14px 16px', marginBottom: '20px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f4a261', margin: '0 0 4px' }}>
            admin notice
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-concrete-gray)', margin: 0 }}>
            Bookings and priority requests are disabled while this space is in maintenance mode.
          </p>
        </div>

        <a
          href="/spaces"
          style={{
            display: 'block', textAlign: 'center',
            fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            backgroundColor: 'var(--color-concrete-char)',
            color: 'var(--color-lime)',
            padding: '14px', textDecoration: 'none',
          }}
        >
          explore other spaces →
        </a>
      </div>
    )
  }

  // ── Conflict / Red Code view (triggered by a 409 from the API) ───────────────
  if (uiState === 'conflict') {
    return (
      <form
        onSubmit={handlePrioritySubmit}
        style={{ border: '2px solid #e63946', padding: '32px', backgroundColor: 'var(--color-concrete-bone)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <polygon points="8,1 15.5,14.5 0.5,14.5" stroke="#e63946" strokeWidth="1.6" fill="none"/>
            <line x1="8" y1="6" x2="8" y2="10" stroke="#e63946" strokeWidth="1.6"/>
            <circle cx="8" cy="12.5" r="0.8" fill="#e63946"/>
          </svg>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e63946', margin: 0 }}>
            conflict detected
          </p>
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-concrete-char)', margin: '0 0 8px', lineHeight: 1.6 }}>
          This space is booked for this time.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-concrete-gray)', margin: '0 0 24px', lineHeight: 1.6 }}>
          Would you like to send a priority request to the Ops Team?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>your message to the ops team</label>
            <textarea
              required
              rows={4}
              value={priorityMessage}
              onChange={e => setPriorityMessage(e.target.value)}
              placeholder="Explain why this slot is critical for your event…"
              style={{ ...inputStyle, resize: 'vertical', height: 'auto' }}
            />
          </div>

          <div style={{ backgroundColor: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.3)', padding: '12px 16px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e63946', margin: '0 0 4px' }}>
              priority request — red alert
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-concrete-gray)', margin: 0 }}>
              The Ops Team will review your request and contact you within 2 hours.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || !priorityMessage.trim()}
            style={{
              fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              backgroundColor: priorityMessage.trim() ? '#e63946' : 'var(--color-concrete-mid)',
              color: '#fff',
              border: 'none', padding: '16px', cursor: priorityMessage.trim() ? 'pointer' : 'not-allowed',
              width: '100%',
            }}
          >
            {submitting ? 'sending request...' : 'send priority request'}
          </button>

          <button
            type="button"
            onClick={() => setUiState('form')}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em',
              textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--color-concrete-mid)',
              color: 'var(--color-concrete-gray)', padding: '10px', cursor: 'pointer', width: '100%',
            }}
          >
            ← choose a different time
          </button>
        </div>
      </form>
    )
  }

  // ── Standard booking form — always active unless maintenance ─────────────────
  return (
    <form onSubmit={handleSubmit} style={{ border: '2px solid var(--color-concrete-char)', padding: '32px', backgroundColor: 'var(--color-concrete-bone)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 20px' }}>
        request this space
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>date</label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              ...inputStyle,
              // Subtle highlight when the chosen date has an existing booking
              borderColor: isDateBooked ? '#f4a261' : 'var(--color-concrete-char)',
            }}
          />
          {/* Per-date warning — does NOT lock the form, the user can still submit.
              If the exact time slot is taken the backend returns 409 → Red Code UI. */}
          {isDateBooked && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#f4a261', margin: '6px 0 0', letterSpacing: '0.06em' }}>
              this date has existing bookings — your request may trigger a priority review
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div><label style={labelStyle}>from</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>until</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} /></div>
        </div>

        <div>
          <label style={labelStyle}>attendees (max {space.capacity_pax})</label>
          <input type="number" min={1} max={space.capacity_pax} value={attendees} onChange={e => setAttendees(parseInt(e.target.value))} style={inputStyle} />
        </div>

        <div style={{ borderTop: '1px solid var(--color-concrete-mid)', paddingTop: '16px' }}>
          <label style={labelStyle}>your name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
        </div>

        <div style={{ backgroundColor: 'var(--color-concrete-char)', padding: '16px', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.5)', margin: 0 }}>estimated total (incl. 18% vat)</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 500, color: 'var(--color-lime)', margin: 0 }}>€{estimatedTotal}</p>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(245,245,240,0.3)', margin: '4px 0 0' }}>
            {durationHrs}h × €{space.hourly_rate_eur}/hr + VAT
          </p>
        </div>

        <button
          type="submit"
          data-brutal
          disabled={submitting}
          style={{
            fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            backgroundColor: 'var(--color-lime)',
            color: 'var(--color-lime-ink)',
            border: 'none', padding: '16px', cursor: 'pointer',
            width: '100%',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'sending request...' : 'request booking'}
        </button>
      </div>
    </form>
  )
}
