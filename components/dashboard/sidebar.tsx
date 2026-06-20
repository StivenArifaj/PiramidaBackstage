'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const M = 'var(--font-mono)'

const NAV = [
  {
    href: '/dashboard', label: 'Dashboard',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="7.5" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1" y="7.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="7.5" y="7.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    href: '/dashboard/events', label: 'Events',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="2.5" width="12" height="10.5" stroke="currentColor" strokeWidth="1.4" />
        <line x1="1" y1="5.5" x2="13" y2="5.5" stroke="currentColor" strokeWidth="1.4" />
        <line x1="4" y1="1" x2="4" y2="4" stroke="currentColor" strokeWidth="1.4" />
        <line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" strokeWidth="1.4" />
        <line x1="4" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1" />
        <line x1="4" y1="10.5" x2="7.5" y2="10.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/spaces', label: 'Spaces',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <polygon points="7,1 13,13 1,13" stroke="currentColor" strokeWidth="1.4" fill="none" />
        <rect x="4.5" y="9" width="2.5" height="4" stroke="currentColor" strokeWidth="1" />
        <rect x="7.5" y="9" width="2.5" height="4" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/quotes', label: 'Quotes',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="12" height="12" stroke="currentColor" strokeWidth="1.4" />
        <line x1="3.5" y1="4.5" x2="10.5" y2="4.5" stroke="currentColor" strokeWidth="1" />
        <line x1="3.5" y1="7" x2="10.5" y2="7" stroke="currentColor" strokeWidth="1" />
        <line x1="3.5" y1="9.5" x2="7.5" y2="9.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/inventory', label: 'Inventory',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="4.5" width="12" height="8.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 4.5V3.5a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4" />
        <line x1="1" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/conflicts', label: 'Conflicts',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <polygon points="7,1 13,13 1,13" stroke="currentColor" strokeWidth="1.4" fill="none" />
        <line x1="7" y1="5" x2="7" y2="8.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7" cy="11" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/dashboard/maintenance', label: 'Maintenance',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="12" height="12" stroke="currentColor" strokeWidth="1.4" />
        <line x1="4" y1="1" x2="4" y2="13" stroke="currentColor" strokeWidth="1" />
        <line x1="8" y1="1" x2="8" y2="13" stroke="currentColor" strokeWidth="1" />
        <line x1="1" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1" />
        <line x1="1" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/reports', label: 'Reports',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="7" width="3" height="6" stroke="currentColor" strokeWidth="1.3" />
        <rect x="5.5" y="4" width="3" height="9" stroke="currentColor" strokeWidth="1.3" />
        <rect x="10" y="1" width="3" height="12" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
]

export function DashboardSidebar() {
  const path = usePathname()

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
      background: '#111110',
      borderRight: '1px solid #252422',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ height: 54, borderBottom: '1px solid #252422', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10, flexShrink: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <svg width="18" height="15" viewBox="0 0 24 20" fill="none" aria-hidden="true">
            <polygon points="12,0 24,20 0,20" fill="#f5f5f0" />
            <rect x="7" y="13" width="4" height="5" fill="#378ADD" />
            <rect x="12" y="13" width="3.5" height="5" fill="#f4a261" />
          </svg>
          <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f5f5f0' }}>Piramida</span>
          <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5a6612', background: '#c8da2b', padding: '1px 5px' }}>BS</span>
        </Link>
      </div>

      {/* Section label */}
      <div style={{ padding: '16px 20px 6px', flexShrink: 0 }}>
        <span style={{ fontFamily: M, fontSize: '7px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#3a3835' }}>Operations</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflow: 'auto' }}>
        {NAV.map(({ href, label, icon }) => {
          const active = href === '/dashboard' ? path === href : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="dash-link"
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 20px',
                color: active ? '#f5f5f0' : '#6b6966',
                background: active ? 'rgba(200,218,43,0.07)' : 'transparent',
                borderLeft: `2px solid ${active ? '#c8da2b' : 'transparent'}`,
                textDecoration: 'none',
                fontFamily: M, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'color 0.12s, background 0.12s',
              }}
            >
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Quick links */}
      <div style={{ padding: '10px 20px', borderTop: '1px solid #252422', borderBottom: '1px solid #252422', flexShrink: 0 }}>
        <Link href="/book" style={{ display: 'block', fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: '#5a6612', background: '#c8da2b', padding: '8px 12px', textAlign: 'center', fontWeight: 600 }}>
          + new booking
        </Link>
      </div>

      {/* Status + venue */}
      <div style={{ padding: '14px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ display: 'block', width: 5, height: 5, borderRadius: '50%', background: '#c8da2b', flexShrink: 0 }} />
          <span style={{ fontFamily: M, fontSize: '7.5px', letterSpacing: '0.12em', color: '#6b6966', textTransform: 'uppercase' }}>All systems operational</span>
        </div>
        <p style={{ fontFamily: M, fontSize: '9px', color: '#9a9890', margin: '0 0 2px', letterSpacing: '0.08em' }}>Piramida · Tirana, AL</p>
        <p style={{ fontFamily: M, fontSize: '8px', color: '#3a3835', margin: 0, letterSpacing: '0.06em' }}>Venue Operations</p>
      </div>
    </aside>
  )
}
