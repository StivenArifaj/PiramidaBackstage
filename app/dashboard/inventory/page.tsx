'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const M = 'var(--font-mono)'
const D = 'var(--font-display)'

type AssetType = 'chair' | 'table_round' | 'table_rect' | 'microphone' | 'projector' | 'screen' | 'speaker' | 'lighting' | 'stage' | 'barrier' | 'cable' | 'other'

interface AssetRow {
  id: string; type: AssetType; name: string
  total_qty: number; available_qty: number; in_use: number
  pct_available: number; storage_location: string; unit_rate_eur: number
}

interface InventoryData {
  assets: AssetRow[]
  total_skus: number; total_units: number; total_in_use: number; low_stock: number
}

const ASSET_TYPES: AssetType[] = ['chair', 'table_round', 'table_rect', 'microphone', 'projector', 'screen', 'speaker', 'lighting', 'stage', 'barrier', 'cable', 'other']

const GROUPS: Record<string, AssetType[]> = {
  'Furniture': ['chair', 'table_round', 'table_rect'],
  'AV Equipment': ['microphone', 'projector', 'screen', 'speaker'],
  'Stage & Lighting': ['stage', 'lighting', 'cable'],
  'Safety & Crowd': ['barrier'],
  'Other': ['other'],
}

import type { ReactElement } from 'react'
const TYPE_ICONS: Record<string, ReactElement> = {
  chair: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="5" width="10" height="3" stroke="currentColor" strokeWidth="1.3"/><line x1="3" y1="8" x2="3" y2="13" stroke="currentColor" strokeWidth="1.3"/><line x1="11" y1="8" x2="11" y2="13" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="1" width="10" height="4" stroke="currentColor" strokeWidth="1.3"/></svg>,
  table_round: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="12" x2="7" y2="13.5" stroke="currentColor" strokeWidth="1.3"/><line x1="4" y1="12.7" x2="3" y2="14" stroke="currentColor" strokeWidth="1.3"/><line x1="10" y1="12.7" x2="11" y2="14" stroke="currentColor" strokeWidth="1.3"/></svg>,
  table_rect: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="5" width="12" height="4" stroke="currentColor" strokeWidth="1.3"/><line x1="3" y1="9" x2="3" y2="13" stroke="currentColor" strokeWidth="1.3"/><line x1="11" y1="9" x2="11" y2="13" stroke="currentColor" strokeWidth="1.3"/></svg>,
  microphone: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4.5" y="1" width="5" height="7" rx="0" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 7.5A4.5 4.5 0 0011.5 7.5" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="12" x2="7" y2="14" stroke="currentColor" strokeWidth="1.3"/><line x1="4.5" y1="14" x2="9.5" y2="14" stroke="currentColor" strokeWidth="1.3"/></svg>,
  projector: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="12" height="6" stroke="currentColor" strokeWidth="1.3"/><circle cx="4.5" cy="7" r="1.2" stroke="currentColor" strokeWidth="1.1"/><circle cx="9.5" cy="7" r="0.8" fill="currentColor" opacity="0.5"/><line x1="11" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.3"/></svg>,
  screen: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="8" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="10" x2="7" y2="13" stroke="currentColor" strokeWidth="1.3"/><line x1="4.5" y1="13" x2="9.5" y2="13" stroke="currentColor" strokeWidth="1.3"/></svg>,
  speaker: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="8" height="12" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="9" r="2" stroke="currentColor" strokeWidth="1.1"/><circle cx="5" cy="3.5" r="1" stroke="currentColor" strokeWidth="1"/></svg>,
  stage: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="6" width="12" height="7" stroke="currentColor" strokeWidth="1.3"/><line x1="1" y1="6" x2="3" y2="1" stroke="currentColor" strokeWidth="1.3"/><line x1="13" y1="6" x2="11" y2="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  lighting: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="7,1 11,8 3,8" stroke="currentColor" strokeWidth="1.3" fill="none"/><line x1="7" y1="8" x2="7" y2="11" stroke="currentColor" strokeWidth="1.3"/><line x1="4" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1.3"/></svg>,
  cable: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 4 Q7 1 13 4" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M1 10 Q7 7 13 10" stroke="currentColor" strokeWidth="1.3" fill="none"/><circle cx="1" cy="4" r="1.2" fill="currentColor"/><circle cx="13" cy="4" r="1.2" fill="currentColor"/><circle cx="1" cy="10" r="1.2" fill="currentColor"/><circle cx="13" cy="10" r="1.2" fill="currentColor"/></svg>,
  barrier: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="2"/><line x1="1" y1="4" x2="1" y2="10" stroke="currentColor" strokeWidth="1.3"/><line x1="13" y1="4" x2="13" y2="10" stroke="currentColor" strokeWidth="1.3"/><line x1="4.5" y1="5" x2="4.5" y2="9" stroke="currentColor" strokeWidth="1"/><line x1="9.5" y1="5" x2="9.5" y2="9" stroke="currentColor" strokeWidth="1"/></svg>,
  other: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" stroke="currentColor" strokeWidth="1.3"/><line x1="7" y1="4" x2="7" y2="10" stroke="currentColor" strokeWidth="1.3"/><line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.3"/></svg>,
}

function AvailBar({ available, inUse, total, delay }: { available: number; inUse: number; total: number; delay: number }) {
  const pctAvail = available / total
  const pctInUse = inUse / total
  const pctAvailColor = pctAvail < 0.25 ? '#e63946' : pctAvail < 0.5 ? '#f4a261' : '#c8da2b'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#e8e6dd', display: 'flex', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pctInUse * 100}%` }} transition={{ duration: 0.7, ease: EASE, delay }} style={{ height: '100%', background: '#378ADD', flexShrink: 0 }} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${pctAvail * 100}%` }} transition={{ duration: 0.7, ease: EASE, delay: delay + 0.05 }} style={{ height: '100%', background: pctAvailColor, flexShrink: 0 }} />
      </div>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890' }}>{inUse} in use</span>
        <span style={{ fontFamily: M, fontSize: '8px', color: pctAvailColor, fontWeight: 600 }}>{available} avail</span>
        <span style={{ fontFamily: M, fontSize: '8px', color: '#c0bdb4' }}>/ {total}</span>
      </div>
    </div>
  )
}

interface FormState {
  name: string; type: AssetType
  total_qty: string; storage_location: string; unit_rate_eur: string
}

const EMPTY_FORM: FormState = { name: '', type: 'chair', total_qty: '', storage_location: '', unit_rate_eur: '' }

function AssetModal({ editing, onClose, onSaved }: {
  editing: AssetRow | null
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(
    editing
      ? { name: editing.name, type: editing.type, total_qty: String(editing.total_qty), storage_location: editing.storage_location, unit_rate_eur: String(editing.unit_rate_eur) }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = { name: form.name, type: form.type, total_qty: Number(form.total_qty), storage_location: form.storage_location, unit_rate_eur: Number(form.unit_rate_eur) }
      const res = editing
        ? await fetch(`/api/assets/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
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
        style={{ background: '#fafaf5', border: '2px solid #1a1a1a', width: 480, padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontFamily: M, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>{editing ? 'edit asset' : '+ add asset'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: M, fontSize: '10px', color: '#9a9890' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Conference Chair" required />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={{ ...inputStyle, appearance: 'none' }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AssetType }))}>
              {ASSET_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Quantity</label>
              <input style={inputStyle} type="number" min={1} value={form.total_qty} onChange={e => setForm(f => ({ ...f, total_qty: e.target.value }))} placeholder="0" required />
            </div>
            <div>
              <label style={labelStyle}>Rate / unit / hr (€)</label>
              <input style={inputStyle} type="number" min={0} step="0.01" value={form.unit_rate_eur} onChange={e => setForm(f => ({ ...f, unit_rate_eur: e.target.value }))} placeholder="0.00" required />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Storage Location</label>
            <input style={inputStyle} value={form.storage_location} onChange={e => setForm(f => ({ ...f, storage_location: e.target.value }))} placeholder="e.g. storage-l-1-a" required />
          </div>
          {error && <p style={{ fontFamily: M, fontSize: '9px', color: '#e63946', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px', border: '1.5px solid #d8d5cc', background: 'transparent', cursor: 'pointer', color: '#6b7280' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 2, fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px', border: 'none', background: '#1a1a1a', color: '#c8da2b', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Asset'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function InventoryPage() {
  const [data, setData] = useState<InventoryData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<AssetRow | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    fetch('/api/assets').then(r => r.json()).then(setData)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await fetch(`/api/assets/${id}`, { method: 'DELETE' })
      fetchData()
    } finally {
      setDeletingId(null)
    }
  }

  const assetsByGroup = data ? Object.entries(GROUPS).map(([group, types]) => ({
    group,
    assets: data.assets.filter(a => types.includes(a.type as AssetType)),
  })).filter(g => g.assets.length > 0) : []

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>asset inventory</h1>

      {/* Top bar */}
      <div style={{ height: 54, borderBottom: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fafaf5', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890' }}>← dashboard</Link>
          <span style={{ display: 'block', width: 1, height: 18, background: '#e8e6dd' }} />
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="3.5" width="11" height="8.5" stroke="#1a1a1a" strokeWidth="1.4"/><path d="M3.5 3.5V2.5a3 3 0 016 0v1" stroke="#1a1a1a" strokeWidth="1.4"/></svg>
          <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>asset inventory</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'block', width: 8, height: 8, background: '#378ADD' }} />
            <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', letterSpacing: '0.06em' }}>in use</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'block', width: 8, height: 8, background: '#c8da2b' }} />
            <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', letterSpacing: '0.06em' }}>available</span>
          </div>
          <div style={{ width: 1, height: 18, background: '#e8e6dd' }} />
          <button
            onClick={() => { setEditingAsset(null); setShowModal(true) }}
            style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', background: '#1a1a1a', color: '#c8da2b', border: 'none', padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>
            + Add Asset
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '2px solid #1a1a1a', flexShrink: 0 }}>
        {[
          { label: 'asset skus',        value: data?.total_skus ?? '—',   sub: 'categories tracked',      accent: '#c8da2b' },
          { label: 'total units',       value: data?.total_units ?? '—',   sub: 'across all categories',   accent: '#c8da2b' },
          { label: 'currently in use',  value: data?.total_in_use ?? '—',  sub: 'allocated to events',     accent: '#378ADD' },
          { label: 'low stock items',   value: data?.low_stock ?? '—',     sub: 'below 50% availability',  accent: data?.low_stock ? '#e63946' : '#c8da2b' },
        ].map(({ label, value, sub, accent }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE, delay: i * 0.06 }}
            style={{ padding: '20px 28px', borderRight: i < 3 ? '1px solid #e8e6dd' : 'none', background: '#fafaf5', borderBottom: `3px solid ${accent}` }}>
            <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 8px' }}>{label}</p>
            <p style={{ fontFamily: M, fontSize: '40px', fontWeight: 500, color: '#1a1a1a', margin: 0, lineHeight: 1 }}>{value}</p>
            <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: '4px 0 0' }}>{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Asset register */}
      <div style={{ flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: 36 }} />
            <col style={{ width: 220 }} />
            <col />
            <col style={{ width: 190 }} />
            <col style={{ width: 100 }} />
            <col style={{ width: 100 }} />
          </colgroup>
          {assetsByGroup.map(({ group, assets }) => (
            <>
              <thead key={`head-${group}`}>
                <tr style={{ background: '#f0ede4', borderBottom: '1px solid #e8e6dd', borderTop: '2px solid #d8d5cc' }}>
                  <th colSpan={2} style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b7280', textAlign: 'left', padding: '8px 16px', fontWeight: 600 }}>{group.toLowerCase()}</th>
                  <th style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9890', textAlign: 'left', padding: '8px 16px', fontWeight: 400 }}>availability</th>
                  <th style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9890', textAlign: 'left', padding: '8px 16px', fontWeight: 400 }}>storage location</th>
                  <th style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9890', textAlign: 'right', padding: '8px 16px', fontWeight: 400 }}>rate / unit</th>
                  <th style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9890', textAlign: 'center', padding: '8px 16px', fontWeight: 400 }}>actions</th>
                </tr>
              </thead>
              <tbody key={`body-${group}`}>
                {assets.map((asset, idx) => {
                  const pct = asset.pct_available
                  const stockColor = pct < 25 ? '#e63946' : pct < 50 ? '#f4a261' : '#1a1a1a'
                  return (
                    <motion.tr key={asset.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: EASE, delay: 0.1 + idx * 0.04 }}
                      style={{ borderBottom: '1px solid #e8e6dd', background: deletingId === asset.id ? '#fff0f0' : 'transparent' }}>
                      <td style={{ padding: '12px 0 12px 16px', color: '#6b7280' }}>
                        {TYPE_ICONS[asset.type] ?? TYPE_ICONS.other}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontFamily: D, fontSize: '13px', fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{asset.name}</p>
                        <p style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{asset.type.replace(/_/g, ' ')}</p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <AvailBar available={asset.available_qty} inUse={asset.in_use} total={asset.total_qty} delay={0.2 + idx * 0.04} />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="0.5" y="3" width="10" height="7.5" stroke="#9a9890" strokeWidth="1"/><line x1="0.5" y1="5.5" x2="10.5" y2="5.5" stroke="#9a9890" strokeWidth="0.8"/></svg>
                          <span style={{ fontFamily: M, fontSize: '8px', color: '#6b7280' }}>{asset.storage_location}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{ fontFamily: M, fontSize: '10px', fontWeight: 600, color: stockColor }}>€{asset.unit_rate_eur.toFixed(2)}</span>
                        <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', display: 'block' }}>/unit/hr</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => { setEditingAsset(asset); setShowModal(true) }}
                            style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid #d8d5cc', padding: '5px 10px', cursor: 'pointer', color: '#6b7280' }}>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            disabled={deletingId === asset.id}
                            style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid #e63946', padding: '5px 10px', cursor: 'pointer', color: '#e63946' }}>
                            Del
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </>
          ))}
          {!data && (
            <tbody>
              <tr><td colSpan={6} style={{ padding: '40px', fontFamily: M, fontSize: '9px', color: '#9a9890', textAlign: 'center', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading inventory…</td></tr>
            </tbody>
          )}
        </table>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '2px solid #1a1a1a', padding: '10px 32px', background: '#fafaf5', display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', textTransform: 'uppercase', letterSpacing: '0.14em' }}>storage · </span>
        {['storage-l-1-a', 'storage-l-1-b', 'storage-l-1-c', 'av-booth-l3'].map(loc => (
          <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.5" y="2.5" width="9" height="7" stroke="#9a9890" strokeWidth="1"/></svg>
            <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890' }}>{loc}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890' }}>Total units tracked: {data?.total_units ?? '…'}</span>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <AssetModal
            editing={editingAsset}
            onClose={() => { setShowModal(false); setEditingAsset(null) }}
            onSaved={() => { setShowModal(false); setEditingAsset(null); fetchData() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
