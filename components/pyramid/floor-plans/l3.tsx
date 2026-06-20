'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SpaceWithAvailability, AvailabilityState } from '@/types/api'

const CX = 400, CY = 400

function toRad(deg: number) { return (deg - 90) * (Math.PI / 180) }
function pt(r: number, deg: number) { return { x: CX + r * Math.cos(toRad(deg)), y: CY + r * Math.sin(toRad(deg)) } }

function annularSector(startDeg: number, endDeg: number, innerR: number, outerR: number): string {
  const p1 = pt(innerR, startDeg), p2 = pt(outerR, startDeg), p3 = pt(outerR, endDeg), p4 = pt(innerR, endDeg)
  const large = (endDeg - startDeg) > 180 ? 1 : 0
  return [`M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`, `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`, `A ${outerR} ${outerR} 0 ${large} 1 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`, `L ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`, `A ${innerR} ${innerR} 0 ${large} 0 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`, 'Z'].join(' ')
}

const FILL: Record<AvailabilityState, string> = { available: '#c8da2b', reserved: '#e63946', blocked: '#6b7280', pending: '#f4a261' }

// 6 colored box rooms arranged inside the L+3 atrium ring
// Each is a rectangle positioned in polar coords, rendered as a rotated rect
interface L3BoxDef {
  code: string
  label: string
  color: string   // MVRDV box color
  textColor: string
  cx: number      // SVG x center
  cy: number      // SVG y center
  w: number       // width
  h: number       // height
  rotate: number  // degrees
  capacity: number
  area: number
  rate: number
}

const L3_BOXES: L3BoxDef[] = [
  { code: 'L3-RED',    label: 'RED',    color: '#e63946', textColor: '#fff',    cx: 360, cy: 280, w: 120, h: 62, rotate: -20,  capacity: 80,  area: 86,  rate: 120 },
  { code: 'L3-BLUE',   label: 'BLUE',   color: '#378ADD', textColor: '#fff',    cx: 480, cy: 295, w: 115, h: 55, rotate: 15,   capacity: 90,  area: 98,  rate: 130 },
  { code: 'L3-PURPLE', label: 'PURPLE', color: '#5a4fcf', textColor: '#fff',    cx: 290, cy: 360, w: 100, h: 55, rotate: -45,  capacity: 60,  area: 72,  rate: 100 },
  { code: 'L3-GREEN',  label: 'GREEN',  color: '#97C459', textColor: '#173404', cx: 390, cy: 440, w: 108, h: 52, rotate: 10,   capacity: 70,  area: 80,  rate: 110 },
  { code: 'L3-YELLOW', label: 'YELLOW', color: '#f9c74f', textColor: '#412402', cx: 500, cy: 400, w: 94,  h: 50, rotate: -10,  capacity: 50,  area: 64,  rate: 90  },
  { code: 'L3-ORANGE', label: 'ORANGE', color: '#f4a261', textColor: '#4a1b0c', cx: 340, cy: 460, w: 100, h: 48, rotate: 30,   capacity: 65,  area: 76,  rate: 105 },
]

interface TooltipState { x: number; y: number; box: L3BoxDef; availability: AvailabilityState }

interface L3FloorPlanProps {
  spaces?: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function L3FloorPlan({ spaces = [], onSpaceClick }: L3FloorPlanProps) {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const spaceMap = new Map(spaces.map(s => [s.code, s]))
  function getAv(code: string): AvailabilityState { return spaceMap.get(code)?.availability ?? 'available' }
  function handleClick(code: string) { onSpaceClick ? onSpaceClick(code) : router.push(`/spaces/${code.toLowerCase()}`) }

  // Octagon outline
  const octPts = Array.from({ length: 8 }, (_, i) => { const p = pt(348, i * 45 + 22.5); return `${p.x.toFixed(1)},${p.y.toFixed(1)}` }).join(' ')

  return (
    <div className="relative w-full select-none" style={{ maxWidth: 720 }}>
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ background: '#f5f5f0' }} aria-label="Level L+3 — Pyramid of Tirana">
        {/* Site boundary */}
        <polygon points={octPts} fill="#e8e6dd" stroke="#1a1a1a" strokeWidth="2" />

        {/* Radial structural fins (light gray) */}
        {Array.from({ length: 16 }, (_, i) => {
          const mid = i * 22.5, s = mid - 1.5, e = mid + 1.5
          return <path key={i} d={annularSector(s, e, 72, 340)} fill="#d4d2c9" stroke="#1a1a1a" strokeWidth="0.75" opacity="0.6" />
        })}

        {/* Atrium circulation ring (walkway) */}
        <circle cx={CX} cy={CY} r={168} fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeDasharray="6 4" />
        <circle cx={CX} cy={CY} r={80}  fill="#fafaf5" stroke="#1a1a1a" strokeWidth="1.5" />

        {/* Inner atrium fill */}
        <circle cx={CX} cy={CY} r={79} fill="#fafaf5" />

        {/* Atrium walkway ring */}
        <path d={annularSector(0, 360, 80, 168)} fill="rgba(255,255,255,0.5)" />

        {/* 6 colored box rooms */}
        {L3_BOXES.map(box => {
          const av = getAv(box.code)
          const isHov = hovered === box.code
          const rx = box.cx - box.w / 2, ry = box.cy - box.h / 2
          return (
            <g
              key={box.code}
              role="button" tabIndex={0} aria-label={`${box.label} Box — ${av} — ${box.capacity} pax`}
              style={{ cursor: 'pointer' }}
              transform={`rotate(${box.rotate}, ${box.cx}, ${box.cy})`}
              onClick={() => handleClick(box.code)}
              onMouseEnter={e => {
                const svg = e.currentTarget.closest('svg') as SVGElement
                const svgRect = svg?.getBoundingClientRect()
                setHovered(box.code)
                setTooltip({ x: box.cx, y: box.cy - box.h / 2 - 20, box, availability: av })
              }}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              onKeyDown={e => e.key === 'Enter' && handleClick(box.code)}
            >
              {/* Shadow/depth */}
              <rect x={rx + 4} y={ry + 4} width={box.w} height={box.h} fill="rgba(0,0,0,0.2)" />
              {/* Fill — show MVRDV color, darken if not available */}
              <rect x={rx} y={ry} width={box.w} height={box.h}
                fill={av === 'available' ? box.color : av === 'reserved' ? '#e63946' : av === 'pending' ? '#f4a261' : '#6b7280'}
                fillOpacity={av === 'blocked' ? 0.4 : 0.9}
                stroke={isHov ? '#c8da2b' : '#1a1a1a'}
                strokeWidth={isHov ? 3 : 1.5}
              />
              {/* Top accent strip */}
              <rect x={rx} y={ry} width={box.w} height={5} fill="rgba(255,255,255,0.3)" />
              {/* Windows */}
              {[0.2, 0.5, 0.78].map((f, i) => (
                <rect key={i} x={rx + box.w * f - 8} y={ry + box.h * 0.25} width={14} height={box.h * 0.45}
                  fill="rgba(255,255,255,0.55)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
              ))}
              {/* Code label */}
              <text x={box.cx} y={box.cy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fontWeight="600" letterSpacing="0.1em" fill={box.textColor}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {box.label}
              </text>
            </g>
          )
        })}

        {/* Central oculus */}
        <circle cx={CX} cy={CY} r={52} fill="#e8f4ff" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx={CX} cy={CY} r={44} fill="#d0e8f8" stroke="#1a1a1a" strokeWidth="1" />
        {[0, 60, 120, 180, 240, 300].map(a => {
          const p = pt(40, a); return <line key={a} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#1a1a1a" strokeWidth="0.75" />
        })}
        <circle cx={CX} cy={CY} r={5} fill="#1a1a1a" />
        <circle cx={CX} cy={CY} r={2} fill="#d0e8f8" />
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize="7" fill="#6b7280" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>OCULUS</text>

        {/* Tooltip */}
        {tooltip && (() => {
          const tx = Math.min(Math.max(tooltip.x, 70), 730), ty = Math.max(tooltip.y - 50, 8)
          const av = tooltip.availability
          return (
            <g transform={`translate(${tx}, ${ty})`} style={{ pointerEvents: 'none' }}>
              <rect x="-64" y="0" width="128" height="52" fill="#fafaf5" stroke="#1a1a1a" strokeWidth="2" />
              <rect x="-64" y="0" width="128" height="6" fill={FILL[av]} fillOpacity="0.9" />
              <text x="0" y="21" textAnchor="middle" fontSize="10" fontWeight="500" fill="#1a1a1a" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{tooltip.box.label} BOX · L+3</text>
              <text x="0" y="33" textAnchor="middle" fontSize="8" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{tooltip.box.capacity} pax · {tooltip.box.area} m²</text>
              <text x="0" y="44" textAnchor="middle" fontSize="8" fill="#5a6612" style={{ fontFamily: 'JetBrains Mono, monospace' }}>€{tooltip.box.rate}/hr</text>
            </g>
          )
        })()}

        {/* Labels */}
        <text x="400" y="768" textAnchor="middle" fontSize="11" letterSpacing="0.22em" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>LEVEL L+3 — KATI I TRETË</text>
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
