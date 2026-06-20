'use client'

import Link from 'next/link'
import { BrandStrip } from '@/components/ui/brand-strip'
import { ScrollVideo } from '@/components/pyramid/scroll-video'

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

// ─── Landing page ────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-concrete-char)', overflowX: 'clip' }}>
      <BrandStrip />

      {/* ══════════════════════════════════════════════════════
          FLYTHROUGH 1 · aerial drone — wide overhead view
          /frames/hero · 300 frames · reversed (aerial→interior)
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

        {/* CTA buttons — bottom right
            Raised to bottom: 64px to clear the [MASK // WM] block (bottom: 4px, height: 40px → top at 44px) */}
        <div
          style={{
            position: 'absolute',
            bottom: '64px',
            right: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end',
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
              whiteSpace: 'nowrap',
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
              whiteSpace: 'nowrap',
            }}
          >
            organizer view
          </Link>
        </div>
      </ScrollVideo>

      {/* ══════════════════════════════════════════════════════
          INTERLUDE · minimal stat bridge between flythroughs
      ══════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════
          FLYTHROUGH 2 · front elevation approach
          /frames/detail-sample · 265 frames · reversed (city→facade)
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
        {/* Enter — bottom right, raised above mask */}
        <div
          style={{
            position: 'absolute',
            bottom: '64px',
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
              whiteSpace: 'nowrap',
            }}
          >
            open floor plans →
          </Link>
        </div>
      </ScrollVideo>
    </div>
  )
}
