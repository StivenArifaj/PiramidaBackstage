'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Scanner } from '@yudiel/react-qr-scanner'

const M = 'var(--font-mono)'

export default function ScannerPage() {
  const router = useRouter()
  const [paused, setPaused]   = useState(false)
  const [scanned, setScanned] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const handleScan = useCallback((results: Array<{ rawValue: string }>) => {
    if (paused || !results.length) return
    const raw = results[0].rawValue
    setScanned(raw)
    setPaused(true)

    // Extract the path — accept any URL pointing to this origin or just a path
    try {
      let path: string
      if (raw.startsWith('http')) {
        const url = new URL(raw)
        path = url.pathname
      } else {
        path = raw
      }
      // Only navigate to dashboard event pages for safety
      if (path.startsWith('/dashboard/')) {
        router.push(path)
      } else {
        setError(`Unrecognised QR: ${raw}`)
        setTimeout(() => { setError(null); setPaused(false); setScanned(null) }, 3000)
      }
    } catch {
      setError(`Invalid QR value: ${raw}`)
      setTimeout(() => { setError(null); setPaused(false); setScanned(null) }, 3000)
    }
  }, [paused, router])

  const handleError = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.toLowerCase().includes('permission')) {
      setError('Camera permission denied. Please allow camera access and reload.')
    } else {
      console.error('[QR scanner]', err)
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#111110', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        qr scanner
      </h1>

      {/* Top bar */}
      <div style={{ height: 54, borderBottom: '1px solid #252422', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#0e0e0d', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#6b6966' }}>← dashboard</Link>
          <span style={{ display: 'block', width: 1, height: 18, background: '#252422' }} />
          {/* scan icon */}
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="1" width="4" height="4" stroke="#c8da2b" strokeWidth="1.3"/>
            <rect x="8" y="1" width="4" height="4" stroke="#c8da2b" strokeWidth="1.3"/>
            <rect x="1" y="8" width="4" height="4" stroke="#c8da2b" strokeWidth="1.3"/>
            <line x1="8" y1="8" x2="12" y2="8" stroke="#c8da2b" strokeWidth="1.3"/>
            <line x1="10" y1="8" x2="10" y2="12" stroke="#c8da2b" strokeWidth="1.3"/>
          </svg>
          <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f5f5f0' }}>qr entry scanner</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: paused ? '#f4a261' : '#c8da2b' }} />
          <span style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b6966' }}>
            {paused ? 'paused' : 'scanning'}
          </span>
        </div>
      </div>

      {/* Scanner area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Instructions */}
          <div>
            <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6b6966', margin: '0 0 6px' }}>entry check-in</p>
            <p style={{ fontFamily: M, fontSize: '12px', color: '#9a9890', margin: 0, lineHeight: 1.6 }}>
              Point the camera at the attendee&apos;s QR ticket. The system will automatically navigate to their event record.
            </p>
          </div>

          {/* Camera viewfinder */}
          <div style={{ border: '2px solid #252422', background: '#0e0e0d', overflow: 'hidden', position: 'relative' }}>
            {/* Corner accent marks */}
            {[['0,0', '0'], ['0,auto', '180'], ['auto,0', '270'], ['auto,auto', '90']].map(([pos, rot], i) => {
              const [top, bottom] = pos.split(',')
              return (
                <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: top === '0' ? 8 : undefined, bottom: bottom === '0' ? 8 : undefined, left: i < 2 ? 8 : undefined, right: i >= 2 ? 8 : undefined, transform: `rotate(${rot}deg)`, zIndex: 2 }}>
                  <path d="M0 12V0H12" stroke="#c8da2b" strokeWidth="2.5" fill="none"/>
                </svg>
              )
            })}

            <Scanner
              onScan={handleScan}
              onError={handleError}
              paused={paused}
              styles={{
                container: { height: 360, width: '100%' },
                video: { objectFit: 'cover' },
              }}
              components={{ torch: false, finder: true }}
            />
          </div>

          {/* Status / error feedback */}
          {error && (
            <div style={{ border: '1px solid #e63946', background: 'rgba(230,57,70,0.08)', padding: '14px 16px' }}>
              <p style={{ fontFamily: M, fontSize: '9px', color: '#e63946', margin: 0, letterSpacing: '0.08em' }}>{error}</p>
            </div>
          )}

          {scanned && !error && (
            <div style={{ border: '1px solid rgba(200,218,43,0.3)', background: 'rgba(200,218,43,0.05)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3 3 7-7" stroke="#c8da2b" strokeWidth="2"/>
              </svg>
              <div>
                <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c8da2b', margin: '0 0 2px' }}>qr recognised — navigating…</p>
                <p style={{ fontFamily: M, fontSize: '9px', color: '#6b6966', margin: 0, wordBreak: 'break-all' }}>{scanned}</p>
              </div>
            </div>
          )}

          {/* Reset button when paused */}
          {paused && (
            <button
              onClick={() => { setPaused(false); setScanned(null); setError(null) }}
              style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: '#6b6966', border: '1px solid #252422', padding: '10px', cursor: 'pointer' }}
            >
              ↺ scan another
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
