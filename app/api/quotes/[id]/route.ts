import { NextResponse } from 'next/server'
import { getQuoteById, acceptQuote } from '@/lib/db/queries/events'
import type { AcceptQuoteResponse } from '@/types/api'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quote = await getQuoteById(id)
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    return NextResponse.json({ quote })
  } catch (err) {
    console.error('[GET /api/quotes/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

// POST /api/quotes/[id] — accept the quote, confirm the event, generate tasks
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await acceptQuote(id)

    if (!result) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const response: AcceptQuoteResponse = {
      event: result.event,
      tasks_generated: result.tasks,
    }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[POST /api/quotes/[id]]', err)
    return NextResponse.json({ error: 'Failed to accept quote' }, { status: 500 })
  }
}

// PATCH /api/quotes/[id] — semantic alias for accepting a quote
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return POST(req, ctx)
}
