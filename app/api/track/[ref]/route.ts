import { NextResponse } from 'next/server'
import { getEventByRef, getQuoteForEvent } from '@/lib/db/queries/events'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params
    const event = await getEventByRef(ref)

    if (!event) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const quote = await getQuoteForEvent(event.id)

    // Only expose fields safe for public consumption — no notes, tasks, or internal ops data
    const publicEvent = {
      id: event.id,
      reference_code: event.reference_code,
      title: event.title,
      event_type: event.event_type,
      organizer_name: event.organizer_name,
      status: event.status,
      start_at: event.start_at,
      end_at: event.end_at,
      attendees_count: event.attendees_count,
      space: event.spaces[0]
        ? {
            name: event.spaces[0].name,
            floor: event.spaces[0].floor,
            photo_urls: event.spaces[0].photo_urls?.slice(0, 1) ?? [],
          }
        : null,
    }

    const publicQuote = quote && !quote.accepted_at
      ? { id: quote.id, total: quote.total, currency: quote.currency, valid_until: quote.valid_until }
      : null

    return NextResponse.json({ event: publicEvent, quote: publicQuote })
  } catch (err) {
    console.error('[GET /api/track/[ref]]', err)
    return NextResponse.json({ error: 'Failed to load booking' }, { status: 500 })
  }
}
