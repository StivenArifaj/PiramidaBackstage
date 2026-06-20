'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import type { DashboardOverviewResponse } from '@/types/api'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const M = 'var(--font-mono)'
const D = 'var(--font-display)'

// ── Static upcoming events ────────────────────────────────────────────────────
const UPCOMING = [
  {
    ref: 'PB-2026-001',
    title: 'Tech Summit Tirana',
    space: 'Blue Space',
    color: '#378ADD', textColor: '#fff',
    startH: 9, endH: 18, status: 'confirmed',
    attendees: 240,
    date: new Date(Date.now() + 86400000),
  },
  {
    ref: 'PB-2026-002',
    title: 'MVRDV Architecture Talk',
    space: 'Space A6',
    color: '#f4a261', textColor: '#4a1b0c',
    startH: 14, endH: 17, status: 'confirmed',
    attendees: 90,
    date: new Date(Date.now() + 86400000 * 2),
  },
  {
    ref: 'PB-2026-003',
    title: 'Startup Albania Night',
    space: 'Orange Space',
    color: '#97C459', textColor: '#173404',
    startH: 19, endH: 23, status: 'quoted',
    attendees: 160,
    date: new Date(Date.now() + 86400000 * 3),
  },
]

const FLOOR_LABELS: Record<string, string> = {
  l0: 'Ground · L0',
  l3: 'Level L+3',
  l_minus_1: 'Basement · B1',
  exterior: 'Exterior',
  roof: 'Rooftop',
}

// ── Timeline SVG ──────────────────────────────────────────────────────────────
const TL_START = 8, TL_END = 23
const TL_HOURS = TL_END - TL_START

function toX(h: number, w: number) { return ((h - TL_START) / TL_HOURS) * w }

function DayTimelineSVG({
  events, empty = false,
}: {
  events: typeof UPCOMING
  empty?: boolean
}) {
  const VW = 560, VH = 36
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height={VH} style={{ display: 'block', overflow: 'visible' }}>
      {/* Background track */}
      <rect x="0" y="18" width={VW} height="14" fill="#eeede6" />
      {/* Hour grid marks */}
      {Array.from({ length: TL_HOURS + 1 }, (_, i) => {
        const h = TL_START + i
        const x = toX(h, VW)
        return (
          <g key={h}>
            <line x1={x} y1="14" x2={x} y2={VH} stroke="#e0ddd4" strokeWidth="0.75" />
            {(i % 3 === 0) && (
              <text x={x + 2} y="12" fontSize="6.5" fill="#b0ada4" fontFamily={M} letterSpacing="0.04em">{h.toString().padStart(2, '0')}h</text>
            )}
          </g>
        )
      })}
      {empty ? (
        <text x={VW / 2} y="28" fontSize="7.5" fill="#c0bdb4" fontFamily={M} textAnchor="middle" letterSpacing="0.14em">NO EVENTS SCHEDULED</text>
      ) : (
        events.map((evt, i) => {
          const x = toX(evt.startH, VW)
          const w = toX(evt.endH, VW) - x
          const maxChars = Math.max(4, Math.floor(w / 5.6))
          return (
            <g key={i}>
              <rect x={x} y="18" width={w} height="14" fill={evt.color} />
              <rect x={x} y="18" width={w} height="3" fill="rgba(255,255,255,0.25)" />
              <text x={x + 4} y="29" fontSize="6.5" fill={evt.textColor} fontFamily={M} letterSpacing="0.04em">
                {evt.title.substring(0, maxChars)}
              </text>
            </g>
          )
        })
      )}
    </svg>
  )
}

// ── Donut ring ────────────────────────────────────────────────────────────────
function DonutRing({ pct, color, size = 32 }: { pct: number; color: string; size?: number }) {
  const r = (size - 7) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(100, pct)) / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8e6dd" strokeWidth="5" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        strokeLinecap="butt"
      />
    </svg>
  )
}

// ── Occupancy bar ─────────────────────────────────────────────────────────────
function OccBar({ pct, delay }: { pct: number; delay: number }) {
  const col = pct > 70 ? '#e63946' : pct > 45 ? '#f4a261' : '#c8da2b'
  return (
    <div style={{ height: 5, background: '#e8e6dd', position: 'relative', overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.85, ease: EASE, delay }}
        style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: col }}
      />
    </div>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const confirmed = status === 'confirmed'
  return (
    <span style={{
      fontFamily: M, fontSize: '7px', letterSpacing: '0.12em', textTransform: 'uppercase',
      padding: '2px 7px',
      background: confirmed ? '#c8da2b' : 'transparent',
      color: confirmed ? '#5a6612' : '#6b7280',
      border: confirmed ? 'none' : '1px solid #d8d5cc',
    }}>
      {status}
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/overview').then(r => r.json()).then(setData)
  }, [])

  const now = new Date()
  const dateLabel = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const timeLabel = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const eventsToday  = data?.events_today.length ?? 0
  const eventsWeek   = data?.events_this_week ?? 0
  const eventsMonth  = data?.events_this_month ?? 0
  const conflicts    = data?.active_conflicts.length ?? 0

  const kpis = [
    { label: 'events today',     value: eventsToday,  sub: 'scheduled for today',   accent: '#c8da2b', alert: false,  pct: Math.min(100, eventsToday * 12) },
    { label: 'this week',        value: eventsWeek,   sub: 'next 7 days',           accent: '#c8da2b', alert: false,  pct: Math.min(100, eventsWeek * 5) },
    { label: 'this month',       value: eventsMonth,  sub: 'next 30 days',          accent: '#c8da2b', alert: false,  pct: Math.min(100, eventsMonth * 2.5) },
    { label: 'active conflicts', value: conflicts,    sub: conflicts > 0 ? 'action required' : 'all clear', accent: conflicts > 0 ? '#e63946' : '#c8da2b', alert: conflicts > 0, pct: Math.min(100, conflicts * 33) },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ── */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        operations dashboard
      </h1>
      <div style={{
        height: 54, borderBottom: '2px solid #1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', background: '#fafaf5',
        position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <motion.span
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: '#c8da2b' }}
            />
            <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.14em', color: '#9a9890', textTransform: 'uppercase' }}>Live</span>
          </div>
          <span style={{ display: 'block', width: 1, height: 18, background: '#e8e6dd' }} />
          <span style={{ fontFamily: M, fontSize: '10px', color: '#1a1a1a', letterSpacing: '0.06em' }}>{dateLabel}</span>
          <span style={{ fontFamily: M, fontSize: '10px', color: '#9a9890', letterSpacing: '0.04em' }}>{timeLabel}</span>
          <span style={{ display: 'block', width: 1, height: 18, background: '#e8e6dd' }} />
          <span style={{ fontFamily: M, fontSize: '8.5px', color: '#9a9890', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Piramida · Tirana, AL</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/dashboard/events" style={{ fontFamily: M, fontSize: '8.5px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#6b7280', padding: '6px 14px', border: '1px solid #d8d5cc' }}>
            events
          </Link>
          <Link href="/dashboard/inventory" style={{ fontFamily: M, fontSize: '8.5px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#6b7280', padding: '6px 14px', border: '1px solid #d8d5cc' }}>
            inventory
          </Link>
          <Link href="/book" style={{ fontFamily: M, fontSize: '8.5px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: '#5a6612', background: '#c8da2b', padding: '8px 18px', fontWeight: 600 }}>
            + new booking
          </Link>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '2px solid #1a1a1a', flexShrink: 0 }}>
        {kpis.map(({ label, value, sub, accent, alert, pct }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: i * 0.07 }}
            style={{
              padding: '22px 28px 0',
              borderRight: i < 3 ? '1px solid #e8e6dd' : 'none',
              background: alert ? 'rgba(230,57,70,0.025)' : '#fafaf5',
              display: 'flex', flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Label */}
            <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 8px' }}>{label}</p>

            {/* Value + ring */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontFamily: M, fontSize: '46px', fontWeight: 500, color: alert ? '#e63946' : '#1a1a1a', margin: 0, lineHeight: 1, letterSpacing: '-0.025em' }}>
                  {data ? value : <span style={{ color: '#d8d5cc' }}>—</span>}
                </p>
                <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: '4px 0 0', letterSpacing: '0.08em' }}>{sub}</p>
              </div>
              <DonutRing pct={pct} color={accent} size={36} />
            </div>

            {/* Animated bottom fill bar */}
            <div style={{ height: 3, background: '#e8e6dd', marginLeft: -28, marginRight: i < 3 ? -1 : 0 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.3 + i * 0.07 }}
                style={{ height: '100%', background: accent }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, minHeight: 0 }}>

        {/* ── Left column: schedule ── */}
        <div style={{ borderRight: '2px solid #1a1a1a', display: 'flex', flexDirection: 'column' }}>

          {/* Section header: Today */}
          <div style={{ padding: '14px 28px', borderBottom: '1px solid #e8e6dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafaf5', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#1a1a1a" strokeWidth="1.4" />
                <line x1="7" y1="3.5" x2="7" y2="7" stroke="#1a1a1a" strokeWidth="1.4" />
                <line x1="7" y1="7" x2="9.5" y2="9" stroke="#1a1a1a" strokeWidth="1.4" />
              </svg>
              <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1a1a1a' }}>
                Today · {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <Link href="/dashboard/events" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890' }}>
              all events →
            </Link>
          </div>

          {/* Today's timeline — empty or populated */}
          <div style={{ padding: '16px 28px', borderBottom: '2px solid #1a1a1a', background: '#fafaf5', flexShrink: 0 }}>
            {(!data || data.events_today.length === 0) ? (
              <>
                <DayTimelineSVG events={[]} empty />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="#c8da2b" strokeWidth="1.4" />
                    <path d="M3.5 6l2 2 3-3" stroke="#5a6612" strokeWidth="1.4" />
                  </svg>
                  <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', letterSpacing: '0.08em' }}>
                    no events today — next event in {Math.ceil((UPCOMING[0].date.getTime() - Date.now()) / 86400000)} day(s) · {UPCOMING[0].ref}
                  </span>
                </div>
              </>
            ) : (
              <DayTimelineSVG events={data.events_today.map(e => ({
                ref: e.reference_code,
                title: e.title,
                space: e.spaces[0]?.name ?? 'TBC',
                color: '#378ADD',
                textColor: '#fff',
                startH: new Date(e.start_at).getHours(),
                endH: new Date(e.end_at).getHours(),
                status: e.status,
                attendees: e.attendees_count,
                date: new Date(e.start_at),
              }))} />
            )}
          </div>

          {/* Section header: Upcoming */}
          <div style={{ padding: '14px 28px', borderBottom: '1px solid #e8e6dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f6f0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2.5" width="12" height="10.5" stroke="#1a1a1a" strokeWidth="1.4" />
                <line x1="1" y1="5.5" x2="13" y2="5.5" stroke="#1a1a1a" strokeWidth="1.4" />
                <line x1="4" y1="1" x2="4" y2="4" stroke="#1a1a1a" strokeWidth="1.4" />
                <line x1="10" y1="1" x2="10" y2="4" stroke="#1a1a1a" strokeWidth="1.4" />
              </svg>
              <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1a1a1a' }}>
                upcoming · {UPCOMING.length} events this week
              </span>
            </div>
          </div>

          {/* Day-by-day event timeline */}
          {UPCOMING.map((evt, i) => {
            const dayLabel = evt.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
            return (
              <motion.div
                key={evt.ref}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.08 }}
                style={{ borderBottom: '1px solid #e8e6dd', flexShrink: 0 }}
              >
                {/* Day header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 28px 6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Color swatch */}
                    <span style={{ display: 'block', width: 8, height: 8, background: evt.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: M, fontSize: '9px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{dayLabel}</span>
                    <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890' }}>{evt.startH.toString().padStart(2,'0')}:00 – {evt.endH.toString().padStart(2,'0')}:00 · {evt.endH - evt.startH}h</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontFamily: M, fontSize: '8px', color: '#6b7280', letterSpacing: '0.06em' }}>{evt.attendees} pax</span>
                    <StatusPill status={evt.status} />
                  </div>
                </div>

                {/* SVG timeline bar */}
                <div style={{ padding: '0 28px' }}>
                  <DayTimelineSVG events={[evt]} />
                </div>

                {/* Event meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 28px 10px' }}>
                  <p style={{ fontFamily: D, fontSize: '13px', fontWeight: 500, color: '#1a1a1a', margin: 0, letterSpacing: '-0.01em' }}>{evt.title}</p>
                  <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', letterSpacing: '0.06em' }}>{evt.space} · {evt.ref}</span>
                </div>
              </motion.div>
            )
          })}

          {/* Reference table */}
          <div style={{ borderTop: '2px solid #1a1a1a', flexShrink: 0, overflowX: 'auto' }}>
            <div style={{ padding: '12px 28px 8px', background: '#f8f6f0', borderBottom: '1px solid #e8e6dd' }}>
              <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9a9890' }}>booking reference index</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e8e6dd', background: '#fafaf5' }}>
                  {['ref', 'event', 'space', 'date', 'pax', 'status'].map(h => (
                    <th key={h} style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9a9890', textAlign: 'left', padding: '8px 12px', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {UPCOMING.map((evt, i) => {
                  const dayLabel = evt.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                  return (
                    <motion.tr
                      key={evt.ref}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                      style={{ borderBottom: '1px solid #e8e6dd' }}
                    >
                      <td style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', padding: '10px 12px', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{evt.ref}</td>
                      <td style={{ fontFamily: D, fontSize: '12px', fontWeight: 500, color: '#1a1a1a', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ display: 'block', width: 6, height: 6, background: evt.color, flexShrink: 0 }} />
                          {evt.title}
                        </div>
                      </td>
                      <td style={{ fontFamily: M, fontSize: '8.5px', color: '#6b7280', padding: '10px 12px' }}>{evt.space}</td>
                      <td style={{ fontFamily: M, fontSize: '8.5px', color: '#6b7280', padding: '10px 12px', whiteSpace: 'nowrap' }}>{dayLabel}</td>
                      <td style={{ fontFamily: M, fontSize: '8.5px', color: '#6b7280', padding: '10px 12px' }}>{evt.attendees}</td>
                      <td style={{ padding: '10px 12px' }}><StatusPill status={evt.status} /></td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right column: occupancy + conflicts ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Space Occupancy header */}
          <div style={{ padding: '14px 22px', borderBottom: '1px solid #e8e6dd', background: '#f8f6f0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polygon points="7,1 13,13 1,13" stroke="#1a1a1a" strokeWidth="1.4" fill="none" />
                <rect x="4.5" y="9.5" width="2" height="3.5" stroke="#1a1a1a" strokeWidth="1" />
                <rect x="7.5" y="9.5" width="2" height="3.5" stroke="#1a1a1a" strokeWidth="1" />
              </svg>
              <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1a1a1a' }}>space occupancy</span>
            </div>
          </div>

          {/* Per-floor rows */}
          {(data?.occupancy_by_floor ?? []).map(({ floor, pct }, i) => {
            const col = pct > 70 ? '#e63946' : pct > 45 ? '#f4a261' : '#c8da2b'
            return (
              <div key={floor} style={{ padding: '12px 22px', borderBottom: '1px solid #e8e6dd', flexShrink: 0 }}>
                {/* Label row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: M, fontSize: '8.5px', letterSpacing: '0.08em', color: '#1a1a1a' }}>
                    {FLOOR_LABELS[floor] ?? floor}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DonutRing pct={pct} color={col} size={26} />
                    <span style={{ fontFamily: M, fontSize: '11px', fontWeight: 600, color: col, minWidth: 30, textAlign: 'right', letterSpacing: '-0.01em' }}>
                      {pct}%
                    </span>
                  </div>
                </div>
                {/* Segmented bar */}
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: 10 }, (_, seg) => {
                    const filled = (seg + 1) * 10 <= pct
                    const partial = seg * 10 < pct && (seg + 1) * 10 > pct
                    const fillPct = partial ? ((pct % 10) / 10 * 100) : 0
                    return (
                      <div key={seg} style={{ flex: 1, height: 5, background: '#e8e6dd', position: 'relative', overflow: 'hidden' }}>
                        {filled && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.06 + seg * 0.03 }}
                            style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: col }}
                          />
                        )}
                        {partial && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${fillPct}%` }}
                            transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.06 + seg * 0.03 }}
                            style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: col }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Low inventory */}
          {(data?.inventory_low?.length ?? 0) > 0 && (
            <>
              <div style={{ padding: '12px 22px 8px', borderBottom: '1px solid #e8e6dd', background: '#f8f6f0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="1" y="4" width="11" height="8" stroke="#f4a261" strokeWidth="1.3" />
                    <path d="M3.5 4V3a3 3 0 016 0v1" stroke="#f4a261" strokeWidth="1.3" />
                  </svg>
                  <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f4a261' }}>
                    inventory · low stock
                  </span>
                </div>
              </div>
              {data!.inventory_low.slice(0, 3).map(({ asset, pct_remaining }) => (
                <div key={asset.id} style={{ padding: '9px 22px', borderBottom: '1px solid #e8e6dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <div>
                    <p style={{ fontFamily: M, fontSize: '9px', color: '#1a1a1a', margin: '0 0 3px', letterSpacing: '0.06em' }}>{asset.name}</p>
                    <p style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', margin: 0 }}>{asset.available_qty} / {asset.total_qty} units</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: M, fontSize: '11px', fontWeight: 600, color: '#f4a261', margin: '0 0 3px', letterSpacing: '-0.01em' }}>{pct_remaining}%</p>
                    <OccBar pct={pct_remaining} delay={0.2} />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Conflicts header */}
          <div style={{ padding: '12px 22px 8px', borderBottom: '1px solid #e8e6dd', borderTop: '2px solid #1a1a1a', background: '#f8f6f0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <polygon points="7,1 13,13 1,13" stroke={conflicts > 0 ? '#e63946' : '#9a9890'} strokeWidth="1.4" fill="none" />
                  <line x1="7" y1="5" x2="7" y2="8.5" stroke={conflicts > 0 ? '#e63946' : '#9a9890'} strokeWidth="1.5" />
                  <circle cx="7" cy="11" r="0.8" fill={conflicts > 0 ? '#e63946' : '#9a9890'} />
                </svg>
                <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: conflicts > 0 ? '#e63946' : '#9a9890' }}>
                  active conflicts
                </span>
              </div>
              {conflicts > 0 && (
                <span style={{ fontFamily: M, fontSize: '9px', color: '#fff', background: '#e63946', padding: '1px 7px', letterSpacing: '0.06em' }}>
                  {conflicts}
                </span>
              )}
            </div>
          </div>

          {/* No conflicts state */}
          {(!data || data.active_conflicts.length === 0) && (
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#c8da2b" strokeWidth="1.4" />
                <path d="M5 8l2.5 2.5 3.5-4" stroke="#5a6612" strokeWidth="1.5" />
              </svg>
              <span style={{ fontFamily: M, fontSize: '8.5px', color: '#9a9890', letterSpacing: '0.06em' }}>
                No conflicts detected
              </span>
            </div>
          )}

          {/* Conflict cards */}
          {(data?.active_conflicts ?? []).map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              style={{ padding: '12px 22px', borderBottom: '1px solid rgba(230,57,70,0.15)', background: 'rgba(230,57,70,0.03)', flexShrink: 0, borderTop: '2px solid #e63946' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#e63946', background: 'rgba(230,57,70,0.1)', padding: '2px 6px' }}>
                  {c.severity}
                </span>
                <span style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a9890' }}>
                  {c.type.replace(/_/g, ' ')}
                </span>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#1a1a1a', margin: '0 0 8px', lineHeight: 1.55 }}>
                {c.description}
              </p>
              <Link
                href="/dashboard/conflicts"
                style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#e63946' }}
              >
                Resolve →
              </Link>
            </motion.div>
          ))}

          {/* Bottom spacer */}
          <div style={{ flex: 1, minHeight: 20 }} />
        </div>

      </div>
    </div>
  )
}
