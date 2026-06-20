import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createEvent, listEvents, insertQuote, updateEvent, insertTasks, checkSpaceConflict } from '@/lib/db/queries/events'
import { searchAvailableSpaces, getSpaceIsActive } from '@/lib/db/queries/spaces'
import { generateQuote } from '@/lib/pricing/quote'
import { generateTasks } from '@/lib/tasks/generate'
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
  notes: z.string().optional(),
  is_priority_request: z.boolean().optional(),
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

    // Normalise incoming date strings to explicit UTC ISO format.
    // Zod only validates non-empty strings; a local-time value like
    // "2026-08-08T10:00" (no TZ suffix) is interpreted differently by
    // JavaScript vs PostgreSQL, breaking the lt/gt timestamp boundary checks.
    // Parsing through Date and re-serialising guarantees a stable UTC offset
    // ("2026-08-08T08:00:00.000Z") before any database comparison.
    const startIso = new Date(data.start_at).toISOString()
    const endIso = new Date(data.end_at).toISOString()

    // Maintenance gate — no bookings allowed for inactive spaces, even priority requests
    if (data.preferred_space_codes?.length) {
      const active = await getSpaceIsActive(data.preferred_space_codes[0])
      if (!active) {
        return NextResponse.json(
          { error: 'maintenance', message: 'Space is currently closed for maintenance.' },
          { status: 403 }
        )
      }
    }

    // Conflict check — skip for priority requests (they intentionally override)
    if (!data.is_priority_request && data.preferred_space_codes?.length) {
      const hasConflict = await checkSpaceConflict(
        data.preferred_space_codes[0],
        startIso,
        endIso
      )
      if (hasConflict) {
        return NextResponse.json(
          { error: 'conflict', message: 'Space already booked.' },
          { status: 409 }
        )
      }
    }

    const { event, matchedSpaceId } = await createEvent(data)

    // Auto-generate quote immediately so the dashboard shows pricing right away
    const quoteData = generateQuote(event)
    await insertQuote(event.id, quoteData)

    const finalStatus = data.is_priority_request ? 'red_alert' : 'quoted'
    await updateEvent(event.id, {
      status: finalStatus,
      ...(data.notes ? { notes: data.notes } : {}),
    })

    // Auto-generate setup/teardown tasks so operations dashboard populates instantly
    const rawTasks = generateTasks(event)
    await insertTasks(rawTasks)

    // Find alternatives (spaces that could work but weren't chosen)
    const availResult = await searchAvailableSpaces({
      from: startIso,
      to: endIso,
      capacity: data.attendees_count,
    })
    const alternatives = availResult.suggested
      .filter(s => s.id !== matchedSpaceId)
      .slice(0, 3)

    const response: CreateEventResponse = {
      event: { ...event, status: finalStatus as typeof event.status },
      matched_space: event.spaces[0] ?? undefined,
      alternatives,
    }
    return NextResponse.json(response, { status: 201 })
  } catch (err) {
    console.error('[POST /api/events]', err)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
