'use client'

import { useState, useCallback, useRef } from 'react'

interface Point { x: number; y: number }

interface MapperProps {
  bgImage: string
  label?: string
}

export function Mapper({ bgImage, label = 'Mapper' }: MapperProps) {
  const [points, setPoints] = useState<Point[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPoints(prev => [...prev, { x: +x.toFixed(2), y: +y.toFixed(2) }])
  }, [])

  const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')
  const svgSnippet = `points="${pointsStr}"`

  function copyToClipboard() {
    navigator.clipboard.writeText(svgSnippet).catch(() => {
      // fallback for browsers without clipboard API
      const ta = document.createElement('textarea')
      ta.value = svgSnippet
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
  }

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '12px', background: '#111', color: '#eee', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa' }}>
          SVG Mapper — {label}
        </span>
        <button
          onClick={() => setPoints([])}
          style={{ fontSize: '10px', padding: '3px 10px', background: '#333', color: '#ccc', border: '1px solid #555', borderRadius: '3px', cursor: 'pointer' }}
        >
          Clear
        </button>
        <button
          onClick={copyToClipboard}
          style={{ fontSize: '10px', padding: '3px 10px', background: '#1a4a1a', color: '#8f8', border: '1px solid #3a6a3a', borderRadius: '3px', cursor: 'pointer' }}
        >
          Copy Polygon
        </button>
        <span style={{ color: '#888', fontSize: '10px' }}>{points.length} pts</span>
      </div>

      {/* Clickable image container */}
      <div
        ref={containerRef}
        onClick={handleClick}
        style={{ position: 'relative', cursor: 'crosshair', userSelect: 'none', display: 'inline-block', maxWidth: '100%' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgImage}
          alt="floor plan"
          style={{ display: 'block', maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', pointerEvents: 'none' }}
          draggable={false}
        />

        {/* SVG overlay for dots and lines */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {points.length > 1 && (
            <polygon
              points={pointsStr}
              fill="rgba(100,220,100,0.15)"
              stroke="#4f4"
              strokeWidth="0.4"
            />
          )}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="0.8" fill="#ff4" stroke="#000" strokeWidth="0.2" />
              <text x={p.x + 1} y={p.y - 0.5} fontSize="1.8" fill="#ff4">{i + 1}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Output string */}
      <div style={{ marginTop: '10px', background: '#1a1a1a', padding: '8px 12px', borderRadius: '4px', overflowX: 'auto', whiteSpace: 'pre', fontSize: '11px', color: '#8f8', borderLeft: '3px solid #3a6a3a' }}>
        {svgSnippet || '(click on the image to add points)'}
      </div>

      {/* Individual point list */}
      {points.length > 0 && (
        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {points.map((p, i) => (
            <span
              key={i}
              onClick={() => setPoints(prev => prev.filter((_, idx) => idx !== i))}
              title="Click to remove"
              style={{ background: '#222', border: '1px solid #444', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', color: '#ccc', cursor: 'pointer' }}
            >
              {i + 1}: {p.x},{p.y}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
