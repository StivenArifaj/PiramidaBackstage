'use client'

import Link from 'next/link'
import { BrandStrip } from '@/components/ui/brand-strip'
import { SectionDivider } from '@/components/ui/section-divider'
import { ScrollVideo } from '@/components/pyramid/scroll-video'

// ─── Building stats (overlay on first flythrough) ─────────────────────────
const HERO_STATS = [
  { value: '80+', label: 'spaces' },
  { value: '5',   label: 'floors' },
  { value: '300', label: 'max pax' },
  { value: '16',  label: 'ext. boxes' },
]

// ─── Feature strips (below second flythrough) ─────────────────────────────
const FEATURES = [
  {
    num: '01',
    title: 'floor plans',
    body: 'Interactive radial SVGs for all 5 floors. Every space is a clickable box with live availability.',
  },
  {
    num: '02',
    title: 'instant quotes',
    body: 'Space + assets + duration → itemized quote assembled in real time. One click to confirm.',
  },
  {
    num: '03',
    title: 'auto tasks',
    body: 'Confirmation triggers a complete setup and teardown checklist for every operational team.',
  },
  {
    num: '04',
    title: 'ai booking',
    body: 'Type one sentence. The chatbot finds the space, generates the quote, and confirms the reservation.',
  },
]

// ─── Building spec table ────────────────────────────────────────────────────
const BUILDING_SPECS = [
  { label: 'location',         value: 'Tirana, Albania' },
  { label: 'architect',        value: 'MVRDV (2023)' },
  { label: 'gross area',       value: '22 000 m²' },
  { label: 'bookable floors',  value: '5' },
  { label: 'event spaces',     value: '80+' },
  { label: 'max capacity',     value: '300 pax' },
  { label: 'exterior boxes',   value: '16 × BE1–BE16' },
  { label: 'asset categories', value: '12' },
]

// ─── Interlude divider text (between two flythroughs) ─────────────────────
const INTERLUDE_LINES = [
  { n: '01', label: 'Five floors catalogued', detail: 'Roof · L+3 · Ground · B1 · Exterior' },
  { n: '02', label: '80+ spaces mapped', detail: 'Every room, box, and terrace bookable in real time' },
  { n: '03', label: 'One confirmation', detail: 'Quote, assets, tasks — all in under 90 seconds' },
]

// ─── Landing page ────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-concrete-char)', overflowX: 'clip' }}>
      <BrandStrip />

      {/* ══════════════════════════════════════════════════════
          FLYTHROUGH 1 · aerial drone — wide overhead view
          Frames: /frames/hero · 300 frames · reversed
          (plays aerial→interior as user scrolls down)
      ══════════════════════════════════════════════════════ */}
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

        {/* CTA — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            right: '40px',
            display: 'flex',
            gap: '14px',
            alignItems: 'center',
            zIndex: 2,
          }}
        >
          <Link
            href="/spaces"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-lime-ink)',
              backgroundColor: 'var(--color-lime)',
              padding: '13px 30px',
              border: '2px solid var(--color-lime-ink)',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            explore spaces
          </Link>
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
            }}
          >
            organizer view
          </Link>
        </div>
      </ScrollVideo>

      {/* ══════════════════════════════════════════════════════
          INTERLUDE · dark stat block between flythroughs
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: 'var(--color-concrete-char)',
          borderTop: '2px solid rgba(245,245,240,0.08)',
          borderBottom: '2px solid rgba(245,245,240,0.08)',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '64px 72px 40px',
            borderBottom: '1px solid rgba(245,245,240,0.06)',
          }}
        >
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 16px' }}>
              the building
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-bone)', margin: 0, lineHeight: 1.0 }}>
              every floor.<br />every space.
            </h2>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(245,245,240,0.4)', maxWidth: '300px', textAlign: 'right', lineHeight: 1.7, margin: 0 }}>
            From rooftop MVRDV colour boxes to the underground B1 level — every square metre catalogued, priced, and bookable in real time.
          </p>
        </div>

        {/* Three-column feature strips */}
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
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--color-concrete-bone)', margin: '0 0 8px' }}>
                {label}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(245,245,240,0.38)', margin: 0, lineHeight: 1.65 }}>
                {detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FLYTHROUGH 2 · front elevation approach
          Frames: /frames/detail-sample · 265 frames · reversed
          (plays wide city → building facade as user scrolls)
      ══════════════════════════════════════════════════════ */}
      <ScrollVideo
        framesFolder="/frames/detail-sample"
        frameCount={265}
        overlayLabel="Ground Level · Front Elevation · Tirana"
        overlayTitle="walk inside."
        overlaySubtitle="5 FLOORS · 80+ SPACES · 3 500 m² · ALL BOOKABLE"
        scrollHeight="260vh"
        reversed
      >
        {/* Explore CTA — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            right: '40px',
            zIndex: 2,
          }}
        >
          <Link
            href="/spaces"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: 'var(--color-lime-ink)',
              backgroundColor: 'var(--color-lime)',
              padding: '16px 40px',
              display: 'inline-block',
            }}
          >
            open floor plans →
          </Link>
        </div>
      </ScrollVideo>

      {/* ══════════════════════════════════════════════════════
          DIAGONAL TRANSITION: dark → bone
      ══════════════════════════════════════════════════════ */}
      <SectionDivider
        fromColor="var(--color-concrete-char)"
        toColor="var(--color-concrete-bone)"
        height={80}
      />

      {/* ══════════════════════════════════════════════════════
          MANIFESTO
      ══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--color-concrete-bone)', padding: '80px 48px' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
          }}
        >
          {/* Left: statement */}
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 20px' }}>
              the problem
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 500, letterSpacing: '0.01em', color: 'var(--color-concrete-char)', margin: 0, lineHeight: 1.15 }}>
              30 emails. 4 spreadsheets. 2 phone calls. Replaced by one sentence.
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 1.7, color: 'var(--color-concrete-gray)', margin: '24px 0 0', maxWidth: '460px' }}>
              Piramida Backstage replaces fragmented event coordination with one operational system: browse 80+ spaces across 5 floors, get a live quote, reserve assets, auto-generate setup tasks, and give the chatbot one sentence to do the whole thing.
            </p>
            <Link
              href="/spaces"
              style={{
                display: 'inline-block',
                marginTop: '32px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-lime-ink)',
                backgroundColor: 'var(--color-lime)',
                padding: '12px 28px',
                border: '2px solid var(--color-lime-ink)',
                textDecoration: 'none',
              }}
            >
              browse the pyramid →
            </Link>
          </div>

          {/* Right: building specs */}
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 24px' }}>
              building data
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {BUILDING_SPECS.map(({ label, value }) => (
                  <tr
                    key={label}
                    style={{ borderBottom: '1px solid var(--color-concrete-mid)' }}
                  >
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', padding: '10px 0', width: '45%' }}>
                      {label}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-concrete-char)', padding: '10px 0', fontWeight: 500 }}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURE STRIP
      ══════════════════════════════════════════════════════ */}
      <SectionDivider
        fromColor="var(--color-concrete-bone)"
        toColor="var(--color-concrete-char)"
        height={60}
      />
      <section
        style={{
          backgroundColor: 'var(--color-concrete-char)',
          borderTop: '2px solid rgba(245,245,240,0.08)',
          borderBottom: '2px solid rgba(245,245,240,0.08)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {FEATURES.map(({ num, title, body }, i) => (
            <div
              key={num}
              style={{
                padding: '52px 40px',
                borderRight: i < 3 ? '1px solid rgba(245,245,240,0.08)' : 'none',
              }}
            >
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--color-lime)', margin: '0 0 16px' }}>
                {num}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-concrete-bone)', margin: '0 0 12px' }}>
                {title}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(245,245,240,0.45)', margin: 0, lineHeight: 1.65 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: 'var(--color-concrete-char)',
          padding: '72px',
          borderTop: '2px solid var(--color-lime)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 12px' }}>
            ready to book
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--color-concrete-bone)', margin: 0, lineHeight: 1.1 }}>
            Replace 30 emails<br />with one sentence.
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '14px', flexShrink: 0 }}>
          <Link
            href="/spaces"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: 'var(--color-lime-ink)',
              backgroundColor: 'var(--color-lime)',
              padding: '14px 32px',
              border: '2px solid var(--color-lime-ink)',
              display: 'inline-block',
            }}
          >
            book a space
          </Link>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: 'rgba(245,245,240,0.75)',
              padding: '14px 32px',
              border: '2px solid rgba(245,245,240,0.2)',
              display: 'inline-block',
            }}
          >
            organizer view
          </Link>
        </div>
      </section>
    </div>
  )
}
