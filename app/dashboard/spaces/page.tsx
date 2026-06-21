'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { SpaceWithAvailability, SpaceFloor } from '@/types/api'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const M = 'var(--font-mono)'
const D = 'var(--font-display)'

const FLOOR_LABELS: Record<SpaceFloor, string> = {
  l0:        'Ground Floor (A)',
  l_minus_1: 'Basement (B)',
  l3:        'Level 3 (C)',
  roof:      'Roof (D)',
  exterior:  'Exterior (E)',
}

const FLOOR_ORDER: SpaceFloor[] = ['l0', 'l_minus_1', 'l3', 'roof', 'exterior']

const COLOR_DOTS: Record<string, string> = {
  blue: '#378ADD', orange: '#f4a261', green: '#97C459', yellow: '#f9c74f',
  red: '#e63946', purple: '#5a4fcf', teal: '#2a9d8f', coral: '#e76f51', pink: '#ec4899',
}

export default function DashboardSpacesPage() {
  const [spaces, setSpaces] = useState<SpaceWithAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const fetchSpaces = useCallback(() => {
    setLoading(true)
    fetch('/api/spaces?include_inactive=true')
      .then(r => r.json())
      .then(d => { setSpaces(d.spaces ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { fetchSpaces() }, [fetchSpaces])

  const handleToggle = async (space: SpaceWithAvailability) => {
    const newActive = space.is_active === false ? true : false
    setToggling(space.code)
    try {
      const res = await fetch(`/api/spaces/${space.code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newActive }),
      })
      if (res.ok) {
        setSpaces(prev =>
          prev.map(s =>
            s.code === space.code
              ? { ...s, is_active: newActive, availability: newActive ? 'available' : 'blocked' }
              : s
          )
        )
      }
    } finally {
      setToggling(null)
    }
  }

  const filtered = spaces.filter(s => {
    if (filter === 'active')   return s.is_active !== false
    if (filter === 'inactive') return s.is_active === false
    return true
  })

  const byFloor = FLOOR_ORDER.map(fl => ({
    floor: fl,
    label: FLOOR_LABELS[fl],
    spaces: filtered.filter(s => s.floor === fl),
  })).filter(g => g.spaces.length > 0)

  const activeCount   = spaces.filter(s => s.is_active !== false).length
  const inactiveCount = spaces.filter(s => s.is_active === false).length

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        space status control
      </h1>

      {/* Top bar */}
      <div style={{ height: 54, borderBottom: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fafaf5', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890' }}>← dashboard</Link>
          <span style={{ display: 'block', width: 1, height: 18, background: '#e8e6dd' }} />
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <polygon points="6.5,1 12,12 1,12" stroke="#1a1a1a" strokeWidth="1.4" fill="none"/>
            <rect x="4" y="8" width="2.5" height="3.5" stroke="#1a1a1a" strokeWidth="1"/>
            <rect x="7" y="8" width="2.5" height="3.5" stroke="#1a1a1a" strokeWidth="1"/>
          </svg>
          <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>space status control</span>
        </div>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {([['all', 'All Spaces'], ['active', 'Active'], ['inactive', 'Maintenance']] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 14px', background: filter === val ? '#1a1a1a' : 'transparent', color: filter === val ? '#c8da2b' : '#9a9890', borderTop: '1px solid #d8d5cc', borderRight: '1px solid #d8d5cc', borderBottom: '1px solid #d8d5cc', borderLeft: val === 'all' ? '1px solid #d8d5cc' : 'none', cursor: 'pointer', fontWeight: filter === val ? 700 : 400 }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '2px solid #1a1a1a', flexShrink: 0 }}>
        {[
          { label: 'total spaces',        value: spaces.length,  sub: 'in the venue',         accent: '#c8da2b' },
          { label: 'active',              value: activeCount,    sub: 'open for bookings',     accent: '#c8da2b' },
          { label: 'under maintenance',   value: inactiveCount,  sub: 'booking disabled',      accent: inactiveCount ? '#f4a261' : '#c8da2b' },
        ].map(({ label, value, sub, accent }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE, delay: i * 0.06 }}
            style={{ padding: '20px 28px', borderRight: i < 2 ? '1px solid #e8e6dd' : 'none', background: '#fafaf5', borderBottom: `3px solid ${accent}` }}>
            <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontFamily: M, fontSize: '40px', fontWeight: 500, color: '#1a1a1a', margin: 0, lineHeight: 1 }}>{value}</p>
            <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: '4px 0 0' }}>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Warning banner when inactive spaces exist */}
      {inactiveCount > 0 && (
        <div style={{ background: 'rgba(244,162,97,0.1)', borderBottom: '1px solid rgba(244,162,97,0.4)', padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0.5" y="0.5" width="12" height="12" stroke="#f4a261" strokeWidth="1.3"/><line x1="6.5" y1="3.5" x2="6.5" y2="7.5" stroke="#f4a261" strokeWidth="1.5"/><circle cx="6.5" cy="9.5" r="0.7" fill="#f4a261"/></svg>
          <span style={{ fontFamily: M, fontSize: '8.5px', color: '#7a4800', letterSpacing: '0.08em' }}>
            {inactiveCount} space{inactiveCount !== 1 ? 's' : ''} currently offline — booking portal is locked for these spaces.
          </span>
        </div>
      )}

      {/* Space list by floor */}
      <div style={{ flex: 1 }}>
        {loading && (
          <div style={{ padding: '40px', fontFamily: M, fontSize: '9px', color: '#9a9890', textAlign: 'center', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading spaces…</div>
        )}

        {!loading && byFloor.map(({ floor, label, spaces: floorSpaces }, floorIdx) => (
          <motion.div key={floor} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: floorIdx * 0.04 }}>
            {/* Floor header */}
            <div style={{ background: '#111110', padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c8da2b' }}>{label}</span>
              <div style={{ flex: 1, height: 1, background: '#252422' }} />
              <span style={{ fontFamily: M, fontSize: '7.5px', color: '#6b6966' }}>{floorSpaces.length} spaces</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <colgroup>
                <col style={{ width: 80 }} />
                <col />
                <col style={{ width: 110 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 160 }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#f0ede4', borderBottom: '1px solid #e8e6dd' }}>
                  {['Code', 'Name', 'Category', 'Capacity', 'Rate', 'Booking Status', 'Kill Switch'].map((h, i) => (
                    <th key={h} style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9890', textAlign: i === 6 ? 'center' : 'left', padding: '8px 16px', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {floorSpaces.map((space, idx) => {
                  const isActive = space.is_active !== false
                  const isToggling = toggling === space.code
                  return (
                    <motion.tr key={space.code}
                      initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.22, delay: floorIdx * 0.04 + idx * 0.025 }}
                      style={{ borderBottom: '1px solid #e8e6dd', background: !isActive ? 'rgba(244,162,97,0.04)' : 'transparent', opacity: isToggling ? 0.6 : 1 }}>

                      {/* Code */}
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontFamily: M, fontSize: '8.5px', fontWeight: 700, letterSpacing: '0.14em', color: '#1a1a1a', background: '#e8e6dd', padding: '3px 7px' }}>{space.code}</span>
                      </td>

                      {/* Name */}
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {space.color && <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: COLOR_DOTS[space.color] ?? '#9a9890', flexShrink: 0 }} />}
                          <span style={{ fontFamily: D, fontSize: '13px', fontWeight: 500, color: isActive ? '#1a1a1a' : '#9a9890' }}>{space.name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{space.category.replace(/_/g, ' ')}</span>
                      </td>

                      {/* Capacity */}
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontFamily: M, fontSize: '9px', color: '#6b7280' }}>{space.capacity_pax} pax</span>
                      </td>

                      {/* Rate */}
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontFamily: M, fontSize: '9px', color: '#6b7280' }}>€{space.hourly_rate_eur}/hr</span>
                      </td>

                      {/* Booking Status */}
                      <td style={{ padding: '11px 16px' }}>
                        {isActive ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: M, fontSize: '7.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3a5a12', background: '#e8f4d8', padding: '3px 8px', fontWeight: 600 }}>
                            <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: '#c8da2b' }} />
                            Open
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: M, fontSize: '7.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a4800', background: '#fff3e0', padding: '3px 8px', fontWeight: 600 }}>
                            <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: '#f4a261' }} />
                            Maintenance
                          </span>
                        )}
                      </td>

                      {/* Kill Switch toggle */}
                      <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggle(space)}
                          disabled={isToggling}
                          title={isActive ? 'Click to disable bookings (maintenance mode)' : 'Click to re-enable bookings'}
                          style={{
                            fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase',
                            padding: '6px 14px', cursor: isToggling ? 'wait' : 'pointer',
                            border: '1.5px solid',
                            borderColor: isActive ? '#e63946' : '#c8da2b',
                            background: isActive ? 'transparent' : '#1a1a1a',
                            color: isActive ? '#e63946' : '#c8da2b',
                            fontWeight: 600,
                            transition: 'all 0.15s',
                          }}
                        >
                          {isToggling
                            ? '…'
                            : isActive
                              ? '⊗ Disable'
                              : '✓ Re-enable'}
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </motion.div>
        ))}

        {!loading && byFloor.length === 0 && (
          <div style={{ padding: '40px', fontFamily: M, fontSize: '9px', color: '#9a9890', textAlign: 'center', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            No spaces match the selected filter.
          </div>
        )}
      </div>

      {/* Footer note */}
      <div style={{ borderTop: '2px solid #1a1a1a', padding: '10px 32px', background: '#fafaf5', display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', letterSpacing: '0.1em' }}>
          Kill switch disables the client booking form and blocks all API requests for that space — including priority requests.
        </span>
        <div style={{ flex: 1 }} />
        <Link href="/spaces" style={{ fontFamily: M, fontSize: '8px', color: '#6b7280', letterSpacing: '0.1em', textDecoration: 'none' }}>view public floor plan →</Link>
      </div>
    </div>
  )
}
