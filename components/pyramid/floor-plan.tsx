'use client'

import type { SpaceFloor, SpaceWithAvailability } from '@/types/api'
import { GroundFloorPlan } from './floor-plans/ground-floor'
import { L3FloorPlan } from './floor-plans/l3'
import { LMinusOneFloorPlan } from './floor-plans/l_minus_1'
import { RoofFloorPlan } from './floor-plans/roof'
import { ExteriorFloorPlan } from './floor-plans/exterior'

const PLAN_BACKGROUNDS: Record<SpaceFloor, string> = {
  l0: "url('/sketches/plan-groundfloor.jpeg')",
  l_minus_1: "url('/sketches/plan-level-01-basement.jpeg')",
  l3: "url('/sketches/plan-level-03.jpeg')",
  roof: "url('/sketches/plan-level-04.jpeg')",
  exterior: "url('/sketches/plan-topview.jpeg')",
}

interface FloorPlanProps {
  floor: SpaceFloor
  spaces: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

function renderFloor(floor: SpaceFloor, spaces: SpaceWithAvailability[], onSpaceClick?: (code: string) => void) {
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
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}>
          {String(floor).toUpperCase()} — no floor plan available
        </div>
      )
  }
}

export function FloorPlan({ floor, spaces, onSpaceClick }: FloorPlanProps) {
  const bgImage = PLAN_BACKGROUNDS[floor]

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundImage: bgImage,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: '#f5f5f0',
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
        <div className="relative w-full h-full" style={{ pointerEvents: 'auto' }}>
          {renderFloor(floor, spaces, onSpaceClick)}
        </div>
      </div>
    </div>
  )
}
