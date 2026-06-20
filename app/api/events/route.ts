import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createEvent, listEvents } from '@/lib/db/queries/events'
import { searchAvailableSpaces } from '@/lib/db/queries/spaces'
import type { CreateEventResponse, ListEventsResponse } from '@/types/api'

const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  event_type: z.string().optional(),
  organizer_name: z.string().min(1, 'Organizer name is required'),
  organizer_email: z.string().email('Invalid email address'),
  organizer_phone: z.string().optional(),
  organizer_org: z.string().optional(),
  attendees_count: z.coerce.number().int().positive('Attendees must be a positive number'),
  start_at: z.string().min(1, 'Start time is required'),
  end_at: z.string().min(1, 'End time is required'),
  preferred_space_codes: z.array(z.string()).optional(),
  setup_type: z.string().optional(),
  features_required: z.array(z.string()).optional(),
})

export async function GET() {
  try {
    const events = await listEvents()
    const response: ListEventsResponse = { events }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[GET /api/events]', err)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createEventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Validate that end_at is after start_at
    if (new Date(data.end_at) <= new Date(data.start_at)) {
      return NextResponse.json(
        { error: 'end_at must be after start_at' },
        { status: 400 }
      )
    }

    const { event, matchedSpaceId } = await createEvent(data)

    // Find alternatives (spaces that could work but weren't chosen)
    const availResult = await searchAvailableSpaces({
      from: data.start_at,
      to: data.end_at,
      capacity: data.attendees_count,
    })
    const alternatives = availResult.suggested
      .filter(s => s.id !== matchedSpaceId)
      .slice(0, 3)

    const response: CreateEventResponse = {
      event,
      matched_space: event.spaces[0] ?? undefined,
      alternatives,
    }
    return NextResponse.json(response, { status: 201 })
  } catch (err) {
    console.error('[POST /api/events]', err)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
