'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const M = 'var(--font-mono)'
const D = 'var(--font-display)'

type MaintenanceStatus = 'clean' | 'needs_cleaning' | 'maintenance'

interface MaintenanceLog {
  id: string
  space_code: string
  space_name: string
  floor: string
  status: MaintenanceStatus
  assigned_worker: string | null
  next_action_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

const FLOOR_LABELS: Record<string, string> = {
  l0: 'Ground Floor',
  l_minus_1: 'Basement (B)',
  l3: 'Level 3 (C)',
  roof: 'Roof (D)',
  exterior: 'Exterior (E)',
}

const FLOOR_ORDER = ['l0', 'l_minus_1', 'l3', 'roof', 'exterior']

const STATUS_CONFIG: Record<MaintenanceStatus, { label: string; color: string; bg: string; dot: string }> = {
  clean:          { label: 'Clean',          color: '#3a5a12', bg: '#e8f4d8', dot: '#c8da2b' },
  needs_cleaning: { label: 'Needs Cleaning', color: '#7a4800', bg: '#fff3e0', dot: '#f4a261' },
  maintenance:    { label: 'Maintenance',    color: '#8b0000', bg: '#ffeaea', dot: '#e63946' },
}

function StatusBadge({ status }: { status: MaintenanceStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: cfg.color, background: cfg.bg, padding: '4px 8px', fontWeight: 600 }}>
      <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface ScheduleModalProps {
  preselected: MaintenanceLog | null
  onClose: () => void
  onSaved: () => void
}

function ScheduleModal({ preselected, onClose, onSaved }: ScheduleModalProps) {
  const [form, setForm] = useState({
    space_code: preselected?.space_code ?? '',
    space_name: preselected?.space_name ?? '',
    floor: preselected?.floor ?? 'l0',
    status: (preselected?.status ?? 'needs_cleaning') as MaintenanceStatus,
    assigned_worker: preselected?.assigned_worker ?? '',
    next_action_at: preselected?.next_action_at ? preselected.next_action_at.slice(0, 10) : '',
    notes: preselected?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const payload = {
        ...form,
        assigned_worker: form.assigned_worker || undefined,
        next_action_at: form.next_action_at ? new Date(form.next_action_at).toISOString() : undefined,
        notes: form.notes || undefined,
      }
      const res = preselected
        ? await fetch(`/api/maintenance/${preselected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: form.status, assigned_worker: form.assigned_worker || null, next_action_at: form.next_action_at ? new Date(form.next_action_at).toISOString() : null, notes: form.notes || null }) })
        : await fetch('/api/maintenance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed') }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = { fontFamily: M, fontSize: '11px', background: '#f5f5f0', border: '1.5px solid #1a1a1a', padding: '8px 10px', width: '100%', outline: 'none', color: '#1a1a1a', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { fontFamily: M, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', display: 'block', marginBottom: 5 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(26,26,26,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.22, ease: EASE }}
        style={{ background: '#fafaf5', border: '2px solid #1a1a1a', width: 520, padding: 32, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{preselected ? 'update status' : 'schedule maintenance'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: M, fontSize: '10px', color: '#9a9890' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!preselected && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Space Code</label>
                  <input style={inputStyle} value={form.space_code} onChange={e => setForm(f => ({ ...f, space_code: e.target.value }))} placeholder="e.g. BLUE" required />
                </div>
                <div>
                  <label style={labelStyle}>Space Name</label>
                  <input style={inputStyle} value={form.space_name} onChange={e => setForm(f => ({ ...f, space_name: e.target.value }))} placeholder="e.g. Blue Space" required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Floor</label>
                <select style={{ ...inputStyle, appearance: 'none' }} value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}>
                  {FLOOR_ORDER.map(fl => <option key={fl} value={fl}>{FLOOR_LABELS[fl]}</option>)}
                </select>
              </div>
            </>
          )}
          <div>
            <label style={labelStyle}>Status</label>
            <select style={{ ...inputStyle, appearance: 'none' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as MaintenanceStatus }))}>
              <option value="clean">Clean</option>
              <option value="needs_cleaning">Needs Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Assigned Worker</label>
              <input style={inputStyle} value={form.assigned_worker} onChange={e => setForm(f => ({ ...f, assigned_worker: e.target.value }))} placeholder="Name (optional)" />
            </div>
            <div>
              <label style={labelStyle}>Next Action Date</label>
              <input style={inputStyle} type="date" value={form.next_action_at} onChange={e => setForm(f => ({ ...f, next_action_at: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes…" />
          </div>
          {error && <p style={{ fontFamily: M, fontSize: '9px', color: '#e63946', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px', border: '1.5px solid #d8d5cc', background: 'transparent', cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 2, fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px', border: 'none', background: '#1a1a1a', color: '#c8da2b', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving…' : preselected ? 'Update Status' : 'Schedule'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null)

  const fetchLogs = useCallback(() => {
    setLoading(true)
    fetch('/api/maintenance').then(r => r.json()).then(d => { setLogs(d.logs ?? []); setLoading(false) })
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const byFloor = FLOOR_ORDER.map(fl => ({
    floor: fl,
    label: FLOOR_LABELS[fl],
    logs: logs.filter(l => l.floor === fl),
  })).filter(g => g.logs.length > 0)

  const counts = {
    clean: logs.filter(l => l.status === 'clean').length,
    needs_cleaning: logs.filter(l => l.status === 'needs_cleaning').length,
    maintenance: logs.filter(l => l.status === 'maintenance').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>facility health matrix</h1>

      {/* Top bar */}
      <div style={{ height: 54, borderBottom: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fafaf5', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890' }}>← dashboard</Link>
          <span style={{ display: 'block', width: 1, height: 18, background: '#e8e6dd' }} />
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" stroke="#1a1a1a" strokeWidth="1.4"/><line x1="4" y1="1" x2="4" y2="13" stroke="#1a1a1a" strokeWidth="1"/><line x1="8" y1="1" x2="8" y2="13" stroke="#1a1a1a" strokeWidth="1"/><line x1="1" y1="5" x2="13" y2="5" stroke="#1a1a1a" strokeWidth="1"/><line x1="1" y1="9" x2="13" y2="9" stroke="#1a1a1a" strokeWidth="1"/></svg>
          <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>facility health matrix</span>
        </div>
        <button
          onClick={() => { setSelectedLog(null); setShowModal(true) }}
          style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', background: '#1a1a1a', color: '#c8da2b', border: 'none', padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>
          + Schedule Maintenance
        </button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '2px solid #1a1a1a', flexShrink: 0 }}>
        {[
          { label: 'clean spaces',     value: counts.clean,          accent: '#c8da2b', dot: '#c8da2b' },
          { label: 'needs cleaning',   value: counts.needs_cleaning, accent: '#f4a261', dot: '#f4a261' },
          { label: 'in maintenance',   value: counts.maintenance,    accent: counts.maintenance ? '#e63946' : '#c8da2b', dot: '#e63946' },
        ].map(({ label, value, accent, dot }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE, delay: i * 0.06 }}
            style={{ padding: '20px 28px', borderRight: i < 2 ? '1px solid #e8e6dd' : 'none', background: '#fafaf5', borderBottom: `3px solid ${accent}`, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, marginTop: 4, flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 8px' }}>{label}</p>
              <p style={{ fontFamily: M, fontSize: '40px', fontWeight: 500, color: '#1a1a1a', margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: '4px 0 0' }}>spaces tracked</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Matrix by floor */}
      <div style={{ flex: 1 }}>
        {loading && (
          <div style={{ padding: '40px', fontFamily: M, fontSize: '9px', color: '#9a9890', textAlign: 'center', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading facility data…</div>
        )}
        {!loading && byFloor.map(({ floor, label, logs: floorLogs }, floorIdx) => (
          <motion.div key={floor} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: floorIdx * 0.05 }}>
            {/* Floor group header */}
            <div style={{ background: '#111110', padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c8da2b' }}>{label}</span>
              <div style={{ flex: 1, height: 1, background: '#252422' }} />
              <span style={{ fontFamily: M, fontSize: '7.5px', color: '#6b6966' }}>{floorLogs.length} spaces</span>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <colgroup>
                <col style={{ width: 120 }} />
                <col />
                <col style={{ width: 180 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 140 }} />
                <col style={{ width: 80 }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#f0ede4', borderBottom: '1px solid #e8e6dd' }}>
                  {['Code', 'Space Name', 'Status', 'Assigned Worker', 'Next Action', 'Actions'].map((h, i) => (
                    <th key={h} style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9890', textAlign: i === 5 ? 'center' : 'left', padding: '8px 16px', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {floorLogs.map((log, idx) => (
                  <motion.tr key={log.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: floorIdx * 0.05 + idx * 0.03 }}
                    style={{ borderBottom: '1px solid #e8e6dd' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: M, fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', color: '#1a1a1a', background: '#e8e6dd', padding: '3px 7px' }}>{log.space_code}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontFamily: D, fontSize: '13px', fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{log.space_name}</p>
                      {log.notes && <p style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', margin: '2px 0 0' }}>{log.notes}</p>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={log.status} />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {log.assigned_worker
                        ? <span style={{ fontFamily: M, fontSize: '9px', color: '#1a1a1a' }}>{log.assigned_worker}</span>
                        : <span style={{ fontFamily: M, fontSize: '8px', color: '#c0bdb4' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: M, fontSize: '9px', color: log.next_action_at && new Date(log.next_action_at) < new Date() ? '#e63946' : '#1a1a1a' }}>
                        {formatDate(log.next_action_at)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => { setSelectedLog(log); setShowModal(true) }}
                        style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid #d8d5cc', padding: '5px 10px', cursor: 'pointer', color: '#6b7280' }}>
                        Update
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ))}
        {!loading && byFloor.length === 0 && (
          <div style={{ padding: '40px', fontFamily: M, fontSize: '9px', color: '#9a9890', textAlign: 'center', letterSpacing: '0.12em', textTransform: 'uppercase' }}>No facility logs found. Schedule maintenance to begin tracking.</div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ScheduleModal
            preselected={selectedLog}
            onClose={() => { setShowModal(false); setSelectedLog(null) }}
            onSaved={() => { setShowModal(false); setSelectedLog(null); fetchLogs() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
