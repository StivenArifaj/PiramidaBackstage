import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { GetSpaceResponse } from '@/types/api'
import { getSpaceByCode } from '@/lib/db/queries/spaces'

const paramsSchema = z.object({ code: z.string().min(1).max(32) })

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
