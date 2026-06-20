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

interface SectorDef {
  code: string
  label: string
  color: string
  textColor: string
  startDeg: number
  endDeg: number
  innerR: number
  outerR: number
  capacity: number
  area: number
  rate: number
  isHero: boolean
}

function labelPt(s: SectorDef): { x: number; y: number } {
  const mid = (s.startDeg + s.endDeg) / 2
  const r = (s.innerR + s.outerR) / 2
  return { x: CX + r * Math.cos(toRad(mid)), y: CY + r * Math.sin(toRad(mid)) }
}

const BASEMENT_SECTORS: SectorDef[] = [
  { code: 'GREEN',  label: 'GREEN',  color: '#97C459', textColor: '#173404', startDeg: 0,   endDeg: 92,  innerR: 78, outerR: 308, capacity: 160, area: 150, rate: 130, isHero: true },
  { code: 'YELLOW', label: 'YELLOW', color: '#f9c74f', textColor: '#412402', startDeg: 92,  endDeg: 166, innerR: 78, outerR: 308, capacity: 140, area: 120, rate: 110, isHero: true },
  { code: 'B1', label: 'B1', color: '#c8c6bd', textColor: '#1a1a1a', startDeg: 166, endDeg: 199, innerR: 78, outerR: 308, capacity: 80,  area: 110, rate: 85,  isHero: false },
  { code: 'B2', label: 'B2', color: '#c8c6bd', textColor: '#1a1a1a', startDeg: 199, endDeg: 232, innerR: 78, outerR: 308, capacity: 95,  area: 130, rate: 95,  isHero: false },
  { code: 'B3', label: 'B3', color: '#c8c6bd', textColor: '#1a1a1a', startDeg: 232, endDeg: 265, innerR: 78, outerR: 308, capacity: 110, area: 150, rate: 105, isHero: false },
  { code: 'B4', label: 'B4', color: '#c8c6bd', textColor: '#1a1a1a', startDeg: 265, endDeg: 298, innerR: 78, outerR: 308, capacity: 125, area: 170, rate: 115, isHero: false },
  { code: 'B5', label: 'B5', color: '#c8c6bd', textColor: '#1a1a1a', startDeg: 298, endDeg: 331, innerR: 78, outerR: 308, capacity: 140, area: 190, rate: 125, isHero: false },
  { code: 'B6', label: 'B6', color: '#c8c6bd', textColor: '#1a1a1a', startDeg: 331, endDeg: 360, innerR: 78, outerR: 308, capacity: 155, area: 210, rate: 135, isHero: false },
]

interface TooltipState { x: number; y: number; sector: SectorDef; availability: AvailabilityState }

interface LMinusOneFloorPlanProps {
  spaces?: SpaceWithAvailability[]
  onSpaceClick?: (code: string) => void
}

export function LMinusOneFloorPlan({ spaces = [], onSpaceClick }: LMinusOneFloorPlanProps) {
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
      <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ background: '#1e1c18' }} aria-label="Level L-1 (Basement) — Pyramid of Tirana">

        {/* Basement floor plate */}
        <polygon points={octPts} fill="#2a2824" stroke="#3a3830" strokeWidth="2" />

        {/* Concrete grid texture lines */}
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`h${i}`} x1="52" y1={52 + i * 35} x2="748" y2={52 + i * 35} stroke="#2e2c28" strokeWidth="0.5" opacity="0.6" />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <line key={`v${i}`} x1={52 + i * 35} y1="52" x2={52 + i * 35} y2="748" stroke="#2e2c28" strokeWidth="0.5" opacity="0.6" />
        ))}

        {/* Structural depth ring — suggests basement ceiling */}
        <circle cx={CX} cy={CY} r={340} fill="none" stroke="#3a3830" strokeWidth="6" />
        <circle cx={CX} cy={CY} r={312} fill="none" stroke="#444038" strokeWidth="1.5" />

        {/* Sectors */}
        {BASEMENT_SECTORS.map(sector => {
          const av = getAv(sector.code)
          const isHov = hovered === sector.code
          const lp = labelPt(sector)
          const fillColor = av === 'available'
            ? sector.isHero ? sector.color : sector.color
            : av === 'reserved' ? '#e63946'
            : av === 'pending' ? '#f4a261'
            : '#6b7280'
          return (
            <g
              key={sector.code}
              role="button" tabIndex={0}
              aria-label={`${sector.label} — ${av} — ${sector.capacity} pax`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleClick(sector.code)}
              onMouseEnter={() => { setHovered(sector.code); setTooltip({ x: lp.x, y: lp.y, sector, availability: av }) }}
              onMouseLeave={() => { setHovered(null); setTooltip(null) }}
              onKeyDown={e => e.key === 'Enter' && handleClick(sector.code)}
            >
              {/* Main sector fill */}
              <path
                d={annularSector(sector.startDeg, sector.endDeg, sector.innerR, sector.outerR)}
                fill={fillColor}
                fillOpacity={av === 'blocked' ? 0.25 : sector.isHero ? 0.88 : 0.55}
                stroke={isHov ? '#c8da2b' : '#1a1a1a'}
                strokeWidth={isHov ? 2.5 : 1.5}
              />
              {/* Inner accent ring for hero spaces */}
              {sector.isHero && (
                <path
                  d={annularSector(sector.startDeg + 1.5, sector.endDeg - 1.5, sector.innerR, sector.innerR + 8)}
                  fill="rgba(255,255,255,0.2)"
                />
              )}
              {/* Label */}
              <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
                fontSize={sector.isHero ? '10' : '8'} fontWeight="600" letterSpacing="0.1em"
                fill={av === 'available' ? sector.textColor : '#fff'}
                style={{ fontFamily: 'JetBrains Mono, monospace', pointerEvents: 'none' }}>
                {sector.label}
              </text>
              {sector.isHero && (
                <text x={lp.x} y={lp.y + 14} textAnchor="middle" dominantBaseline="middle"
                  fontSize="7" fill={av === 'available' ? sector.textColor : '#fff'}
                  style={{ fontFamily: 'JetBrains Mono, monospace', pointerEvents: 'none', opacity: 0.75 }}>
                  {sector.capacity} PAX
                </text>
              )}
            </g>
          )
        })}

        {/* Radial dividers between sectors */}
        {BASEMENT_SECTORS.map(sector => {
          const p1 = pt(sector.innerR, sector.startDeg), p2 = pt(sector.outerR, sector.startDeg)
          return <line key={`div-${sector.code}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#1a1a1a" strokeWidth="2" />
        })}

        {/* Stair cores — two opposite sides */}
        {[45, 225].map(a => {
          const pc = pt(200, a)
          return (
            <g key={a} transform={`rotate(${a}, ${pc.x}, ${pc.y})`}>
              <rect x={pc.x - 22} y={pc.y - 14} width={44} height={28} fill="#1a1a1a" opacity="0.7" />
              {[0, 7, 14, 21].map(dy => (
                <line key={dy} x1={pc.x - 22} y1={pc.y - 14 + dy} x2={pc.x + 22} y2={pc.y - 14 + dy} stroke="#3a3830" strokeWidth="0.75" />
              ))}
              <text x={pc.x} y={pc.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="5.5" fill="#6b7280" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>STAIR</text>
            </g>
          )
        })}

        {/* Central service core */}
        <circle cx={CX} cy={CY} r={78} fill="#1a1a1a" stroke="#3a3830" strokeWidth="2" />
        <circle cx={CX} cy={CY} r={64} fill="#232220" stroke="#444038" strokeWidth="1" />
        {[0, 60, 120, 180, 240, 300].map(a => {
          const p = pt(55, a)
          return <line key={a} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#444038" strokeWidth="1" />
        })}
        <circle cx={CX} cy={CY} r={8} fill="#c8da2b" />
        <circle cx={CX} cy={CY} r={4} fill="#1a1a1a" />
        <text x={CX} y={CY + 18} textAnchor="middle" fontSize="6" fill="#6b7280" letterSpacing="0.12em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>CORE</text>

        {/* Tooltip */}
        {tooltip && (() => {
          const tx = Math.min(Math.max(tooltip.x, 70), 730), ty = Math.max(tooltip.y - 50, 8)
          const av = tooltip.availability
          return (
            <g transform={`translate(${tx}, ${ty})`} style={{ pointerEvents: 'none' }}>
              <rect x="-64" y="0" width="128" height="52" fill="#1e1c18" stroke="#c8da2b" strokeWidth="1.5" />
              <rect x="-64" y="0" width="128" height="5" fill={FILL[av]} fillOpacity="0.9" />
              <text x="0" y="20" textAnchor="middle" fontSize="10" fontWeight="500" fill="#f5f5f0" letterSpacing="0.1em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{tooltip.sector.label} · B-1</text>
              <text x="0" y="32" textAnchor="middle" fontSize="8" fill="#9a9890" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{tooltip.sector.capacity} pax · {tooltip.sector.area} m²</text>
              <text x="0" y="43" textAnchor="middle" fontSize="8" fill="#c8da2b" style={{ fontFamily: 'JetBrains Mono, monospace' }}>€{tooltip.sector.rate}/hr</text>
            </g>
          )
        })()}

        {/* Labels */}
        <text x="400" y="768" textAnchor="middle" fontSize="11" letterSpacing="0.22em" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>LEVEL B-1 — BODRUM I PARË</text>
        <g transform="translate(744, 52)">
          <line x1="0" y1="18" x2="0" y2="-2" stroke="#9a9890" strokeWidth="1.5" />
          <polygon points="0,-6 -4,4 4,4" fill="#9a9890" />
          <text x="0" y="28" textAnchor="middle" fontSize="9" fill="#6b7280" style={{ fontFamily: 'JetBrains Mono, monospace' }}>N</text>
        </g>
        <g transform="translate(36, 718)">
          {([{ label: 'available', color: '#c8da2b' }, { label: 'reserved', color: '#e63946' }, { label: 'pending', color: '#f4a261' }, { label: 'blocked', color: '#6b7280' }] as const).map(({ label, color }, i) => (
            <g key={label} transform={`translate(${i * 92}, 0)`}>
              <rect width="10" height="10" fill={color} stroke="#3a3830" strokeWidth="1.5" />
              <text x="14" y="9" fontSize="9" fill="#6b7280" letterSpacing="0.06em" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
