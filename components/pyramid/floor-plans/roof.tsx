'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SpaceWithAvailability, AvailabilityState } from '@/types/api'

const CX = 400, CY = 400

function toRad(deg: number) { return (deg - 90) * (Math.PI / 180) }
function pt(r: number, deg: number) { return { x: CX + r * Math.cos(toRad(deg)), y: CY + r * Math.sin(toRad(deg)) } }

const FILL: Record<AvailabilityState, string> = { available: '#c8da2b', reserved: '#e63946', blocked: '#6b7280', pending: '#f4a261' }

interface RoofBoxDef {
  code: string
  label: string
  color: string
  textColor: string
  cx: number
  cy: number
  w: number
  h: number
  rotate: number
  capacity: number
  area: number
  rate: number
}

const ROOF_BOXES: RoofBoxDef[] = [
  { code: 'ROOF-YELLOW', label: 'YELLOW', color: '#f9c74f', textColor: '#412402', cx: 275, cy: 272, w: 116, h: 72, rotate: -12, capacity: 80,  area: 112, rate: 140 },
  { code: 'ROOF-RED',    label: 'RED',    color: '#e63946', textColor: '#fff',    cx: 525, cy: 272, w: 108, h: 66, rotate: 12,  capacity: 65,  area: 96,  rate: 135 },
  { code: 'ROOF-ORANGE', label: 'ORANGE', color: '#f4a261', textColor: '#4a1b0c', cx: 530, cy: 530, w: 114, h: 70, rotate: -8,  capacity: 75,  area: 104, rate: 138 },
  { code: 'ROOF-PURPLE', label: 'PURPLE', color: '#5a4fcf', textColor: '#fff',    cx: 272, cy: 528, w: 100, h: 64, rotate: 10,  capacity: 55,  area: 88,  rate: 125 },
]

// Octagon helper
function octagonPoints(r: number, rotate = 22.5): string {
  return Array.from({ length: 8 }, (_, i) => {
    const p = pt(r, i * 45 + rotate)
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')
}

interface TooltipState { x: number; y: number; box: RoofBoxDef; availability: AvailabilityState }

interface RoofFloorPlanProps {
  spaces?: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function RoofFloorPlan({ spaces = [], onSpaceClick }: RoofFloorPlanProps) {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const spaceMap = new Map(spaces.map(s => [s.code, s]))
  function getAv(code: string): AvailabilityState { return spaceMap.get(code)?.availability ?? 'available' }
  function handleClick(code: string) { onSpaceClick ? onSpaceClick(code) : router.push(`/spaces/${code.toLowerCase()}`) }

  return (
    <div className="absolute inset-0 w-full h-full select-none overflow-hidden">
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ background: 'transparent' }} aria-label="Rooftop — Pyramid of Tirana">

        {/* Outer building boundary — stroke-only, MVRDV JPEG is the background */}
        <polygon points={octagonPoints(348, 22.5)} fill="none" stroke="#1a1a1a" strokeWidth="2" />

        {/* 4 Rooftop colored boxes */}
        {ROOF_BOXES.map(box => {
          const av = getAv(box.code)
          const isHov = hovered === box.code
          const rx = box.cx - box.w / 2, ry = box.cy - box.h / 2
          return (
            <g
              key={box.code}
              role="button" tabIndex={0}
              aria-label={`${box.label} Roof Box — ${av} — ${box.capacity} pax`}
              style={{ cursor: 'pointer' }}
              transform={`rotate(${box.rotate}, ${box.cx}, ${box.cy})`}
              onClick={() => handleClick(box.code)}
              onMouseEnter={() => { setHovered(box.code); setTooltip({ x: box.cx, y: box.cy - box.h / 2 - 20, box, availability: av }) }}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              onKeyDown={e => e.key === 'Enter' && handleClick(box.code)}
            >
              {/* Drop shadow */}
              <rect x={rx + 5} y={ry + 5} width={box.w} height={box.h} fill="rgba(0,0,0,0.18)" />
              {/* Box fill */}
              <rect x={rx} y={ry} width={box.w} height={box.h}
                fill={av === 'available' ? box.color : av === 'reserved' ? '#e63946' : av === 'pending' ? '#f4a261' : '#6b7280'}
                fillOpacity={av === 'blocked' ? 0.4 : 0.92}
                stroke={isHov ? '#c8da2b' : '#1a1a1a'}
                strokeWidth={isHov ? 3 : 2}
              />
              {/* Top light strip */}
              <rect x={rx} y={ry} width={box.w} height={6} fill="rgba(255,255,255,0.35)" />
              {/* Terrace edge indicator (bottom) */}
              <rect x={rx} y={ry + box.h - 6} width={box.w} height={6} fill="rgba(0,0,0,0.12)" />
              {/* Windows */}
              {[0.18, 0.48, 0.78].map((f, i) => (
                <rect key={i} x={rx + box.w * f - 7} y={ry + box.h * 0.22} width={13} height={box.h * 0.42}
                  fill="rgba(180,210,240,0.7)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
              ))}
              {/* Label */}
              <text x={box.cx} y={box.cy + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fontWeight="700" letterSpacing="0.12em" fill={box.textColor}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {box.label}
              </text>
              {/* ROOF tag */}
              <text x={box.cx} y={box.cy + 14} textAnchor="middle" dominantBaseline="middle"
                fontSize="6" fill={box.textColor} opacity="0.7"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ROOF
              </text>
            </g>
          )
        })}

        {/* Central plant/mechanical room */}
        <polygon points={octagonPoints(52, 22.5)} fill="#aaa9a0" stroke="#1a1a1a" strokeWidth="2" />
        <polygon points={octagonPoints(40, 22.5)} fill="#b8b6ac" stroke="#1a1a1a" strokeWidth="1" />
        <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#1a1a1a" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>MEP</text>
        <text x={CX} y={CY + 10} textAnchor="middle" dominantBaseline="middle" fontSize="5" fill="#6b7280" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>CORE</text>

        {/* Tooltip */}
        {tooltip && (() => {
          const tx = Math.min(Math.max(tooltip.x, 70), 730), ty = Math.max(tooltip.y - 50, 8)
          const av = tooltip.availability
          return (
            <g transform={`translate(${tx}, ${ty})`} style={{ pointerEvents: 'none' }}>
              <rect x="-64" y="0" width="128" height="52" fill="#fafaf5" stroke="#1a1a1a" strokeWidth="2" />
              <rect x="-64" y="0" width="128" height="6" fill={FILL[av]} fillOpacity="0.9" />
              <text x="0" y="21" textAnchor="middle" fontSize="10" fontWeight="500" fill="#1a1a1a" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{tooltip.box.label} · ROOF</text>
              <text x="0" y="33" textAnchor="middle" fontSize="8" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{tooltip.box.capacity} pax · {tooltip.box.area} m²</text>
              <text x="0" y="44" textAnchor="middle" fontSize="8" fill="#5a6612" style={{ fontFamily: 'JetBrains Mono, monospace' }}>€{tooltip.box.rate}/hr</text>
            </g>
          )
        })()}

        {/* Labels */}
        <text x="400" y="768" textAnchor="middle" fontSize="11" letterSpacing="0.22em" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ROOFTOP — ÇATIA</text>
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

        {/* Sky detail — light cloud strokes in upper corners */}
        <text x="60" y="60" fontSize="9" fill="#8a9aaa" letterSpacing="0.12em" opacity="0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>↑ TIRANA</text>
        <text x="60" y="74" fontSize="8" fill="#8a9aaa" letterSpacing="0.1em" opacity="0.4" style={{ fontFamily: 'JetBrains Mono, monospace' }}>MT DAJTI 4.8KM</text>
      </svg>
    </div>
  )
}
