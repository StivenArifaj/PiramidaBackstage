'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface BrandStripProps {
  className?: string
}

export function BrandStrip({ className }: BrandStripProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header
      className={cn('fixed top-0 left-0 right-0 z-50', className)}
      style={{
        borderBottom: '2px solid var(--color-concrete-char)',
        backgroundColor: 'var(--color-concrete-bone)',
      }}
    >
      <div className="flex items-center justify-between h-12 px-4 md:px-6">
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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/spaces"
            style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}
            className="hover:text-[var(--color-concrete-char)] transition-colors"
          >
            spaces
          </Link>
          <Link
            href="/lookup"
            style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}
            className="hover:text-[var(--color-concrete-char)] transition-colors"
          >
            track booking
          </Link>
        </nav>

        {/* Hamburger — mobile only */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 p-2 -mr-2"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span
            className="block h-px w-5 transition-transform origin-center"
            style={{ backgroundColor: 'var(--color-concrete-char)', transform: menuOpen ? 'translateY(4px) rotate(45deg)' : undefined }}
          />
          <span
            className="block h-px w-5 transition-opacity"
            style={{ backgroundColor: 'var(--color-concrete-char)', opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="block h-px w-5 transition-transform origin-center"
            style={{ backgroundColor: 'var(--color-concrete-char)', transform: menuOpen ? 'translateY(-4px) rotate(-45deg)' : undefined }}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          className="md:hidden border-t-2"
          style={{ borderColor: 'var(--color-concrete-char)', backgroundColor: 'var(--color-concrete-bone)' }}
        >
          <Link
            href="/spaces"
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', borderBottom: '1px solid var(--color-concrete-mid)' }}
          >
            spaces
          </Link>
          <Link
            href="/lookup"
            onClick={() => setMenuOpen(false)}
            className="block px-6 py-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', borderBottom: '1px solid var(--color-concrete-mid)' }}
          >
            track booking
          </Link>
        </nav>
      )}
    </header>
  )
}
