import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import type { ListSpacesResponse } from '@/types/api'
import { listSpaces } from '@/lib/db/queries/spaces'

const querySchema = z.object({
  floor: z.enum(['roof', 'l3', 'l0', 'l_minus_1', 'exterior']).optional(),
  available_from: z.string().min(1).optional(),
  available_to: z.string().min(1).optional(),
  min_capacity: z.coerce.number().int().positive().optional(),
  features: z.string().transform(v => v.split(',').filter(Boolean)).optional(),
})

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }

  try {
    const spaces = await listSpaces(parsed.data)
    const response: ListSpacesResponse = { spaces }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[GET /api/spaces]', err)
    return NextResponse.json({ error: 'Failed to load spaces' }, { status: 500 })
  }
}
