'use client'

import { useState } from 'react'
import { Mapper } from '@/components/pyramid/floor-plans/mapper'

const FLOORS = [
  { label: 'Ground Floor (L0)',  image: '/sketches/plan-groundfloor.jpeg' },
  { label: 'Basement (L-1)',     image: '/sketches/plan-level-01-basement.jpeg' },
  { label: 'Level 2',           image: '/sketches/plan-level-02.jpeg' },
  { label: 'Level 3',           image: '/sketches/plan-level-03.jpeg' },
  { label: 'Roof (L4)',         image: '/sketches/plan-level-04.jpeg' },
]

export default function MapDevPage() {
  const [activeIdx, setActiveIdx] = useState(0)
  const floor = FLOORS[activeIdx]

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', color: '#eee', padding: '24px', fontFamily: 'monospace' }}>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#666', margin: '0 0 6px' }}>
          dev tool — internal only
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 500, margin: '0 0 16px', color: '#ccc' }}>
          SVG Polygon Mapper
        </h1>
        <p style={{ fontSize: '11px', color: '#666', margin: '0 0 20px', maxWidth: '600px', lineHeight: 1.6 }}>
          Click the corners of a room on the floor plan image. The tool records each click as an X,Y percentage of the image dimensions.
          When done, click <strong style={{ color: '#8f8' }}>Copy Polygon</strong> and paste the{' '}
          <code style={{ background: '#222', padding: '1px 4px' }}>points="…"</code> attribute into the floor plan SVG component.
          Click a point badge to remove it individually.
        </p>

        {/* Floor tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {FLOORS.map((f, i) => (
            <button
              key={f.label}
              onClick={() => setActiveIdx(i)}
              style={{
                fontSize: '10px', padding: '5px 14px', borderRadius: '3px', cursor: 'pointer',
                border: i === activeIdx ? '1px solid #8f8' : '1px solid #444',
                background: i === activeIdx ? '#1a4a1a' : '#1a1a1a',
                color: i === activeIdx ? '#8f8' : '#888',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Mapper key={floor.image} bgImage={floor.image} label={floor.label} />
    </div>
  )
}
