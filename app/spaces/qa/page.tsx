'use client'

import { MOCK_SPACES } from '@/lib/db/mock-data'

export default function QAPage() {
  const spaces = MOCK_SPACES

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-8">
      {spaces.map((space) => (
        <div
          key={space.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          {space.photo_urls[0] ? (
            <img
              src={space.photo_urls[0]}
              alt={space.name}
              style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                aspectRatio: '16 / 9',
                backgroundColor: '#f00',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            >
              NO IMAGE
            </div>
          )}
          <div style={{ padding: '8px 12px 12px' }}>
            <p style={{ fontWeight: 'bold', margin: 0, fontSize: '14px' }}>
              {space.code}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#555' }}>
              {space.name}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>
              {space.floor}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
