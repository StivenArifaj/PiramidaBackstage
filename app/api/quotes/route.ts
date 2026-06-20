import { NextResponse } from 'next/server'
import { MOCK_EVENTS, MOCK_QUOTES } from '@/lib/db/mock-data'
import { generateQuote } from '@/lib/pricing/quote'
import type { GenerateQuoteRequest, GenerateQuoteResponse } from '@/types/api'

export async function POST(req: Request) {
  const { event_id }: GenerateQuoteRequest = await req.json()
  const event = MOCK_EVENTS.find(e => e.id === event_id)
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const quoteData = generateQuote(event)
  const quote = { id: `q-${Date.now()}`, event_id, ...quoteData }
  MOCK_QUOTES.push(quote)

  // Advance event to 'quoted'
  event.status = 'quoted'
  event.updated_at = new Date().toISOString()

  const response: GenerateQuoteResponse = { quote }
  return NextResponse.json(response, { status: 201 })
}
