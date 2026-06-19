'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandStripProps {
  role?: 'customer' | 'organizer'
  onRoleSwitch?: () => void
  className?: string
}

export function BrandStrip({ role = 'customer', onRoleSwitch, className }: BrandStripProps) {
  return (
    <header
      className={cn('fixed top-0 left-0 right-0 z-50', className)}
      style={{
        borderBottom: '2px solid var(--color-concrete-char)',
        backgroundColor: 'var(--color-concrete-bone)',
      }}
    >
      <div className="flex items-center justify-between h-12 px-6">
        {/* Logo + wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="22" height="18" viewBox="0 0 24 20" fill="none" aria-hidden="true">
            <polygon
              points="12,0 24,20 0,20"
              style={{ fill: 'var(--color-concrete-char)', transition: 'fill 0.15s' }}
            />
            <rect x="7" y="13" width="4" height="5" style={{ fill: 'var(--color-box-blue)' }} />
            <rect x="12" y="13" width="3.5" height="5" style={{ fill: 'var(--color-box-orange)' }} />
          </svg>

          <span className="flex items-baseline gap-1.5">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-char)' }}>
              piramida
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '0 4px' }}>
              backstage
            </span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <Link
            href="/spaces"
            style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}
            className="hover:text-[var(--color-concrete-char)] transition-colors"
          >
            spaces
          </Link>
          <Link
            href="/dashboard"
            style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}
            className="hover:text-[var(--color-concrete-char)] transition-colors"
          >
            dashboard
          </Link>

          <button
            type="button"
            onClick={onRoleSwitch}
            className="transition-colors hover:bg-[var(--color-lime)] hover:border-[var(--color-lime-ink)]"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '4px 12px',
              border: '2px solid var(--color-concrete-char)',
              backgroundColor: 'transparent',
              color: 'var(--color-concrete-char)',
              cursor: 'pointer',
            }}
          >
            {role === 'customer' ? 'organizer view' : 'customer view'}
          </button>
        </nav>
      </div>
    </header>
  )
}
