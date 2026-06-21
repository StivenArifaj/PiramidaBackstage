'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/db/client'

const M = 'var(--font-mono)'

const JURY_EMAIL    = 'admin@piramida.com'
const JURY_PASSWORD = 'admin123'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const signIn = async (e: string, p: string) => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email: e, password: p })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signIn(email, password)
  }

  const handleJuryAccess = () => {
    setEmail(JURY_EMAIL)
    setPassword(JURY_PASSWORD)
    signIn(JURY_EMAIL, JURY_PASSWORD)
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: M,
    fontSize: '12px',
    background: '#f5f5f0',
    border: '1.5px solid #1a1a1a',
    padding: '10px 12px',
    width: '100%',
    outline: 'none',
    color: '#1a1a1a',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: M,
    fontSize: '8px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: '#9a9890',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 400,
        border: '2px solid #1a1a1a',
        background: '#fafaf5',
        padding: '40px 36px',
      }}>
        {/* Wordmark */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9a9890', margin: '0 0 6px' }}>
            Pyramid of Tirana
          </p>
          <p style={{ fontFamily: M, fontSize: '14px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1a1a1a', margin: 0, fontWeight: 700 }}>
            Backstage
          </p>
          <div style={{ width: 24, height: 2, background: '#c8da2b', marginTop: 10 }} />
        </div>

        {/* Jury demo access — prominent, above the manual form */}
        <div style={{
          marginBottom: 24,
          background: '#1a1a1a',
          padding: '18px 20px',
          borderLeft: '3px solid #c8da2b',
        }}>
          <p style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#c8da2b', margin: '0 0 4px' }}>
            Hackathon Jury
          </p>
          <p style={{ fontFamily: M, fontSize: '10px', color: '#9a9890', margin: '0 0 14px', lineHeight: 1.5 }}>
            Click below for instant access — no typing required.
          </p>
          <button
            type="button"
            onClick={handleJuryAccess}
            disabled={loading}
            style={{
              width: '100%',
              fontFamily: M,
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              background: loading ? '#333' : '#c8da2b',
              color: '#1a1a1a',
              border: 'none',
              padding: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
            }}
          >
            {loading ? 'Signing in…' : '⚡ Jury Demo Access'}
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#e8e6dd' }} />
          <span style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c8c6be' }}>or sign in manually</span>
          <div style={{ flex: 1, height: 1, background: '#e8e6dd' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="admin@piramida.al"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p style={{
              fontFamily: M,
              fontSize: '9px',
              color: '#e63946',
              margin: 0,
              background: '#ffeaea',
              border: '1px solid #e63946',
              padding: '8px 10px',
              letterSpacing: '0.06em',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              fontFamily: M,
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              background: loading ? '#d8d5cc' : '#1a1a1a',
              color: loading ? '#9a9890' : '#c8da2b',
              border: 'none',
              padding: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              width: '100%',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
