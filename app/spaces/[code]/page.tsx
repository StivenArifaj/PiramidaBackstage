import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BrandStrip } from '@/components/ui/brand-strip'
import { MonoTable } from '@/components/ui/mono-table'
import { StatusDot } from '@/components/ui/status-dot'
import { BookingPanel } from '@/components/spaces/booking-panel'
import { getSpaceByCode } from '@/lib/db/queries/spaces'

const COLOR_MAP: Record<string, string> = {
  blue: '#378ADD', orange: '#f4a261', green: '#97C459', yellow: '#f9c74f',
  red: '#e63946', purple: '#5a4fcf', teal: '#2a9d8f', coral: '#e76f51', pink: '#ec4899',
}

function formatFloor(floor: string): string {
  switch (floor) {
    case 'l0':        return 'Ground Floor'
    case 'l_minus_1': return 'Basement L-1'
    case 'l3':        return 'Level 3'
    case 'roof':      return 'Rooftop'
    case 'exterior':  return 'Exterior'
    default:          return floor
  }
}

export default async function SpaceDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const result = await getSpaceByCode(code.toUpperCase())

  if (!result) notFound()

  const { space, upcoming_bookings } = result
  const accentColor = space.color ? COLOR_MAP[space.color] ?? '#c8da2b' : '#c8da2b'
  const floorLabel   = formatFloor(space.floor)
  const primaryImage = space.photo_urls[0] ?? null

  return (
    <div style={{ backgroundColor: 'var(--color-concrete-bone)', minHeight: '100vh' }}>
      <BrandStrip />

      {/* ── Breadcrumb header ──────────────────────────────────────────────── */}
      <div style={{ paddingTop: '48px', backgroundColor: 'var(--color-concrete-char)', borderBottom: '2px solid rgba(245,245,240,0.06)' }}>
        <div style={{ padding: '18px 64px 0' }}>
          <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/spaces"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.35)', textDecoration: 'none' }}
            >
              Spaces
            </Link>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(245,245,240,0.2)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.35)' }}>
              {floorLabel}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(245,245,240,0.2)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.7)' }}>
              {space.name}
            </span>
          </nav>
        </div>
        <div style={{ padding: '12px 64px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <StatusDot status={space.availability} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: accentColor }}>
              {space.availability}
            </span>
            <span style={{ color: 'rgba(245,245,240,0.18)', fontFamily: 'var(--font-mono)', fontSize: '9px' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.3)' }}>
              {space.category.replace(/_/g, ' ')}
            </span>
          </div>
          <Link
            href="/spaces"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.3)', textDecoration: 'none' }}
          >
            ← all spaces
          </Link>
        </div>
      </div>

      {/* ── Hero image ────────────────────────────────────────────────────── */}
      <div
        style={{
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#0d0d0d',
          borderBottom: '2px solid var(--color-concrete-char)',
          width: '100%',
        }}
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={space.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}>
              <defs>
                <pattern id={`hatch-${space.code}`} patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(30)">
                  <line x1="0" y1="0" x2="0" y2="20" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#hatch-${space.code})`} />
            </svg>
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.16)', margin: 0 }}>
                {space.code} · render not available
              </p>
            </div>
          </div>
        )}
        {/* Space code badge */}
        <div
          style={{
            position: 'absolute', top: '24px', left: '24px',
            border: `2px solid ${accentColor}`,
            padding: '6px 14px',
            backgroundColor: 'rgba(10,10,10,0.78)',
          }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.24em', textTransform: 'uppercase', color: accentColor, margin: 0 }}>
            {space.code}
          </p>
        </div>
      </div>

      {/* ── Two-column content grid ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', alignItems: 'start', borderTop: '2px solid var(--color-concrete-char)' }}>

        {/* ── Left column: all space data ─────────────────────────────────── */}
        <div style={{ padding: '56px 64px', borderRight: '2px solid var(--color-concrete-char)' }}>

          {/* Title */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--color-concrete-char)',
              margin: '0 0 10px',
              lineHeight: 0.95,
            }}
          >
            {space.name}
          </h1>
          {space.name_sq && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em', color: 'var(--color-concrete-gray)', margin: '0 0 40px' }}>
              {space.name_sq}
            </p>
          )}
          {!space.name_sq && <div style={{ marginBottom: '40px' }} />}

          {/* Key metrics — capacity first, per spec */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              border: '2px solid var(--color-concrete-char)',
              marginBottom: '40px',
            }}
          >
            {[
              { label: 'capacity', value: `${space.capacity_pax}`, unit: 'pax' },
              { label: 'area',     value: `${space.area_sqm}`,     unit: 'm²'  },
              { label: 'ceiling',  value: space.ceiling_m ? `${space.ceiling_m}` : '—', unit: space.ceiling_m ? 'm' : '' },
              { label: 'rate',     value: `€${space.hourly_rate_eur}`, unit: '/hr' },
            ].map(({ label, value, unit }, i) => (
              <div
                key={label}
                style={{
                  padding: '24px 20px',
                  borderRight: i < 3 ? '2px solid var(--color-concrete-char)' : 'none',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '28px',
                    fontWeight: 500,
                    color: 'var(--color-concrete-char)',
                    margin: '0 0 4px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {value}
                  <span style={{ fontSize: '12px', color: 'var(--color-concrete-gray)', marginLeft: '3px' }}>{unit}</span>
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--color-concrete-gray)',
                    margin: 0,
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          {space.description && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: 'var(--color-concrete-char)',
                lineHeight: 1.8,
                margin: '0 0 40px',
                maxWidth: '600px',
              }}
            >
              {space.description}
            </p>
          )}

          {/* Features */}
          {space.features.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>
                included features
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {space.features.map(f => (
                  <span
                    key={f}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--color-lime-ink)',
                      backgroundColor: 'var(--color-lime)',
                      padding: '4px 10px',
                    }}
                  >
                    {f.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Setup types */}
          {space.setup_types.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>
                available layouts
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {space.setup_types.map(t => (
                  <span
                    key={t}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--color-concrete-char)',
                      border: '1px solid var(--color-concrete-char)',
                      padding: '4px 10px',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full spec table */}
          <div style={{ maxWidth: '480px', marginBottom: '40px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 16px' }}>
              specifications
            </p>
            <MonoTable
              rows={[
                { label: 'space code', value: space.code },
                { label: 'floor',      value: floorLabel },
                { label: 'category',   value: space.category.replace(/_/g, ' ') },
                { label: 'area',       value: space.area_sqm,     unit: 'm²'  },
                { label: 'capacity',   value: space.capacity_pax, unit: 'pax' },
                ...(space.ceiling_m ? [{ label: 'ceiling height', value: space.ceiling_m, unit: 'm' }] : []),
                { label: 'hourly rate', value: `€${space.hourly_rate_eur}`, unit: '+ VAT' },
              ]}
            />
          </div>

          {/* Upcoming bookings */}
          {upcoming_bookings.length > 0 && (
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>
                upcoming bookings
              </p>
              {upcoming_bookings.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-concrete-mid)',
                    alignItems: 'center',
                  }}
                >
                  <StatusDot status={b.status === 'confirmed' ? 'reserved' : b.status === 'in_progress' ? 'available' : 'pending'} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-concrete-char)' }}>
                    {new Date(b.start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {new Date(b.start_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {new Date(b.end_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', marginLeft: 'auto' }}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right column: sticky booking panel ──────────────────────────── */}
        <div
          style={{
            padding: '40px 32px',
            backgroundColor: 'var(--color-concrete-light)',
            position: 'sticky',
            top: '48px',
            alignSelf: 'start',
          }}
        >
          <BookingPanel space={space} />
        </div>
      </div>
    </div>
  )
}
