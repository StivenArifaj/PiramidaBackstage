'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BrandStrip } from '@/components/ui/brand-strip'
import { QuoteSummary } from '@/components/booking/quote-summary'
import type { SpaceWithAvailability, ListSpacesResponse, CreateEventResponse } from '@/types/api'

const M: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

const INPUT: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.04em',
  color: 'var(--color-concrete-char)', backgroundColor: 'var(--color-concrete-bone)',
  border: '2px solid var(--color-concrete-char)', padding: '10px 12px',
  width: '100%', outline: 'none', appearance: 'none',
}

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'var(--color-concrete-gray)',
  display: 'block', marginBottom: '6px',
}

const EVENT_TYPES = ['conference', 'workshop', 'reception', 'exhibition', 'performance', 'meetup', 'private']

export default function BookPage() {
  const router = useRouter()

  // ── Space list ──────────────────────────────────────────────────────────────
  const [spaces, setSpaces] = useState<SpaceWithAvailability[]>([])
  useEffect(() => {
    fetch('/api/spaces')
      .then(r => r.json())
      .then((d: ListSpacesResponse) => setSpaces(d.spaces ?? []))
      .catch(() => {/* leave empty; fallback to placeholder */})
  }, [])

  // ── Form state ──────────────────────────────────────────────────────────────
  const [spaceCode, setSpaceCode]   = useState('')
  const [date, setDate]             = useState('')
  const [startTime, setStartTime]   = useState('10:00')
  const [endTime, setEndTime]       = useState('14:00')
  const [attendees, setAttendees]   = useState(50)
  const [name, setName]             = useState('')
  const [email, setEmail]           = useState('')
  const [org, setOrg]               = useState('')
  const [eventType, setEventType]   = useState('')
  const [notes, setNotes]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const selectedSpace = spaces.find(s => s.code === spaceCode) ?? null
  const canSubmit = !!spaceCode && !!date && !!name && !!email && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${eventType ? eventType.charAt(0).toUpperCase() + eventType.slice(1) + ' — ' : ''}${name}`,
          organizer_name: name,
          organizer_email: email,
          organizer_org: org || undefined,
          event_type: eventType || undefined,
          attendees_count: attendees,
          start_at: new Date(`${date}T${startTime}`).toISOString(),
          end_at: new Date(`${date}T${endTime}`).toISOString(),
          preferred_space_codes: [spaceCode],
          notes: notes || undefined,
        }),
      })
      const data: CreateEventResponse = await res.json()
      if (!res.ok) throw new Error('Request failed')
      router.push(`/book/confirmation?ref=${data.event?.reference_code ?? 'PB-2026-NEW'}`)
    } catch {
      setError('Could not submit request. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-concrete-bone)' }}>
      <BrandStrip />

      {/* Page header */}
      <div style={{ paddingTop: '48px', backgroundColor: 'var(--color-concrete-char)', borderBottom: '2px solid var(--color-concrete-char)' }}>
        <div style={{ padding: '0 64px' }}>
          <Link
            href="/spaces"
            style={{ ...M, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none', color: 'rgba(245,245,240,0.35)' }}
          >
            ← all spaces
          </Link>
        </div>
        <div style={{ padding: '20px 64px 32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p style={{ ...M, fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.35)', margin: '0 0 12px' }}>
              piramida backstage · new booking
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-bone)', margin: 0, lineHeight: 0.95 }}>
              reserve a space.
            </h1>
          </div>
          <p style={{ ...M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.28)', margin: 0 }}>
            {spaces.length > 0 ? `${spaces.length} spaces available` : 'loading spaces…'}
          </p>
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', minHeight: 'calc(100vh - 180px)', borderTop: '2px solid var(--color-concrete-char)' }}>

        {/* ── LEFT: Form ────────────────────────────────────────────── */}
        <div style={{ borderRight: '2px solid var(--color-concrete-char)' }}>

          {/* Section: Space selection */}
          <div style={{ padding: '40px 56px 32px', borderBottom: '2px solid var(--color-concrete-char)' }}>
            <p style={{ ...M, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 20px' }}>
              01 — select space
            </p>

            <form id="booking-form" onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={LABEL}>space</label>
                  <select
                    required
                    value={spaceCode}
                    onChange={e => { setSpaceCode(e.target.value); setAttendees(50) }}
                    style={{ ...INPUT, cursor: 'pointer' }}
                  >
                    <option value="">— choose a space —</option>
                    {spaces.length > 0 ? (
                      <>
                        {['hero', 'extension', 'exterior_box', 'public_area'].map(cat => {
                          const group = spaces.filter(s => s.category === cat)
                          if (!group.length) return null
                          return (
                            <optgroup key={cat} label={cat.replace('_', ' ').toUpperCase()}>
                              {group.map(s => (
                                <option key={s.code} value={s.code} disabled={s.availability === 'blocked'}>
                                  {s.name} · {s.capacity_pax} pax · €{s.hourly_rate_eur}/hr{s.availability !== 'available' ? ` [${s.availability}]` : ''}
                                </option>
                              ))}
                            </optgroup>
                          )
                        })}
                      </>
                    ) : (
                      <option disabled>loading spaces…</option>
                    )}
                  </select>
                </div>

                <div>
                  <label style={LABEL}>event type (optional)</label>
                  <select value={eventType} onChange={e => setEventType(e.target.value)} style={{ ...INPUT, cursor: 'pointer' }}>
                    <option value="">— select type —</option>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Section: Date & time */}
          <div style={{ padding: '32px 56px', borderBottom: '2px solid var(--color-concrete-char)' }}>
            <p style={{ ...M, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 20px' }}>
              02 — date &amp; time
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={LABEL}>date</label>
                <input
                  form="booking-form" type="date" required
                  value={date} onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={INPUT}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={LABEL}>start time</label>
                  <input form="booking-form" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>end time</label>
                  <input form="booking-form" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={INPUT} />
                </div>
              </div>
              <div>
                <label style={LABEL}>
                  attendees{selectedSpace ? ` (max ${selectedSpace.capacity_pax})` : ''}
                </label>
                <input
                  form="booking-form" type="number" min={1}
                  max={selectedSpace?.capacity_pax ?? 9999}
                  value={attendees}
                  onChange={e => setAttendees(parseInt(e.target.value) || 1)}
                  style={INPUT}
                />
              </div>
            </div>
          </div>

          {/* Section: Organizer details */}
          <div style={{ padding: '32px 56px', borderBottom: '2px solid var(--color-concrete-char)' }}>
            <p style={{ ...M, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 20px' }}>
              03 — organizer details
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={LABEL}>full name</label>
                  <input form="booking-form" type="text" required placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>organisation (optional)</label>
                  <input form="booking-form" type="text" placeholder="Company / org" value={org} onChange={e => setOrg(e.target.value)} style={INPUT} />
                </div>
              </div>
              <div>
                <label style={LABEL}>email</label>
                <input form="booking-form" type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>notes (optional)</label>
                <textarea
                  form="booking-form"
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Special setup requirements, accessibility needs, AV requests…"
                  rows={3}
                  style={{ ...INPUT, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ padding: '32px 56px' }}>
            {error && (
              <p style={{ ...M, fontSize: '10px', letterSpacing: '0.1em', color: 'var(--color-box-red)', margin: '0 0 16px', border: '1px solid var(--color-box-red)', padding: '10px 14px' }}>
                <span aria-label="error" style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'var(--color-box-red)', marginRight: '8px', flexShrink: 0 }} />{error}
              </p>
            )}
            <button
              form="booking-form"
              type="submit"
              data-brutal
              disabled={!canSubmit}
              style={{
                fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                backgroundColor: canSubmit ? 'var(--color-lime)' : 'var(--color-concrete-mid)',
                color: canSubmit ? 'var(--color-lime-ink)' : 'var(--color-concrete-gray)',
                border: 'none', padding: '18px 48px',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                width: '100%',
              }}
            >
              {submitting ? 'sending request…' : 'reserve space →'}
            </button>
            <p style={{ ...M, fontSize: '8px', letterSpacing: '0.1em', color: 'var(--color-concrete-gray)', margin: '12px 0 0', textAlign: 'center' }}>
              This submits a booking request. You will receive confirmation by email.
            </p>
          </div>
        </div>

        {/* ── RIGHT: Live quote ─────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: '48px', alignSelf: 'start', borderBottom: '2px solid var(--color-concrete-char)' }}>
          <QuoteSummary
            space={selectedSpace}
            date={date}
            startTime={startTime}
            endTime={endTime}
            attendees={attendees}
          />
        </div>
      </div>
    </div>
  )
}
