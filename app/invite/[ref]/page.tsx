'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { BrandStrip } from '@/components/ui/brand-strip'

const M = 'var(--font-mono)'
const D = 'var(--font-display)'
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const FLOOR_LABELS: Record<string, string> = {
  l0:        'Ground Floor · L0',
  l3:        'Level L+3',
  l_minus_1: 'Basement · B1',
  exterior:  'Exterior / Park',
  roof:      'Rooftop',
}

const FLOOR_DIRECTIONS: Record<string, string> = {
  l0:        'Enter via the main public entrance on Rruga e Elbasanit. The space is on the ground level — no stairs required.',
  l3:        'Enter via the main entrance and take the internal ramps upward. Follow Pyramid signage to Level L+3.',
  l_minus_1: 'Access via the main external stairwell and descend to the Basement level. Follow B1 floor markings.',
  exterior:  'Located in the surrounding Piramida park area. No elevator required — navigate along the exterior paths.',
  roof:      'Take the external climbing route on the Pyramid\'s concrete surface, or use internal ramps to reach the rooftop.',
}

interface PublicEvent {
  id: string
  reference_code: string
  title: string
  event_type?: string
  organizer_name?: string
  status: string
  start_at: string
  end_at: string
  attendees_count: number
  space: { name: string; floor: string; photo_urls: string[] } | null
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function InvitePage() {
  const { ref } = useParams<{ ref: string }>()
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/track/${ref}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); return }
        setEvent(data.event)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [ref])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-concrete-char)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(245,245,240,0.3)' }}>LOADING</p>
        </motion.div>
      </div>
    )
  }

  if (notFound || !event) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-concrete-char)', color: 'var(--color-concrete-bone)' }}>
        <BrandStrip />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '140px 32px 80px', textAlign: 'center' }}>
          <p style={{ fontFamily: M, fontSize: '11px', color: 'rgba(245,245,240,0.35)', lineHeight: 1.7 }}>
            This invite link is invalid or the event could not be found.
          </p>
        </div>
      </div>
    )
  }

  if (event.status !== 'confirmed') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-concrete-char)', color: 'var(--color-concrete-bone)' }}>
        <BrandStrip />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '140px 32px 80px', textAlign: 'center' }}>
          <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.25)', marginBottom: 16 }}>
            not yet confirmed
          </p>
          <p style={{ fontFamily: M, fontSize: '13px', color: 'rgba(245,245,240,0.45)', lineHeight: 1.7 }}>
            This event is not yet confirmed.
          </p>
        </div>
      </div>
    )
  }

  const floorKey = event.space?.floor ?? ''
  const floorLabel = FLOOR_LABELS[floorKey] ?? floorKey
  const floorDirections = FLOOR_DIRECTIONS[floorKey] ?? ''
  const photo = event.space?.photo_urls?.[0] ?? null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-concrete-char)', color: 'var(--color-concrete-bone)' }}>
      <BrandStrip />

      {/* Space photo banner */}
      {photo && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: EASE }}
          style={{ width: '100%', height: 'clamp(220px, 35vw, 420px)', overflow: 'hidden', position: 'relative' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt={event.space?.name ?? 'Event space'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.75)' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, var(--color-concrete-char) 100%)',
          }} />
        </motion.div>
      )}

      <div style={{ maxWidth: 640, margin: '0 auto', padding: photo ? '0 32px 80px' : '120px 32px 80px' }}>

        {/* Event title block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
          style={{ marginBottom: 48 }}
        >
          {event.event_type && (
            <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 14px' }}>
              {event.event_type}
            </p>
          )}
          <h1 style={{ fontFamily: D, fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-bone)', margin: '0 0 12px', lineHeight: 1.0 }}>
            {event.title}
          </h1>
          {event.organizer_name && (
            <p style={{ fontFamily: M, fontSize: '12px', color: 'rgba(245,245,240,0.4)', margin: 0, letterSpacing: '0.04em' }}>
              Hosted by {event.organizer_name}
            </p>
          )}
        </motion.div>

        {/* Date & time + location */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: EASE }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 48 }}
        >
          {/* Date & time */}
          <div style={{ background: 'rgba(245,245,240,0.04)', padding: '24px', borderRight: '1px solid rgba(245,245,240,0.06)' }}>
            <p style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.3)', margin: '0 0 12px' }}>
              date &amp; time
            </p>
            <p style={{ fontFamily: M, fontSize: '13px', color: 'var(--color-concrete-bone)', margin: '0 0 6px', lineHeight: 1.4 }}>
              {formatDate(event.start_at)}
            </p>
            <p style={{ fontFamily: M, fontSize: '12px', color: 'rgba(245,245,240,0.45)', margin: 0 }}>
              {formatTime(event.start_at)} – {formatTime(event.end_at)}
            </p>
          </div>

          {/* Location */}
          <div style={{ background: 'rgba(245,245,240,0.04)', padding: '24px' }}>
            <p style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.3)', margin: '0 0 12px' }}>
              location
            </p>
            {event.space ? (
              <>
                <p style={{ fontFamily: M, fontSize: '13px', color: 'var(--color-concrete-bone)', margin: '0 0 4px', lineHeight: 1.4 }}>
                  {event.space.name}
                </p>
                <p style={{ fontFamily: M, fontSize: '11px', color: 'rgba(245,245,240,0.4)', margin: 0 }}>
                  {floorLabel}
                </p>
              </>
            ) : (
              <p style={{ fontFamily: M, fontSize: '12px', color: 'rgba(245,245,240,0.35)', margin: 0 }}>
                Pyramid of Tirana
              </p>
            )}
          </div>
        </motion.div>

        {/* Venue directions */}
        {floorDirections && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34, ease: EASE }}
            style={{ border: '1px solid rgba(245,245,240,0.08)', padding: '24px', marginBottom: 48 }}
          >
            <p style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.28)', margin: '0 0 12px' }}>
              getting there
            </p>
            <p style={{ fontFamily: M, fontSize: '12px', color: 'rgba(245,245,240,0.5)', margin: '0 0 10px', lineHeight: 1.7 }}>
              {floorDirections}
            </p>
            <p style={{ fontFamily: M, fontSize: '10px', color: 'rgba(245,245,240,0.25)', margin: 0, letterSpacing: '0.04em' }}>
              Rruga e Elbasanit, Tirana · Piramida MVRDV 2023
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ borderTop: '1px solid rgba(245,245,240,0.06)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
        >
          <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.18)', margin: 0 }}>
            Piramida Backstage
          </p>
          <p style={{ fontFamily: M, fontSize: '8px', color: 'rgba(245,245,240,0.18)', margin: 0, letterSpacing: '0.04em' }}>
            Pyramid of Tirana · MVRDV 2023
          </p>
        </motion.div>
      </div>
    </div>
  )
}
