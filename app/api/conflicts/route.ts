import { NextResponse } from 'next/server'
import { MOCK_CONFLICTS, MOCK_EVENTS, MOCK_SPACES } from '@/lib/db/mock-data'

export async function GET() {
  const conflicts = MOCK_CONFLICTS.map(c => ({
    ...c,
    related_events: MOCK_EVENTS.filter(e => c.related_event_ids.includes(e.id)).map(e => ({
      id: e.id, reference_code: e.reference_code, title: e.title,
      status: e.status, start_at: e.start_at, organizer_name: e.organizer_name,
    })),
    related_spaces: MOCK_SPACES
      .filter(s => c.related_space_ids?.includes(s.id))
      .map(s => ({ id: s.id, code: s.code, name: s.name, floor: s.floor, color: s.color })),
  }))

  return NextResponse.json({ conflicts, total: conflicts.length })
}
