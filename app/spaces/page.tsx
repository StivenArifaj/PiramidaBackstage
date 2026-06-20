'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandStrip } from '@/components/ui/brand-strip'
import { FloorSelector } from '@/components/pyramid/floor-selector'
import { FloorPlan } from '@/components/pyramid/floor-plan'
import { MiniMap } from '@/components/pyramid/mini-map'
import { FLOOR_LABELS } from '@/types/domain'
import type { SpaceFloor, SpaceWithAvailability } from '@/types/api'

const DEMO_SPACES: SpaceWithAvailability[] = [
  { id: '1',  code: 'A1',  name: 'Exhibition Room A1',  floor: 'l0', category: 'extension', area_sqm: 85,  capacity_pax: 90,  hourly_rate_eur: 120, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '2',  code: 'A2',  name: 'Exhibition Room A2',  floor: 'l0', category: 'extension', area_sqm: 92,  capacity_pax: 100, hourly_rate_eur: 130, setup_types: [], features: [], photo_urls: [], availability: 'reserved'  },
  { id: '3',  code: 'A3',  name: 'Exhibition Room A3',  floor: 'l0', category: 'extension', area_sqm: 88,  capacity_pax: 95,  hourly_rate_eur: 125, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '4',  code: 'A4',  name: 'Exhibition Room A4',  floor: 'l0', category: 'extension', area_sqm: 95,  capacity_pax: 110, hourly_rate_eur: 135, setup_types: [], features: [], photo_urls: [], availability: 'pending'   },
  { id: '5',  code: 'A5',  name: 'Exhibition Room A5',  floor: 'l0', category: 'extension', area_sqm: 105, capacity_pax: 120, hourly_rate_eur: 145, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '6',  code: 'A6',  name: 'Exhibition Room A6',  floor: 'l0', category: 'extension', area_sqm: 98,  capacity_pax: 108, hourly_rate_eur: 138, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '7',  code: 'A7',  name: 'Exhibition Room A7',  floor: 'l0', category: 'extension', area_sqm: 90,  capacity_pax: 98,  hourly_rate_eur: 128, setup_types: [], features: [], photo_urls: [], availability: 'reserved'  },
  { id: '8',  code: 'A8',  name: 'Exhibition Room A8',  floor: 'l0', category: 'extension', area_sqm: 87,  capacity_pax: 94,  hourly_rate_eur: 122, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '9',  code: 'A9',  name: 'Exhibition Room A9',  floor: 'l0', category: 'extension', area_sqm: 88,  capacity_pax: 96,  hourly_rate_eur: 124, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '10', code: 'A10', name: 'Exhibition Room A10', floor: 'l0', category: 'extension', area_sqm: 92,  capacity_pax: 100, hourly_rate_eur: 130, setup_types: [], features: [], photo_urls: [], availability: 'blocked'   },
  { id: '11', code: 'A11', name: 'Exhibition Room A11', floor: 'l0', category: 'extension', area_sqm: 95,  capacity_pax: 105, hourly_rate_eur: 135, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '12', code: 'A12', name: 'Exhibition Room A12', floor: 'l0', category: 'extension', area_sqm: 100, capacity_pax: 112, hourly_rate_eur: 140, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '13', code: 'A13', name: 'Exhibition Room A13', floor: 'l0', category: 'extension', area_sqm: 96,  capacity_pax: 106, hourly_rate_eur: 136, setup_types: [], features: [], photo_urls: [], availability: 'pending'   },
  { id: '14', code: 'A14', name: 'Exhibition Room A14', floor: 'l0', category: 'extension', area_sqm: 90,  capacity_pax: 98,  hourly_rate_eur: 128, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '15', code: 'A15', name: 'Exhibition Room A15', floor: 'l0', category: 'extension', area_sqm: 87,  capacity_pax: 93,  hourly_rate_eur: 122, setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '16', code: 'A16', name: 'Exhibition Room A16', floor: 'l0', category: 'extension', area_sqm: 84,  capacity_pax: 90,  hourly_rate_eur: 120, setup_types: [], features: [], photo_urls: [], availability: 'reserved'  },
  { id: '17', code: 'A17', name: 'Entrance Node A17',   floor: 'l0', category: 'extension', area_sqm: 42,  capacity_pax: 38,  hourly_rate_eur: 75,  setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '18', code: 'A18', name: 'Entrance Node A18',   floor: 'l0', category: 'extension', area_sqm: 42,  capacity_pax: 38,  hourly_rate_eur: 75,  setup_types: [], features: [], photo_urls: [], availability: 'available' },
  { id: '19', code: 'A19', name: 'Entrance Node A19',   floor: 'l0', category: 'extension', area_sqm: 40,  capacity_pax: 35,  hourly_rate_eur: 70,  setup_types: [], features: [], photo_urls: [], availability: 'pending'   },
]

export default function SpacesPage() {
  const router = useRouter()
  const [activeFloor, setActiveFloor] = useState<SpaceFloor>('l0')
  function handleFloorSelect(floor: SpaceFloor) {
    setActiveFloor(floor)
  }

  function handleSpaceClick(code: string) {
    router.push(`/spaces/${code.toLowerCase()}`)
  }

  const floorLabel = FLOOR_LABELS[activeFloor]

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
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 500, color: 'var(--color-lime-ink)', letterSpacing: '0.04em' }}>
                {DEMO_SPACES.filter(s => s.availability === 'available').length}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-lime-ink)' }}>
                available
              </span>
            </div>
          </div>

          {/* SVG floor plan */}
          <div style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FloorPlan
              floor={activeFloor}
              spaces={DEMO_SPACES}
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
