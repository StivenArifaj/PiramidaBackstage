import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getEventById, insertQuote, updateEvent } from '@/lib/db/queries/events'
import { generateQuote } from '@/lib/pricing/quote'
import { createAdminClient } from '@/lib/db/client'
import { MOCK_QUOTES, MOCK_EVENTS } from '@/lib/db/mock-data'
import type { GenerateQuoteResponse } from '@/types/api'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      const quotes = MOCK_QUOTES.map(q => {
        const evt = MOCK_EVENTS.find(e => e.id === q.event_id)
        return {
          ...q,
          event: evt
            ? { id: evt.id, title: evt.title, reference_code: evt.reference_code, organizer_name: evt.organizer_name, status: evt.status, start_at: evt.start_at }
            : null,
        }
      })
      return NextResponse.json({ quotes })
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from('quotes')
      .select('*, events(id, title, reference_code, organizer_name, status, start_at)')
      .order('generated_at', { ascending: false })

    if (error) throw new Error(error.message)
    return NextResponse.json({ quotes: data ?? [] })
  } catch (err) {
    console.error('[GET /api/quotes]', err)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}

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
