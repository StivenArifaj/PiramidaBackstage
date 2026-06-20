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

      {/* Main layout: selector left, plan right */}
      <div style={{ paddingTop: '48px', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

        {/* Left: floor selector elevation */}
        <div style={{ borderRight: '2px solid var(--color-concrete-char)', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '32px 32px 24px', borderBottom: '2px solid var(--color-concrete-char)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', marginBottom: '8px' }}>
              pyramid of tirana
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, letterSpacing: '0.01em', color: 'var(--color-concrete-char)', margin: 0 }}>
              select a floor
            </h1>
          </div>

          {/* Elevation photo + pills */}
          <div style={{ padding: '32px', flex: 1 }}>
            <FloorSelector
              activeFloor={activeFloor}
              onFloorSelect={handleFloorSelect}
              lang="en"
            />
          </div>

          {/* Stats bar */}
          <div style={{ padding: '20px 32px', borderTop: '2px solid var(--color-concrete-char)', display: 'flex', gap: '32px' }}>
            {[
              { label: 'total spaces', value: '80+' },
              { label: 'floors',        value: '5' },
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

        {/* Right: interactive floor plan */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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

          {/* Interactive floor plan with official sketch background */}
          <div style={{ flex: 1, display: 'flex', borderBottom: '2px solid var(--color-concrete-char)' }}>
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
