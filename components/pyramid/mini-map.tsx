'use client'

import { cn } from '@/lib/utils'
import type { SpaceFloor } from '@/types/api'

const FLOOR_Y_PCT: Record<SpaceFloor, number> = {
  roof:      6,
  l3:        24,
  l0:        44,
  l_minus_1: 62,
  exterior:  80,
}

interface MiniMapProps {
  activeFloor?: SpaceFloor
  onFloorClick?: (floor: SpaceFloor) => void
  className?: string
}

export function MiniMap({ activeFloor = 'l0', onFloorClick, className }: MiniMapProps) {
  return (
    <div
      className={cn('fixed bottom-4 right-4 z-40 p-2', className)}
      style={{ border: '2px solid var(--color-concrete-char)', backgroundColor: 'var(--color-concrete-bone)' }}
      aria-label="Floor navigator"
    >
      <svg width="56" height="76" viewBox="0 0 56 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pyramid silhouette */}
        <polygon points="28,3 53,70 3,70" fill="#e8e6dd" stroke="#1a1a1a" strokeWidth="1.5" />

        {/* Floor level indicators */}
        {(Object.entries(FLOOR_Y_PCT) as [SpaceFloor, number][]).map(([floor, yPct]) => {
          const y = 3 + (yPct / 100) * 67
          const halfW = ((y - 3) / 67) * 25
          const isActive = activeFloor === floor
          return (
            <g key={floor} style={{ cursor: onFloorClick ? 'pointer' : 'default' }} onClick={() => onFloorClick?.(floor)}>
              <line
                x1={28 - halfW} y1={y}
                x2={28 + halfW} y2={y}
                stroke={isActive ? '#c8da2b' : '#6b7280'}
                strokeWidth={isActive ? 2 : 0.75}
              />
              {isActive && (
                <circle cx={28 + halfW + 4} cy={y} r="3" fill="#c8da2b" />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
