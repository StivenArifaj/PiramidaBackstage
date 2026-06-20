'use client'

import { Pill } from '@/components/ui/pill'
import type { SpaceFloor } from '@/types/api'

// Image dimensions: section-bb.jpeg = 1600×910 (aspect 1.758)
// Positions calibrated against the MVRDV architectural cross-section:
//   roof      → topmost slab at the pyramid apex, ~35% from top, centered
//   l3        → third-level stepped terrace, ~42% from top, centered
//   l0        → ground floor slab at the base of above-grade structure, ~50% from top, centered
//   l_minus_1 → basement slab below grade, ~66% from top, centered
//   exterior  → exterior boxes at grade flanking the building, ~50% from top, ~12% from left
const FLOORS: Array<{
  key: SpaceFloor
  label: string
  label_sq: string
  elevation: string
  topPct: string
  leftPct: string
  lineDir: 'left' | 'right' | 'none'
}> = [
  {
    key: 'roof',
    label: 'Roof',
    label_sq: 'Çatia',
    elevation: '+4',
    topPct: '35%',
    leftPct: '50%',
    lineDir: 'right',
  },
  {
    key: 'l3',
    label: '3rd Floor',
    label_sq: 'Kati 3',
    elevation: '+3',
    topPct: '42%',
    leftPct: '50%',
    lineDir: 'right',
  },
  {
    key: 'l0',
    label: 'Ground Floor',
    label_sq: 'Kati Përdhes',
    elevation: '±0',
    topPct: '50%',
    leftPct: '50%',
    lineDir: 'right',
  },
  {
    key: 'l_minus_1',
    label: 'B1 Floor',
    label_sq: 'Kati B1',
    elevation: '-1',
    topPct: '66%',
    leftPct: '50%',
    lineDir: 'right',
  },
  {
    // Exterior boxes ring the perimeter at grade — shown outside (left) of the building
    key: 'exterior',
    label: 'Ext. Boxes',
    label_sq: 'Kutitë Ext.',
    elevation: 'EX',
    topPct: '50%',
    leftPct: '12%',
    lineDir: 'left',
  },
]

interface FloorSelectorProps {
  activeFloor?: SpaceFloor
  onFloorSelect: (floor: SpaceFloor) => void
  lang?: 'en' | 'sq'
}

export function FloorSelector({
  activeFloor = 'l0',
  onFloorSelect,
  lang = 'en',
}: FloorSelectorProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: '1600/910',
        border: '2px solid var(--color-concrete-char)',
        backgroundImage: "url('/sketches/section-bb.jpeg')",
        backgroundSize: 'contain',
        backgroundPosition: 'center center',
        backgroundColor: 'var(--color-concrete-black)',
      }}
    >
      {/* Subtle gradient scrim — pills stay legible, image detail shows through */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(180deg, rgba(10,10,10,0.20) 0%, rgba(10,10,10,0.08) 50%, rgba(10,10,10,0.28) 100%)',
        }}
      />

      {/* Floor pills with leader lines */}
      {FLOORS.map((floor) => {
        const isActive = activeFloor === floor.key

        return (
          <div
            key={floor.key}
            className="absolute"
            style={{ top: floor.topPct, left: floor.leftPct, transform: 'translate(-50%, -50%)' }}
          >
            {/* Leader line — extends from pill toward building edge */}
            {isActive && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '50%',
                  [floor.lineDir === 'right' ? 'left' : 'right']: '100%',
                  width: '40px',
                  height: '1px',
                  backgroundColor: 'var(--color-lime)',
                  transform: 'translateY(-50%)',
                  marginLeft: floor.lineDir === 'right' ? '6px' : 0,
                  marginRight: floor.lineDir === 'left' ? '6px' : 0,
                }}
              />
            )}

            {/* Elevation tag — JetBrains Mono, shown beside active pill */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  [floor.lineDir === 'right' ? 'right' : 'left']: 'calc(100% + 50px)',
                  transform: 'translateY(-50%)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.1em',
                  color: 'var(--color-lime)',
                  whiteSpace: 'nowrap',
                }}
              >
                {floor.elevation}
              </span>
            )}

            <Pill
              label={lang === 'sq' ? floor.label_sq : floor.label}
              active={isActive}
              onClick={() => onFloorSelect(floor.key)}
            />
          </div>
        )
      })}

      {/* Label strip */}
      <div className="absolute bottom-3 left-4">
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(245,245,240,0.4)',
            margin: 0,
          }}
        >
          pyramid of tirana — select floor
        </p>
      </div>

      {/* Active floor name — bottom right */}
      <div className="absolute bottom-3 right-4">
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-lime)',
            margin: 0,
          }}
        >
          {FLOORS.find((f) => f.key === activeFloor)?.[lang === 'sq' ? 'label_sq' : 'label'] ?? ''}
        </p>
      </div>
    </div>
  )
}
