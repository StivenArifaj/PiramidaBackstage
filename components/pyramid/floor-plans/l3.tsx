'use client'

import { useState } from 'react'
import type { SpaceWithAvailability, AvailabilityState } from '@/types/api'

// Mapper % → SVG viewBox (1600×1131)
function pts(pctStr: string): string {
  return pctStr.split(' ').map(pair => {
    const [x, y] = pair.split(',').map(Number)
    return `${(x * 16 - 120).toFixed(1)},${(y * 11.31 - 15).toFixed(1)}`
  }).join(' ')
}

function centroid(svgPts: string): { x: number; y: number } {
  const coords = svgPts.split(' ').map(p => p.split(',').map(Number))
  return {
    x: coords.reduce((a, p) => a + p[0], 0) / coords.length,
    y: coords.reduce((a, p) => a + p[1], 0) / coords.length,
  }
}

interface SpaceDef {
  code:      string
  pctPoints: string
  area:      number
  capacity:  number
  rate:      number
}

const SPACES: SpaceDef[] = [
  { code: 'C1', pctPoints: '47.97,33.21 48.19,36.25 51.2,36.56 51.41,33.51',  area: 55,  capacity: 45,  rate: 90  },
  { code: 'C2', pctPoints: '46.47,34.43 48.62,34.73 48.62,37.17 46.9,37.47',  area: 42,  capacity: 35,  rate: 78  },
  { code: 'C4', pctPoints: '51.63,32.45 53.14,36.41 50.98,38.23 49.69,34.58', area: 50,  capacity: 40,  rate: 85  },
  { code: 'C5', pctPoints: '48.19,38.23 51.41,37.32 50.55,34.58 47.54,34.88', area: 48,  capacity: 38,  rate: 82  },
  { code: 'C6', pctPoints: '52.27,40.36 54,40.06 52.92,36.71 50.98,37.01',    area: 44,  capacity: 36,  rate: 80  },
  { code: 'C7', pctPoints: '48.19,39.45 48.83,37.62 47.11,36.71 45.82,38.54', area: 38,  capacity: 30,  rate: 72  },
  { code: 'C8', pctPoints: '48.83,41.58 48.19,43.1 46.25,41.28 46.9,39.15',   area: 36,  capacity: 28,  rate: 70  },
]

const FILL: Record<AvailabilityState, string> = {
  available: '#c8da2b',
  reserved:  '#e63946',
  blocked:   '#6b7280',
  pending:   '#f4a261',
}
const FILL_OPACITY: Record<AvailabilityState, number> = {
  available: 0.82,
  reserved:  0.78,
  blocked:   0.48,
  pending:   0.72,
}

interface TooltipState {
  x: number; y: number
  space: SpaceDef
  availability: AvailabilityState
}

interface L3FloorPlanProps {
  spaces?: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function L3FloorPlan({ spaces = [], onSpaceClick }: L3FloorPlanProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const spaceMap = new Map(spaces.map(s => [s.code, s]))

  function getAvailability(code: string): AvailabilityState {
    return spaceMap.get(code)?.availability ?? 'available'
  }

  function handleMouseEnter(e: React.MouseEvent<SVGGElement>, def: SpaceDef) {
    const svg = e.currentTarget.closest('svg') as SVGElement | null
    if (!svg) return
    const svgRect   = svg.getBoundingClientRect()
    const groupRect = (e.currentTarget as SVGElement).getBoundingClientRect()
    setHovered(def.code)
    setTooltip({
      x: groupRect.left + groupRect.width / 2 - svgRect.left,
      y: groupRect.top  - svgRect.top,
      space: def,
      availability: getAvailability(def.code),
    })
  }

  return (
    <div className="absolute inset-0 w-full h-full select-none overflow-hidden">
      <svg
        viewBox="0 0 1415 1081"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ background: 'transparent', pointerEvents: 'none' }}
        aria-label="3rd Floor — Pyramid of Tirana"
      >
        {SPACES.map((def) => {
          const availability = getAvailability(def.code)
          const fill         = FILL[availability]
          const fillOpacity  = FILL_OPACITY[availability]
          const isHov        = hovered === def.code
          const svgPoints    = pts(def.pctPoints)
          const c            = centroid(svgPoints)

          return (
            <g
              key={def.code}
              role="button"
              tabIndex={0}
              aria-label={`${def.code} — ${availability} — ${def.capacity} pax`}
              style={{ cursor: 'pointer' }}
              onClick={() => onSpaceClick?.(def.code)}
              onMouseEnter={(e) => handleMouseEnter(e, def)}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              onKeyDown={(e) => e.key === 'Enter' && onSpaceClick?.(def.code)}
            >
              <polygon
                points={svgPoints}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke="#1a1a1a"
                strokeWidth={isHov ? 3 : 1.5}
                strokeLinejoin="round"
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              />
              {isHov && (
                <polygon
                  points={svgPoints}
                  fill="none"
                  stroke="#c8da2b"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              )}
              <text
                x={c.x}
                y={c.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="600"
                letterSpacing="0.06em"
                fill={
                  availability === 'available' ? '#3a4a08' :
                  availability === 'reserved'  ? '#4a0808' : '#1a1a1a'
                }
                style={{ fontFamily: 'JetBrains Mono, monospace', pointerEvents: 'none' }}
              >
                {def.code}
              </text>
            </g>
          )
        })}

        {/* ── Legend ── */}
        <g transform="translate(20, 1088)">
          {([
            { label: 'available', color: '#c8da2b' },
            { label: 'reserved',  color: '#e63946' },
            { label: 'pending',   color: '#f4a261' },
            { label: 'blocked',   color: '#6b7280' },
          ] as const).map(({ label, color }, i) => (
            <g key={label} transform={`translate(${i * 110}, 0)`}>
              <rect width="10" height="10" fill={color} stroke="#1a1a1a" strokeWidth="1.5" />
              <text x="14" y="9" fontSize="9" fill="#6b7280" letterSpacing="0.06em"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {label}
              </text>
            </g>
          ))}
        </g>

        {/* ── Floor label ── */}
        <text
          x="1580" y="1118"
          textAnchor="end"
          fontSize="10"
          letterSpacing="0.18em"
          fill="#6b7280"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          3RD FLOOR — KATI 3
        </text>

        {/* ── Tooltip ── */}
        {tooltip && (() => {
          const tx = Math.min(Math.max(tooltip.x, 80), 920)
          const ty = Math.max(tooltip.y - 58, 8)
          return (
            <g transform={`translate(${tx}, ${ty})`} style={{ pointerEvents: 'none' }}>
              <rect x="-58" y="0" width="116" height="50" fill="#fafaf5" stroke="#1a1a1a" strokeWidth="2" />
              <rect x="-58" y="0" width="116" height="6"  fill={FILL[tooltip.availability]} fillOpacity="0.9" />
              <text x="0" y="22" textAnchor="middle" fontSize="10" fontWeight="500" fill="#1a1a1a"
                letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {tooltip.space.code}
              </text>
              <text x="0" y="34" textAnchor="middle" fontSize="8" fill="#6b7280"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {tooltip.space.capacity} pax · {tooltip.space.area} m²
              </text>
              <text x="0" y="44" textAnchor="middle" fontSize="8" fill="#5a6612"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                €{tooltip.space.rate}/hr
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
