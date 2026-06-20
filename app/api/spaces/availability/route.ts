import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { MOCK_SPACES, getAvailability } from '@/lib/db/mock-data'
import type { AvailabilityResponse } from '@/types/api'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''
  const capacity = parseInt(searchParams.get('capacity') ?? '0')

  const matches = MOCK_SPACES
    .filter(s => capacity === 0 || s.capacity_pax >= capacity)
    .map(s => ({ space: s, availability: getAvailability(s.id, from, to) }))

  const suggested = matches
    .filter(m => m.availability === 'available')
    .sort((a, b) => a.space.capacity_pax - b.space.capacity_pax)
    .slice(0, 3)
    .map(m => m.space)

  const response: AvailabilityResponse = { matches, suggested }
  return NextResponse.json(response)
}
