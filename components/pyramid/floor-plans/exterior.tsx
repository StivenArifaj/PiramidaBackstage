'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SpaceWithAvailability, AvailabilityState } from '@/types/api'

const CX = 400, CY = 400

function toRad(deg: number) { return (deg - 90) * (Math.PI / 180) }
function pt(r: number, deg: number) { return { x: CX + r * Math.cos(toRad(deg)), y: CY + r * Math.sin(toRad(deg)) } }

const FILL: Record<AvailabilityState, string> = { available: '#c8da2b', reserved: '#e63946', blocked: '#6b7280', pending: '#f4a261' }

// 16 exterior boxes — MVRDV jewel colors, 2 per octagonal face
// Boxes are placed just OUTSIDE the building at r=290 (building edge), offset tangentially
const BOX_COLORS: { color: string; textColor: string }[] = [
  { color: '#378ADD', textColor: '#fff' },    // BE1  blue
  { color: '#f4a261', textColor: '#4a1b0c' }, // BE2  orange
  { color: '#97C459', textColor: '#173404' }, // BE3  green
  { color: '#f9c74f', textColor: '#412402' }, // BE4  yellow
  { color: '#e63946', textColor: '#fff' },    // BE5  red
  { color: '#5a4fcf', textColor: '#fff' },    // BE6  purple
  { color: '#2a9d8f', textColor: '#fff' },    // BE7  teal
  { color: '#e07a5f', textColor: '#fff' },    // BE8  coral
  { color: '#378ADD', textColor: '#fff' },    // BE9  blue
  { color: '#f4a261', textColor: '#4a1b0c' }, // BE10 orange
  { color: '#97C459', textColor: '#173404' }, // BE11 green
  { color: '#f9c74f', textColor: '#412402' }, // BE12 yellow
  { color: '#e63946', textColor: '#fff' },    // BE13 red
  { color: '#5a4fcf', textColor: '#fff' },    // BE14 purple
  { color: '#2a9d8f', textColor: '#fff' },    // BE15 teal
  { color: '#e07a5f', textColor: '#fff' },    // BE16 coral
]

// Capacity / area / rate from mock-data pattern: 40 + (i%4)*25 pax, 86 + (i%6)*18 sqm, 65 + (i%4)*12 eur
function boxMeta(i: number) {
  return { capacity: 40 + (i % 4) * 25, area: 86 + (i % 6) * 18, rate: 65 + (i % 4) * 12 }
}

// Position: 16 boxes at 22.5° intervals, placed at r=298 (just outside building perimeter)
// Each box: 46×36 SVG units, rotated to face outward
function boxTransform(i: number): { cx: number; cy: number; rotate: number } {
  const angle = i * 22.5 // 0° = top, clockwise
  const r = 298
  return {
    cx: CX + r * Math.cos(toRad(angle)),
    cy: CY + r * Math.sin(toRad(angle)),
    rotate: angle,
  }
}

const W = 46, H = 34

interface TooltipState { x: number; y: number; index: number; availability: AvailabilityState }

interface ExteriorFloorPlanProps {
  spaces?: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function ExteriorFloorPlan({ spaces = [], onSpaceClick }: ExteriorFloorPlanProps) {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const spaceMap = new Map(spaces.map(s => [s.code, s]))
  function getAv(i: number): AvailabilityState { return spaceMap.get(`BE${i + 1}`)?.availability ?? 'available' }
  function handleClick(code: string) { onSpaceClick ? onSpaceClick(code) : router.push(`/spaces/${code.toLowerCase()}`) }

  // Octagon outline points at r=270 (building footprint)
  const octBuilding = Array.from({ length: 8 }, (_, i) => {
    const p = pt(270, i * 45 + 22.5)
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')

  // Site boundary
  const octSite = Array.from({ length: 8 }, (_, i) => {
    const p = pt(366, i * 45 + 22.5)
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')

  return (
    <div className="relative w-full select-none" style={{ maxWidth: 720 }}>
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ background: '#e8e5da' }} aria-label="Exterior — Pyramid of Tirana">

        {/* Site pavement */}
        <polygon points={octSite} fill="#d8d5ca" stroke="#1a1a1a" strokeWidth="2" />

        {/* Paving pattern */}
        {Array.from({ length: 24 }, (_, i) => (
          <line key={`h${i}`} x1="34" y1={34 + i * 31} x2="766" y2={34 + i * 31} stroke="#ccc9be" strokeWidth="0.6" opacity="0.7" />
        ))}
        {Array.from({ length: 24 }, (_, i) => (
          <line key={`v${i}`} x1={34 + i * 31} y1="34" x2={34 + i * 31} y2="766" stroke="#ccc9be" strokeWidth="0.6" opacity="0.7" />
        ))}

        {/* Connection arms from building to each exterior box */}
        {BOX_COLORS.map((_, i) => {
          const { cx, cy, rotate } = boxTransform(i)
          const buildingEdge = pt(270, i * 22.5)
          return (
            <line key={`arm-${i}`}
              x1={buildingEdge.x} y1={buildingEdge.y}
              x2={cx} y2={cy}
              stroke="#1a1a1a" strokeWidth="1" opacity="0.4"
            />
          )
        })}

        {/* Building body (pyramid footprint) */}
        <polygon points={octBuilding} fill="#bfbdb4" stroke="#1a1a1a" strokeWidth="2.5" />

        {/* Inner atrium circle */}
        <circle cx={CX} cy={CY} r={120} fill="#d0cec5" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="6 4" />
        <circle cx={CX} cy={CY} r={52} fill="#c8c6bc" stroke="#1a1a1a" strokeWidth="1.5" />

        {/* Structural grid lines inside building */}
        {[0, 45, 90, 135].map(a => {
          const p1 = pt(50, a), p2 = pt(265, a)
          return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#aaa9a0" strokeWidth="0.75" />
        })}

        {/* Building label */}
        <text x={CX} y={CY - 4} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="600" fill="#6b7280" letterSpacing="0.14em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>PIRAMIDA</text>
        <text x={CX} y={CY + 8} textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#8a8880" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>TIRANA</text>

        {/* 16 Exterior boxes */}
        {BOX_COLORS.map(({ color, textColor }, i) => {
          const code = `BE${i + 1}`
          const av = getAv(i)
          const { cx, cy, rotate } = boxTransform(i)
          const isHov = hovered === code
          const meta = boxMeta(i)

          const fillColor = av === 'available' ? color
            : av === 'reserved' ? '#e63946'
            : av === 'pending' ? '#f4a261'
            : '#6b7280'

          return (
            <g
              key={code}
              role="button" tabIndex={0}
              aria-label={`${code} — ${av} — ${meta.capacity} pax`}
              style={{ cursor: 'pointer' }}
              transform={`rotate(${rotate}, ${cx}, ${cy})`}
              onClick={() => handleClick(code)}
              onMouseEnter={() => { setHovered(code); setTooltip({ x: cx, y: cy, index: i, availability: av }) }}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              onKeyDown={e => e.key === 'Enter' && handleClick(code)}
            >
              {/* Shadow */}
              <rect x={cx - W / 2 + 3} y={cy - H / 2 + 3} width={W} height={H} fill="rgba(0,0,0,0.18)" />
              {/* Box */}
              <rect x={cx - W / 2} y={cy - H / 2} width={W} height={H}
                fill={fillColor}
                fillOpacity={av === 'blocked' ? 0.35 : 0.92}
                stroke={isHov ? '#c8da2b' : '#1a1a1a'}
                strokeWidth={isHov ? 2.5 : 1.5}
              />
              {/* Top accent */}
              <rect x={cx - W / 2} y={cy - H / 2} width={W} height={4} fill="rgba(255,255,255,0.3)" />
              {/* Window strip */}
              <rect x={cx - W / 2 + 6} y={cy - H / 2 + 9} width={W - 12} height={H * 0.38}
                fill="rgba(255,255,255,0.45)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              {/* Code label */}
              <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="7" fontWeight="700" letterSpacing="0.1em" fill={av === 'available' ? textColor : '#fff'}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {code}
              </text>
            </g>
          )
        })}

        {/* Tooltip */}
        {tooltip && (() => {
          const tx = Math.min(Math.max(tooltip.x, 70), 730)
          const ty = Math.max(tooltip.y - 70, 8)
          const av = tooltip.availability
          const meta = boxMeta(tooltip.index)
          const code = `BE${tooltip.index + 1}`
          return (
            <g transform={`translate(${tx}, ${ty})`} style={{ pointerEvents: 'none' }}>
              <rect x="-64" y="0" width="128" height="52" fill="#fafaf5" stroke="#1a1a1a" strokeWidth="2" />
              <rect x="-64" y="0" width="128" height="6" fill={FILL[av]} fillOpacity="0.9" />
              <text x="0" y="21" textAnchor="middle" fontSize="10" fontWeight="500" fill="#1a1a1a" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{code} · EXTERIOR</text>
              <text x="0" y="33" textAnchor="middle" fontSize="8" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{meta.capacity} pax · {meta.area} m²</text>
              <text x="0" y="44" textAnchor="middle" fontSize="8" fill="#5a6612" style={{ fontFamily: 'JetBrains Mono, monospace' }}>€{meta.rate}/hr</text>
            </g>
          )
        })()}

        {/* Labels */}
        <text x="400" y="768" textAnchor="middle" fontSize="11" letterSpacing="0.22em" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>EXTERIOR — JASHTË NDËRTESËS</text>
        <g transform="translate(744, 52)">
          <line x1="0" y1="18" x2="0" y2="-2" stroke="#1a1a1a" strokeWidth="1.5" />
          <polygon points="0,-6 -4,4 4,4" fill="#1a1a1a" />
          <text x="0" y="28" textAnchor="middle" fontSize="9" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>N</text>
        </g>
        <g transform="translate(36, 718)">
          {([{ label: 'available', color: '#c8da2b' }, { label: 'reserved', color: '#e63946' }, { label: 'pending', color: '#f4a261' }, { label: 'blocked', color: '#6b7280' }] as const).map(({ label, color }, i) => (
            <g key={label} transform={`translate(${i * 92}, 0)`}>
              <rect width="10" height="10" fill={color} stroke="#1a1a1a" strokeWidth="1.5" />
              <text x="14" y="9" fontSize="9" fill="#6b7280" letterSpacing="0.06em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
