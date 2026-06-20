import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getEventById, insertQuote, updateEvent } from '@/lib/db/queries/events'
import { generateQuote } from '@/lib/pricing/quote'
import type { GenerateQuoteResponse } from '@/types/api'

const generateQuoteSchema = z.object({
  event_id: z.string().min(1, 'event_id is required'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = generateQuoteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const event = await getEventById(parsed.data.event_id)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const quoteData = generateQuote(event)
    const quote = await insertQuote(event.id, quoteData)

    // Advance event to 'quoted' status
    await updateEvent(event.id, { status: 'quoted' })

    const response: GenerateQuoteResponse = { quote }
    return NextResponse.json(response, { status: 201 })
  } catch (err) {
    console.error('[POST /api/quotes]', err)
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 })
  }
}
