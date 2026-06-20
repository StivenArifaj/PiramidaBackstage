'use client'

import { useState, useCallback } from 'react'

interface Point { x: number; y: number }
interface SavedPolygon { code: string; points: string }

interface MapperProps {
  bgImage: string
  label?: string
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}

// Distinct stroke colors cycled through saved polygons so they're easy to distinguish
const SAVED_COLORS = ['#4af', '#f4a', '#fa4', '#a4f', '#4fa', '#f44', '#44f', '#af4']

export function Mapper({ bgImage, label = 'Mapper' }: MapperProps) {
  const [activePoints, setActivePoints] = useState<Point[]>([])
  const [currentCode, setCurrentCode] = useState('')
  const [saved, setSaved] = useState<SavedPolygon[]>([])
  const [copiedJson, setCopiedJson] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setActivePoints(prev => [...prev, { x: +x.toFixed(2), y: +y.toFixed(2) }])
  }, [])

  const activePointsStr = activePoints.map(p => `${p.x},${p.y}`).join(' ')

  function savePolygon() {
    const code = currentCode.trim()
    if (!code || activePoints.length < 2) return
    setSaved(prev => {
      // replace if same code already exists
      const without = prev.filter(s => s.code !== code)
      return [...without, { code, points: activePointsStr }]
    })
    setActivePoints([])
    setCurrentCode('')
  }

  function removeSaved(code: string) {
    setSaved(prev => prev.filter(s => s.code !== code))
  }

  const exportObj = Object.fromEntries(saved.map(s => [s.code, s.points]))
  const exportJson = JSON.stringify(exportObj, null, 2)

  function copyJson() {
    copyText(exportJson)
    setCopiedJson(true)
    setTimeout(() => setCopiedJson(false), 1800)
  }

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '12px', background: '#111', color: '#eee', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa' }}>
          SVG Mapper — {label}
        </span>

        {/* Space code input */}
        <input
          value={currentCode}
          onChange={e => setCurrentCode(e.target.value.toUpperCase())}
          onKeyDown={e => { if (e.key === 'Enter') savePolygon() }}
          placeholder="Space code (e.g. A1)"
          style={{
            fontSize: '11px', padding: '3px 8px', background: '#1a1a1a', color: '#eee',
            border: '1px solid #555', borderRadius: '3px', width: '130px', outline: 'none',
          }}
        />

        <button
          onClick={savePolygon}
          disabled={!currentCode.trim() || activePoints.length < 2}
          style={{
            fontSize: '10px', padding: '3px 12px', borderRadius: '3px', cursor: 'pointer',
            background: currentCode.trim() && activePoints.length >= 2 ? '#1a3a6a' : '#222',
            color: currentCode.trim() && activePoints.length >= 2 ? '#8af' : '#555',
            border: '1px solid ' + (currentCode.trim() && activePoints.length >= 2 ? '#3a5a8a' : '#333'),
          }}
        >
          Save &amp; Next
        </button>

        <button
          onClick={() => setActivePoints([])}
          style={{ fontSize: '10px', padding: '3px 10px', background: '#2a1a1a', color: '#f88', border: '1px solid #5a3a3a', borderRadius: '3px', cursor: 'pointer' }}
        >
          Clear Active
        </button>

        <span style={{ color: '#666', fontSize: '10px' }}>
          {activePoints.length} active pts · {saved.length} saved
        </span>
      </div>

      {/* ── Clickable image ── */}
      <div
        onClick={handleClick}
        style={{ position: 'relative', cursor: 'crosshair', userSelect: 'none', display: 'inline-block', maxWidth: '100%' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgImage}
          alt="floor plan"
          style={{ display: 'block', maxWidth: '100%', maxHeight: '62vh', objectFit: 'contain', pointerEvents: 'none' }}
          draggable={false}
        />

        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Saved (committed) polygons */}
          {saved.map((s, i) => {
            const color = SAVED_COLORS[i % SAVED_COLORS.length]
            const pts = s.points.split(' ').map(pair => {
              const [x, y] = pair.split(',').map(Number)
              return { x, y }
            })
            const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length
            const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length
            return (
              <g key={s.code}>
                <polygon
                  points={s.points}
                  fill={color + '28'}
                  stroke={color}
                  strokeWidth="0.5"
                />
                <text x={cx} y={cy} fontSize="2.2" fill={color} textAnchor="middle" dominantBaseline="middle"
                  style={{ fontWeight: 'bold' }}>
                  {s.code}
                </text>
              </g>
            )
          })}

          {/* Active (in-progress) polygon */}
          {activePoints.length > 1 && (
            <polygon
              points={activePointsStr}
              fill="rgba(100,220,100,0.15)"
              stroke="#4f4"
              strokeWidth="0.4"
              strokeDasharray="1,0.5"
            />
          )}
          {activePoints.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="0.7" fill="#ff4" stroke="#000" strokeWidth="0.15" />
              <text x={p.x + 0.9} y={p.y - 0.4} fontSize="1.6" fill="#ff4">{i + 1}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* ── Active polygon string ── */}
      <div style={{ marginTop: '10px', background: '#1a1a1a', padding: '7px 12px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'pre', fontSize: '11px', color: '#8f8', borderLeft: '3px solid #3a6a3a' }}>
        {activePointsStr ? `points="${activePointsStr}"` : '(click the image to start tracing — then enter a code and Save & Next)'}
      </div>

      {/* Active point badges */}
      {activePoints.length > 0 && (
        <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {activePoints.map((p, i) => (
            <span
              key={i}
              onClick={() => setActivePoints(prev => prev.filter((_, idx) => idx !== i))}
              title="Click to remove"
              style={{ background: '#222', border: '1px solid #444', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', color: '#ccc', cursor: 'pointer' }}
            >
              {i + 1}: {p.x},{p.y}
            </span>
          ))}
        </div>
      )}

      {/* ── Saved polygons list ── */}
      {saved.length > 0 && (
        <div style={{ marginTop: '14px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', marginBottom: '6px' }}>
            Saved polygons ({saved.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            {saved.map((s, i) => {
              const color = SAVED_COLORS[i % SAVED_COLORS.length]
              return (
                <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#1a1a1a', border: `1px solid ${color}55`, borderRadius: '3px', padding: '3px 8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color + '66', border: `1px solid ${color}`, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color }}>{s.code}</span>
                  <span
                    onClick={() => removeSaved(s.code)}
                    title="Remove"
                    style={{ fontSize: '10px', color: '#555', cursor: 'pointer', marginLeft: '4px' }}
                  >✕</span>
                </div>
              )
            })}
          </div>

          {/* JSON export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666' }}>Export JSON</span>
            <button
              onClick={copyJson}
              style={{
                fontSize: '10px', padding: '3px 12px', background: copiedJson ? '#1a4a1a' : '#1a2a3a',
                color: copiedJson ? '#8f8' : '#8af', border: `1px solid ${copiedJson ? '#3a6a3a' : '#3a4a6a'}`, borderRadius: '3px', cursor: 'pointer',
              }}
            >
              {copiedJson ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={() => setSaved([])}
              style={{ fontSize: '10px', padding: '3px 10px', background: '#2a1a1a', color: '#f88', border: '1px solid #5a3a3a', borderRadius: '3px', cursor: 'pointer' }}
            >
              Clear All
            </button>
          </div>

          <pre style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '10px 14px', fontSize: '10px', color: '#8af', overflowX: 'auto', margin: 0, lineHeight: 1.6 }}>
            {exportJson}
          </pre>
        </div>
      )}
    </div>
  )
}
