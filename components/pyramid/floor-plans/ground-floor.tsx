'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SpaceWithAvailability, AvailabilityState } from '@/types/api'

// ─── Geometry constants ───────────────────────────────────────────────────────
const CX = 400
const CY = 400
const SITE_R    = 345   // outer octagon circumradius (site boundary)
const BOX_OUTER = 305   // circumradius of outer edge of space boxes
const BOX_INNER = 178   // circumradius of inner edge of space boxes
const RING_R    = 162   // circumradius of inner circulation ring (octagonal)
const ATRIUM_R  = 68    // circumradius of central atrium octagon

// ─── Geometry: strict octagon, no arcs ────────────────────────────────────────
// Octagon orientation: faces (flat sides) at 0°, 45°, 90°, … 315°
//                     vertices at 22.5°, 67.5°, … 337.5°

/**
 * Compute the intersection of a radial ray at `angleDeg` (0 = top, clockwise)
 * with a regular octagon of given circumradius. Returns SVG screen coordinates.
 */
function octPt(angleDeg: number, circumR: number): { x: number; y: number } {
  const apothem = circumR * Math.cos(Math.PI / 8)
  const a = ((angleDeg % 360) + 360) % 360
  // Face 0 spans -22.5° to +22.5° (midpoint at 0°). Face k spans k*45°±22.5°.
  const faceIdx = Math.floor(((a + 22.5) % 360) / 45) % 8
  const faceMidDeg = faceIdx * 45
  let delta = a - faceMidDeg
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  const dist = apothem / Math.cos(delta * Math.PI / 180)
  const rad = (a - 90) * Math.PI / 180
  return { x: CX + dist * Math.cos(rad), y: CY + dist * Math.sin(rad) }
}

/**
 * Compute all 8 vertex coordinates of the octagon as an SVG `points` string.
 */
function octagonPoints(circumR: number): string {
  return Array.from({ length: 8 }, (_, i) => {
    const deg = 22.5 + i * 45
    const rad = (deg - 90) * Math.PI / 180
    const x = CX + circumR * Math.cos(rad)
    const y = CY + circumR * Math.sin(rad)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

/**
 * Straight-sided trapezoidal sector points — NO arcs whatsoever.
 * All four corners are computed via octPt(), producing a quadrilateral that
 * lies entirely within the octagon boundary when the sector doesn't cross a vertex.
 * Returns space-separated "x,y" pairs for use in <polygon points="...">.
 */
function octSectorPoints(startDeg: number, endDeg: number, innerR: number, outerR: number): string {
  const p1 = octPt(startDeg, innerR)
  const p2 = octPt(startDeg, outerR)
  const p3 = octPt(endDeg, outerR)
  const p4 = octPt(endDeg, innerR)
  const f = (n: number) => n.toFixed(2)
  return `${f(p1.x)},${f(p1.y)} ${f(p2.x)},${f(p2.y)} ${f(p3.x)},${f(p3.y)} ${f(p4.x)},${f(p4.y)}`
}

// ─── Space definitions ────────────────────────────────────────────────────────
// The Pyramid of Tirana (MVRDV) is an octagon. The ground floor has 16 main
// radial bays (every 22.5°) plus 3 additional smaller spaces: A17, A18, A19.
// Corridors sit at every 22.5° mark (alternately on face-midpoints and vertices).

const WEDGE_DEG  = 22.5   // one full radial segment
const WEDGE_GAP  = 3      // corridor half-width in degrees
const BOX_SPAN   = WEDGE_DEG - WEDGE_GAP * 2  // ≈ 16.5° per standard space

interface GroundSpaceDef {
  code:       string
  centerDeg:  number
  spanDeg:    number
  area:       number
  capacity:   number
  rate:       number
}

// A1–A16 evenly distributed; A17–A19 are narrower transition nodes placed
// in three of the corridors that fall on face midpoints (0°, 90°, 180°).
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
  // Transition nodes — narrower, in 3 of the 8 face-midpoint corridors
  { code: 'A17', centerDeg: 0,    spanDeg: WEDGE_GAP * 1.4, area: 42, capacity: 38, rate: 75 },
  { code: 'A18', centerDeg: 180,  spanDeg: WEDGE_GAP * 1.4, area: 42, capacity: 38, rate: 75 },
  { code: 'A19', centerDeg: 270,  spanDeg: WEDGE_GAP * 1.4, area: 40, capacity: 35, rate: 70 },
]

// ─── Availability colours ─────────────────────────────────────────────────────
const FILL: Record<AvailabilityState, string> = {
  available: '#c8da2b',
  reserved:  '#e63946',
  blocked:   '#6b7280',
  pending:   '#f4a261',
}
const FILL_OPACITY: Record<AvailabilityState, number> = {
  available: 0.90,
  reserved:  0.82,
  blocked:   0.52,
  pending:   0.78,
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
  const [hovered, setHovered]   = useState<string | null>(null)
  const [tooltip, setTooltip]   = useState<TooltipState | null>(null)

  const spaceMap = new Map(spaces.map(s => [s.code, s]))

  function handleClick(code: string) {
    onSpaceClick ? onSpaceClick(code) : router.push(`/spaces/${code.toLowerCase()}`)
  }

  function getAvailability(code: string): AvailabilityState {
    return spaceMap.get(code)?.availability ?? 'available'
  }

  function handleMouseEnter(e: React.MouseEvent<SVGGElement>, def: GroundSpaceDef) {
    const svg = e.currentTarget.closest('svg') as SVGElement | null
    if (!svg) return
    const svgRect   = svg.getBoundingClientRect()
    const groupRect = (e.currentTarget as SVGElement).getBoundingClientRect()
    setHovered(def.code)
    setTooltip({
      x: groupRect.left + groupRect.width / 2 - svgRect.left,
      y: groupRect.top - svgRect.top,
      space: def,
      availability: getAvailability(def.code),
    })
  }

  // Pre-compute octagon outline polygons
  const outerOctPts  = octagonPoints(SITE_R)
  const ringOctPts   = octagonPoints(RING_R)
  const atriumOctPts = octagonPoints(ATRIUM_R)
  const atriumInner  = octagonPoints(ATRIUM_R * 0.55)

  return (
    <div className="absolute inset-0 w-full h-full select-none overflow-hidden">
      <svg
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ background: 'transparent' }}
        aria-label="Ground Floor — Pyramid of Tirana"
        role="img"
      >
        {/* ── Outer site octagon — the true building boundary ── */}
        <polygon
          points={outerOctPts}
          fill="#e8e6dd"
          stroke="#1a1a1a"
          strokeWidth="2.5"
        />

        {/* ── 16 radial corridor lines (straight spokes, no arcs) ──
            Each line runs from the atrium edge to the site boundary,
            passing through the gaps between space boxes.              */}
        {Array.from({ length: 16 }, (_, i) => {
          const deg = i * WEDGE_DEG
          const inner = octPt(deg, RING_R + 4)
          const outer = octPt(deg, SITE_R - 2)
          return (
            <line
              key={`spoke-${i}`}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="#1a1a1a"
              strokeWidth="1"
            />
          )
        })}

        {/* ── Space boxes A1–A16 (main clickable sectors) ── */}
        {GROUND_SPACES.slice(0, 16).map((def) => {
          const availability = getAvailability(def.code)
          const fill         = FILL[availability]
          const fillOpacity  = FILL_OPACITY[availability]
          const isHov        = hovered === def.code
          const half         = def.spanDeg / 2
          const startDeg     = def.centerDeg - half
          const endDeg       = def.centerDeg + half

          // Label position: midpoint of the octagon sector radius
          const labelR   = (BOX_INNER + BOX_OUTER) / 2
          const labelPt  = octPt(def.centerDeg, labelR)
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
              {/* Main fill — octagonal trapezoid, zero arcs */}
              <polygon
                points={octSectorPoints(startDeg, endDeg, BOX_INNER, BOX_OUTER)}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke="#1a1a1a"
                strokeWidth={isHov ? 2.5 : 1.5}
                strokeLinejoin="miter"
              />
              {/* Lime selection ring — inset by 3px */}
              {isHov && (
                <polygon
                  points={octSectorPoints(startDeg - 0.4, endDeg + 0.4, BOX_INNER - 4, BOX_OUTER + 4)}
                  fill="none"
                  stroke="#c8da2b"
                  strokeWidth="3"
                />
              )}
              {/* Code label — rotated to read radially */}
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontWeight="500"
                letterSpacing="0.08em"
                fill={
                  availability === 'available' ? '#5a6612' :
                  availability === 'reserved'  ? '#501313' : '#1a1a1a'
                }
                transform={`rotate(${rotAngle > 90 || rotAngle < -90 ? rotAngle + 180 : rotAngle}, ${labelPt.x.toFixed(2)}, ${labelPt.y.toFixed(2)})`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {def.code}
              </text>
            </g>
          )
        })}

        {/* ── Transition nodes A17–A19 (narrow, in 3 face-midpoint corridors) ── */}
        {GROUND_SPACES.slice(16).map((def) => {
          const availability = getAvailability(def.code)
          const fill         = FILL[availability]
          const fillOpacity  = FILL_OPACITY[availability] * 0.85
          const isHov        = hovered === def.code
          const half         = def.spanDeg / 2
          const startDeg     = def.centerDeg - half
          const endDeg       = def.centerDeg + half
          const labelR       = (BOX_INNER + BOX_OUTER) / 2
          const labelPt      = octPt(def.centerDeg, labelR)
          const rotAngle     = def.centerDeg - 90

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
                points={octSectorPoints(startDeg, endDeg, BOX_INNER, BOX_OUTER)}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke="#1a1a1a"
                strokeWidth={isHov ? 2 : 1}
                strokeLinejoin="miter"
                strokeDasharray="3 2"
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fontWeight="400"
                fill="#1a1a1a"
                transform={`rotate(${rotAngle > 90 || rotAngle < -90 ? rotAngle + 180 : rotAngle}, ${labelPt.x.toFixed(2)}, ${labelPt.y.toFixed(2)})`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {def.code}
              </text>
            </g>
          )
        })}

        {/* ── Inner circulation ring — octagonal, flat-sided ── */}
        <polygon
          points={ringOctPts}
          fill="#f0ede6"
          stroke="#1a1a1a"
          strokeWidth="1.5"
        />

        {/* ── 16 short radial lines inside the circulation ring (structural detail) ── */}
        {Array.from({ length: 16 }, (_, i) => {
          const deg   = i * WEDGE_DEG
          const inner = octPt(deg, ATRIUM_R + 2)
          const outer = octPt(deg, RING_R - 2)
          return (
            <line
              key={`inner-spoke-${i}`}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="#1a1a1a"
              strokeWidth="0.75"
            />
          )
        })}

        {/* ── Central atrium — double-octagon ── */}
        <polygon
          points={atriumOctPts}
          fill="#fafaf5"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        <polygon
          points={atriumInner}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="0.75"
        />

        {/* Atrium cross lines (structural pattern) */}
        {[0, 45, 90, 135].map((angle) => {
          const a = octPt(angle,       ATRIUM_R * 0.52)
          const b = octPt(angle + 180, ATRIUM_R * 0.52)
          return <line key={`atrium-${angle}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1a1a1a" strokeWidth="0.75" />
        })}

        {/* Center datum */}
        <circle cx={CX} cy={CY} r="5" fill="#1a1a1a" />
        <circle cx={CX} cy={CY} r="2" fill="#fafaf5" />

        {/* ── Floor label ── */}
        <text
          x="400" y="770"
          textAnchor="middle"
          fontSize="11"
          letterSpacing="0.22em"
          fill="#6b7280"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          GROUND FLOOR — KATI PËRDHES
        </text>

        {/* ── North indicator ── */}
        <g transform="translate(748, 54)">
          <line x1="0" y1="18" x2="0" y2="-2" stroke="#1a1a1a" strokeWidth="1.5" />
          <polygon points="0,-7 -4,5 4,5" fill="#1a1a1a" />
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
            <g key={label} transform={`translate(${i * 94}, 0)`}>
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
          const ty = Math.max(tooltip.y - 58, 8)
          return (
            <g transform={`translate(${tx}, ${ty})`} style={{ pointerEvents: 'none' }}>
              <rect x="-58" y="0" width="116" height="50" fill="#fafaf5" stroke="#1a1a1a" strokeWidth="2" />
              <rect x="-58" y="0" width="116" height="6" fill={FILL[tooltip.availability]} fillOpacity="0.9" />
              <text x="0" y="22" textAnchor="middle" fontSize="10" fontWeight="500" fill="#1a1a1a" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {tooltip.space.code}
              </text>
              <text x="0" y="34" textAnchor="middle" fontSize="8" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {tooltip.space.capacity} pax · {tooltip.space.area} m²
              </text>
              <text x="0" y="44" textAnchor="middle" fontSize="8" fill="#5a6612" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                €{tooltip.space.rate}/hr
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
