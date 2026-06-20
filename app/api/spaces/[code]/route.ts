import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { GetSpaceResponse } from '@/types/api'
import { getSpaceByCode, updateSpaceStatus } from '@/lib/db/queries/spaces'

const paramsSchema = z.object({ code: z.string().min(1).max(32) })
const patchSchema = z.object({ is_active: z.boolean() })

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const raw = await params
  const parsed = paramsSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid space code' }, { status: 400 })
  }

  try {
    const result = await getSpaceByCode(parsed.data.code)
    if (!result) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }
    const response: GetSpaceResponse = result
    return NextResponse.json(response)
  } catch (err) {
    console.error('[GET /api/spaces/[code]]', err)
    return NextResponse.json({ error: 'Failed to load space' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const ok = await updateSpaceStatus(code, parsed.data.is_active)
    if (!ok) {
      return NextResponse.json({ error: 'Failed to update space status' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, code: code.toUpperCase(), is_active: parsed.data.is_active })
  } catch (err) {
    console.error('[PATCH /api/spaces/[code]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
