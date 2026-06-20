'use client'

import type { SpaceFloor, SpaceWithAvailability } from '@/types/api'
import { GroundFloorPlan } from './floor-plans/ground-floor'
import { L3FloorPlan } from './floor-plans/l3'
import { LMinusOneFloorPlan } from './floor-plans/l_minus_1'
import { RoofFloorPlan } from './floor-plans/roof'
import { ExteriorFloorPlan } from './floor-plans/exterior'

const PLAN_BACKGROUNDS: Record<SpaceFloor, string> = {
  l0:       "url('/sketches/plan-groundfloor.jpeg')",
  l_minus_1: "url('/sketches/plan-level-01-basement.jpeg')",
  l3:       "url('/sketches/plan-level-03.jpeg')",
  roof:     "url('/sketches/plan-level-04.jpeg')",
  exterior: "url('/sketches/plan-topview.jpeg')",
}

// Per-floor zoom: scale + translate to center the cluster on screen.
// translate(tx%, ty%) moves the cluster center to the viewport center before scale.
// Formula (with transform-origin 50% 50%): tx = 50 - cx, ty = 50 - cy
const FLOOR_ZOOM: Record<SpaceFloor, { scale: number; tx: number; ty: number }> = {
  l0:       { scale: 1,   tx: 0,  ty: 0  },
  l_minus_1: { scale: 2.5, tx: 0,  ty: 14 },
  l3:       { scale: 3.5, tx: 1,  ty: 12 },
  roof:     { scale: 3.5, tx: 1,  ty: 24 },
  exterior: { scale: 1.2, tx: 0,  ty: 0  },
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
  const z = FLOOR_ZOOM[floor]

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: '#f5f5f0' }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: bgImage,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          transform: z.scale !== 1
            ? `scale(${z.scale}) translate(${z.tx}%, ${z.ty}%)`
            : undefined,
          transformOrigin: '50% 50%',
        }}
      >
        {renderFloor(floor, spaces, onSpaceClick)}
      </div>
    </div>
  )
}
