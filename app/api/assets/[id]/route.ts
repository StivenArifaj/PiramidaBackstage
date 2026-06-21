import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/db/client'
import { MOCK_ASSETS } from '@/lib/db/mock-data'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

const patchAssetSchema = z.object({
  name: z.string().min(1).optional(),
  total_qty: z.coerce.number().int().positive().optional(),
  storage_location: z.string().min(1).optional(),
  unit_rate_eur: z.coerce.number().min(0).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = patchAssetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      const idx = MOCK_ASSETS.findIndex(a => a.id === id)
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      Object.assign(MOCK_ASSETS[idx], parsed.data)
      return NextResponse.json({ asset: MOCK_ASSETS[idx] })
    }

    const db = createAdminClient()
    // Note: assets table has no updated_at column — only include schema columns
    const { data, error } = await db
      .from('assets')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json({ asset: data })
  } catch (err) {
    console.error('[PATCH /api/assets/[id]]', err)
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    if (!isSupabaseConfigured()) {
      const idx = MOCK_ASSETS.findIndex(a => a.id === id)
      if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      MOCK_ASSETS.splice(idx, 1)
      return NextResponse.json({ ok: true })
    }

    const db = createAdminClient()
    const { error } = await db.from('assets').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/assets/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
