'use client'

import type { SpaceWithAvailability } from '@/types/api'

const M = 'var(--font-mono)'
const D = 'var(--font-display)'

interface QuoteSummaryProps {
  space: SpaceWithAvailability | null
  date: string
  startTime: string
  endTime: string
  attendees: number
}

function fmtEur(n: number) {
  return `€${n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function fmtFloor(f: string) {
  return f.replace('l_minus_1', 'B1').replace('l0', 'L0').replace('l3', 'L+3')
          .replace('roof', 'Roof').replace('exterior', 'Exterior')
}

export function QuoteSummary({ space, date, startTime, endTime, attendees }: QuoteSummaryProps) {
  const durationHrs = Math.max(
    1,
    (new Date(`2000-01-01T${endTime}`).getTime() - new Date(`2000-01-01T${startTime}`).getTime()) / 3_600_000,
  )

  const rate     = space?.hourly_rate_eur ?? 0
  const rental   = Math.round(rate * durationHrs)
  const cleaning = 50
  const service  = Math.round((rental + cleaning) * 0.08)
  const subtotal = rental + cleaning + service
  const vat      = Math.round(subtotal * 0.18)
  const total    = subtotal + vat

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '2px solid var(--color-concrete-char)', backgroundColor: 'var(--color-concrete-mid)' }}>
        <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 6px' }}>
          live quote
        </p>
        {space ? (
          <>
            <p style={{ fontFamily: D, fontSize: '18px', fontWeight: 500, color: 'var(--color-concrete-char)', margin: 0, letterSpacing: '0.01em' }}>
              {space.name}
            </p>
            <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '4px 0 0' }}>
              {fmtFloor(space.floor)} · max {space.capacity_pax} pax · €{space.hourly_rate_eur}/hr
            </p>
          </>
        ) : (
          <p style={{ fontFamily: M, fontSize: '11px', color: 'var(--color-concrete-gray)', margin: 0 }}>
            select a space to see pricing
          </p>
        )}
      </div>

      {/* Date / time summary */}
      {space && date && (
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--color-concrete-mid)', display: 'flex', gap: '24px' }}>
          <div>
            <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 2px' }}>date</p>
            <p style={{ fontFamily: M, fontSize: '11px', color: 'var(--color-concrete-char)', margin: 0 }}>
              {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 2px' }}>time</p>
            <p style={{ fontFamily: M, fontSize: '11px', color: 'var(--color-concrete-char)', margin: 0 }}>
              {startTime} – {endTime} · {durationHrs}h
            </p>
          </div>
          <div>
            <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 2px' }}>pax</p>
            <p style={{ fontFamily: M, fontSize: '11px', color: 'var(--color-concrete-char)', margin: 0 }}>
              {attendees}
            </p>
          </div>
        </div>
      )}

      {/* Line items */}
      {space ? (
        <div style={{ padding: '16px 24px', flex: 1 }}>
          {[
            { label: 'Space rental',   value: rental,   note: `${durationHrs}h × €${rate}/hr` },
            { label: 'Cleaning fee',   value: cleaning, note: 'flat' },
            { label: 'Service charge', value: service,  note: '8%' },
          ].map(({ label, value, note }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderTop: '1px solid var(--color-concrete-mid)' }}>
              <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}>
                {label} <span style={{ opacity: 0.45 }}>({note})</span>
              </span>
              <span style={{ fontFamily: M, fontSize: '12px', fontWeight: 500, color: 'var(--color-concrete-char)' }}>{fmtEur(value)}</span>
            </div>
          ))}

          {/* Subtotal divider */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderTop: '2px solid var(--color-concrete-char)', marginTop: '8px' }}>
            <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-concrete-char)' }}>subtotal</span>
            <span style={{ fontFamily: M, fontSize: '12px', fontWeight: 500, color: 'var(--color-concrete-char)' }}>{fmtEur(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderTop: '1px solid var(--color-concrete-mid)' }}>
            <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}>
              VAT <span style={{ opacity: 0.45 }}>(18%)</span>
            </span>
            <span style={{ fontFamily: M, fontSize: '12px', fontWeight: 500, color: 'var(--color-concrete-char)' }}>{fmtEur(vat)}</span>
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0', borderTop: '2px solid var(--color-concrete-char)', marginTop: '8px' }}>
            <span style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}>total incl. vat</span>
            <span style={{ fontFamily: M, fontSize: '28px', fontWeight: 500, color: 'var(--color-lime-ink)', letterSpacing: '-0.02em' }}>{fmtEur(total)}</span>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <p style={{ fontFamily: M, fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-mid)', textAlign: 'center', margin: 0 }}>
            pricing will appear<br />once you select a space
          </p>
        </div>
      )}

      {/* Validity note */}
      {space && (
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--color-concrete-mid)', backgroundColor: 'var(--color-concrete-mid)' }}>
          <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.1em', color: 'var(--color-concrete-gray)', margin: 0 }}>
            Quote valid 48h · subject to availability confirmation
          </p>
        </div>
      )}
    </div>
  )
}
