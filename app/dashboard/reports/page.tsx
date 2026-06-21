'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { RevenueTrendChart } from '@/components/dashboard/charts/revenue-trend-chart'
import { SpaceUtilizationChart } from '@/components/dashboard/charts/space-utilization-chart'
import type { RevenueTrendPoint } from '@/components/dashboard/charts/revenue-trend-chart'
import type { SpaceUtilizationPoint } from '@/components/dashboard/charts/space-utilization-chart'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const M = 'var(--font-mono)'
const D = 'var(--font-display)'

// ── Floor / Space registry ────────────────────────────────────────────────────
const FLOORS = [
  {
    id: 'l0', label: 'Ground / L0',
    spaces: [
      { code: 'BLUE',   name: 'Blue Space' },
      { code: 'ORANGE', name: 'Orange Space' },
      ...Array.from({ length: 19 }, (_, i) => ({ code: `A${i + 1}`, name: `Exhibition A${i + 1}` })),
    ],
  },
  {
    id: 'l_minus_1', label: 'Basement / B',
    spaces: [
      { code: 'GREEN',  name: 'Green Space' },
      { code: 'YELLOW', name: 'Yellow Space' },
      ...Array.from({ length: 6 }, (_, i) => ({ code: `B${i + 1}`, name: `Basement B${i + 1}` })),
    ],
  },
  {
    id: 'l3', label: 'Level 3 / C',
    spaces: [
      { code: 'L3-RED',    name: 'Red Box L+3' },
      { code: 'L3-PURPLE', name: 'Purple Box L+3' },
      { code: 'L3-BLUE',   name: 'Blue Box L+3' },
      { code: 'L3-YELLOW', name: 'Yellow Box L+3' },
      { code: 'L3-GREEN',  name: 'Green Box L+3' },
      { code: 'L3-ORANGE', name: 'Orange Box L+3' },
    ],
  },
  {
    id: 'roof', label: 'Roof / D',
    spaces: [
      { code: 'ROOF-YELLOW', name: 'Yellow Roof Box' },
      { code: 'ROOF-RED',    name: 'Red Roof Box' },
      { code: 'ROOF-ORANGE', name: 'Orange Roof Box' },
      { code: 'ROOF-PURPLE', name: 'Purple Roof Box' },
    ],
  },
  {
    id: 'exterior', label: 'Exterior / E',
    spaces: Array.from({ length: 16 }, (_, i) => ({ code: `BE${i + 1}`, name: `Exterior Box ${i + 1}` })),
  },
] as const

type FloorId = typeof FLOORS[number]['id']

interface BookingLog {
  id: string
  reference_code: string
  title: string
  organizer_name: string
  status: string
  start_at: string
  end_at: string
  attendees_count: number
  space_names: string
  space_codes: string[]
  revenue: number
  revenue_locked: boolean
}

interface ReportData {
  total_bookings: number
  total_revenue: number
  pipeline_revenue: number
  avg_duration_hrs: number
  bookings: BookingLog[]
  chart_revenue: RevenueTrendPoint[]
  chart_spaces: SpaceUtilizationPoint[]
}

const STATUS_COLORS: Record<string, string> = {
  confirmed:   '#c8da2b',
  quoted:      '#378ADD',
  requested:   '#9a9890',
  in_progress: '#f4a261',
  completed:   '#3a5a12',
  cancelled:   '#e63946',
  red_alert:   '#e63946',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDuration(start: string, end: string) {
  const hrs = (new Date(end).getTime() - new Date(start).getTime()) / 3600000
  return `${hrs.toFixed(1)}h`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// Default to a 2-year window (1 year back + 1 year forward) so future bookings appear
function defaultStartStr() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  return d.toISOString().slice(0, 10)
}

function defaultEndStr() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  // Floor / space selection
  const [activeFloor, setActiveFloor]         = useState<FloorId | null>(null)
  const [selectedSpaces, setSelectedSpaces]   = useState<string[]>([])

  // Date range — wide default so future venue bookings are always visible
  const [startDate, setStartDate] = useState<string>(defaultStartStr())
  const [endDate,   setEndDate]   = useState<string>(defaultEndStr())

  // Report state
  const [report,    setReport]    = useState<ReportData | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [generated, setGenerated] = useState(false)
  const [apiError,  setApiError]  = useState<string | null>(null)

  const floorSpaces = FLOORS.find(f => f.id === activeFloor)?.spaces ?? []

  const toggleSpace = (code: string) =>
    setSelectedSpaces(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code])

  const toggleFloorAll = (floor: typeof FLOORS[number]) => {
    const codes = floor.spaces.map(s => s.code)
    const allSelected = codes.every(c => selectedSpaces.includes(c))
    if (allSelected) setSelectedSpaces(prev => prev.filter(c => !codes.includes(c)))
    else setSelectedSpaces(prev => [...new Set([...prev, ...codes])])
  }

  const handleGenerate = async () => {
    setLoading(true)
    setGenerated(false)
    setApiError(null)
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate })
      if (selectedSpaces.length > 0) params.set('space_codes', selectedSpaces.join(','))
      const res  = await fetch(`/api/reports?${params}`)
      const data = await res.json()
      if (!res.ok || data.error) { setApiError(data.error ?? `Server error ${res.status}`); return }
      setReport(data)
      setGenerated(true)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const presetRange = (preset: 'week' | 'month' | 'quarter') => {
    const now = new Date()
    const end = now.toISOString().slice(0, 10)
    const from = new Date(now)
    const to   = new Date(now)
    if (preset === 'week')    { from.setDate(now.getDate() - 7);    to.setDate(now.getDate() + 7) }
    if (preset === 'month')   { from.setMonth(now.getMonth() - 1);  to.setMonth(now.getMonth() + 1) }
    if (preset === 'quarter') { from.setMonth(now.getMonth() - 3);  to.setMonth(now.getMonth() + 3) }
    setStartDate(from.toISOString().slice(0, 10))
    setEndDate(to.toISOString().slice(0, 10))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        bi &amp; financial reports
      </h1>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ height: 54, borderBottom: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fafaf5', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890' }}>← dashboard</Link>
          <span style={{ display: 'block', width: 1, height: 18, background: '#e8e6dd' }} />
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="7" width="3" height="6" stroke="#1a1a1a" strokeWidth="1.3"/>
            <rect x="5" y="4" width="3" height="9" stroke="#1a1a1a" strokeWidth="1.3"/>
            <rect x="9" y="1" width="3" height="12" stroke="#1a1a1a" strokeWidth="1.3"/>
          </svg>
          <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>bi & financial reports</span>
        </div>
        {generated && report && (
          <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', letterSpacing: '0.08em' }}>
            {report.total_bookings} bookings · {selectedSpaces.length > 0 ? `${selectedSpaces.length} spaces` : 'all spaces'} · {formatDate(startDate + 'T12:00:00Z')} – {formatDate(endDate + 'T12:00:00Z')}
          </span>
        )}
      </div>

      {/* ── Filter panel ─────────────────────────────────────────────────── */}
      <div style={{ background: '#111110', borderBottom: '2px solid #252422', flexShrink: 0 }}>

        {/* Row 1: Floor toggles */}
        <div style={{ padding: '18px 32px 0', borderBottom: '1px solid #252422' }}>
          <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b6966', margin: '0 0 10px' }}>floor</p>
          <div style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
            {FLOORS.map(floor => {
              const isActive = activeFloor === floor.id
              const floorSelectedCount = floor.spaces.filter(s => selectedSpaces.includes(s.code)).length
              return (
                <button
                  key={floor.id}
                  onClick={() => setActiveFloor(isActive ? null : floor.id as FloorId)}
                  style={{
                    fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase',
                    padding: '9px 18px',
                    background: isActive ? '#c8da2b' : 'transparent',
                    color: isActive ? '#1a1a1a' : floorSelectedCount > 0 ? '#c8da2b' : '#6b6966',
                    border: `1.5px solid ${isActive ? '#c8da2b' : floorSelectedCount > 0 ? '#c8da2b' : '#3a3835'}`,
                    borderLeft: 'none',
                    cursor: 'pointer',
                    fontWeight: isActive || floorSelectedCount > 0 ? 600 : 400,
                    position: 'relative',
                  }}
                >
                  {floor.label}
                  {floorSelectedCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -7, right: -7,
                      background: '#c8da2b', color: '#1a1a1a',
                      fontFamily: M, fontSize: '7px', fontWeight: 700,
                      width: 16, height: 16, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #111110',
                    }}>
                      {floorSelectedCount}
                    </span>
                  )}
                </button>
              )
            })}
            <button
              onClick={() => { setActiveFloor(null); setSelectedSpaces([]) }}
              style={{
                fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '9px 14px', background: 'transparent', color: '#3a3835',
                border: '1px solid #252422', borderLeft: 'none', cursor: 'pointer',
              }}
            >
              clear
            </button>
          </div>
        </div>

        {/* Row 2: Space checkboxes for active floor (animated) */}
        <AnimatePresence>
          {activeFloor && (
            <motion.div
              key={activeFloor}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden', borderBottom: '1px solid #252422' }}
            >
              <div style={{ padding: '14px 32px', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                {/* Select all for floor */}
                <button
                  onClick={() => toggleFloorAll(FLOORS.find(f => f.id === activeFloor)!)}
                  style={{
                    fontFamily: M, fontSize: '7px', letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '5px 10px', background: 'transparent', color: '#c8da2b',
                    border: '1px solid #3a3835', cursor: 'pointer', marginRight: 4,
                  }}
                >
                  all
                </button>
                {floorSpaces.map(({ code, name }) => {
                  const checked = selectedSpaces.includes(code)
                  return (
                    <button
                      key={code}
                      onClick={() => toggleSpace(code)}
                      style={{
                        fontFamily: M, fontSize: '7.5px', letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '5px 10px',
                        background: checked ? 'rgba(200,218,43,0.12)' : 'transparent',
                        color: checked ? '#c8da2b' : '#6b6966',
                        border: `1px solid ${checked ? '#c8da2b' : '#3a3835'}`,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, border: `1.5px solid ${checked ? '#c8da2b' : '#3a3835'}`,
                        background: checked ? '#c8da2b' : 'transparent',
                        flexShrink: 0, display: 'inline-block',
                      }} />
                      <span style={{ fontWeight: checked ? 600 : 400 }}>{code}</span>
                      <span style={{ color: '#3a3835', fontSize: '6.5px', maxWidth: 80, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{name}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 3: Date pickers + generate */}
        <div style={{ padding: '16px 32px', display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b6966', margin: '0 0 8px' }}>Date Range</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.06em', color: '#f5f5f0', background: '#1a1a18', border: '1.5px solid #3a3835', padding: '8px 10px', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: M, fontSize: '8px', color: '#3a3835' }}>→</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.06em', color: '#f5f5f0', background: '#1a1a18', border: '1.5px solid #3a3835', padding: '8px 10px', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', gap: 0 }}>
            {(['week', 'month', 'quarter'] as const).map((p, i) => (
              <button
                key={p}
                onClick={() => presetRange(p)}
                style={{
                  fontFamily: M, fontSize: '7.5px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '8px 12px', background: '#1a1a18', color: '#6b6966',
                  border: '1.5px solid #3a3835', borderLeft: i > 0 ? 'none' : '1.5px solid #3a3835',
                  cursor: 'pointer',
                }}
              >
                {p === 'week' ? '7d' : p === 'month' ? '30d' : '90d'}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              fontFamily: M, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase',
              background: '#c8da2b', color: '#1a1a1a', border: 'none',
              padding: '12px 28px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, opacity: loading ? 0.7 : 1, marginLeft: 'auto',
            }}
          >
            {loading ? 'generating…' : 'generate report'}
          </button>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {apiError && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e63946', background: '#ffeaea', border: '1px solid #e63946', padding: '8px 16px' }}>
              Report Error: {apiError}
            </span>
          </motion.div>
        )}

        {!generated && !loading && !apiError && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4"  y="20" width="8" height="16" stroke="#d8d5cc" strokeWidth="2"/>
              <rect x="16" y="12" width="8" height="24" stroke="#d8d5cc" strokeWidth="2"/>
              <rect x="28" y="4"  width="8" height="32" stroke="#d8d5cc" strokeWidth="2"/>
            </svg>
            <p style={{ fontFamily: M, fontSize: '9px', color: '#9a9890', textTransform: 'uppercase', letterSpacing: '0.16em', margin: 0 }}>
              select filters and generate a report
            </p>
          </motion.div>
        )}

        {generated && report && (
          <motion.div key="report" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '2px solid #1a1a1a' }}>
              {[
                { label: 'Total Bookings',      value: report.total_bookings,                                sub: 'matched events',           accent: '#c8da2b' },
                { label: 'Confirmed Revenue',   value: `€${(report.total_revenue ?? 0).toLocaleString()}`,   sub: 'accepted quotes',           accent: '#378ADD' },
                { label: 'Pipeline Revenue',    value: `€${(report.pipeline_revenue ?? 0).toLocaleString()}`, sub: 'pending / not yet accepted', accent: '#f4a261' },
                { label: 'Avg Event Duration',  value: `${report.avg_duration_hrs}h`,                        sub: 'per booking',               accent: '#c8da2b' },
              ].map(({ label, value, sub, accent }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE, delay: i * 0.07 }}
                  style={{ padding: '24px 32px', borderRight: i < 3 ? '1px solid #e8e6dd' : 'none', background: '#fafaf5', borderBottom: `3px solid ${accent}` }}
                >
                  <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 10px' }}>{label}</p>
                  <p style={{ fontFamily: M, fontSize: '38px', fontWeight: 500, color: '#1a1a1a', margin: 0, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: '6px 0 0' }}>{sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts — 2-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #1a1a1a' }}>
              {/* Revenue Trend */}
              <div style={{ padding: '28px 32px', borderRight: '1px solid #e8e6dd', background: '#fafaf5' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                  <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b6966', margin: 0 }}>revenue trend</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.1em', color: '#c8da2b' }}>■ confirmed</span>
                    <span style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.1em', color: '#378ADD' }}>■ pipeline</span>
                  </div>
                </div>
                <RevenueTrendChart data={report.chart_revenue} />
              </div>

              {/* Space Utilization */}
              <div style={{ padding: '28px 32px', background: '#fafaf5' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
                  <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b6966', margin: 0 }}>space utilization</p>
                  <span style={{ fontFamily: M, fontSize: '7px', color: '#9a9890', letterSpacing: '0.06em' }}>by booking count</span>
                </div>
                <SpaceUtilizationChart data={report.chart_spaces} />
              </div>
            </div>

            {/* Booking log */}
            <div>
              <div style={{ padding: '14px 32px', borderBottom: '1px solid #e8e6dd', background: '#fafaf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b7280' }}>booking log</span>
                <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890' }}>{report.bookings.length} records</span>
              </div>

              {report.bookings.length === 0 ? (
                <div style={{ padding: '40px', fontFamily: M, fontSize: '9px', color: '#9a9890', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  no bookings match the selected filters
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <colgroup>
                    <col style={{ width: 130 }} />
                    <col />
                    <col style={{ width: 180 }} />
                    <col style={{ width: 130 }} />
                    <col style={{ width: 60 }} />
                    <col style={{ width: 80 }} />
                    <col style={{ width: 120 }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: '#f0ede4', borderBottom: '1px solid #e8e6dd' }}>
                      {['Ref', 'Title / Organizer', 'Space(s)', 'Date', 'Pax', 'Duration', 'Revenue'].map((h, i) => (
                        <th key={h} style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9890', textAlign: i === 6 ? 'right' : 'left', padding: '8px 16px', fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.bookings.map((b, idx) => (
                      <motion.tr key={b.id}
                        initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.02 }}
                        style={{ borderBottom: '1px solid #e8e6dd' }}
                      >
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontFamily: M, fontSize: '8.5px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.06em' }}>{b.reference_code}</span>
                          <div style={{ marginTop: 3 }}>
                            <span style={{ fontFamily: M, fontSize: '7.5px', color: STATUS_COLORS[b.status] ?? '#9a9890', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{b.status}</span>
                          </div>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <p style={{ fontFamily: D, fontSize: '12px', fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{b.title}</p>
                          <p style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', margin: '2px 0 0' }}>{b.organizer_name}</p>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontFamily: M, fontSize: '8px', color: '#6b7280' }}>{b.space_names || '—'}</span>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontFamily: M, fontSize: '8px', color: '#1a1a1a' }}>{formatDate(b.start_at)}</span>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontFamily: M, fontSize: '8px', color: '#6b7280' }}>{b.attendees_count}</span>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontFamily: M, fontSize: '8px', color: '#6b7280' }}>{formatDuration(b.start_at, b.end_at)}</span>
                        </td>
                        <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                          <span style={{ fontFamily: M, fontSize: '10px', fontWeight: 700, color: b.revenue > 0 ? '#1a1a1a' : '#c0bdb4' }}>
                            {b.revenue > 0 ? `€${b.revenue.toLocaleString()}` : '—'}
                          </span>
                          {b.revenue_locked && (
                            <span style={{ display: 'block', fontFamily: M, fontSize: '6.5px', color: '#c8da2b', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>locked</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
