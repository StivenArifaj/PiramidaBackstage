'use client'

import type { SpaceFloor, SpaceWithAvailability } from '@/types/api'
import { GroundFloorPlan } from './floor-plans/ground-floor'
import { L3FloorPlan } from './floor-plans/l3'
import { LMinusOneFloorPlan } from './floor-plans/l_minus_1'
import { RoofFloorPlan } from './floor-plans/roof'
import { ExteriorFloorPlan } from './floor-plans/exterior'

interface FloorPlanProps {
  floor: SpaceFloor
  spaces: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function FloorPlan({ floor, spaces, onSpaceClick }: FloorPlanProps) {
  switch (floor) {
    case 'l0':
      return <GroundFloorPlan spaces={spaces} onSpaceClick={onSpaceClick} />
    case 'l3':
      return <L3FloorPlan spaces={spaces} onSpaceClick={onSpaceClick} />
    case 'l_minus_1':
      return <LMinusOneFloorPlan spaces={spaces} onSpaceClick={onSpaceClick} />
    case 'roof':
      return <RoofFloorPlan spaces={spaces} onSpaceClick={onSpaceClick} />
    case 'exterior':
      return <ExteriorFloorPlan spaces={spaces} onSpaceClick={onSpaceClick} />
    default:
      return (
        <div
          className="flex items-center justify-center w-full aspect-square"
          style={{ border: '2px solid var(--color-concrete-char)', backgroundColor: 'var(--color-concrete-mid)' }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}>
            {String(floor).toUpperCase()} — no floor plan available
          </p>
        </div>
      )
  }
}
