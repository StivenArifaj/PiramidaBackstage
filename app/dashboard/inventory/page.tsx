'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]
const M = 'JetBrains Mono, monospace'
const D = 'Space Grotesk, sans-serif'

interface AssetRow {
  id: string; type: string; name: string
  total_qty: number; available_qty: number; in_use: number
  pct_available: number; storage_location: string; unit_rate_eur: number
}

interface InventoryData {
  assets: AssetRow[]
  total_skus: number; total_units: number; total_in_use: number; low_stock: number
}

const GROUPS: Record<string, string[]> = {
  'Furniture': ['chair', 'table_round', 'table_rect'],
  'AV Equipment': ['microphone', 'projector', 'screen', 'speaker'],
  'Stage & Lighting': ['stage', 'lighting', 'cable'],
  'Safety & Crowd': ['barrier'],
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
}

function AvailBar({ available, inUse, total, delay }: { available: number; inUse: number; total: number; delay: number }) {
  const pctAvail = available / total
  const pctInUse = inUse / total
  const pctAvailColor = pctAvail < 0.25 ? '#e63946' : pctAvail < 0.5 ? '#f4a261' : '#c8da2b'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#e8e6dd', display: 'flex', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pctInUse * 100}%` }}
          transition={{ duration: 0.7, ease: EASE, delay }}
          style={{ height: '100%', background: '#378ADD', flexShrink: 0 }}
        />
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pctAvail * 100}%` }}
          transition={{ duration: 0.7, ease: EASE, delay: delay + 0.05 }}
          style={{ height: '100%', background: pctAvailColor, flexShrink: 0 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890' }}>{inUse} in use</span>
        <span style={{ fontFamily: M, fontSize: '8px', color: pctAvailColor, fontWeight: 600 }}>{available} avail</span>
        <span style={{ fontFamily: M, fontSize: '8px', color: '#c0bdb4' }}>/ {total}</span>
      </div>
    </div>
  )
}

export default function InventoryPage() {
  const [data, setData] = useState<InventoryData | null>(null)

  useEffect(() => {
    fetch('/api/inventory').then(r => r.json()).then(setData)
  }, [])

  const assetsByGroup = data ? Object.entries(GROUPS).map(([group, types]) => ({
    group,
    assets: data.assets.filter(a => types.includes(a.type)),
  })).filter(g => g.assets.length > 0) : []

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ height: 54, borderBottom: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#fafaf5', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#9a9890' }}>← Dashboard</Link>
          <span style={{ display: 'block', width: 1, height: 18, background: '#e8e6dd' }} />
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="3.5" width="11" height="8.5" stroke="#1a1a1a" strokeWidth="1.4"/><path d="M3.5 3.5V2.5a3 3 0 016 0v1" stroke="#1a1a1a" strokeWidth="1.4"/></svg>
          <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>Asset Inventory</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'block', width: 8, height: 8, background: '#378ADD' }} />
            <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', letterSpacing: '0.06em' }}>In use</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'block', width: 8, height: 8, background: '#c8da2b' }} />
            <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', letterSpacing: '0.06em' }}>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'block', width: 8, height: 8, background: '#e8e6dd' }} />
            <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', letterSpacing: '0.06em' }}>Untracked</span>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '2px solid #1a1a1a', flexShrink: 0 }}>
        {[
          { label: 'Asset SKUs', value: data?.total_skus ?? '—', sub: 'categories tracked', accent: '#c8da2b', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="5" width="16" height="12" stroke="#1a1a1a" strokeWidth="1.5"/><path d="M5 5V3.5a4 4 0 018 0V5" stroke="#1a1a1a" strokeWidth="1.5"/></svg> },
          { label: 'Total Units', value: data?.total_units ?? '—', sub: 'across all categories', accent: '#c8da2b', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="7" height="7" stroke="#1a1a1a" strokeWidth="1.5"/><rect x="10" y="1" width="7" height="7" stroke="#1a1a1a" strokeWidth="1.5"/><rect x="1" y="10" width="7" height="7" stroke="#1a1a1a" strokeWidth="1.5"/><rect x="10" y="10" width="7" height="7" stroke="#1a1a1a" strokeWidth="1.5"/></svg> },
          { label: 'Currently In Use', value: data?.total_in_use ?? '—', sub: 'allocated to events', accent: '#378ADD', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="#378ADD" strokeWidth="1.5"/><path d="M5 9l3 3 5-5" stroke="#378ADD" strokeWidth="1.5"/></svg> },
          { label: 'Low Stock Items', value: data?.low_stock ?? '—', sub: 'below 50% availability', accent: data?.low_stock ? '#e63946' : '#c8da2b', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polygon points="9,2 16,16 2,16" stroke={data?.low_stock ? '#e63946' : '#c8da2b'} strokeWidth="1.5" fill="none"/><line x1="9" y1="7" x2="9" y2="11.5" stroke={data?.low_stock ? '#e63946' : '#c8da2b'} strokeWidth="1.5"/><circle cx="9" cy="13.5" r="0.8" fill={data?.low_stock ? '#e63946' : '#c8da2b'}/></svg> },
        ].map(({ label, value, sub, accent, icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: i * 0.06 }}
            style={{ padding: '20px 28px', borderRight: i < 3 ? '1px solid #e8e6dd' : 'none', background: '#fafaf5', borderBottom: `3px solid ${accent}`, display: 'flex', alignItems: 'flex-start', gap: 14 }}
          >
            <div style={{ paddingTop: 2, color: '#1a1a1a', flexShrink: 0 }}>{icon}</div>
            <div>
              <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 8px' }}>{label}</p>
              <p style={{ fontFamily: D, fontSize: '40px', fontWeight: 500, color: '#1a1a1a', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
              <p style={{ fontFamily: M, fontSize: '8px', color: '#9a9890', margin: '4px 0 0', letterSpacing: '0.06em' }}>{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Asset register */}
      <div style={{ flex: 1, padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <colgroup>
            <col style={{ width: 36 }} />
            <col style={{ width: 220 }} />
            <col />
            <col style={{ width: 190 }} />
            <col style={{ width: 100 }} />
          </colgroup>
          {assetsByGroup.map(({ group, assets }) => (
            <>
              {/* Group header */}
              <thead key={`head-${group}`}>
                <tr style={{ background: '#f0ede4', borderBottom: '1px solid #e8e6dd', borderTop: '2px solid #d8d5cc' }}>
                  <th colSpan={2} style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b7280', textAlign: 'left', padding: '8px 16px', fontWeight: 600 }}>{group}</th>
                  <th style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9890', textAlign: 'left', padding: '8px 16px', fontWeight: 400 }}>Availability · In Use (blue) / Available (green)</th>
                  <th style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9890', textAlign: 'left', padding: '8px 16px', fontWeight: 400 }}>Storage Location</th>
                  <th style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a9890', textAlign: 'right', padding: '8px 16px', fontWeight: 400 }}>Rate / Unit</th>
                </tr>
              </thead>
              <tbody key={`body-${group}`}>
                {assets.map((asset, idx) => {
                  const pct = asset.pct_available
                  const stockColor = pct < 25 ? '#e63946' : pct < 50 ? '#f4a261' : '#1a1a1a'
                  return (
                    <motion.tr
                      key={asset.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: EASE, delay: 0.1 + idx * 0.04 }}
                      style={{ borderBottom: '1px solid #e8e6dd' }}
                    >
                      {/* Icon */}
                      <td style={{ padding: '12px 0 12px 16px', color: '#6b7280' }}>
                        {TYPE_ICONS[asset.type] ?? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" stroke="currentColor" strokeWidth="1.3"/></svg>}
                      </td>
                      {/* Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontFamily: D, fontSize: '13px', fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{asset.name}</p>
                        <p style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{asset.type.replace(/_/g, ' ')}</p>
                      </td>
                      {/* Availability bar */}
                      <td style={{ padding: '12px 16px' }}>
                        <AvailBar available={asset.available_qty} inUse={asset.in_use} total={asset.total_qty} delay={0.2 + idx * 0.04} />
                      </td>
                      {/* Storage */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="0.5" y="3" width="10" height="7.5" stroke="#9a9890" strokeWidth="1"/><line x1="0.5" y1="5.5" x2="10.5" y2="5.5" stroke="#9a9890" strokeWidth="0.8"/></svg>
                          <span style={{ fontFamily: M, fontSize: '8px', color: '#6b7280', letterSpacing: '0.04em' }}>{asset.storage_location}</span>
                        </div>
                      </td>
                      {/* Rate */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{ fontFamily: M, fontSize: '10px', fontWeight: 600, color: stockColor }}>€{asset.unit_rate_eur.toFixed(2)}</span>
                        <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', display: 'block' }}>/unit/hr</span>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </>
          ))}
          {!data && (
            <tbody>
              <tr><td colSpan={5} style={{ padding: '40px', fontFamily: M, fontSize: '9px', color: '#9a9890', textAlign: 'center', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Loading inventory…</td></tr>
            </tbody>
          )}
        </table>
      </div>

      {/* Footer legend */}
      <div style={{ borderTop: '2px solid #1a1a1a', padding: '10px 32px', background: '#fafaf5', display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Storage · </span>
        {['storage-l-1-a', 'storage-l-1-b', 'storage-l-1-c', 'av-booth-l3'].map(loc => (
          <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.5" y="2.5" width="9" height="7" stroke="#9a9890" strokeWidth="1"/></svg>
            <span style={{ fontFamily: M, fontSize: '7.5px', color: '#9a9890', letterSpacing: '0.04em' }}>{loc}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: M, fontSize: '8px', color: '#9a9890' }}>Total units tracked: {data?.total_units ?? '…'}</span>
      </div>
    </div>
  )
}
