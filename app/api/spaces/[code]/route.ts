import { NextResponse } from 'next/server'
import { MOCK_SPACES, MOCK_EVENTS } from '@/lib/db/mock-data'
import type { GetSpaceResponse } from '@/types/api'

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const space = MOCK_SPACES.find(s => s.code === code.toUpperCase())
  if (!space) return NextResponse.json({ error: 'Space not found' }, { status: 404 })

  const upcoming_bookings = MOCK_EVENTS
    .filter(e => e.spaces.some(s => s.code === space.code) && ['confirmed', 'quoted', 'in_progress'].includes(e.status))
    .map(e => ({ start_at: e.start_at, end_at: e.end_at, status: e.status }))

  const response: GetSpaceResponse = { space, upcoming_bookings }
  return NextResponse.json(response)
}
