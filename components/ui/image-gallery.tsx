'use client'

import { useState } from 'react'

interface GalleryImage {
  url: string
  label?: string
}

interface ImageGalleryProps {
  images?: GalleryImage[]
  title?: string
  spaceCode?: string
  accentColor?: string
}

const PLACEHOLDER_SLOTS = [
  'RENDERING · MAIN VIEW',
  'RENDERING · DETAIL ANGLE',
  'PLAN · FLOOR LAYOUT',
  'SECTION · CUT A–A',
  'RENDERING · AMBIENT',
  'RENDERING · CAPACITY SETUP',
]

export function ImageGallery({
  images,
  title,
  spaceCode = 'SPACE',
  accentColor = 'var(--color-lime)',
}: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  const items: GalleryImage[] =
    images && images.length > 0
      ? images
      : PLACEHOLDER_SLOTS.map((label) => ({ url: '', label }))

  const active = items[activeIdx]
  const patternId = `hatch-${spaceCode.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`

  return (
    <div style={{ borderBottom: '2px solid var(--color-concrete-char)' }}>
      {/* ── Main viewport ─────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          height: '62vh',
          minHeight: '480px',
          overflow: 'hidden',
          backgroundColor: '#0d0d0d',
          borderBottom: '2px solid var(--color-concrete-char)',
        }}
      >
        {active.url ? (
          <img
            src={active.url}
            alt={active.label ?? title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
        ) : (
          /* Placeholder — architectural hatch pattern, no gradients */
          <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Diagonal hatch — brutalist texture via SVG */}
            <svg
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
            >
              <defs>
                <pattern
                  id={patternId}
                  patternUnits="userSpaceOnUse"
                  width="20"
                  height="20"
                  patternTransform="rotate(30)"
                >
                  <line x1="0" y1="0" x2="0" y2="20" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>

            {/* Centre label block */}
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              {/* Cross-hair marks — pure geometric */}
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(245,245,240,0.12)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(245,245,240,0.12)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: '10px', height: '10px', transform: 'translate(-50%,-50%)', border: '2px solid rgba(245,245,240,0.15)' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.18)', margin: '0 0 10px' }}>
                {spaceCode} · {active.label ?? PLACEHOLDER_SLOTS[activeIdx]}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, letterSpacing: '-0.02em', color: 'rgba(245,245,240,0.06)', margin: 0 }}>
                {title ?? 'RENDERING'}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.1)', margin: '14px 0 0', border: '1px solid rgba(245,245,240,0.06)', display: 'inline-block', padding: '4px 10px' }}>
                [ NO IMAGE · PLACEHOLDER ]
              </p>
            </div>
          </div>
        )}

        {/* View label — top left */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            border: '2px solid rgba(245,245,240,0.12)',
            backgroundColor: 'rgba(10,10,10,0.82)',
            padding: '7px 12px',
            zIndex: 2,
          }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.5)', margin: 0 }}>
            {active.label ?? `VIEW ${String(activeIdx + 1).padStart(2, '0')}`}
          </p>
        </div>

        {/* Counter — top right */}
        <p
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(245,245,240,0.28)',
            margin: 0,
            zIndex: 2,
          }}
        >
          {String(activeIdx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </p>

        {/* Nav arrows — bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            gap: '2px',
            zIndex: 2,
          }}
        >
          {(['←', '→'] as const).map((glyph, dir) => {
            const disabled = dir === 0 ? activeIdx === 0 : activeIdx === items.length - 1
            return (
              <button
                key={glyph}
                onClick={() => setActiveIdx((i) => dir === 0 ? Math.max(0, i - 1) : Math.min(items.length - 1, i + 1))}
                disabled={disabled}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  padding: '9px 18px',
                  border: '2px solid rgba(245,245,240,0.15)',
                  backgroundColor: 'rgba(10,10,10,0.85)',
                  color: disabled ? 'rgba(245,245,240,0.12)' : 'rgba(245,245,240,0.65)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  lineHeight: 1,
                }}
              >
                {glyph}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Thumbnail strip ─────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(items.length, 6)}, 1fr)`,
          gap: '2px',
          backgroundColor: '#0a0a0a',
          padding: '2px',
        }}
      >
        {items.slice(0, 6).map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            style={{
              aspectRatio: '16 / 9',
              border: i === activeIdx ? `2px solid ${accentColor}` : '2px solid rgba(245,245,240,0.06)',
              backgroundColor: '#0d0d0d',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              padding: 0,
              display: 'block',
            }}
          >
            {item.url ? (
              <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.14em', color: 'rgba(245,245,240,0.18)', margin: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </p>
              </div>
            )}
            {/* Active lime accent bar */}
            {i === activeIdx && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: accentColor }} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
