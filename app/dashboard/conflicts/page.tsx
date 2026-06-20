'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Event } from '@/types/api'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const M = 'var(--font-mono)'
const D = 'var(--font-display)'

type ConflictType = 'space_double_booked' | 'asset_oversold' | 'setup_overlap' | 'capacity_exceeded'
type Severity = 'high' | 'medium' | 'low'

interface ConflictEvent { id: string; reference_code: string; title: string; status: string; start_at: string; organizer_name: string }
interface ConflictSpace { id: string; code: string; name: string; floor: string; color?: string }
interface ConflictFull {
  id: string; type: ConflictType; severity: Severity
  description: string
  related_events: ConflictEvent[]
  related_spaces: ConflictSpace[]
}

const SEV: Record<Severity, { bg: string; text: string; border: string; label: string }> = {
  high:   { bg: 'rgba(230,57,70,0.07)',   text: '#e63946', border: '#e63946', label: 'HIGH' },
  medium: { bg: 'rgba(244,162,97,0.07)',  text: '#c05a00', border: '#f4a261', label: 'MEDIUM' },
  low:    { bg: 'rgba(200,218,43,0.07)',  text: '#5a6612', border: '#c8da2b', label: 'LOW' },
}

const TYPE_INFO: Record<ConflictType, { label: string; guide: string[] }> = {
  space_double_booked: {
    label: 'space double booked',
    guide: [
      'Contact second organizer within 24h to discuss alternatives',
      'Identify available alternative spaces for the affected time slot',
      'Update booking references and notify both organizers in writing',
      'Log resolution decision with timestamp and close this conflict',
    ],
  },
  asset_oversold: {
    label: 'asset oversold',
    guide: [
      'Check asset return schedule from previous or concurrent event',
      'Identify the shortage gap and contact rental suppliers for extras',
      'Notify affected organizer and update the quote if substitution required',
      'Flag for inventory review post-event to prevent recurrence',
    ],
  },
  setup_overlap: {
    label: 'setup / teardown overlap',
    guide: [
      'Review setup and teardown window requirements for both events',
      'Negotiate access time adjustments with the earlier organizer\'s team',
      'Update run-sheet and brief logistics team on revised windows',
      'Confirm revised timeline in writing with all parties',
    ],
  },
  capacity_exceeded: {
    label: 'capacity exceeded',
    guide: [
      'Review confirmed attendee count against space fire certificate limit',
      'Contact organizer to reduce headcount or upgrade to larger space',
      'Check alternative larger space availability and generate revised quote',
      'Update space assignment and obtain organizer written confirmation',
    ],
  },
}

const FLOOR_LABELS: Record<string, string> = {
  l0: 'Ground · L0', l3: 'Level L+3', l_minus_1: 'Basement · B1', exterior: 'Exterior', roof: 'Rooftop',
}

const SPACE_COLORS: Record<string, string> = {
  blue: '#378ADD', orange: '#f4a261', green: '#97C459', yellow: '#f9c74f',
  red: '#e63946', purple: '#5a4fcf', teal: '#2a9d8f', coral: '#e07a5f',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<ConflictFull[]>([])
  const [redAlerts, setRedAlerts] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [resolved, setResolved] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState<Record<string, boolean[]>>({})
  const [handlingAlert, setHandlingAlert] = useState<string | null>(null)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      fetch('/api/conflicts').then(r => r.json()),
      fetch('/api/events').then(r => r.json()),
    ]).then(([conflictsData, eventsData]) => {
      const allConflicts = conflictsData.conflicts ?? []
      setConflicts(allConflicts)
      const init: Record<string, boolean[]> = {}
      allConflicts.forEach((c: ConflictFull) => {
        init[c.id] = (TYPE_INFO[c.type]?.guide ?? []).map(() => false)
      })
      setChecked(init)
      const alerts = (eventsData.events ?? []).filter((e: Event) => e.status === 'red_alert')
      setRedAlerts(alerts)
      setLoading(false)
    })
  }, [])

  async function handleAlertAction(eventId: string, newStatus: 'confirmed' | 'cancelled') {
    setHandlingAlert(eventId)
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setDismissedAlerts(prev => new Set([...prev, eventId]))
      }
    } finally {
      setHandlingAlert(null)
    }
  }

  function toggleStep(conflictId: string, stepIdx: number) {
    setChecked(prev => ({
      ...prev,
      [conflictId]: prev[conflictId].map((v, i) => i === stepIdx ? !v : v),
    }))
  }

  function markResolved(id: string) {
    setResolved(prev => new Set([...prev, id]))
  }

  const activeAlerts = redAlerts.filter(e => !dismissedAlerts.has(e.id))
  const active = conflicts.filter(c => !resolved.has(c.id))
  const done = conflicts.filter(c => resolved.has(c.id))

  const bySeq: Severity[] = ['high', 'medium', 'low']
  const grouped = bySeq.map(s => ({ sev: s, items: active.filter(c => c.severity === s) })).filter(g => g.items.length > 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        conflict resolution
      </h1>
      <div style={{ height: 54, borderBottom: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fafaf5', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890' }}>← dashboard</Link>
          <span style={{ display: 'block', width: 1, height: 18, background: '#e8e6dd' }} />
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><polygon points="6.5,1 12.5,12.5 0.5,12.5" stroke={active.length > 0 ? '#e63946' : '#9a9890'} strokeWidth="1.4" fill="none"/><line x1="6.5" y1="5" x2="6.5" y2="8.5" stroke={active.length > 0 ? '#e63946' : '#9a9890'} strokeWidth="1.4"/><circle cx="6.5" cy="10.5" r="0.7" fill={active.length > 0 ? '#e63946' : '#9a9890'}/></svg>
          <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>conflict resolution</span>
          {active.length > 0 && (
            <span style={{ fontFamily: M, fontSize: '8px', background: '#e63946', color: '#fff', padding: '1px 7px', letterSpacing: '0.06em' }}>{active.length} active</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {done.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#c8da2b" strokeWidth="1.4"/><path d="M3.5 6l2 2 3-3" stroke="#5a6612" strokeWidth="1.4"/></svg>
              <span style={{ fontFamily: M, fontSize: '8px', color: '#5a6612', letterSpacing: '0.08em' }}>{done.length} resolved this session</span>
            </div>
          )}
          <Link href="/dashboard/events" style={{ fontFamily: M, fontSize: '8.5px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#6b7280', padding: '6px 14px', border: '1px solid #d8d5cc' }}>
            view events
          </Link>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '60px', textAlign: 'center', fontFamily: M, fontSize: '9px', color: '#9a9890', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Loading conflict data…
        </div>
      )}

      {/* ── Red Alert Priority Requests ────────────────────────────────── */}
      {!loading && activeAlerts.length > 0 && (
        <div>
          {/* Section header */}
          <div style={{ padding: '10px 32px', background: 'rgba(230,57,70,0.1)', borderBottom: '2px solid #e63946', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <polygon points="6.5,1 12.5,12.5 0.5,12.5" stroke="#e63946" strokeWidth="1.4" fill="none"/>
              <line x1="6.5" y1="5" x2="6.5" y2="8.5" stroke="#e63946" strokeWidth="1.4"/>
              <circle cx="6.5" cy="10.5" r="0.7" fill="#e63946"/>
            </svg>
            <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#e63946', fontWeight: 700 }}>RED ALERT — PRIORITY REQUESTS</span>
            <span style={{ fontFamily: M, fontSize: '8px', background: '#e63946', color: '#fff', padding: '1px 7px' }}>{activeAlerts.length}</span>
          </div>

          {activeAlerts.map((alert, ai) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: ai * 0.05 }}
              style={{ borderBottom: '1px solid rgba(230,57,70,0.25)', background: 'rgba(230,57,70,0.04)', padding: '20px 32px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'flex-start' }}>
                <div>
                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#e63946', background: 'rgba(230,57,70,0.12)', padding: '3px 8px', border: '1px solid rgba(230,57,70,0.3)' }}>
                      RED ALERT
                    </span>
                    <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', letterSpacing: '0.06em' }}>{alert.reference_code}</span>
                    <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890' }}>·</span>
                    <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890' }}>
                      {new Date(alert.start_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {' '}
                      {new Date(alert.start_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(alert.end_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Event title */}
                  <p style={{ fontFamily: D, fontSize: '15px', fontWeight: 500, color: '#1a1a1a', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                    {alert.title}
                  </p>
                  <p style={{ fontFamily: M, fontSize: '8.5px', color: '#6b7280', margin: '0 0 12px' }}>
                    {alert.organizer_name} · {alert.organizer_email}
                    {alert.spaces[0] ? ` · ${alert.spaces[0].name}` : ''}
                    {' · '}{alert.attendees_count} pax
                  </p>

                  {/* User's priority message */}
                  {alert.notes && (
                    <div style={{ background: 'rgba(230,57,70,0.07)', border: '1px solid rgba(230,57,70,0.25)', padding: '12px 16px' }}>
                      <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#e63946', margin: '0 0 6px' }}>
                        organizer message
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#1a1a1a', margin: 0, lineHeight: 1.6 }}>
                        {alert.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                  <button
                    onClick={() => handleAlertAction(alert.id, 'confirmed')}
                    disabled={handlingAlert === alert.id}
                    style={{
                      fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase',
                      padding: '10px 18px', border: 'none', cursor: 'pointer',
                      background: '#c8da2b', color: '#3a4400', fontWeight: 700,
                      opacity: handlingAlert === alert.id ? 0.6 : 1,
                    }}
                  >
                    {handlingAlert === alert.id ? '…' : '✓ override & confirm'}
                  </button>
                  <button
                    onClick={() => handleAlertAction(alert.id, 'cancelled')}
                    disabled={handlingAlert === alert.id}
                    style={{
                      fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase',
                      padding: '9px 18px', border: '1px solid rgba(230,57,70,0.4)', cursor: 'pointer',
                      background: 'transparent', color: '#e63946',
                      opacity: handlingAlert === alert.id ? 0.6 : 1,
                    }}
                  >
                    ✕ reject request
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* All clear state */}
      {!loading && active.length === 0 && activeAlerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 64px' }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 28 }}>
            <circle cx="32" cy="32" r="30" stroke="#c8da2b" strokeWidth="2" />
            <path d="M20 32l9 9 15-15" stroke="#5a6612" strokeWidth="2.5" />
          </svg>
          <h2 style={{ fontFamily: D, fontSize: '28px', fontWeight: 500, color: '#1a1a1a', margin: '0 0 10px', letterSpacing: '-0.02em' }}>no active conflicts</h2>
          <p style={{ fontFamily: M, fontSize: '10px', color: '#9a9890', margin: 0, letterSpacing: '0.08em' }}>All scheduling conflicts have been resolved or none detected</p>
          {done.length > 0 && (
            <div style={{ marginTop: 32, padding: '14px 24px', border: '1px solid #e8e6dd', background: '#fafaf5' }}>
              <p style={{ fontFamily: M, fontSize: '8.5px', color: '#5a6612', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ✓ {done.length} conflict{done.length > 1 ? 's' : ''} resolved this session
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Conflict groups */}
      {!loading && grouped.map(({ sev, items }) => {
        const sevStyle = SEV[sev]
        return (
          <div key={sev}>
            {/* Severity banner */}
            <div style={{ padding: '10px 32px', background: sevStyle.bg, borderBottom: `2px solid ${sevStyle.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.22em', textTransform: 'uppercase', color: sevStyle.text, fontWeight: 700 }}>{sevStyle.label} SEVERITY</span>
              <span style={{ fontFamily: M, fontSize: '8px', color: sevStyle.text, opacity: 0.7 }}>·</span>
              <span style={{ fontFamily: M, fontSize: '8px', color: sevStyle.text, opacity: 0.7, letterSpacing: '0.08em' }}>{items.length} conflict{items.length > 1 ? 's' : ''} requiring attention</span>
            </div>

            {items.map((conflict, ci) => {
              const info = TYPE_INFO[conflict.type]
              const steps = info?.guide ?? []
              const stepsChecked = checked[conflict.id] ?? steps.map(() => false)
              const allChecked = stepsChecked.every(Boolean)

              return (
                <motion.div
                  key={conflict.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE, delay: ci * 0.06 }}
                  style={{ borderBottom: '2px solid #e8e6dd', background: '#fafaf5' }}
                >
                  {/* Conflict header */}
                  <div style={{ padding: '20px 32px 16px', borderBottom: '1px solid #e8e6dd', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: sevStyle.text, background: `${sevStyle.border}18`, padding: '3px 8px', border: `1px solid ${sevStyle.border}40` }}>
                          {sevStyle.label}
                        </span>
                        <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6b7280', background: '#f0ede4', padding: '3px 8px' }}>
                          {info?.label ?? conflict.type.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontFamily: M, fontSize: '8px', color: '#c0bdb4' }}>{conflict.id.toUpperCase()}</span>
                      </div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1a1a1a', margin: 0, lineHeight: 1.6, maxWidth: 640 }}>
                        {conflict.description}
                      </p>
                    </div>
                    <button
                      onClick={() => markResolved(conflict.id)}
                      disabled={!allChecked}
                      style={{
                        fontFamily: M, fontSize: '8.5px', letterSpacing: '0.14em', textTransform: 'uppercase',
                        padding: '8px 18px', border: '2px solid', cursor: allChecked ? 'pointer' : 'default',
                        borderColor: allChecked ? '#c8da2b' : '#e8e6dd',
                        background: allChecked ? '#c8da2b' : 'transparent',
                        color: allChecked ? '#5a6612' : '#c0bdb4',
                        flexShrink: 0, marginLeft: 24,
                        transition: 'all 0.2s',
                      }}
                    >
                      {allChecked ? '✓ mark resolved' : 'complete checklist first'}
                    </button>
                  </div>

                  {/* Detail grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #e8e6dd' }}>

                    {/* Related events */}
                    <div style={{ padding: '16px 24px', borderRight: '1px solid #e8e6dd' }}>
                      <p style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 12px' }}>related events</p>
                      {conflict.related_events.map(evt => (
                        <div key={evt.id} style={{ marginBottom: 12, padding: '10px 12px', border: '1px solid #e8e6dd', background: '#fafaf5' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', letterSpacing: '0.06em' }}>{evt.reference_code}</span>
                            <span style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '1px 5px', background: evt.status === 'confirmed' ? '#c8da2b' : '#f0ede4', color: evt.status === 'confirmed' ? '#5a6612' : '#6b7280' }}>{evt.status}</span>
                          </div>
                          <p style={{ fontFamily: D, fontSize: '12px', fontWeight: 500, color: '#1a1a1a', margin: '0 0 3px' }}>{evt.title}</p>
                          <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: '0 0 3px' }}>{fmt(evt.start_at)}</p>
                          <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: 0 }}>{evt.organizer_name}</p>
                          <Link href={`/dashboard/events`} style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#378ADD', marginTop: '6px', display: 'inline-block' }}>view event →</Link>
                        </div>
                      ))}
                      {conflict.related_events.length === 0 && <p style={{ fontFamily: M, fontSize: '8px', color: '#c0bdb4' }}>No related events</p>}
                    </div>

                    {/* Related spaces */}
                    <div style={{ padding: '16px 24px', borderRight: '1px solid #e8e6dd' }}>
                      <p style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 12px' }}>affected spaces</p>
                      {conflict.related_spaces.map(space => (
                        <div key={space.id} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ display: 'block', width: 10, height: 10, background: SPACE_COLORS[space.color ?? ''] ?? '#9a9890', flexShrink: 0 }} />
                            <span style={{ fontFamily: D, fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>{space.name}</span>
                          </div>
                          <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: '0 0 2px', paddingLeft: 18 }}>{FLOOR_LABELS[space.floor] ?? space.floor}</p>
                          <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: 0, paddingLeft: 18 }}>Code: {space.code}</p>
                          <Link href={`/spaces/${space.code.toLowerCase()}`} style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#378ADD', marginLeft: 18, marginTop: '4px', display: 'inline-block' }}>space detail →</Link>
                        </div>
                      ))}
                      {conflict.related_spaces.length === 0 && <p style={{ fontFamily: M, fontSize: '8px', color: '#c0bdb4' }}>No affected spaces</p>}

                      {/* Alternative space suggestion */}
                      <div style={{ marginTop: 16, padding: '10px 12px', background: '#f0ede4', border: '1px solid #e8e6dd' }}>
                        <p style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5a6612', margin: '0 0 5px' }}>suggested alternative</p>
                        <p style={{ fontFamily: M, fontSize: '8.5px', color: '#1a1a1a', margin: 0 }}>Green Space · Basement B1</p>
                        <p style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', margin: '2px 0 0' }}>150m² · 160 pax · €130/hr</p>
                        <Link href="/spaces/green" style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: '#5a6612', marginTop: '5px', display: 'inline-block' }}>check availability →</Link>
                      </div>
                    </div>

                    {/* Resolution checklist */}
                    <div style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <p style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9a9890', margin: 0 }}>resolution checklist</p>
                        <span style={{ fontFamily: M, fontSize: '8px', color: allChecked ? '#5a6612' : '#9a9890' }}>
                          {stepsChecked.filter(Boolean).length}/{steps.length}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: 3, background: '#e8e6dd', marginBottom: 14, overflow: 'hidden' }}>
                        <motion.div
                          animate={{ width: `${(stepsChecked.filter(Boolean).length / steps.length) * 100}%` }}
                          transition={{ duration: 0.3, ease: EASE }}
                          style={{ height: '100%', background: allChecked ? '#c8da2b' : sevStyle.border }}
                        />
                      </div>

                      {steps.map((step, si) => (
                        <div
                          key={si}
                          onClick={() => toggleStep(conflict.id, si)}
                          style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10, cursor: 'pointer' }}
                        >
                          <div style={{ width: 14, height: 14, border: `1.5px solid ${stepsChecked[si] ? '#c8da2b' : '#d8d5cc'}`, background: stepsChecked[si] ? '#c8da2b' : 'transparent', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                            {stepsChecked[si] && (
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path d="M1.5 4l2 2 3-3" stroke="#5a6612" strokeWidth="1.4" />
                              </svg>
                            )}
                          </div>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11.5px', color: stepsChecked[si] ? '#9a9890' : '#1a1a1a', margin: 0, lineHeight: 1.55, textDecoration: stepsChecked[si] ? 'line-through' : 'none', transition: 'color 0.15s' }}>
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )
      })}

      {/* Resolved section */}
      {done.length > 0 && (
        <div style={{ borderTop: '2px solid #1a1a1a', marginTop: 'auto' }}>
          <div style={{ padding: '10px 32px', background: 'rgba(200,218,43,0.06)', borderBottom: '1px solid #e8e6dd', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#c8da2b" strokeWidth="1.3"/><path d="M3.5 6l2 2 3-3" stroke="#5a6612" strokeWidth="1.3"/></svg>
            <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5a6612' }}>resolved this session · {done.length}</span>
          </div>
          {done.map(c => (
            <div key={c.id} style={{ padding: '10px 32px', borderBottom: '1px solid #e8e6dd', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#c8da2b" strokeWidth="1.3"/><path d="M3.5 6l2 2 3-3" stroke="#5a6612" strokeWidth="1.3"/></svg>
              <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', letterSpacing: '0.08em' }}>{c.id.toUpperCase()}</span>
              <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890' }}>·</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9a9890', textDecoration: 'line-through' }}>{c.description.substring(0, 80)}…</span>
              <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5a6612', background: '#c8da2b', padding: '1px 7px', marginLeft: 'auto' }}>resolved</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
