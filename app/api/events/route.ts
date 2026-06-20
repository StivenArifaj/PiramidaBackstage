import { NextResponse } from 'next/server'
import { MOCK_EVENTS, MOCK_SPACES, MOCK_ASSETS, nextRefCode } from '@/lib/db/mock-data'
import type { CreateEventRequest, CreateEventResponse, ListEventsResponse } from '@/types/api'

export async function GET() {
  const response: ListEventsResponse = { events: MOCK_EVENTS }
  return NextResponse.json(response)
}

export async function POST(req: Request) {
  const body: CreateEventRequest = await req.json()

  // Space matching: prefer requested, then find best fit by capacity
  let matchedSpace = body.preferred_space_codes?.length
    ? MOCK_SPACES.find(s => body.preferred_space_codes!.includes(s.code) && s.capacity_pax >= body.attendees_count)
    : MOCK_SPACES.filter(s => s.capacity_pax >= body.attendees_count && s.availability === 'available').sort((a, b) => a.capacity_pax - b.capacity_pax)[0]

  const alternatives = MOCK_SPACES
    .filter(s => s.capacity_pax >= body.attendees_count && s.id !== matchedSpace?.id)
    .slice(0, 3)

  const newEvent = {
    id: `evt-${Date.now()}`,
    reference_code: nextRefCode(),
    title: body.title,
    description: body.description,
    event_type: body.event_type,
    organizer_name: body.organizer_name,
    organizer_email: body.organizer_email,
    organizer_phone: body.organizer_phone,
    organizer_org: body.organizer_org,
    attendees_count: body.attendees_count,
    status: 'requested' as const,
    start_at: body.start_at,
    end_at: body.end_at,
    setup_start_at: new Date(new Date(body.start_at).getTime() - 7200000).toISOString(),
    teardown_end_at: new Date(new Date(body.end_at).getTime() + 3600000).toISOString(),
    spaces: matchedSpace ? [matchedSpace] : [],
    assets: [],
    notes: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  MOCK_EVENTS.push(newEvent)
  const response: CreateEventResponse = { event: newEvent, matched_space: matchedSpace, alternatives }
  return NextResponse.json(response, { status: 201 })
}
