import { NextResponse } from 'next/server'
import { MOCK_ASSETS } from '@/lib/db/mock-data'

export async function GET() {
  const assets = MOCK_ASSETS.map(a => ({
    ...a,
    in_use: a.total_qty - a.available_qty,
    pct_available: Math.round((a.available_qty / a.total_qty) * 100),
  }))

  const total_skus = assets.length
  const total_units = assets.reduce((s, a) => s + a.total_qty, 0)
  const total_in_use = assets.reduce((s, a) => s + a.in_use, 0)
  const low_stock = assets.filter(a => a.pct_available < 50).length

  return NextResponse.json({ assets, total_skus, total_units, total_in_use, low_stock })
}
