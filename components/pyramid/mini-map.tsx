'use client'

import { cn } from '@/lib/utils'
import type { SpaceFloor } from '@/types/api'

// ─── Stepped pyramid tier definitions ────────────────────────────────────────
// Building cross-section from top (Roof) to bottom (Exterior).
// Each tier steps outward as you descend — architecturally accurate for the
// Pyramid of Tirana (MVRDV), which is a step pyramid widening at the base.
// viewBox = 0 0 62 78

const TIER_HEIGHT = 11
const TIER_GAP    = 2
const SVG_W       = 62
const ATOP        = 4   // top margin

const TIERS: { floor: SpaceFloor; w: number; label: string }[] = [
  { floor: 'roof',      w: 12, label: 'RF' },
  { floor: 'l3',        w: 22, label: 'L3' },
  { floor: 'l0',        w: 34, label: 'L0' },
  { floor: 'l_minus_1', w: 44, label: 'B1' },
  { floor: 'exterior',  w: 56, label: 'EX' },
]

interface MiniMapProps {
  activeFloor?: SpaceFloor
  onFloorClick?: (floor: SpaceFloor) => void
  className?: string
}

export function MiniMap({ activeFloor = 'l0', onFloorClick, className }: MiniMapProps) {
  const totalH = ATOP + TIERS.length * TIER_HEIGHT + (TIERS.length - 1) * TIER_GAP + 4

  return (
    <div
      className={cn('fixed bottom-4 right-4 z-40 p-2', className)}
      style={{
        border: '2px solid var(--color-concrete-char)',
        backgroundColor: 'var(--color-concrete-bone)',
      }}
      aria-label="Floor navigator"
    >
      <svg
        width={SVG_W}
        height={totalH}
        viewBox={`0 0 ${SVG_W} ${totalH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {TIERS.map(({ floor, w, label }, i) => {
          const x       = (SVG_W - w) / 2
          const y       = ATOP + i * (TIER_HEIGHT + TIER_GAP)
          const isActive = activeFloor === floor

          return (
            <g
              key={floor}
              style={{ cursor: onFloorClick ? 'pointer' : 'default' }}
              onClick={() => onFloorClick?.(floor)}
              role={onFloorClick ? 'button' : undefined}
              aria-label={label}
            >
              {/* Tier rectangle */}
              <rect
                x={x}
                y={y}
                width={w}
                height={TIER_HEIGHT}
                fill={isActive ? '#c8da2b' : '#e8e6dd'}
                stroke="#1a1a1a"
                strokeWidth={isActive ? 2 : 1}
              />

              {/* Active lime accent: left edge bar */}
              {isActive && (
                <rect
                  x={x}
                  y={y}
                  width={3}
                  height={TIER_HEIGHT}
                  fill="#1a1a1a"
                />
              )}

              {/* Floor label */}
              <text
                x={SVG_W / 2}
                y={y + TIER_HEIGHT / 2 + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="6"
                fontWeight={isActive ? '500' : '400'}
                fill={isActive ? '#5a6612' : '#6b7280'}
                letterSpacing="0.08em"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {label}
              </text>

              {/* Active indicator dot — right side */}
              {isActive && (
                <circle
                  cx={x + w + 5}
                  cy={y + TIER_HEIGHT / 2}
                  r="2.5"
                  fill="#c8da2b"
                  stroke="#1a1a1a"
                  strokeWidth="1"
                />
              )}
            </g>
          )
        })}

        {/* Vertical spine connecting all tiers */}
        <line
          x1={SVG_W / 2}
          y1={ATOP}
          x2={SVG_W / 2}
          y2={ATOP + TIERS.length * TIER_HEIGHT + (TIERS.length - 1) * TIER_GAP}
          stroke="#1a1a1a"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />
      </svg>
    </div>
  )
}
