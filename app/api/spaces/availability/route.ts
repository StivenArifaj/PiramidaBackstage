import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import type { AvailabilityResponse } from '@/types/api'
import { searchAvailableSpaces } from '@/lib/db/queries/spaces'

const querySchema = z.object({
  from: z.string().min(1, 'from is required'),
  to:   z.string().min(1, 'to is required'),
  capacity: z.coerce.number().int().positive().optional(),
  features: z.string().transform(v => v.split(',').filter(Boolean)).optional(),
})

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'from and to query params are required' }, { status: 400 })
  }

  try {
    const result = await searchAvailableSpaces(parsed.data)
    const response: AvailabilityResponse = result
    return NextResponse.json(response)
  } catch (err) {
    console.error('[GET /api/spaces/availability]', err)
    return NextResponse.json({ error: 'Failed to search availability' }, { status: 500 })
  }
}
