'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BrandStrip } from '@/components/ui/brand-strip'

const M = 'var(--font-mono)'
const D = 'var(--font-display)'
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

const INPUT_STYLE = {
  width: '100%',
  fontFamily: M,
  fontSize: '13px',
  letterSpacing: '0.04em',
  color: 'var(--color-concrete-bone)',
  background: 'rgba(245,245,240,0.05)',
  border: '1px solid rgba(245,245,240,0.15)',
  padding: '14px 16px',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const LABEL_STYLE = {
  fontFamily: M,
  fontSize: '8px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  color: 'rgba(245,245,240,0.35)',
  display: 'block',
  marginBottom: '8px',
}

export default function LookupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [refCode, setRefCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !refCode.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), reference_code: refCode.trim().toUpperCase() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Lookup failed. Please check your details.')
        return
      }

      router.push(`/track/${data.reference_code}`)
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [email, refCode, loading, router])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-concrete-char)', color: 'var(--color-concrete-bone)' }}>
      <BrandStrip />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '120px 32px 80px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ marginBottom: 48 }}
        >
          <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 12px' }}>
            booking lookup
          </p>
          <h1 style={{ fontFamily: D, fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-bone)', margin: '0 0 14px', lineHeight: 1.05 }}>
            Find your<br />booking.
          </h1>
          <p style={{ fontFamily: M, fontSize: '12px', color: 'rgba(245,245,240,0.4)', margin: 0, lineHeight: 1.65 }}>
            Enter the email address you booked with and your reference code from the confirmation email.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45, ease: EASE }}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          {/* Email */}
          <div>
            <label htmlFor="email" style={LABEL_STYLE}>email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={INPUT_STYLE}
            />
          </div>

          {/* Reference code */}
          <div>
            <label htmlFor="ref" style={LABEL_STYLE}>reference code</label>
            <input
              id="ref"
              type="text"
              autoComplete="off"
              placeholder="PB-2026-001"
              value={refCode}
              onChange={e => setRefCode(e.target.value.toUpperCase())}
              required
              style={{ ...INPUT_STYLE, letterSpacing: '0.12em' }}
            />
            <p style={{ fontFamily: M, fontSize: '8px', color: 'rgba(245,245,240,0.22)', margin: '6px 0 0', letterSpacing: '0.06em' }}>
              Found in your confirmation email, e.g. PB-2026-001
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: M, fontSize: '10px', color: '#e63946', margin: 0, letterSpacing: '0.06em', lineHeight: 1.5 }}
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !refCode.trim()}
            style={{
              fontFamily: M, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase',
              background: loading || !email.trim() || !refCode.trim() ? 'rgba(200,218,43,0.4)' : 'var(--color-lime)',
              color: 'var(--color-lime-ink)',
              border: 'none', padding: '16px 0',
              cursor: loading || !email.trim() || !refCode.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 600, width: '100%',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'looking up…' : 'find my booking →'}
          </button>
        </motion.form>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ fontFamily: M, fontSize: '10px', color: 'rgba(245,245,240,0.2)', marginTop: 32, lineHeight: 1.6, letterSpacing: '0.04em' }}
        >
          Don&apos;t have a booking yet?{' '}
          <a href="/spaces" style={{ color: 'rgba(245,245,240,0.4)', textDecoration: 'underline' }}>Browse spaces →</a>
        </motion.p>
      </div>
    </div>
  )
}
