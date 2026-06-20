'use client'

import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Event, EventStatus } from '@/types/api'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const M = 'var(--font-mono)'
const D = 'var(--font-display)'

type Task = { id: string; title: string; team: string; status: string; due_at: string }
type EventWithExtras = Event & { tasks?: Task[] }

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  requested:   { bg: '#f0ede4',             color: '#6b7280', dot: '#c0bdb4', label: 'requested' },
  quoted:      { bg: 'rgba(249,199,79,0.2)', color: '#7a3a00', dot: '#f9c74f', label: 'quoted' },
  confirmed:   { bg: '#c8da2b',             color: '#3a4400', dot: '#8fa018', label: 'confirmed' },
  in_progress: { bg: 'rgba(55,138,221,0.15)',color: '#042C53', dot: '#378ADD', label: 'in progress' },
  completed:   { bg: '#f5f5f0',             color: '#9a9890', dot: '#d8d5cc', label: 'completed' },
  cancelled:   { bg: 'rgba(230,57,70,0.12)', color: '#e63946', dot: '#e63946', label: 'cancelled' },
}

// ── Event type colors ─────────────────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  conference: '#378ADD', workshop: '#f4a261', reception: '#97C459',
  exhibition: '#5a4fcf', performance: '#e63946', meetup: '#2a9d8f',
}

// ── Space color map ───────────────────────────────────────────────────────────
const SPACE_COLOR: Record<string, string> = {
  blue: '#378ADD', orange: '#f4a261', green: '#97C459', yellow: '#f9c74f',
  red: '#e63946', purple: '#5a4fcf', teal: '#2a9d8f', coral: '#e07a5f',
}

// ── Team colors ───────────────────────────────────────────────────────────────
const TEAM_COLOR: Record<string, string> = {
  logistics: '#378ADD', av: '#5a4fcf', reception: '#f4a261',
  cleaning: '#97C459', security: '#e63946', catering: '#2a9d8f',
}

const ALL_STATUSES: EventStatus[] = ['requested', 'quoted', 'confirmed', 'in_progress', 'completed', 'cancelled']


// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
function durationH(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 3600000)
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid #e8e6dd' }}>
      {[100, 110, 260, 100, 140, 130, 55, 140].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <motion.div
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.07 }}
            style={{ height: 10, width: w * 0.7, background: '#e8e6dd', maxWidth: '100%' }}
          />
        </td>
      ))}
    </tr>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const [events, setEvents] = useState<EventWithExtras[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tasksByEvent, setTasksByEvent] = useState<Record<string, Task[]>>({})

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => {
        setEvents((d.events ?? []).map((e: Event) => ({ ...e, tasks: [] })))
        setLoading(false)
      })
  }, [])

  // Lazy-load tasks when an event row is expanded
  useEffect(() => {
    if (!expanded || tasksByEvent[expanded] !== undefined) return
    fetch(`/api/tasks?event_id=${expanded}`)
      .then(r => r.json())
      .then(d => setTasksByEvent(prev => ({ ...prev, [expanded]: d.tasks ?? [] })))
  }, [expanded, tasksByEvent])

  const counts = ALL_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: events.filter(e => e.status === s).length }),
    {} as Record<string, number>
  )

  const filtered = events.filter(e => {
    if (filter !== 'all' && e.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return e.title.toLowerCase().includes(q)
        || e.organizer_name.toLowerCase().includes(q)
        || e.reference_code.toLowerCase().includes(q)
    }
    return true
  })

  // Summary stats
  const confirmed = counts.confirmed ?? 0
  const quoted = counts.quoted ?? 0
  const requested = counts.requested ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#f0ede4', display: 'flex', flexDirection: 'column' }}>

      {/* ── Page header ── */}
      <div style={{ background: '#1a1a1a', padding: '28px 36px 0', flexShrink: 0 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Link href="/dashboard" style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#6b6966' }}>dashboard</Link>
          <span style={{ color: '#3a3835', fontSize: 10 }}>/</span>
          <span style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c8da2b' }}>Events</span>
        </div>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: D, fontSize: '32px', fontWeight: 500, color: '#f5f5f0', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              event register
            </h1>
            {/* Inline stat chips */}
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', background: 'rgba(255,255,255,0.07)', color: '#9a9890' }}>
                {events.length} total
              </span>
              {confirmed > 0 && (
                <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', background: '#c8da2b', color: '#3a4400' }}>
                  {confirmed} confirmed
                </span>
              )}
              {quoted > 0 && (
                <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', background: 'rgba(249,199,79,0.2)', color: '#f9c74f' }}>
                  {quoted} quoted
                </span>
              )}
              {requested > 0 && (
                <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', background: 'rgba(255,255,255,0.07)', color: '#9a9890' }}>
                  {requested} requested
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingBottom: 2 }}>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', width: 240 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="5" cy="5" r="4" stroke="#6b6966" strokeWidth="1.4" />
                <line x1="8.2" y1="8.2" x2="11" y2="11" stroke="#6b6966" strokeWidth="1.4" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search events, refs, organizers…"
                style={{ fontFamily: M, fontSize: '9.5px', letterSpacing: '0.04em', border: 'none', background: 'transparent', outline: 'none', color: '#f5f5f0', width: '100%' }}
              />
            </div>
            <Link href="/book" style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: '#3a4400', background: '#c8da2b', padding: '9px 20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><line x1="5.5" y1="1" x2="5.5" y2="10" stroke="currentColor" strokeWidth="1.8"/><line x1="1" y1="5.5" x2="10" y2="5.5" stroke="currentColor" strokeWidth="1.8"/></svg>
               new booking
            </Link>
          </div>
        </div>

        {/* Status filter tabs — pinned to bottom of dark header */}
        <div style={{ display: 'flex', gap: 0, marginLeft: -36, paddingLeft: 36, overflowX: 'auto' }}>
          {(['all', ...ALL_STATUSES]).map(s => {
            const active = filter === s
            const count = s === 'all' ? events.length : (counts[s] ?? 0)
            const cfg = s !== 'all' ? STATUS[s] : null
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  fontFamily: M, fontSize: '9.5px', letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '10px 18px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: active ? '#f0ede4' : 'transparent',
                  color: active ? '#1a1a1a' : '#6b6966',
                  borderTop: `2px solid ${active ? '#c8da2b' : 'transparent'}`,
                  marginTop: 2,
                  transition: 'all 0.15s',
                }}
              >
                {cfg && <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: active ? cfg.dot : '#3a3835', flexShrink: 0 }} />}
                {s === 'all' ? 'all events' : STATUS[s]?.label ?? s}
                <span style={{
                  fontFamily: M, fontSize: '9px', padding: '1px 6px',
                  background: active ? (s === 'confirmed' ? '#c8da2b' : '#e8e6dd') : 'rgba(255,255,255,0.08)',
                  color: active ? (s === 'confirmed' ? '#3a4400' : '#1a1a1a') : '#6b6966',
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ flex: 1, overflowX: 'auto', background: '#fafaf5' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <colgroup>
            <col style={{ width: 130 }} />
            <col style={{ width: 120 }} />
            <col />
            <col style={{ width: 108 }} />
            <col style={{ width: 148 }} />
            <col style={{ width: 148 }} />
            <col style={{ width: 56 }} />
            <col style={{ width: 160 }} />
          </colgroup>

          {/* Sticky header */}
          <thead>
            <tr style={{ background: '#f0ede4', borderBottom: '2px solid #1a1a1a', position: 'sticky', top: 0, zIndex: 5 }}>
              {[
                { label: 'status',     align: 'left' as const },
                { label: 'ref',        align: 'left' as const },
                { label: 'event',      align: 'left' as const },
                { label: 'type',       align: 'left' as const },
                { label: 'date · time',align: 'left' as const },
                { label: 'space',      align: 'left' as const },
                { label: 'pax',        align: 'right' as const },
                { label: 'organizer',  align: 'left' as const },
              ].map(({ label, align }) => (
                <th key={label} style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', textAlign: align, padding: '11px 16px', fontWeight: 500, borderRight: '1px solid #e8e6dd' }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Skeleton */}
            {loading && [0, 1, 2].map(i => <SkeletonRow key={i} />)}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '72px 0', textAlign: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ display: 'block', margin: '0 auto 16px' }}>
                    <rect x="4" y="8" width="32" height="28" stroke="#d8d5cc" strokeWidth="2" />
                    <line x1="4" y1="15" x2="36" y2="15" stroke="#d8d5cc" strokeWidth="2" />
                    <line x1="12" y1="4" x2="12" y2="12" stroke="#d8d5cc" strokeWidth="2" />
                    <line x1="28" y1="4" x2="28" y2="12" stroke="#d8d5cc" strokeWidth="2" />
                    <line x1="11" y1="24" x2="29" y2="24" stroke="#e8e6dd" strokeWidth="1.5" />
                    <line x1="11" y1="29" x2="22" y2="29" stroke="#e8e6dd" strokeWidth="1.5" />
                  </svg>
                  <p style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c0bdb4', margin: '0 0 6px' }}>
                    No events match
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#c0bdb4', margin: 0 }}>
                    Try adjusting the filter or search term
                  </p>
                </td>
              </tr>
            )}

            {/* Event rows */}
            {filtered.map((evt, i) => {
              const st = STATUS[evt.status] ?? STATUS.requested
              const isOpen = expanded === evt.id
              const typeColor = TYPE_COLOR[evt.event_type ?? ''] ?? '#9a9890'
              const spaceColor = SPACE_COLOR[evt.spaces[0]?.color ?? ''] ?? '#9a9890'

              return (
                <Fragment key={evt.id}>
                  {/* Main row */}
                  <motion.tr
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: EASE, delay: i * 0.05 }}
                    onClick={() => setExpanded(isOpen ? null : evt.id)}
                    style={{
                      borderBottom: isOpen ? 'none' : '1px solid #e8e6dd',
                      cursor: 'pointer',
                      background: isOpen ? '#fffffe' : 'transparent',
                      outline: isOpen ? '2px solid #c8da2b' : 'none',
                      outlineOffset: -1,
                    }}
                  >
                    {/* Status */}
                    <td style={{ padding: '15px 16px', borderRight: '1px solid #e8e6dd' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                        <span style={{ fontFamily: M, fontSize: '9.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                    </td>

                    {/* Ref */}
                    <td style={{ padding: '15px 16px', borderRight: '1px solid #e8e6dd', fontFamily: M, fontSize: '9.5px', color: '#9a9890', letterSpacing: '0.06em' }}>
                      {evt.reference_code}
                    </td>

                    {/* Event title */}
                    <td style={{ padding: '13px 16px', borderRight: '1px solid #e8e6dd' }}>
                      <p style={{ fontFamily: D, fontSize: '14px', fontWeight: 500, color: '#1a1a1a', margin: '0 0 3px', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {evt.title}
                      </p>
                      {evt.notes && (
                        <p style={{ fontFamily: M, fontSize: '8.5px', color: '#9a9890', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                          {evt.notes}
                        </p>
                      )}
                    </td>

                    {/* Event type */}
                    <td style={{ padding: '15px 16px', borderRight: '1px solid #e8e6dd' }}>
                      <span style={{ fontFamily: M, fontSize: '8.5px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', background: `${typeColor}1a`, color: typeColor }}>
                        {evt.event_type ?? '—'}
                      </span>
                    </td>

                    {/* Date & time */}
                    <td style={{ padding: '13px 16px', borderRight: '1px solid #e8e6dd' }}>
                      <p style={{ fontFamily: M, fontSize: '10px', color: '#1a1a1a', margin: '0 0 3px', letterSpacing: '0.04em' }}>
                        {fmtDate(evt.start_at)}
                      </p>
                      <p style={{ fontFamily: M, fontSize: '8.5px', color: '#9a9890', margin: 0 }}>
                        {fmtTime(evt.start_at)} – {fmtTime(evt.end_at)} · {durationH(evt.start_at, evt.end_at)}h
                      </p>
                    </td>

                    {/* Space */}
                    <td style={{ padding: '15px 16px', borderRight: '1px solid #e8e6dd' }}>
                      {evt.spaces[0] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ display: 'block', width: 8, height: 8, background: spaceColor, flexShrink: 0 }} />
                          <span style={{ fontFamily: M, fontSize: '9.5px', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {evt.spaces[0].name}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontFamily: M, fontSize: '9.5px', color: '#c0bdb4' }}>TBC</span>
                      )}
                    </td>

                    {/* Pax */}
                    <td style={{ padding: '15px 16px', borderRight: '1px solid #e8e6dd', fontFamily: M, fontSize: '12px', fontWeight: 600, color: '#1a1a1a', textAlign: 'right', letterSpacing: '-0.01em' }}>
                      {evt.attendees_count}
                    </td>

                    {/* Organizer */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontFamily: M, fontSize: '9.5px', color: '#1a1a1a', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {evt.organizer_name}
                          </p>
                          <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {evt.organizer_org ?? evt.organizer_email}
                          </p>
                        </div>
                        <motion.svg
                          width="14" height="14" viewBox="0 0 14 14" fill="none"
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={{ duration: 0.2, ease: EASE }}
                          style={{ flexShrink: 0, marginLeft: 8 }}
                        >
                          <path d="M5 3l4 4-4 4" stroke={isOpen ? '#c8da2b' : '#c0bdb4'} strokeWidth="1.6" />
                        </motion.svg>
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expanded detail panel */}
                  <tr style={{ display: isOpen ? 'table-row' : 'none', background: '#fffffe' }}>
                    <td colSpan={8} style={{ padding: 0, borderBottom: '2px solid #c8da2b', borderLeft: '2px solid #c8da2b', borderRight: '2px solid #c8da2b' }}>
                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', borderTop: '1px solid #e8e6dd' }}>

                          {/* Tasks */}
                          <div style={{ padding: '20px 24px', borderRight: '1px solid #e8e6dd' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <rect x="0.5" y="0.5" width="12" height="12" stroke="#9a9890" strokeWidth="1.2" />
                                <path d="M3 6.5l2.5 2.5 4-4.5" stroke="#c8da2b" strokeWidth="1.3" />
                              </svg>
                              <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', margin: 0 }}>
                                pre-event tasks · {(tasksByEvent[evt.id] ?? []).length}
                              </p>
                            </div>
                            {(tasksByEvent[evt.id] ?? []).map((t, ti) => (
                              <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: ti * 0.04 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: ti < (tasksByEvent[evt.id] ?? []).length - 1 ? '1px solid #f0ede4' : 'none' }}
                              >
                                <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: TEAM_COLOR[t.team] ?? '#9a9890', flexShrink: 0 }} />
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1a1a1a', flex: 1 }}>{t.title}</span>
                                <span style={{ fontFamily: M, fontSize: '8px', color: '#fff', background: TEAM_COLOR[t.team] ?? '#9a9890', padding: '1px 7px', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
                                  {t.team}
                                </span>
                              </motion.div>
                            ))}
                            {(tasksByEvent[evt.id] ?? []).length === 0 && (
                              <p style={{ fontFamily: M, fontSize: '9px', color: '#c0bdb4', letterSpacing: '0.06em' }}>No tasks assigned yet</p>
                            )}
                          </div>

                          {/* Assets */}
                          <div style={{ padding: '20px 24px', borderRight: '1px solid #e8e6dd' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <rect x="0.5" y="3.5" width="12" height="9" stroke="#9a9890" strokeWidth="1.2" />
                                <path d="M3.5 3.5V2.5a3 3 0 016 0v1" stroke="#9a9890" strokeWidth="1.2" />
                              </svg>
                              <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', margin: 0 }}>
                                booked assets · {evt.assets.length}
                              </p>
                            </div>
                            {evt.assets.map(({ asset, quantity }, ai) => (
                              <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: ai < evt.assets.length - 1 ? '1px solid #f0ede4' : 'none' }}>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1a1a1a' }}>{asset.name}</span>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                  <span style={{ fontFamily: M, fontSize: '11px', fontWeight: 600, color: '#1a1a1a' }}>×{quantity}</span>
                                  <span style={{ fontFamily: M, fontSize: '9px', color: '#9a9890' }}>€{(asset.unit_rate_eur * quantity).toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                            {evt.assets.length === 0 && (
                              <p style={{ fontFamily: M, fontSize: '9px', color: '#c0bdb4', letterSpacing: '0.06em' }}>No assets assigned</p>
                            )}
                          </div>

                          {/* Event meta */}
                          <div style={{ padding: '20px 24px', background: '#f8f6f0' }}>
                            <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 14px' }}>
                              event details
                            </p>
                            {[
                              { label: 'Email', value: evt.organizer_email },
                              { label: 'Org', value: evt.organizer_org ?? '—' },
                              { label: 'Created', value: new Date(evt.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                              { label: 'Updated', value: new Date(evt.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                              ...(evt.setup_start_at ? [{ label: 'Setup', value: `${fmtTime(evt.setup_start_at)} ${new Date(evt.setup_start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` }] : []),
                            ].map(({ label, value }) => (
                              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>{label}</span>
                                <span style={{ fontFamily: M, fontSize: '9px', color: '#1a1a1a', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                              </div>
                            ))}
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {evt.spaces[0] && (
                                <Link
                                  href={`/spaces/${evt.spaces[0].code.toLowerCase()}`}
                                  style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#5a6612', background: '#c8da2b', padding: '6px 12px', textAlign: 'center' }}
                                >
                                  view space →
                                </Link>
                              )}
                              <Link
                                href="/dashboard/conflicts"
                                style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890', border: '1px solid #e8e6dd', padding: '5px 12px', textAlign: 'center' }}
                              >
                                check conflicts →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Footer bar ── */}
      <div style={{ borderTop: '2px solid #1a1a1a', padding: '10px 32px', background: '#fafaf5', display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {ALL_STATUSES.filter(s => (counts[s] ?? 0) > 0).map(s => {
            const cfg = STATUS[s]
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? 'all' : s)}
                style={{ fontFamily: M, fontSize: '8.5px', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: filter === s ? '#1a1a1a' : '#9a9890', padding: 0 }}
              >
                <span style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
                {cfg.label}
                <span style={{ fontFamily: M, fontSize: '9px', fontWeight: 600, color: '#1a1a1a' }}>{counts[s]}</span>
              </button>
            )
          })}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: M, fontSize: '9px', color: '#9a9890', letterSpacing: '0.06em' }}>
          {filtered.length} of {events.length} events shown
        </span>
      </div>
    </div>
  )
}
