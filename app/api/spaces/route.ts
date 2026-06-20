import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { MOCK_SPACES, getAvailability } from '@/lib/db/mock-data'
import type { ListSpacesResponse, SpaceFloor } from '@/types/api'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const floor = searchParams.get('floor') as SpaceFloor | null
  const minCap = searchParams.get('min_capacity')
  const from = searchParams.get('available_from') ?? undefined
  const to = searchParams.get('available_to') ?? undefined

  let spaces = MOCK_SPACES.map(s => ({ ...s, availability: getAvailability(s.id, from, to) }))

  if (floor) spaces = spaces.filter(s => s.floor === floor)
  if (minCap) spaces = spaces.filter(s => s.capacity_pax >= parseInt(minCap))

  const response: ListSpacesResponse = { spaces }
  return NextResponse.json(response)
}
