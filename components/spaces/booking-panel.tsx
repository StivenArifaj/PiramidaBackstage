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

export function BookingPanel({ space }: { space: SpaceWithAvailability }) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('14:00')
  const [attendees, setAttendees] = useState(Math.min(50, space.capacity_pax))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const durationHrs = Math.max(1, (new Date(`2000-01-01T${endTime}`).getTime() - new Date(`2000-01-01T${startTime}`).getTime()) / 3600000)
  const estimatedTotal = Math.round(durationHrs * space.hourly_rate_eur * 1.18)

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
    const data = await res.json()
    setSubmitting(false)
    if (res.ok) router.push(`/book/confirmation?ref=${data.event.reference_code}`)
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: '2px solid var(--color-concrete-char)', padding: '32px', backgroundColor: 'var(--color-concrete-bone)' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 20px' }}>
        request this space
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>date</label>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={inputStyle} />
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
          disabled={submitting || space.availability !== 'available'}
          style={{
            fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            backgroundColor: space.availability === 'available' ? 'var(--color-lime)' : 'var(--color-concrete-mid)',
            color: space.availability === 'available' ? 'var(--color-lime-ink)' : 'var(--color-concrete-gray)',
            border: 'none', padding: '16px', cursor: space.availability === 'available' ? 'pointer' : 'not-allowed',
            width: '100%',
          }}
        >
          {submitting ? 'sending request...' : space.availability === 'available' ? 'request booking' : 'not available'}
        </button>
      </div>
    </form>
  )
}
