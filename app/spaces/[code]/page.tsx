'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BrandStrip } from '@/components/ui/brand-strip'
import { MonoTable } from '@/components/ui/mono-table'
import { StatusDot } from '@/components/ui/status-dot'
import type { GetSpaceResponse, SpaceWithAvailability } from '@/types/api'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const HERO_IMGS: Record<string, string> = {
  BLUE: '/pyramid/mvrdv-15.jpg', ORANGE: '/pyramid/mvrdv-10.jpg',
  GREEN: '/pyramid/mvrdv-13.jpg', YELLOW: '/pyramid/mvrdv-11.jpg',
  default: '/pyramid/mvrdv-27.jpg',
}

const COLOR_MAP: Record<string, string> = {
  blue: '#378ADD', orange: '#f4a261', green: '#97C459', yellow: '#f9c74f',
  red: '#e63946', purple: '#5a4fcf', teal: '#2a9d8f', coral: '#e76f51', pink: '#ec4899',
}

function BookingPanel({ space }: { space: SpaceWithAvailability }) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('14:00')
  const [attendees, setAttendees] = useState(Math.min(50, space.capacity_pax))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

        {/* Live estimate */}
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

export default function SpaceDetailPage() {
  const { code } = useParams<{ code: string }>()
  const [data, setData] = useState<GetSpaceResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/spaces/${code.toUpperCase()}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [code])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-concrete-char)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.4)' }}>loading space data...</p>
    </div>
  )

  if (!data?.space) return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-concrete-bone)', paddingTop: '80px', padding: '120px 72px' }}>
      <BrandStrip />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-concrete-gray)' }}>Space &quot;{code}&quot; not found.</p>
      <Link href="/spaces" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-lime-ink)' }}>← back to spaces</Link>
    </div>
  )

  const { space, upcoming_bookings } = data
  const heroImg = HERO_IMGS[space.code] ?? HERO_IMGS.default
  const accentColor = space.color ? COLOR_MAP[space.color] ?? '#c8da2b' : '#c8da2b'

  return (
    <div style={{ backgroundColor: 'var(--color-concrete-bone)', minHeight: '100vh' }}>
      <BrandStrip />

      {/* Hero */}
      <section style={{ position: 'relative', height: '65vh', minHeight: '480px', overflow: 'hidden', backgroundColor: '#050505' }}>
        <motion.div
          initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: EASE }}
          style={{ position: 'absolute', inset: 0, backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.75 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.2) 70%, transparent 100%)' }} />

        {/* Breadcrumb */}
        <div style={{ position: 'absolute', top: '80px', left: '64px' }}>
          <Link href="/spaces" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none', color: 'rgba(245,245,240,0.5)' }}>
            ← all spaces
          </Link>
        </div>

        {/* Space identity */}
        <div style={{ position: 'absolute', bottom: '48px', left: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: accentColor, display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.5)' }}>
              {space.floor.replace('l_minus_1', 'B1').replace('l0', 'L0').replace('l3', 'L+3').replace('roof', 'Roof').replace('exterior', 'Exterior')} · {space.category}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-bone)', margin: 0, lineHeight: 1 }}>
            {space.name}
          </h1>
          {space.name_sq && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.06em', color: 'rgba(245,245,240,0.4)', margin: '8px 0 0' }}>{space.name_sq}</p>
          )}
        </div>

        {/* Status badge */}
        <div style={{ position: 'absolute', top: '80px', right: '64px', border: `2px solid ${accentColor}`, padding: '8px 16px', backgroundColor: 'rgba(5,5,5,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StatusDot status={space.availability} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-bone)' }}>{space.availability}</span>
        </div>
      </section>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '0', borderTop: '2px solid var(--color-concrete-char)' }}>
        {/* Left: specs + description */}
        <div style={{ padding: '56px 64px', borderRight: '2px solid var(--color-concrete-char)' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}>

            {/* Key metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '2px solid var(--color-concrete-char)', marginBottom: '40px' }}>
              {[
                { label: 'area', value: `${space.area_sqm}`, unit: 'm²' },
                { label: 'capacity', value: `${space.capacity_pax}`, unit: 'pax' },
                { label: 'ceiling', value: space.ceiling_m ? `${space.ceiling_m}` : '—', unit: space.ceiling_m ? 'm' : '' },
                { label: 'rate', value: `€${space.hourly_rate_eur}`, unit: '/hr' },
              ].map(({ label, value, unit }, i) => (
                <div key={label} style={{ padding: '28px 24px', borderRight: i < 3 ? '2px solid var(--color-concrete-char)' : 'none' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: 500, color: 'var(--color-concrete-char)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                    {value}<span style={{ fontSize: '14px', color: 'var(--color-concrete-gray)', marginLeft: '4px' }}>{unit}</span>
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {space.description && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-concrete-char)', lineHeight: 1.75, margin: '0 0 40px', maxWidth: '600px' }}>
                {space.description}
              </p>
            )}

            {/* Full spec table */}
            <div style={{ maxWidth: '480px', marginBottom: '40px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 16px' }}>specifications</p>
              <MonoTable rows={[
                { label: 'space code', value: space.code },
                { label: 'floor', value: space.floor.replace('l_minus_1', 'B1').replace('l0', 'Ground / L0').replace('l3', 'Level L+3').replace('roof', 'Rooftop').replace('exterior', 'Exterior') },
                { label: 'category', value: space.category.replace('_', ' ') },
                { label: 'area', value: space.area_sqm, unit: 'm²' },
                { label: 'capacity', value: space.capacity_pax, unit: 'pax' },
                ...(space.ceiling_m ? [{ label: 'ceiling height', value: space.ceiling_m, unit: 'm' }] : []),
                { label: 'hourly rate', value: `€${space.hourly_rate_eur}`, unit: '+ VAT' },
              ]} />
            </div>

            {/* Setup types */}
            {space.setup_types.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>available layouts</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {space.setup_types.map(t => (
                    <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-concrete-char)', border: '1px solid var(--color-concrete-char)', padding: '4px 10px' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {space.features.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>included features</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {space.features.map(f => (
                    <span key={f} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '4px 10px' }}>{f.replace('_', ' ')}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming bookings */}
            {upcoming_bookings.length > 0 && (
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>upcoming bookings</p>
                {upcoming_bookings.map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--color-concrete-mid)', alignItems: 'center' }}>
                    <StatusDot status={b.status === 'confirmed' ? 'reserved' : b.status === 'in_progress' ? 'available' : 'pending'} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-concrete-char)' }}>
                      {new Date(b.start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(b.start_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', marginLeft: 'auto' }}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: booking panel */}
        <div style={{ padding: '40px 32px', backgroundColor: 'var(--color-concrete-light)' }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}>
            <BookingPanel space={space} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
