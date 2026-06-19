'use client'

import { Pill } from '@/components/ui/pill'
import type { SpaceFloor } from '@/types/api'

const FLOORS: Array<{ key: SpaceFloor; label: string; label_sq: string; topPct: string; leftPct: string }> = [
  { key: 'roof',      label: 'Roof L+4',       label_sq: 'Çatia L+4',     topPct: '8%',  leftPct: '50%' },
  { key: 'l3',        label: '3rd Floor',       label_sq: 'Kati 3',        topPct: '26%', leftPct: '50%' },
  { key: 'l0',        label: 'Ground Floor',    label_sq: 'Kati Përdhes',  topPct: '50%', leftPct: '50%' },
  { key: 'l_minus_1', label: 'B1 Floor',        label_sq: 'Kati B1',       topPct: '64%', leftPct: '50%' },
  { key: 'exterior',  label: 'Exterior Boxes',  label_sq: 'Kutitë Jashtë', topPct: '80%', leftPct: '50%' },
]

interface FloorSelectorProps {
  activeFloor?: SpaceFloor
  onFloorSelect: (floor: SpaceFloor) => void
  lang?: 'en' | 'sq'
}

export function FloorSelector({ activeFloor = 'l0', onFloorSelect, lang = 'en' }: FloorSelectorProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: '16/9',
        border: '2px solid var(--color-concrete-char)',
        backgroundImage: "url('/references/front-elevation.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundColor: 'var(--color-concrete-char)',
      }}
    >
      {/* Dark overlay for contrast */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(10,10,10,0.35)' }}
      />

      {/* Floor pills */}
      {FLOORS.map((floor) => (
        <div
          key={floor.key}
          className="absolute -translate-x-1/2"
          style={{ top: floor.topPct, left: floor.leftPct }}
        >
          <Pill
            label={lang === 'sq' ? floor.label_sq : floor.label}
            active={activeFloor === floor.key}
            onClick={() => onFloorSelect(floor.key)}
          />
        </div>
      ))}

      {/* Label */}
      <div className="absolute bottom-4 left-4">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.5)' }}>
          pyramid of tirana — select floor
        </p>
      </div>
    </div>
  )
}
