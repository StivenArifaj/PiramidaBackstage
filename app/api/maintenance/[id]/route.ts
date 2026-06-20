import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/db/client'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

const patchSchema = z.object({
  status: z.enum(['clean', 'needs_cleaning', 'maintenance']).optional(),
  assigned_worker: z.string().nullable().optional(),
  next_action_at: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: true, id, ...parsed.data })
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from('maintenance_logs')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json({ log: data })
  } catch (err) {
    console.error('[PATCH /api/maintenance/[id]]', err)
    return NextResponse.json({ error: 'Failed to update maintenance log' }, { status: 500 })
  }
}
