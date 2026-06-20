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

// E9/E10/E12/E13 dropped — centroid distance <0.2% from D3/D2/D1/D4 (Roof floor owns them)
const SPACES: SpaceDef[] = [
  { code: 'E1',  pctPoints: '28.83,15.25 31.41,15.25 31.62,21.04 29.04,20.73', area: 55,  capacity: 45,  rate: 88  },
  { code: 'E2',  pctPoints: '35.06,16.78 37,14.95 39.15,18.91 37.43,21.04',    area: 52,  capacity: 42,  rate: 85  },
  { code: 'E3',  pctPoints: '45.61,8.26 44.96,13.73 48.83,14.65 49.26,9.17',   area: 58,  capacity: 48,  rate: 90  },
  { code: 'E4',  pctPoints: '52.7,7.34 52.06,10.69 54.86,12.52 55.72,8.26',    area: 50,  capacity: 40,  rate: 85  },
  { code: 'E5',  pctPoints: '60.23,9.78 59.59,13.43 63.25,15.25 64.32,12.21',  area: 54,  capacity: 44,  rate: 88  },
  { code: 'E6',  pctPoints: '63.46,20.43 61.31,22.86 63.46,26.52 65.83,23.17', area: 48,  capacity: 38,  rate: 82  },
  { code: 'E7',  pctPoints: '67.76,20.43 69.27,16.47 72.5,18.91 70.78,23.17',  area: 52,  capacity: 42,  rate: 85  },
  { code: 'E8',  pctPoints: '71.21,24.69 71.21,28.04 74.86,28.34 75.29,24.99', area: 46,  capacity: 36,  rate: 80  },
  { code: 'E11', pctPoints: '29.69,35.34 29.69,38.38 33.99,38.38 33.77,35.65', area: 44,  capacity: 34,  rate: 78  },
  { code: 'E14', pctPoints: '67.76,51.47 68.84,54.82 72.07,52.38 71.21,49.34', area: 50,  capacity: 40,  rate: 83  },
  { code: 'E15', pctPoints: '40.23,54.21 38.94,59.38 42.16,60.9 43.67,56.34',  area: 48,  capacity: 38,  rate: 80  },
  { code: 'E16', pctPoints: '56.58,71.56 60.23,70.95 59.59,66.38 56.15,66.69', area: 46,  capacity: 36,  rate: 78  },
  { code: 'E18', pctPoints: '30.98,49.64 33.13,53.91 30.12,56.64 27.97,52.69', area: 50,  capacity: 40,  rate: 82  },
  { code: 'E19', pctPoints: '40.44,68.21 38.51,64.86 35.5,68.21 37.22,71.86',  area: 48,  capacity: 38,  rate: 80  },
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

interface ExteriorFloorPlanProps {
  spaces?: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function ExteriorFloorPlan({ spaces = [], onSpaceClick }: ExteriorFloorPlanProps) {
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
        aria-label="Exterior Boxes — Pyramid of Tirana"
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
          EXT. BOXES — KUTITË EXT.
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
