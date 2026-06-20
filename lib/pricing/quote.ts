import type { Event, Quote, QuoteLineItem } from '@/types/api'

const VAT_RATE = 0.18

export function generateQuote(event: Event): Omit<Quote, 'id' | 'event_id'> {
  const durationHrs = Math.ceil((new Date(event.end_at).getTime() - new Date(event.start_at).getTime()) / 3600000)
  const lines: QuoteLineItem[] = []

  for (const space of event.spaces) {
    lines.push({ description: `${space.name} rental (${durationHrs}h)`, quantity: durationHrs, unit_price: space.hourly_rate_eur, total: durationHrs * space.hourly_rate_eur })
  }

  if (event.setup_start_at) {
    const setupHrs = Math.ceil((new Date(event.start_at).getTime() - new Date(event.setup_start_at).getTime()) / 3600000)
    if (setupHrs > 0) lines.push({ description: `Setup block (${setupHrs}h)`, quantity: setupHrs, unit_price: (event.spaces[0]?.hourly_rate_eur ?? 100) * 0.5, total: setupHrs * ((event.spaces[0]?.hourly_rate_eur ?? 100) * 0.5) })
  }

  for (const { asset, quantity } of event.assets) {
    if (asset.unit_rate_eur > 0) lines.push({ description: `${asset.name} × ${quantity}`, quantity, unit_price: asset.unit_rate_eur, total: quantity * asset.unit_rate_eur })
  }

  const subtotal = Math.round(lines.reduce((s, l) => s + l.total, 0) * 100) / 100
  const tax = Math.round(subtotal * VAT_RATE * 100) / 100
  return { line_items: lines, subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100, currency: 'EUR', generated_at: new Date().toISOString(), valid_until: new Date(Date.now() + 86400000 * 7).toISOString() }
}
