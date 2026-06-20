'use client'

import { useState } from 'react'
import type { SpaceWithAvailability, AvailabilityState } from '@/types/api'

// ── Coordinate conversion ─────────────────────────────────────────────────────
// Mapper % -> original JPEG (1600x1131), then subtract crop offset (left=120, top=15).
// Cropped image is 1415x1081; viewBox matches that.
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

// ── Space definitions ─────────────────────────────────────────────────────────
// pctPoints: raw mapper output — percentages of the 1600×1131 blueprint JPEG
interface SpaceDef {
  code:      string
  pctPoints: string
  area:      number
  capacity:  number
  rate:      number
}

const SPACES: SpaceDef[] = [
  // ── Perimeter ring ───────────────────────────────────────────────────────
  { code: 'A1',  pctPoints: '30.12,15.25 27.97,20.12 29.69,21.34 31.84,16.47', area: 85,  capacity: 90,  rate: 120 },
  { code: 'A2',  pctPoints: '35.06,17.08 37.43,21.04 39.15,18.91 36.79,14.65', area: 92,  capacity: 100, rate: 130 },
  { code: 'A3',  pctPoints: '45.18,13.12 45.61,7.95 49.26,9.47 48.62,14.34',   area: 88,  capacity: 95,  rate: 125 },
  { code: 'A4',  pctPoints: '51.2,7.65 54.43,6.73 55.07,11.3 52.06,12.52',     area: 95,  capacity: 110, rate: 135 },
  { code: 'A5',  pctPoints: '60.45,10.08 59.59,13.12 63.25,15.25 64.11,11.91', area: 105, capacity: 120, rate: 145 },
  { code: 'A6',  pctPoints: '69.27,16.47 67.55,20.43 70.56,23.17 72.07,19.52', area: 98,  capacity: 108, rate: 138 },
  { code: 'A7',  pctPoints: '63.03,19.52 61.96,24.08 64.97,25.3 66.04,21.04',  area: 90,  capacity: 98,  rate: 128 },
  { code: 'A8',  pctPoints: '71.21,24.69 71.21,28.34 75.08,28.34 75.08,24.99', area: 87,  capacity: 94,  rate: 122 },
  { code: 'A9',  pctPoints: '69.48,48.73 68.41,53.6 71.85,55.12 72.93,50.56',  area: 88,  capacity: 96,  rate: 124 },
  { code: 'A10', pctPoints: '70.99,58.77 71.21,64.56 73.57,64.56 73.36,59.08', area: 92,  capacity: 100, rate: 130 },
  { code: 'A11', pctPoints: '60.02,70.8 56.58,71.71 56.15,67.14 59.59,66.23',  area: 95,  capacity: 105, rate: 135 },
  { code: 'A13', pctPoints: '40.23,68.97 38.29,70.8 36.36,67.45 38.08,65.32',  area: 96,  capacity: 106, rate: 136 },
  { code: 'A14', pctPoints: '37.86,72.93 35.06,76.27 32.91,72.32 35.71,69.27', area: 90,  capacity: 98,  rate: 128 },
  { code: 'A15', pctPoints: '29.9,56.49 27.97,52.23 30.76,50.1 32.91,53.75',   area: 87,  capacity: 93,  rate: 122 },
  { code: 'A16', pctPoints: '33.77,38.54 29.69,38.23 29.69,35.49 33.77,35.19', area: 84,  capacity: 90,  rate: 120 },
  { code: 'A17', pctPoints: '40.23,54.67 38.72,59.54 42.16,61.06 43.67,56.49', area: 42,  capacity: 38,  rate: 75  },
  // ── Interior cluster ─────────────────────────────────────────────────────
  { code: 'A18', pctPoints: '56.58,47.36 57.65,45.54 55.72,43.41 54.86,45.54', area: 42,  capacity: 38,  rate: 75  },
  { code: 'A19', pctPoints: '58.3,44.01 56.36,43.1 56.58,40.67 58.94,42.49',   area: 40,  capacity: 35,  rate: 70  },
  { code: 'A20', pctPoints: '57.44,34.58 58.73,34.58 59.37,39.75 57.65,40.06', area: 38,  capacity: 32,  rate: 68  },
  { code: 'A21', pctPoints: '43.02,46.45 45.18,44.62 43.24,40.97 41.52,43.1',  area: 35,  capacity: 28,  rate: 65  },
  { code: 'A22', pctPoints: '42.16,40.36 40.44,40.06 40.87,35.49 42.59,36.1',  area: 33,  capacity: 26,  rate: 62  },
  { code: 'A23', pctPoints: '43.45,34.88 41.09,33.36 43.24,28.49 45.39,30.32', area: 36,  capacity: 30,  rate: 65  },
  { code: 'A24', pctPoints: '46.9,25.45 46.9,28.8 52.49,29.1 52.49,25.45',     area: 44,  capacity: 40,  rate: 72  },
  { code: 'A25', pctPoints: '47.33,33.97 47.76,38.23 52.27,37.32 51.41,32.75', area: 40,  capacity: 35,  rate: 68  },
  { code: 'A26', pctPoints: '47.11,33.06 49.26,35.8 48.19,39.45 45.61,38.23',  area: 32,  capacity: 25,  rate: 60  },
  { code: 'A27', pctPoints: '52.49,40.06 54.21,39.75 52.92,33.06 50.55,34.58', area: 34,  capacity: 28,  rate: 63  },
  { code: 'A28', pctPoints: '55.72,33.06 57.87,31.54 56.15,29.1 54.43,30.93',  area: 36,  capacity: 30,  rate: 65  },
  { code: 'A29', pctPoints: '49.05,42.04 48.19,45.08 46.04,43.86 47.11,41.12', area: 30,  capacity: 24,  rate: 58  },
]

// ── Availability colours ──────────────────────────────────────────────────────
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

interface GroundFloorPlanProps {
  spaces?: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function GroundFloorPlan({ spaces = [], onSpaceClick }: GroundFloorPlanProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const spaceMap = new Map(spaces.map(s => [s.code, s]))

  function getAvailability(code: string): AvailabilityState {
    return spaceMap.get(code)?.availability ?? 'available'
  }

  function handleClick(code: string) {
    onSpaceClick ? onSpaceClick(code) : undefined
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
        aria-label="Ground Floor — Pyramid of Tirana"
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
              onClick={() => handleClick(def.code)}
              onMouseEnter={(e) => handleMouseEnter(e, def)}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleClick(def.code)}
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
          GROUND FLOOR — KATI PËRDHES
        </text>

        {/* ── Tooltip (always on top) ── */}
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
