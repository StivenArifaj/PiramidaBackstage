'use client'

import Link from 'next/link'
import { BrandStrip } from '@/components/ui/brand-strip'
import { SectionDivider } from '@/components/ui/section-divider'
import { ScrollVideo } from '@/components/pyramid/scroll-video'

const BUILDING_STATS = [
  { value: '80+', label: 'spaces' },
  { value: '5',   label: 'floors' },
  { value: '300', label: 'max pax' },
  { value: '16',  label: 'ext. boxes' },
]

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

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-concrete-char)' }}>
      <BrandStrip />

      {/* ── Scroll-scrubbed video hero ──────────────────────────────────── */}
      <ScrollVideo
        framesFolder="/frames/hero"
        frameCount={300}
        overlayLabel="event coordination platform"
        overlayTitle="PIRAMIDA E SHQIPËRISË"
        overlaySubtitle="EST. 1988 · REIMAGINED 2023 · BACKSTAGE 2026"
        scrollHeight="300vh"
      >
        {/* Stats panel — top right */}
        <div
          style={{
            position: 'absolute',
            top: '72px',
            right: '40px',
            border: '2px solid rgba(245,245,240,0.18)',
            backgroundColor: 'rgba(10,10,10,0.62)',
            zIndex: 2,
          }}
        >
          {BUILDING_STATS.map(({ value, label }, i) => (
            <div
              key={label}
              style={{
                padding: '14px 22px',
                borderBottom:
                  i < BUILDING_STATS.length - 1
                    ? '1px solid rgba(245,245,240,0.1)'
                    : 'none',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '22px',
                  fontWeight: 500,
                  color: 'var(--color-concrete-bone)',
                  margin: 0,
                  letterSpacing: '0.03em',
                }}
              >
                {value}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '8px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,245,240,0.38)',
                  margin: '3px 0 0',
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA buttons — bottom right */}
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

      {/* ── Diagonal transition: dark → bone ───────────────────────────── */}
      <SectionDivider
        fromColor="var(--color-concrete-char)"
        toColor="var(--color-concrete-bone)"
        height={80}
      />

      {/* ── Manifesto ──────────────────────────────────────────────────── */}
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
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-concrete-gray)',
                margin: '0 0 20px',
              }}
            >
              the problem
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3vw, 38px)',
                fontWeight: 500,
                letterSpacing: '0.01em',
                color: 'var(--color-concrete-char)',
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              30 emails. 4 spreadsheets. 2 phone calls. Replaced by one sentence.
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'var(--color-concrete-gray)',
                margin: '24px 0 0',
                maxWidth: '460px',
              }}
            >
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
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-concrete-gray)',
                margin: '0 0 16px',
              }}
            >
              building specs
            </p>
            {BUILDING_SPECS.map(({ label, value }, i) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  padding: '10px 0',
                  borderBottom:
                    i < BUILDING_SPECS.length - 1
                      ? '1px solid var(--color-concrete-mid)'
                      : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-concrete-gray)',
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--color-concrete-char)',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature strip ──────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: '2px solid var(--color-concrete-char)',
          borderBottom: '2px solid var(--color-concrete-char)',
          backgroundColor: 'var(--color-concrete-bone)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {FEATURES.map(({ num, title, body }, i) => (
            <div
              key={title}
              style={{
                padding: '40px 32px',
                borderRight:
                  i < FEATURES.length - 1
                    ? '2px solid var(--color-concrete-char)'
                    : 'none',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--color-lime-ink)',
                  backgroundColor: 'var(--color-lime)',
                  padding: '2px 7px',
                  marginBottom: '18px',
                }}
              >
                {num}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  color: 'var(--color-concrete-char)',
                  margin: '0 0 12px',
                  textTransform: 'lowercase',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  lineHeight: 1.65,
                  color: 'var(--color-concrete-gray)',
                  margin: 0,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dark CTA ───────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--color-concrete-char)',
          padding: '72px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '32px',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-concrete-gray)',
              margin: '0 0 10px',
            }}
          >
            start here
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 3vw, 36px)',
              fontWeight: 500,
              letterSpacing: '0.01em',
              color: 'var(--color-concrete-bone)',
              margin: 0,
            }}
          >
            pick a floor. pick a space. book it.
          </h2>
        </div>
        <Link
          href="/spaces"
          style={{
            flexShrink: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-lime-ink)',
            backgroundColor: 'var(--color-lime)',
            padding: '16px 40px',
            border: '2px solid var(--color-lime-ink)',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          explore the pyramid →
        </Link>
      </section>
    </div>
  )
}
