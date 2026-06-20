import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getEventById, updateEvent, getTasksForEvent, getQuoteForEvent } from '@/lib/db/queries/events'
import { MOCK_CONFLICTS } from '@/lib/db/mock-data'
import type { GetEventResponse } from '@/types/api'

const patchSchema = z.object({
  status: z
    .enum(['requested', 'quoted', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .optional(),
  notes: z.string().optional(),
  spaces: z.array(z.string()).optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await getEventById(id)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const [tasks, quote] = await Promise.all([
      getTasksForEvent(id),
      getQuoteForEvent(id),
    ])

    // Simple conflict detection: other events in the same space at the same time
    const conflicts = MOCK_CONFLICTS.filter(c =>
      c.related_event_ids.includes(id)
    )

    const response: GetEventResponse = { event, tasks, conflicts, quote: quote ?? undefined }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[GET /api/events/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const updated = await updateEvent(id, {
      status: parsed.data.status,
      notes: parsed.data.notes,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event: updated })
  } catch (err) {
    console.error('[PATCH /api/events/[id]]', err)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}
