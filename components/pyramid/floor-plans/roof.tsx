'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  { code: 'D1', pctPoints: '44.32,27.43 46.04,26.82 46.47,29.25 44.75,30.17', area: 40,  capacity: 30,  rate: 95  },
  { code: 'D2', pctPoints: '41.95,29.56 43.67,27.73 42.38,24.99 40.44,26.52', area: 38,  capacity: 28,  rate: 90  },
  { code: 'D3', pctPoints: '50.77,21.04 53.14,21.34 52.7,24.08 49.91,23.47',  area: 45,  capacity: 35,  rate: 100 },
  { code: 'D4', pctPoints: '57.44,24.99 56.15,27.43 57.65,29.56 59.16,27.43', area: 42,  capacity: 32,  rate: 98  },
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

interface RoofFloorPlanProps {
  spaces?: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function RoofFloorPlan({ spaces = [], onSpaceClick }: RoofFloorPlanProps) {
  const router = useRouter()
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
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 1415 1081"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full z-50"
        preserveAspectRatio="xMidYMid meet"
        style={{ background: 'transparent', pointerEvents: 'none' }}
        aria-label="Roof — Pyramid of Tirana"
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
              onMouseEnter={(e) => handleMouseEnter(e, def)}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/spaces/${def.code.toLowerCase()}`) }}
            >
              <polygon
                points={svgPoints}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke="#1a1a1a"
                strokeWidth={isHov ? 3 : 1.5}
                strokeLinejoin="round"
                style={{ pointerEvents: 'all', cursor: 'pointer' }}
                onClick={() => router.push(`/spaces/${def.code.toLowerCase()}`)}
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
          ROOF — ÇATIA
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
