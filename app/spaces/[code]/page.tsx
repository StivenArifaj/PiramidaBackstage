import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BrandStrip } from '@/components/ui/brand-strip'
import { MonoTable } from '@/components/ui/mono-table'
import { StatusDot } from '@/components/ui/status-dot'
import { ImageGallery } from '@/components/ui/image-gallery'
import { BookingPanel } from '@/components/spaces/booking-panel'
import { getSpaceByCode } from '@/lib/db/queries/spaces'

const COLOR_MAP: Record<string, string> = {
  blue: '#378ADD', orange: '#f4a261', green: '#97C459', yellow: '#f9c74f',
  red: '#e63946', purple: '#5a4fcf', teal: '#2a9d8f', coral: '#e76f51', pink: '#ec4899',
}

function formatFloor(floor: string) {
  return floor
    .replace('l_minus_1', 'B1')
    .replace('l0', 'L0')
    .replace('l3', 'L+3')
    .replace('roof', 'Roof')
    .replace('exterior', 'Exterior')
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

  return (
    <div style={{ backgroundColor: 'var(--color-concrete-bone)', minHeight: '100vh' }}>
      <BrandStrip />

      {/* Page header — breadcrumb · space identity · status */}
      <div
        style={{
          paddingTop: '80px',
          backgroundColor: 'var(--color-concrete-char)',
          borderBottom: '2px solid var(--color-concrete-char)',
        }}
      >
        <div style={{ padding: '0 64px' }}>
          <Link
            href="/spaces"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: 'rgba(245,245,240,0.35)',
            }}
          >
            ← all spaces
          </Link>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '20px 64px 32px',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(245,245,240,0.35)',
                margin: '0 0 12px',
              }}
            >
              {formatFloor(space.floor)} · {space.category.replace(/_/g, ' ')}
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 5vw, 72px)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: 'var(--color-concrete-bone)',
                margin: 0,
                lineHeight: 0.95,
              }}
            >
              {space.name}
            </h1>
            {space.name_sq && (
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  color: 'rgba(245,245,240,0.28)',
                  margin: '10px 0 0',
                }}
              >
                {space.name_sq}
              </p>
            )}
          </div>
          <div
            style={{
              border: `2px solid ${accentColor}`,
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
            }}
          >
            <StatusDot status={space.availability} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: accentColor,
              }}
            >
              {space.availability}
            </span>
          </div>
        </div>
      </div>

      {/* Architectural image gallery */}
      <ImageGallery
        title={space.name}
        spaceCode={space.code}
        accentColor={accentColor}
        images={
          space.photo_urls.length > 0
            ? space.photo_urls.map((url, i) => ({
                url,
                label: `${space.name.toUpperCase()} · VIEW ${String(i + 1).padStart(2, '0')}`,
              }))
            : undefined
        }
      />

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '0', borderTop: '2px solid var(--color-concrete-char)' }}>
        {/* Left: specs + description */}
        <div style={{ padding: '56px 64px', borderRight: '2px solid var(--color-concrete-char)' }}>
          {/* Key metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '2px solid var(--color-concrete-char)', marginBottom: '40px' }}>
            {[
              { label: 'area', value: `${space.area_sqm}`, unit: 'm²' },
              { label: 'capacity', value: `${space.capacity_pax}`, unit: 'pax' },
              { label: 'ceiling', value: space.ceiling_m ? `${space.ceiling_m}` : '—', unit: space.ceiling_m ? 'm' : '' },
              { label: 'rate', value: `€${space.hourly_rate_eur}`, unit: '/hr' },
            ].map(({ label, value, unit }, i) => (
              <div key={label} style={{ padding: '28px 24px', borderRight: i < 3 ? '2px solid var(--color-concrete-char)' : 'none' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: 500, color: 'var(--color-concrete-char)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                  {value}<span style={{ fontSize: '14px', color: 'var(--color-concrete-gray)', marginLeft: '4px' }}>{unit}</span>
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {space.description && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-concrete-char)', lineHeight: 1.75, margin: '0 0 40px', maxWidth: '600px' }}>
              {space.description}
            </p>
          )}

          {/* Full spec table */}
          <div style={{ maxWidth: '480px', marginBottom: '40px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 16px' }}>specifications</p>
            <MonoTable rows={[
              { label: 'space code', value: space.code },
              { label: 'floor', value: formatFloor(space.floor) },
              { label: 'category', value: space.category.replace('_', ' ') },
              { label: 'area', value: space.area_sqm, unit: 'm²' },
              { label: 'capacity', value: space.capacity_pax, unit: 'pax' },
              ...(space.ceiling_m ? [{ label: 'ceiling height', value: space.ceiling_m, unit: 'm' }] : []),
              { label: 'hourly rate', value: `€${space.hourly_rate_eur}`, unit: '+ VAT' },
            ]} />
          </div>

          {/* Setup types */}
          {space.setup_types.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>available layouts</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {space.setup_types.map(t => (
                  <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-concrete-char)', border: '1px solid var(--color-concrete-char)', padding: '4px 10px' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {space.features.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>included features</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {space.features.map(f => (
                  <span key={f} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '4px 10px' }}>{f.replace('_', ' ')}</span>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming bookings */}
          {upcoming_bookings.length > 0 && (
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>upcoming bookings</p>
              {upcoming_bookings.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--color-concrete-mid)', alignItems: 'center' }}>
                  <StatusDot status={b.status === 'confirmed' ? 'reserved' : b.status === 'in_progress' ? 'available' : 'pending'} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-concrete-char)' }}>
                    {new Date(b.start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(b.start_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', marginLeft: 'auto' }}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: booking panel */}
        <div style={{ padding: '40px 32px', backgroundColor: 'var(--color-concrete-light)' }}>
          <BookingPanel space={space} />
        </div>
      </div>
    </div>
  )
}
