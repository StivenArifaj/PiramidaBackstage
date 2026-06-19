'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SpaceWithAvailability, AvailabilityState } from '@/types/api'

// ─── Geometry constants ───────────────────────────────────────────────────────
const CX = 400
const CY = 400
const ATRIUM_R    = 72   // central atrium circle
const RING_INNER  = 80   // inner edge of corridor ring
const RING_OUTER  = 168  // outer edge of corridor ring
const BOX_INNER   = 178  // inner edge of space boxes
const BOX_OUTER   = 318  // outer edge of space boxes
const SITE_R      = 348  // outer octagon

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function toRad(deg: number) { return (deg - 90) * (Math.PI / 180) }

function pt(r: number, deg: number) {
  return { x: CX + r * Math.cos(toRad(deg)), y: CY + r * Math.sin(toRad(deg)) }
}

function arcPath(r: number, startDeg: number, endDeg: number): string {
  const s = pt(r, startDeg)
  const e = pt(r, endDeg)
  const large = (endDeg - startDeg) > 180 ? 1 : 0
  return `A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

function annularSector(startDeg: number, endDeg: number, innerR: number, outerR: number): string {
  const p1 = pt(innerR, startDeg)
  const p2 = pt(outerR, startDeg)
  const p3 = pt(outerR, endDeg)
  const p4 = pt(innerR, endDeg)
  const large = (endDeg - startDeg) > 180 ? 1 : 0
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `L ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

// ─── Space definitions ────────────────────────────────────────────────────────
// 19 spaces around the radial ring. The ground floor plan (current-site-plan-ground.png)
// shows spaces between the 16 radial corridor wedges. Each space = one sector.
// Wedges are at 0°, 22.5°, 45°... (every 22.5°). Spaces sit centered between wedges.
// Most spaces span ~16°; some hero spaces are wider.

const WEDGE_DEG = 22.5  // one full segment = 22.5°
const WEDGE_GAP = 3     // corridor takes 3° on each side = 6° per wedge
const BOX_SPAN  = WEDGE_DEG - WEDGE_GAP * 2  // ≈ 16.5° per standard space

interface GroundSpaceDef {
  code: string
  centerDeg: number  // center of this space on the circle
  spanDeg: number    // angular width
  area: number       // m² for display
  capacity: number   // pax for display
  rate: number       // EUR/hr
}

// 16 main spaces (A1–A16) plus 3 larger hero extensions (A17–A19)
// Distributed evenly at every 22.5°, centered on odd multiples of 11.25°
const GROUND_SPACES: GroundSpaceDef[] = [
  { code: 'A1',  centerDeg: 11.25,  spanDeg: BOX_SPAN, area: 85,  capacity: 90,  rate: 120 },
  { code: 'A2',  centerDeg: 33.75,  spanDeg: BOX_SPAN, area: 92,  capacity: 100, rate: 130 },
  { code: 'A3',  centerDeg: 56.25,  spanDeg: BOX_SPAN, area: 88,  capacity: 95,  rate: 125 },
  { code: 'A4',  centerDeg: 78.75,  spanDeg: BOX_SPAN, area: 95,  capacity: 110, rate: 135 },
  { code: 'A5',  centerDeg: 101.25, spanDeg: BOX_SPAN, area: 105, capacity: 120, rate: 145 },
  { code: 'A6',  centerDeg: 123.75, spanDeg: BOX_SPAN, area: 98,  capacity: 108, rate: 138 },
  { code: 'A7',  centerDeg: 146.25, spanDeg: BOX_SPAN, area: 90,  capacity: 98,  rate: 128 },
  { code: 'A8',  centerDeg: 168.75, spanDeg: BOX_SPAN, area: 87,  capacity: 94,  rate: 122 },
  { code: 'A9',  centerDeg: 191.25, spanDeg: BOX_SPAN, area: 88,  capacity: 96,  rate: 124 },
  { code: 'A10', centerDeg: 213.75, spanDeg: BOX_SPAN, area: 92,  capacity: 100, rate: 130 },
  { code: 'A11', centerDeg: 236.25, spanDeg: BOX_SPAN, area: 95,  capacity: 105, rate: 135 },
  { code: 'A12', centerDeg: 258.75, spanDeg: BOX_SPAN, area: 100, capacity: 112, rate: 140 },
  { code: 'A13', centerDeg: 281.25, spanDeg: BOX_SPAN, area: 96,  capacity: 106, rate: 136 },
  { code: 'A14', centerDeg: 303.75, spanDeg: BOX_SPAN, area: 90,  capacity: 98,  rate: 128 },
  { code: 'A15', centerDeg: 326.25, spanDeg: BOX_SPAN, area: 87,  capacity: 93,  rate: 122 },
  { code: 'A16', centerDeg: 348.75, spanDeg: BOX_SPAN, area: 84,  capacity: 90,  rate: 120 },
  // Three wider hero extension spaces at cardinal transitions
  { code: 'A17', centerDeg: 0,      spanDeg: WEDGE_GAP * 1.6, area: 45, capacity: 40, rate: 80  },
  { code: 'A18', centerDeg: 180,    spanDeg: WEDGE_GAP * 1.6, area: 45, capacity: 40, rate: 80  },
  { code: 'A19', centerDeg: 270,    spanDeg: WEDGE_GAP * 1.6, area: 42, capacity: 38, rate: 75  },
]

// Availability fill colors
const FILL: Record<AvailabilityState, string> = {
  available: '#c8da2b',
  reserved:  '#e63946',
  blocked:   '#6b7280',
  pending:   '#f4a261',
}
const FILL_OPACITY: Record<AvailabilityState, number> = {
  available: 0.88,
  reserved:  0.80,
  blocked:   0.50,
  pending:   0.75,
}

// ─── Tooltip state ────────────────────────────────────────────────────────────
interface TooltipState {
  x: number
  y: number
  space: GroundSpaceDef
  availability: AvailabilityState
}

// ─── Component ────────────────────────────────────────────────────────────────
interface GroundFloorPlanProps {
  spaces?: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function GroundFloorPlan({ spaces = [], onSpaceClick }: GroundFloorPlanProps) {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const spaceMap = new Map(spaces.map(s => [s.code, s]))

  function handleClick(code: string) {
    onSpaceClick ? onSpaceClick(code) : router.push(`/spaces/${code.toLowerCase()}`)
  }

  function getAvailability(code: string): AvailabilityState {
    return spaceMap.get(code)?.availability ?? 'available'
  }

  function handleMouseEnter(e: React.MouseEvent<SVGGElement>, def: GroundSpaceDef) {
    const svg = (e.currentTarget.closest('svg') as SVGElement)
    if (!svg) return
    const svgRect = svg.getBoundingClientRect()
    const groupRect = (e.currentTarget as SVGElement).getBoundingClientRect()
    setHovered(def.code)
    setTooltip({
      x: groupRect.left + groupRect.width / 2 - svgRect.left,
      y: groupRect.top - svgRect.top,
      space: def,
      availability: getAvailability(def.code),
    })
  }

  // Octagon points for site boundary
  const octPts = Array.from({ length: 8 }, (_, i) => {
    const p = pt(SITE_R, i * 45 + 22.5)
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')

  // Inner octagon for atrium detail
  const atriumPts = Array.from({ length: 8 }, (_, i) => {
    const p = pt(ATRIUM_R * 0.62, i * 45 + 22.5)
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')

  return (
    <div className="relative w-full select-none" style={{ maxWidth: 720 }}>
      <svg
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        style={{ background: '#f5f5f0' }}
        aria-label="Ground Floor — Pyramid of Tirana"
        role="img"
      >
        {/* ── Site: outer octagon ── */}
        <polygon points={octPts} fill="#e8e6dd" stroke="#1a1a1a" strokeWidth="2" />

        {/* ── 16 radial corridor wedges ── */}
        {Array.from({ length: 16 }, (_, i) => {
          const mid = i * WEDGE_DEG
          const s = mid - WEDGE_GAP
          const e = mid + WEDGE_GAP
          return (
            <path
              key={`wedge-${i}`}
              d={annularSector(s, e, RING_INNER, BOX_OUTER + 12)}
              fill="#d4d2c9"
              stroke="#1a1a1a"
              strokeWidth="1"
            />
          )
        })}

        {/* ── Space boxes A1–A19 ── */}
        {GROUND_SPACES.slice(0, 16).map((def) => {
          const availability = getAvailability(def.code)
          const fill = FILL[availability]
          const fillOpacity = FILL_OPACITY[availability]
          const isHov = hovered === def.code
          const half = def.spanDeg / 2
          const startDeg = def.centerDeg - half
          const endDeg   = def.centerDeg + half

          const labelR = (BOX_INNER + BOX_OUTER) / 2
          const labelPt = pt(labelR, def.centerDeg)
          const rotAngle = def.centerDeg - 90

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
              {/* Main fill */}
              <path
                d={annularSector(startDeg, endDeg, BOX_INNER, BOX_OUTER)}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke="#1a1a1a"
                strokeWidth={isHov ? 2.5 : 1.5}
              />
              {/* Lime hover ring */}
              {isHov && (
                <path
                  d={annularSector(startDeg - 0.5, endDeg + 0.5, BOX_INNER - 3, BOX_OUTER + 3)}
                  fill="none"
                  stroke="#c8da2b"
                  strokeWidth="3"
                />
              )}
              {/* Code label — rotated along radius */}
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontWeight="500"
                letterSpacing="0.08em"
                fill={availability === 'available' ? '#5a6612' : availability === 'reserved' ? '#501313' : '#1a1a1a'}
                transform={`rotate(${rotAngle > 90 || rotAngle < -90 ? rotAngle + 180 : rotAngle}, ${labelPt.x.toFixed(2)}, ${labelPt.y.toFixed(2)})`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {def.code}
              </text>
            </g>
          )
        })}

        {/* ── Corridor outer ring arc ── */}
        <circle cx={CX} cy={CY} r={BOX_OUTER + 14} fill="none" stroke="#1a1a1a" strokeWidth="2" />

        {/* ── Inner circulation ring ── */}
        <circle cx={CX} cy={CY} r={RING_OUTER} fill="#e8e6dd" stroke="#1a1a1a" strokeWidth="1.5" />

        {/* ── Central atrium ── */}
        <circle cx={CX} cy={CY} r={ATRIUM_R} fill="#fafaf5" stroke="#1a1a1a" strokeWidth="2" />

        {/* Atrium inner octagon */}
        <polygon points={atriumPts} fill="none" stroke="#1a1a1a" strokeWidth="1" />

        {/* Atrium structural lines (cross + diagonals) */}
        {[0, 45, 90, 135].map((angle) => {
          const a = pt(ATRIUM_R * 0.64, angle)
          const b = pt(ATRIUM_R * 0.64, angle + 180)
          return <line key={angle} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1a1a1a" strokeWidth="0.75" />
        })}

        {/* Center point */}
        <circle cx={CX} cy={CY} r="5" fill="#1a1a1a" />
        <circle cx={CX} cy={CY} r="2" fill="#fafaf5" />

        {/* ── Floor title ── */}
        <text
          x="400" y="768"
          textAnchor="middle"
          fontSize="11"
          letterSpacing="0.22em"
          fill="#6b7280"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          GROUND FLOOR — KATI PËRDHES
        </text>

        {/* ── North indicator ── */}
        <g transform="translate(744, 52)">
          <line x1="0" y1="18" x2="0" y2="-2" stroke="#1a1a1a" strokeWidth="1.5" />
          <polygon points="0,-6 -4,4 4,4" fill="#1a1a1a" />
          <text x="0" y="28" textAnchor="middle" fontSize="9" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>N</text>
        </g>

        {/* ── Scale bar ── */}
        <g transform="translate(36, 754)">
          <line x1="0" y1="0" x2="60" y2="0" stroke="#6b7280" strokeWidth="1.5" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="#6b7280" strokeWidth="1.5" />
          <line x1="60" y1="-4" x2="60" y2="4" stroke="#6b7280" strokeWidth="1.5" />
          <text x="30" y="-8" textAnchor="middle" fontSize="8" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>10 m</text>
        </g>

        {/* ── Legend ── */}
        <g transform="translate(36, 718)">
          {([
            { label: 'available', color: '#c8da2b' },
            { label: 'reserved',  color: '#e63946' },
            { label: 'pending',   color: '#f4a261' },
            { label: 'blocked',   color: '#6b7280' },
          ] as const).map(({ label, color }, i) => (
            <g key={label} transform={`translate(${i * 92}, 0)`}>
              <rect width="10" height="10" fill={color} stroke="#1a1a1a" strokeWidth="1.5" />
              <text x="14" y="9" fontSize="9" fill="#6b7280" letterSpacing="0.06em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {label}
              </text>
            </g>
          ))}
        </g>

        {/* ── Tooltip (always on top) ── */}
        {tooltip && (() => {
          const tx = Math.min(Math.max(tooltip.x, 64), 736)
          const ty = Math.max(tooltip.y - 56, 8)
          return (
            <g transform={`translate(${tx}, ${ty})`} style={{ pointerEvents: 'none' }}>
              <rect x="-58" y="0" width="116" height="48" fill="#fafaf5" stroke="#1a1a1a" strokeWidth="2" />
              <rect x="-58" y="0" width="116" height="6" fill={FILL[tooltip.availability]} fillOpacity="0.9" />
              <text x="0" y="20" textAnchor="middle" fontSize="10" fontWeight="500" fill="#1a1a1a" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {tooltip.space.code}
              </text>
              <text x="0" y="32" textAnchor="middle" fontSize="8" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {tooltip.space.capacity} pax · {tooltip.space.area} m²
              </text>
              <text x="0" y="42" textAnchor="middle" fontSize="8" fill="#5a6612" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                €{tooltip.space.rate}/hr
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
