import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/client'
import { MOCK_EVENTS, MOCK_QUOTES } from '@/lib/db/mock-data'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

function rangeFilter(dateRange: string): { from: string; to: string } {
  const now = new Date()
  if (dateRange === 'this_week') {
    const from = new Date(now)
    from.setDate(now.getDate() - now.getDay())
    from.setHours(0, 0, 0, 0)
    return { from: from.toISOString(), to: now.toISOString() }
  }
  if (dateRange === 'this_month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: from.toISOString(), to: now.toISOString() }
  }
  return { from: '2000-01-01T00:00:00Z', to: '2100-01-01T00:00:00Z' }
}

// Statuses that mean the revenue is locked / earned
const CONFIRMED_STATUSES = new Set(['confirmed', 'in_progress', 'completed'])
// Statuses that mean the booking is still pending (pipeline)
const PIPELINE_STATUSES = new Set(['requested', 'quoted', 'red_alert'])

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dateRange = searchParams.get('date_range') ?? 'all_time'
    const spaceCodes = searchParams.get('space_codes')?.split(',').filter(Boolean) ?? []
    const { from, to } = rangeFilter(dateRange)

    // ── Mock fallback (dev without Supabase) ─────────────────────────────────
    if (!isSupabaseConfigured()) {
      let events = MOCK_EVENTS.filter(e => {
        if (e.status === 'cancelled') return false
        const inRange = e.start_at >= from && e.start_at <= to
        if (!inRange) return false
        if (spaceCodes.length > 0) {
          const codes = e.spaces.map(s => s.code)
          return spaceCodes.some(c => codes.includes(c))
        }
        return true
      })

      const quotes = MOCK_QUOTES.filter(q => events.some(e => e.id === q.event_id))
      // Revenue = confirmed events' quotes
      const totalRevenue = quotes
        .filter(q => {
          const evt = events.find(e => e.id === q.event_id)
          return q.accepted_at != null || CONFIRMED_STATUSES.has(evt?.status ?? '')
        })
        .reduce((s, q) => s + q.total, 0)
      // Pipeline = pending events' quotes
      const pipelineRevenue = quotes
        .filter(q => {
          const evt = events.find(e => e.id === q.event_id)
          return q.accepted_at == null && PIPELINE_STATUSES.has(evt?.status ?? '')
        })
        .reduce((s, q) => s + q.total, 0)

      const totalDurationHrs = events.reduce((s, e) => {
        return s + (new Date(e.end_at).getTime() - new Date(e.start_at).getTime()) / 3600000
      }, 0)

      return NextResponse.json({
        total_bookings: events.length,
        total_revenue: totalRevenue,
        pipeline_revenue: pipelineRevenue,
        avg_duration_hrs: events.length ? +(totalDurationHrs / events.length).toFixed(1) : 0,
        bookings: events.map(e => {
          const q = quotes.find(qq => qq.event_id === e.id)
          return {
            id: e.id,
            reference_code: e.reference_code,
            title: e.title,
            organizer_name: e.organizer_name,
            status: e.status,
            start_at: e.start_at,
            end_at: e.end_at,
            attendees_count: e.attendees_count,
            space_names: e.spaces.map(s => s.name).join(', '),
            revenue: q?.total ?? 0,
            revenue_locked: q != null && (q.accepted_at != null || CONFIRMED_STATUSES.has(e.status)),
          }
        }),
      })
    }

    // ── Live Supabase path ───────────────────────────────────────────────────
    const db = createAdminClient()

    // Query from the quotes side so we always have accepted_at
    const { data: quotesRaw, error: qErr } = await db
      .from('quotes')
      .select(`
        id, total, accepted_at, event_id,
        events!inner (
          id, reference_code, title, organizer_name,
          status, start_at, end_at, attendees_count
        )
      `)
      .neq('events.status', 'cancelled')
      .gte('events.start_at', from)
      .lte('events.start_at', to)
      .order('events.start_at', { ascending: false })

    if (qErr) throw new Error(qErr.message)

    type QuoteRow = {
      id: string; total: number; accepted_at: string | null; event_id: string
      events: {
        id: string; reference_code: string; title: string; organizer_name: string
        status: string; start_at: string; end_at: string; attendees_count: number
      }
    }
    const quotes = (quotesRaw ?? []) as unknown as QuoteRow[]

    // Optionally filter by space codes using event_spaces join
    let filteredQuotes = quotes
    if (spaceCodes.length > 0) {
      const { data: esRows } = await db
        .from('event_spaces')
        .select('event_id, spaces!inner(code)')
        .in('spaces.code', spaceCodes)

      const matchedEventIds = new Set(
        ((esRows ?? []) as Array<{ event_id: string }>).map(r => r.event_id)
      )
      filteredQuotes = quotes.filter(q => matchedEventIds.has(q.event_id))
    }

    // Deduplicate events (one event can have multiple quotes; use the latest)
    const eventMap = new Map<string, QuoteRow>()
    for (const q of filteredQuotes) {
      const existing = eventMap.get(q.event_id)
      if (!existing || new Date(q.id) > new Date(existing.id)) {
        eventMap.set(q.event_id, q)
      }
    }
    const dedupedQuotes = Array.from(eventMap.values())

    const totalRevenue = dedupedQuotes
      .filter(q => q.accepted_at != null || CONFIRMED_STATUSES.has(q.events.status))
      .reduce((s, q) => s + Number(q.total), 0)

    const pipelineRevenue = dedupedQuotes
      .filter(q => q.accepted_at == null && PIPELINE_STATUSES.has(q.events.status))
      .reduce((s, q) => s + Number(q.total), 0)

    const totalDurationHrs = dedupedQuotes.reduce((s, q) => {
      return s + (new Date(q.events.end_at).getTime() - new Date(q.events.start_at).getTime()) / 3600000
    }, 0)

    // Build booking log — fetch space names in one query
    const eventIds = dedupedQuotes.map(q => q.event_id)
    const { data: esData } = eventIds.length
      ? await db.from('event_spaces').select('event_id, spaces(name)').in('event_id', eventIds)
      : { data: [] }

    const spaceNamesByEvent = new Map<string, string[]>()
    for (const row of (esData ?? []) as unknown as Array<{ event_id: string; spaces: { name: string } | null }>) {
      if (!row.spaces) continue
      const arr = spaceNamesByEvent.get(row.event_id) ?? []
      arr.push(row.spaces.name)
      spaceNamesByEvent.set(row.event_id, arr)
    }

    return NextResponse.json({
      total_bookings: dedupedQuotes.length,
      total_revenue: totalRevenue,
      pipeline_revenue: pipelineRevenue,
      avg_duration_hrs: dedupedQuotes.length
        ? +(totalDurationHrs / dedupedQuotes.length).toFixed(1)
        : 0,
      bookings: dedupedQuotes.map(q => ({
        id: q.events.id,
        reference_code: q.events.reference_code,
        title: q.events.title,
        organizer_name: q.events.organizer_name,
        status: q.events.status,
        start_at: q.events.start_at,
        end_at: q.events.end_at,
        attendees_count: q.events.attendees_count,
        space_names: (spaceNamesByEvent.get(q.event_id) ?? []).join(', '),
        revenue: Number(q.total),
        revenue_locked: q.accepted_at != null || CONFIRMED_STATUSES.has(q.events.status),
      })),
    })
  } catch (err) {
    console.error('[GET /api/reports]', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
