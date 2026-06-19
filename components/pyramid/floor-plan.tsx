'use client'

import type { SpaceFloor, SpaceWithAvailability } from '@/types/api'
import { GroundFloorPlan } from './floor-plans/ground-floor'

interface FloorPlanProps {
  floor: SpaceFloor
  spaces: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function FloorPlan({ floor, spaces, onSpaceClick }: FloorPlanProps) {
  switch (floor) {
    case 'l0':
      return <GroundFloorPlan spaces={spaces} onSpaceClick={onSpaceClick} />
    default:
      return (
        <div
          className="flex items-center justify-center w-full aspect-square"
          style={{ border: '2px solid var(--color-concrete-char)', backgroundColor: 'var(--color-concrete-mid)' }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}>
            {floor.toUpperCase()} — floor plan coming in Phase 4
          </p>
        </div>
      )
  }
}
