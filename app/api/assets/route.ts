import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/db/client'
import { MOCK_ASSETS } from '@/lib/db/mock-data'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

function computedMock(assets: typeof MOCK_ASSETS) {
  return assets.map(a => ({
    ...a,
    in_use: a.total_qty - a.available_qty,
    pct_available: Math.round((a.available_qty / a.total_qty) * 100),
  }))
}

export async function GET() {
  try {
    // ── Mock fallback ─────────────────────────────────────────────────────────
    if (!isSupabaseConfigured()) {
      const assets = computedMock(MOCK_ASSETS)
      return NextResponse.json({
        assets,
        total_skus: assets.length,
        total_units: assets.reduce((s, a) => s + a.total_qty, 0),
        total_in_use: assets.reduce((s, a) => s + a.in_use, 0),
        low_stock: assets.filter(a => a.pct_available < 50).length,
      })
    }

    // ── Live Supabase path ────────────────────────────────────────────────────
    const db = createAdminClient()

    // Fetch all assets
    const { data: assetRows, error: aErr } = await db
      .from('assets')
      .select('*')
      .order('type')
    if (aErr) throw new Error(aErr.message)

    // Calculate real in_use counts by joining event_assets with active events.
    // Active = events currently confirmed, in_progress, or quoted (reserved).
    const { data: inUseRows, error: euErr } = await db
      .from('event_assets')
      .select('asset_id, quantity, events!inner(status)')
      .in('events.status', ['confirmed', 'in_progress', 'quoted'])

    if (euErr) {
      console.warn('[GET /api/assets] event_assets join failed, defaulting in_use=0:', euErr.message)
    }

    // Build asset_id → total_in_use map
    const inUseMap = new Map<string, number>()
    for (const row of (inUseRows ?? []) as Array<{ asset_id: string; quantity: number }>) {
      inUseMap.set(row.asset_id, (inUseMap.get(row.asset_id) ?? 0) + row.quantity)
    }

    const assets = ((assetRows ?? []) as Array<Record<string, unknown>>).map(a => {
      const totalQty = a.total_qty as number
      const inUse = Math.min(inUseMap.get(a.id as string) ?? 0, totalQty)
      const availableQty = Math.max(0, totalQty - inUse)
      return {
        id: a.id as string,
        type: a.type as string,
        name: a.name as string,
        total_qty: totalQty,
        available_qty: availableQty,
        in_use: inUse,
        pct_available: totalQty > 0 ? Math.round((availableQty / totalQty) * 100) : 0,
        storage_location: a.storage_location as string,
        unit_rate_eur: Number(a.unit_rate_eur),
      }
    })

    return NextResponse.json({
      assets,
      total_skus: assets.length,
      total_units: assets.reduce((s, a) => s + a.total_qty, 0),
      total_in_use: assets.reduce((s, a) => s + a.in_use, 0),
      low_stock: assets.filter(a => a.pct_available < 50).length,
    })
  } catch (err) {
    console.error('[GET /api/assets]', err)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

const VALID_TYPES = ['chair', 'table_round', 'table_rect', 'microphone', 'projector', 'screen', 'speaker', 'lighting', 'stage', 'barrier', 'cable', 'other'] as const

const createAssetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(VALID_TYPES),
  total_qty: z.coerce.number().int().positive('Quantity must be positive'),
  storage_location: z.string().min(1, 'Storage location is required'),
  unit_rate_eur: z.coerce.number().min(0, 'Rate must be non-negative'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createAssetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
    }

    const { name, type, total_qty, storage_location, unit_rate_eur } = parsed.data

    if (!isSupabaseConfigured()) {
      const newAsset = {
        id: `a${Date.now()}`,
        type, name, total_qty,
        available_qty: total_qty,
        storage_location,
        unit_rate_eur,
        condition: 'good' as const,
      }
      MOCK_ASSETS.push(newAsset)
      return NextResponse.json({ asset: newAsset }, { status: 201 })
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from('assets')
      .insert({ name, type, total_qty, storage_location, unit_rate_eur, condition: 'good' })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json({ asset: data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/assets]', err)
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}
