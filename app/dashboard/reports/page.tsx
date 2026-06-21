'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const M = 'var(--font-mono)'
const D = 'var(--font-display)'

type DateRange = 'this_week' | 'this_month' | 'all_time'

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
  revenue: number
  revenue_locked: boolean
}

interface ReportData {
  total_bookings: number
  total_revenue: number
  pipeline_revenue: number
  avg_duration_hrs: number
  bookings: BookingLog[]
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

const AVAILABLE_SPACES = [
  { code: 'BLUE',   name: 'Blue Space' },
  { code: 'ORANGE', name: 'Orange Space' },
  { code: 'GREEN',  name: 'Green Box' },
  { code: 'YELLOW', name: 'Yellow Roof Box' },
  { code: 'A1',     name: 'Ground Ring A1' },
  { code: 'B1',     name: 'Basement Studio B1' },
  { code: 'L3-A',   name: 'Level 3 Suite A' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDuration(start: string, end: string) {
  const hrs = (new Date(end).getTime() - new Date(start).getTime()) / 3600000
  return `${hrs.toFixed(1)}h`
}

export default function ReportsPage() {
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange>('all_time')
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const toggleSpace = (code: string) => {
    setSelectedSpaces(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code])
  }

  const handleGenerate = async () => {
    setLoading(true)
    setGenerated(false)
    setApiError(null)
    try {
      const params = new URLSearchParams({ date_range: dateRange })
      if (selectedSpaces.length > 0) params.set('space_codes', selectedSpaces.join(','))
      const res = await fetch(`/api/reports?${params}`)
      const data = await res.json()
      if (!res.ok || data.error) {
        setApiError(data.error ?? `Server error ${res.status}`)
        return
      }
      setReport(data)
      setGenerated(true)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>bi & financial reports</h1>

      {/* Top bar */}
      <div style={{ height: 54, borderBottom: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fafaf5', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890' }}>← dashboard</Link>
          <span style={{ display: 'block', width: 1, height: 18, background: '#e8e6dd' }} />
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="7" width="3" height="6" stroke="#1a1a1a" strokeWidth="1.3"/><rect x="5" y="4" width="3" height="9" stroke="#1a1a1a" strokeWidth="1.3"/><rect x="9" y="1" width="3" height="12" stroke="#1a1a1a" strokeWidth="1.3"/></svg>
          <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>bi & financial reports</span>
        </div>
        {generated && report && (
          <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', letterSpacing: '0.08em' }}>
            Report generated · {report.total_bookings} bookings found
          </span>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ background: '#111110', borderBottom: '2px solid #252422', padding: '20px 32px', display: 'flex', gap: 24, alignItems: 'flex-end', flexShrink: 0 }}>
        {/* Space multi-select */}
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b6966', margin: '0 0 10px' }}>Select Spaces</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {AVAILABLE_SPACES.map(({ code, name }) => {
              const active = selectedSpaces.includes(code)
              return (
                <button key={code} onClick={() => toggleSpace(code)}
                  style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px', background: active ? '#c8da2b' : 'transparent', color: active ? '#1a1a1a' : '#6b6966', border: `1.5px solid ${active ? '#c8da2b' : '#3a3835'}`, cursor: 'pointer', transition: 'all 0.12s', fontWeight: active ? 600 : 400 }}>
                  {name}
                </button>
              )
            })}
            <button onClick={() => setSelectedSpaces([])} style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 10px', background: 'transparent', color: '#3a3835', border: '1px solid #252422', cursor: 'pointer' }}>
              All
            </button>
          </div>
        </div>

        {/* Date range */}
        <div>
          <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b6966', margin: '0 0 10px' }}>Date Range</p>
          <div style={{ display: 'flex', gap: 0 }}>
            {([['this_week', 'This Week'], ['this_month', 'This Month'], ['all_time', 'All Time']] as [DateRange, string][]).map(([val, lbl]) => (
              <button key={val} onClick={() => setDateRange(val)}
                style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 14px', background: dateRange === val ? '#c8da2b' : '#1a1a18', color: dateRange === val ? '#1a1a1a' : '#6b6966', border: '1.5px solid #3a3835', borderLeft: val === 'this_week' ? '1.5px solid #3a3835' : 'none', cursor: 'pointer', fontWeight: dateRange === val ? 600 : 400 }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Generate */}
        <button onClick={handleGenerate} disabled={loading}
          style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', background: '#c8da2b', color: '#1a1a1a', border: 'none', padding: '12px 24px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, flexShrink: 0, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Generating…' : 'Generate Report'}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {!generated && !loading && apiError && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e63946', background: '#ffeaea', border: '1px solid #e63946', padding: '8px 16px' }}>Report Error: {apiError}</span>
            <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: 0 }}>Check server logs for the full Supabase error.</p>
          </motion.div>
        )}
        {!generated && !loading && !apiError && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="20" width="8" height="16" stroke="#d8d5cc" strokeWidth="2"/><rect x="16" y="12" width="8" height="24" stroke="#d8d5cc" strokeWidth="2"/><rect x="28" y="4" width="8" height="32" stroke="#d8d5cc" strokeWidth="2"/></svg>
            <p style={{ fontFamily: M, fontSize: '9px', color: '#9a9890', textTransform: 'uppercase', letterSpacing: '0.16em', margin: 0 }}>Select filters and generate a report</p>
          </motion.div>
        )}

        {generated && report && (
          <motion.div key="report" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
            {/* KPI summary — 4 metrics: bookings, confirmed revenue, pipeline, avg duration */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '2px solid #1a1a1a' }}>
              {[
                { label: 'Total Bookings',       value: report.total_bookings,                              sub: 'matched events',          accent: '#c8da2b' },
                { label: 'Confirmed Revenue',    value: `€${(report.total_revenue ?? 0).toLocaleString()}`,    sub: 'accepted quotes',            accent: '#378ADD' },
                { label: 'Pipeline Revenue',     value: `€${(report.pipeline_revenue ?? 0).toLocaleString()}`, sub: 'pending / not yet accepted', accent: '#f4a261' },
                { label: 'Avg Event Duration',   value: `${report.avg_duration_hrs}h`,                     sub: 'per booking',             accent: '#c8da2b' },
              ].map(({ label, value, sub, accent }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE, delay: i * 0.07 }}
                  style={{ padding: '24px 32px', borderRight: i < 3 ? '1px solid #e8e6dd' : 'none', background: '#fafaf5', borderBottom: `3px solid ${accent}` }}>
                  <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 10px' }}>{label}</p>
                  <p style={{ fontFamily: M, fontSize: '38px', fontWeight: 500, color: '#1a1a1a', margin: 0, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: '6px 0 0' }}>{sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Booking log */}
            <div>
              <div style={{ padding: '14px 32px', borderBottom: '1px solid #e8e6dd', background: '#fafaf5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b7280' }}>Booking Log</span>
                <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890' }}>{report.bookings.length} records</span>
              </div>
              {report.bookings.length === 0 ? (
                <div style={{ padding: '32px', fontFamily: M, fontSize: '9px', color: '#9a9890', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.12em' }}>No bookings match the selected filters.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <colgroup>
                    <col style={{ width: 130 }} />
                    <col />
                    <col style={{ width: 160 }} />
                    <col style={{ width: 130 }} />
                    <col style={{ width: 70 }} />
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
                      <motion.tr key={b.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: idx * 0.025 }}
                        style={{ borderBottom: '1px solid #e8e6dd' }}>
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
                        <td style={{ padding: '11px 16px', textAlign: 'left' }}>
                          <span style={{ fontFamily: M, fontSize: '8px', color: '#6b7280' }}>{b.attendees_count}</span>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontFamily: M, fontSize: '8px', color: '#6b7280' }}>{formatDuration(b.start_at, b.end_at)}</span>
                        </td>
                        <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                          <span style={{ fontFamily: M, fontSize: '10px', fontWeight: 700, color: b.revenue > 0 ? '#1a1a1a' : '#c0bdb4' }}>
                            {b.revenue > 0 ? `€${b.revenue.toLocaleString()}` : '—'}
                          </span>
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
