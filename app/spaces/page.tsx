'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BrandStrip } from '@/components/ui/brand-strip'
import { FloorSelector } from '@/components/pyramid/floor-selector'
import { FloorPlan } from '@/components/pyramid/floor-plan'
import { MiniMap } from '@/components/pyramid/mini-map'
import { FLOOR_LABELS } from '@/types/domain'
import type { SpaceFloor, SpaceWithAvailability } from '@/types/api'

export default function SpacesPage() {
  const router = useRouter()
  const [activeFloor, setActiveFloor] = useState<SpaceFloor>('l0')
  const [spaces, setSpaces] = useState<SpaceWithAvailability[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/spaces?floor=${activeFloor}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setSpaces(data.spaces ?? [])
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSpaces([])
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [activeFloor])

  function handleFloorSelect(floor: SpaceFloor) {
    setActiveFloor(floor)
  }

  function handleSpaceClick(code: string) {
    router.push(`/spaces/${code.toLowerCase()}`)
  }

  const floorLabel = FLOOR_LABELS[activeFloor]
  const availableCount = spaces.filter(s => s.availability === 'available').length

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-concrete-bone)' }}>
      <BrandStrip />

      {/* Main layout: selector left, plan right — stacks on mobile */}
      <div className="pt-12 grid grid-cols-1 md:grid-cols-2 min-h-screen">

        {/* Left: floor selector elevation — full border-b on mobile, border-r on md+ */}
        <div
          className="flex flex-col border-b-2 md:border-b-0 md:border-r-2"
          style={{ borderColor: 'var(--color-concrete-char)' }}
        >
          {/* Asymmetric editorial header */}
          <div style={{ padding: '28px 32px 0', position: 'relative' }}>
            {/* Lime left-accent bar — inset from top/bottom, doesn't touch corners */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', left: 0, top: '16px', bottom: '16px',
                width: '3px', backgroundColor: 'var(--color-lime)',
              }}
            />

            {/* Row 1: label left, section ref pushed right */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px', paddingLeft: '12px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: 0 }}>
                pyramid of tirana
              </p>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', opacity: 0.45 }}>
                section B-B
              </span>
            </div>

            {/* Row 2: main heading, slightly indented */}
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, letterSpacing: '0.01em', color: 'var(--color-concrete-char)', margin: '0 0 24px', paddingLeft: '12px' }}>
              select a floor
            </h1>

            {/* Bottom border — starts 3px from left (after lime bar), runs to edge */}
            <div style={{ position: 'absolute', bottom: 0, left: '3px', right: 0, height: '2px', backgroundColor: 'var(--color-concrete-char)' }} />
          </div>

          {/* Elevation photo + pills */}
          <div className="p-4 flex-1 min-h-[360px] md:min-h-0">
            <FloorSelector
              activeFloor={activeFloor}
              onFloorSelect={handleFloorSelect}
              lang="en"
            />
          </div>

          {/* Stats bar — staggered: last stat pushed to far right */}
          <div
            style={{
              padding: '20px 32px',
              borderTop: '2px solid var(--color-concrete-char)',
              display: 'flex',
              alignItems: 'flex-end',
              position: 'relative',
            }}
          >
            {/* Lime accent notch at top-right of stats bar */}
            <div aria-hidden="true" style={{ position: 'absolute', top: -2, right: '32px', width: '40px', height: '2px', backgroundColor: 'var(--color-lime)' }} />
            {[
              { label: 'total spaces', value: '80+' },
              { label: 'floors',        value: '5' },
              { label: 'max capacity',  value: '300' },
            ].map(({ label, value }, i) => (
              <div key={label} style={{ marginLeft: i === 0 ? 0 : i === 1 ? '28px' : 'auto' }}>
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

        {/* Right: interactive floor plan */}
        <div className="flex flex-col">
          {/* Floor title */}
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

            {/* Available count badge */}
            <div style={{ border: '2px solid var(--color-lime)', padding: '6px 14px', backgroundColor: 'var(--color-lime)', display: 'flex', gap: '6px', alignItems: 'baseline' }}>
              {loading ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'var(--color-lime-ink)' }}>
                  loading…
                </span>
              ) : (
                <>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 500, color: 'var(--color-lime-ink)', letterSpacing: '0.04em' }}>
                    {availableCount}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-lime-ink)' }}>
                    available
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive floor plan — min-h on mobile so SVG isn't zero-height */}
          <div
            className="flex flex-1 min-h-[360px] md:min-h-0"
            style={{ borderBottom: '2px solid var(--color-concrete-char)' }}
          >
            <FloorPlan
              floor={activeFloor}
              spaces={spaces}
              onSpaceClick={handleSpaceClick}
            />
          </div>

          {/* Instruction hint */}
          <div style={{ padding: '16px 32px', borderTop: '1px solid var(--color-concrete-mid)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: 0 }}>
              click any space to view details and book
            </p>
          </div>
        </div>
      </div>

      {/* Persistent mini-map */}
      <MiniMap activeFloor={activeFloor} onFloorClick={setActiveFloor} />
    </div>
  )
}
