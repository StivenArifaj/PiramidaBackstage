'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrandStrip } from '@/components/ui/brand-strip'
import { ScrollVideo } from '@/components/pyramid/scroll-video'
import { FloorSelector } from '@/components/pyramid/floor-selector'
import { FloorPlan } from '@/components/pyramid/floor-plan'
import { FLOOR_LABELS } from '@/types/domain'
import type { SpaceFloor, SpaceWithAvailability } from '@/types/api'

// ─── Building stats overlay (first flythrough) ───────────────────────────
const HERO_STATS = [
  { value: '80+', label: 'spaces' },
  { value: '5',   label: 'floors' },
  { value: '300', label: 'max pax' },
  { value: '16',  label: 'ext. boxes' },
]

// ─── Interlude: structural bridge between the two flythroughs ─────────────
const INTERLUDE_LINES = [
  { n: '01', label: 'Five floors', detail: 'Roof · L+3 · Ground · B1 · Exterior' },
  { n: '02', label: '80+ spaces', detail: 'Every room, box, and terrace' },
  { n: '03', label: 'Real-time', detail: 'Live availability · instant quote' },
]

// ─── Demo spaces — mirrors /spaces page (live data once Supabase is wired) ─
const DEMO_SPACES: SpaceWithAvailability[] = [
  { id: '1',  code: 'A1',  name: 'Space A1',  floor: 'l0', category: 'extension', area_sqm: 85,  capacity_pax: 90,  hourly_rate_eur: 120, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '2',  code: 'A2',  name: 'Space A2',  floor: 'l0', category: 'extension', area_sqm: 92,  capacity_pax: 100, hourly_rate_eur: 130, setup_types: [], features: [], photo_urls: [], availability: 'reserved'  },
  { id: '3',  code: 'A3',  name: 'Space A3',  floor: 'l0', category: 'extension', area_sqm: 88,  capacity_pax: 95,  hourly_rate_eur: 125, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '4',  code: 'A4',  name: 'Space A4',  floor: 'l0', category: 'extension', area_sqm: 95,  capacity_pax: 110, hourly_rate_eur: 135, setup_types: [], features: [], photo_urls: [], availability: 'pending'   },
  { id: '5',  code: 'A5',  name: 'Space A5',  floor: 'l0', category: 'extension', area_sqm: 105, capacity_pax: 120, hourly_rate_eur: 145, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '6',  code: 'A6',  name: 'Space A6',  floor: 'l0', category: 'extension', area_sqm: 98,  capacity_pax: 108, hourly_rate_eur: 138, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '7',  code: 'A7',  name: 'Space A7',  floor: 'l0', category: 'extension', area_sqm: 90,  capacity_pax: 98,  hourly_rate_eur: 128, setup_types: [], features: [], photo_urls: [], availability: 'reserved'  },
  { id: '8',  code: 'A8',  name: 'Space A8',  floor: 'l0', category: 'extension', area_sqm: 87,  capacity_pax: 94,  hourly_rate_eur: 122, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '9',  code: 'A9',  name: 'Space A9',  floor: 'l0', category: 'extension', area_sqm: 88,  capacity_pax: 96,  hourly_rate_eur: 124, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '10', code: 'A10', name: 'Space A10', floor: 'l0', category: 'extension', area_sqm: 92,  capacity_pax: 100, hourly_rate_eur: 130, setup_types: [], features: [], photo_urls: [], availability: 'blocked'   },
  { id: '11', code: 'A11', name: 'Space A11', floor: 'l0', category: 'extension', area_sqm: 95,  capacity_pax: 105, hourly_rate_eur: 135, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '12', code: 'A12', name: 'Space A12', floor: 'l0', category: 'extension', area_sqm: 100, capacity_pax: 112, hourly_rate_eur: 140, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '13', code: 'A13', name: 'Space A13', floor: 'l0', category: 'extension', area_sqm: 96,  capacity_pax: 106, hourly_rate_eur: 136, setup_types: [], features: [], photo_urls: [], availability: 'pending'   },
  { id: '14', code: 'A14', name: 'Space A14', floor: 'l0', category: 'extension', area_sqm: 90,  capacity_pax: 98,  hourly_rate_eur: 128, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '15', code: 'A15', name: 'Space A15', floor: 'l0', category: 'extension', area_sqm: 87,  capacity_pax: 93,  hourly_rate_eur: 122, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '16', code: 'A16', name: 'Space A16', floor: 'l0', category: 'extension', area_sqm: 84,  capacity_pax: 90,  hourly_rate_eur: 120, setup_types: [], features: [], photo_urls: [], availability: 'reserved'  },
]

// ─── Landing page ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeFloor, setActiveFloor] = useState<SpaceFloor>('l0')
  const floorLabel = FLOOR_LABELS[activeFloor]

  function handleFloorSelect(floor: SpaceFloor) {
    setActiveFloor(floor)
  }

  const availableCount = DEMO_SPACES.filter(s => s.availability === 'available').length

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          DARK CINEMATIC SECTION
          BrandStrip + Flythrough 1 + Interlude + Flythrough 2
      ══════════════════════════════════════════════════════ */}
      <div style={{ backgroundColor: 'var(--color-concrete-char)', overflowX: 'clip' }}>
        <BrandStrip />

        {/* ── FLYTHROUGH 1 · aerial drone → interior ───────── */}
        <ScrollVideo
          framesFolder="/frames/hero"
          frameCount={300}
          overlayLabel="Pyramid of Tirana · MVRDV · Albania · 2023"
          overlayTitle="piramida backstage."
          overlaySubtitle="EST. 1988 · REIMAGINED 2023 · BACKSTAGE 2026"
          scrollHeight="300vh"
          reversed
        >
          {/* Stats panel — top right */}
          <div
            style={{
              position: 'absolute',
              top: '72px',
              right: '40px',
              border: '2px solid rgba(245,245,240,0.18)',
              backgroundColor: 'rgba(10,10,10,0.65)',
              zIndex: 2,
            }}
          >
            {HERO_STATS.map(({ value, label }, i) => (
              <div
                key={label}
                style={{
                  padding: '14px 22px',
                  borderBottom: i < HERO_STATS.length - 1 ? '1px solid rgba(245,245,240,0.1)' : 'none',
                }}
              >
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 500, color: 'var(--color-concrete-bone)', margin: 0, letterSpacing: '0.03em' }}>
                  {value}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.38)', margin: '3px 0 0' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Organizer shortcut — "explore spaces" removed (redundant: scroll down to reach it) */}
          <div style={{ position: 'absolute', bottom: '64px', right: '40px', zIndex: 2 }}>
            <Link
              href="/dashboard"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-concrete-bone)',
                padding: '13px 30px',
                border: '2px solid rgba(245,245,240,0.28)',
                textDecoration: 'none',
                display: 'inline-block',
                whiteSpace: 'nowrap',
              }}
            >
              organizer view
            </Link>
          </div>
        </ScrollVideo>

        {/* ── INTERLUDE · stat bridge ───────────────────────── */}
        <section
          style={{
            backgroundColor: 'var(--color-concrete-char)',
            borderTop: '2px solid rgba(245,245,240,0.08)',
            borderBottom: '2px solid rgba(245,245,240,0.08)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {INTERLUDE_LINES.map(({ n, label, detail }, i) => (
              <div
                key={n}
                style={{
                  padding: '40px 48px',
                  borderRight: i < 2 ? '1px solid rgba(245,245,240,0.06)' : 'none',
                }}
              >
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--color-lime)', margin: '0 0 14px' }}>
                  {n}
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--color-concrete-bone)', margin: '0 0 6px' }}>
                  {label}
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(245,245,240,0.35)', margin: 0 }}>
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FLYTHROUGH 2 · city → facade ─────────────────── */}
        {/* No CTA — user scrolls naturally into the floor selector below */}
        <ScrollVideo
          framesFolder="/frames/detail-sample"
          frameCount={265}
          overlayLabel="Ground Level · Front Elevation · Tirana"
          overlayTitle="walk inside."
          overlaySubtitle="5 FLOORS · 80+ SPACES · 3 500 m² · ALL BOOKABLE"
          scrollHeight="260vh"
          reversed
        />
      </div>

      {/* ══════════════════════════════════════════════════════
          FLOOR SELECTOR
          Slides into view naturally after Flythrough 2 ends.
          Mirrors /spaces layout (no BrandStrip — already fixed at top).
      ══════════════════════════════════════════════════════ */}
      <div style={{ backgroundColor: 'var(--color-concrete-bone)' }}>

        {/* Section header — deliberate dark-to-light break */}
        <div
          style={{
            borderTop: '3px solid var(--color-concrete-char)',
            padding: '20px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-concrete-bone)',
          }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: 0 }}>
            pyramid of tirana · 5 floors · 80+ spaces
          </p>
          <Link
            href="/spaces"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-concrete-gray)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--color-concrete-mid)',
              paddingBottom: '2px',
            }}
          >
            view as page ↗
          </Link>
        </div>

        {/* Main grid — left: floor selector, right: floor plan */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

          {/* ── Left panel ───────────────────────────────────── */}
          <div style={{ borderRight: '2px solid var(--color-concrete-char)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '32px 32px 24px', borderBottom: '2px solid var(--color-concrete-char)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', marginBottom: '8px' }}>
                pyramid of tirana
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, letterSpacing: '0.01em', color: 'var(--color-concrete-char)', margin: 0 }}>
                select a floor
              </h2>
            </div>

            <div style={{ padding: '32px', flex: 1 }}>
              <FloorSelector
                activeFloor={activeFloor}
                onFloorSelect={handleFloorSelect}
                lang="en"
              />
            </div>

            <div style={{ padding: '20px 32px', borderTop: '2px solid var(--color-concrete-char)', display: 'flex', gap: '32px' }}>
              {[
                { label: 'total spaces', value: '80+' },
                { label: 'floors',        value: '5'   },
                { label: 'max capacity',  value: '300' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 500, color: 'var(--color-concrete-char)', margin: 0, letterSpacing: '0.02em' }}>
                    {value}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '2px 0 0' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right panel ──────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '32px 32px 24px', borderBottom: '2px solid var(--color-concrete-char)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', marginBottom: '8px' }}>
                  floor plan
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, letterSpacing: '0.01em', color: 'var(--color-concrete-char)', margin: 0 }}>
                  {floorLabel.en}
                </h2>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-concrete-gray)', margin: '4px 0 0', letterSpacing: '0.06em' }}>
                  {floorLabel.sq}
                </p>
              </div>

              <div style={{ border: '2px solid var(--color-lime)', padding: '6px 14px', backgroundColor: 'var(--color-lime)', display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 500, color: 'var(--color-lime-ink)', letterSpacing: '0.04em' }}>
                  {availableCount}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-lime-ink)' }}>
                  available
                </span>
              </div>
            </div>

            <div style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FloorPlan
                floor={activeFloor}
                spaces={DEMO_SPACES}
              />
            </div>

            <div style={{ padding: '16px 32px', borderTop: '1px solid var(--color-concrete-mid)' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: 0 }}>
                click any space to view details and book
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
