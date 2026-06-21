import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/client'
import { MOCK_EVENTS, MOCK_QUOTES } from '@/lib/db/mock-data'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

function rangeFilter(dateRange: string, startDate?: string, endDate?: string): { from: string; to: string } {
  // Explicit date range takes precedence over the preset
  if (startDate && endDate) {
    return {
      from: new Date(startDate + 'T00:00:00Z').toISOString(),
      to:   new Date(endDate   + 'T23:59:59Z').toISOString(),
    }
  }
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

type BookingRow = {
  id: string
  reference_code: string
  title: string
  organizer_name: string
  status: string
  start_at: string
  end_at: string
  attendees_count: number
  space_names: string
  space_codes: string[]
  revenue: number
  revenue_locked: boolean
}

function buildChartRevenue(bookings: BookingRow[]): { date: string; confirmed: number; pipeline: number }[] {
  const map = new Map<string, { confirmed: number; pipeline: number }>()
  for (const b of bookings) {
    const date = b.start_at.slice(0, 10)
    const entry = map.get(date) ?? { confirmed: 0, pipeline: 0 }
    if (b.revenue_locked) entry.confirmed += b.revenue
    else entry.pipeline += b.revenue
    map.set(date, entry)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { confirmed, pipeline }]) => ({ date, confirmed, pipeline }))
}

function buildChartSpaces(bookings: BookingRow[]): { code: string; name: string; bookings: number; revenue: number }[] {
  const map = new Map<string, { name: string; bookings: number; revenue: number }>()
  for (const b of bookings) {
    const codes = b.space_codes.length > 0 ? b.space_codes : ['UNKNOWN']
    const names = b.space_names ? b.space_names.split(', ') : ['Unknown']
    codes.forEach((code, i) => {
      const entry = map.get(code) ?? { name: names[i] ?? code, bookings: 0, revenue: 0 }
      entry.bookings += 1
      entry.revenue += b.revenue / codes.length
      map.set(code, entry)
    })
  }
  return Array.from(map.entries())
    .map(([code, { name, bookings, revenue }]) => ({ code, name, bookings, revenue: Math.round(revenue) }))
    .sort((a, b) => b.bookings - a.bookings)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dateRange  = searchParams.get('date_range')  ?? 'all_time'
    const startDate  = searchParams.get('start_date')  ?? undefined
    const endDate    = searchParams.get('end_date')    ?? undefined
    const spaceCodes = searchParams.get('space_codes')?.split(',').filter(Boolean) ?? []
    const { from, to } = rangeFilter(dateRange, startDate, endDate)

    // ── Mock fallback (dev without Supabase) ─────────────────────────────────
    if (!isSupabaseConfigured()) {
      const events = MOCK_EVENTS.filter(e => {
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
      const totalRevenue = quotes
        .filter(q => { const evt = events.find(e => e.id === q.event_id); return q.accepted_at != null || CONFIRMED_STATUSES.has(evt?.status ?? '') })
        .reduce((s, q) => s + q.total, 0)
      const pipelineRevenue = quotes
        .filter(q => { const evt = events.find(e => e.id === q.event_id); return q.accepted_at == null && PIPELINE_STATUSES.has(evt?.status ?? '') })
        .reduce((s, q) => s + q.total, 0)
      const totalDurationHrs = events.reduce((s, e) => s + (new Date(e.end_at).getTime() - new Date(e.start_at).getTime()) / 3600000, 0)

      const bookings: BookingRow[] = events.map(e => {
        const q = quotes.find(qq => qq.event_id === e.id)
        const locked = q != null && (q.accepted_at != null || CONFIRMED_STATUSES.has(e.status))
        return {
          id: e.id, reference_code: e.reference_code, title: e.title,
          organizer_name: e.organizer_name, status: e.status,
          start_at: e.start_at, end_at: e.end_at,
          attendees_count: e.attendees_count,
          space_names: e.spaces.map(s => s.name).join(', '),
          space_codes: e.spaces.map(s => s.code),
          revenue: q?.total ?? 0,
          revenue_locked: locked,
        }
      })

      return NextResponse.json({
        total_bookings: events.length, total_revenue: totalRevenue,
        pipeline_revenue: pipelineRevenue,
        avg_duration_hrs: events.length ? +(totalDurationHrs / events.length).toFixed(1) : 0,
        bookings,
        chart_revenue: buildChartRevenue(bookings),
        chart_spaces:  buildChartSpaces(bookings),
      })
    }

    // ── Live Supabase path ───────────────────────────────────────────────────
    const db = createAdminClient()

    // Fetch all quotes with their events — no PostgREST filters on joined columns
    // (chained .neq/.gte/.lte on embedded tables are unreliable in Supabase JS v2).
    // All filtering (date range, status, space codes) happens in JS below.
    const { data: quotesRaw, error: qErr } = await db
      .from('quotes')
      .select(`
        id, total, accepted_at, event_id, created_at,
        events!inner (
          id, reference_code, title, organizer_name,
          status, start_at, end_at, attendees_count
        )
      `)
      .order('created_at', { ascending: false })

    if (qErr) throw new Error(qErr.message)

    type EventRow = {
      id: string; reference_code: string; title: string; organizer_name: string
      status: string; start_at: string; end_at: string; attendees_count: number
    }
    type QuoteRow = {
      id: string; total: number; accepted_at: string | null
      event_id: string; created_at: string
      events: EventRow
    }

    // Supabase may return the embedded resource as an object or single-element array
    // depending on FK cardinality. Normalise to always be an object.
    const allQuotes: QuoteRow[] = ((quotesRaw ?? []) as unknown as Array<QuoteRow & { events: EventRow | EventRow[] }>)
      .map(q => ({ ...q, events: Array.isArray(q.events) ? q.events[0] : q.events }))
      .filter(q => q.events != null)

    // JS-side filters: cancelled status + date range
    const fromMs = new Date(from).getTime()
    const toMs   = new Date(to).getTime()
    let filteredQuotes = allQuotes.filter(q => {
      if (q.events.status === 'cancelled') return false
      const t = new Date(q.events.start_at).getTime()
      return t >= fromMs && t <= toMs
    })

    if (spaceCodes.length > 0) {
      const { data: esRows } = await db
        .from('event_spaces')
        .select('event_id, spaces!inner(code)')
        .in('spaces.code', spaceCodes)
      const matchedEventIds = new Set(((esRows ?? []) as Array<{ event_id: string }>).map(r => r.event_id))
      filteredQuotes = filteredQuotes.filter(q => matchedEventIds.has(q.event_id))
    }

    // Deduplicate: one row per event, keeping the most recently created quote
    const eventMap = new Map<string, QuoteRow>()
    for (const q of filteredQuotes) {
      const existing = eventMap.get(q.event_id)
      if (!existing || q.created_at > existing.created_at) eventMap.set(q.event_id, q)
    }
    const dedupedQuotes = Array.from(eventMap.values())
      .sort((a, b) => new Date(b.events.start_at).getTime() - new Date(a.events.start_at).getTime())

    const totalRevenue = dedupedQuotes
      .filter(q => q.accepted_at != null || CONFIRMED_STATUSES.has(q.events.status))
      .reduce((s, q) => s + Number(q.total), 0)
    const pipelineRevenue = dedupedQuotes
      .filter(q => q.accepted_at == null && PIPELINE_STATUSES.has(q.events.status))
      .reduce((s, q) => s + Number(q.total), 0)
    const totalDurationHrs = dedupedQuotes.reduce((s, q) =>
      s + (new Date(q.events.end_at).getTime() - new Date(q.events.start_at).getTime()) / 3600000, 0)

    const eventIds = dedupedQuotes.map(q => q.event_id)
    const { data: esData } = eventIds.length
      ? await db.from('event_spaces').select('event_id, spaces(code, name)').in('event_id', eventIds)
      : { data: [] }

    const spacesByEvent = new Map<string, { code: string; name: string }[]>()
    for (const row of (esData ?? []) as unknown as Array<{ event_id: string; spaces: { code: string; name: string } | null }>) {
      if (!row.spaces) continue
      const arr = spacesByEvent.get(row.event_id) ?? []
      arr.push(row.spaces)
      spacesByEvent.set(row.event_id, arr)
    }

    const bookings: BookingRow[] = dedupedQuotes.map(q => {
      const spaces = spacesByEvent.get(q.event_id) ?? []
      const locked = q.accepted_at != null || CONFIRMED_STATUSES.has(q.events.status)
      return {
        id: q.events.id, reference_code: q.events.reference_code, title: q.events.title,
        organizer_name: q.events.organizer_name, status: q.events.status,
        start_at: q.events.start_at, end_at: q.events.end_at,
        attendees_count: q.events.attendees_count,
        space_names: spaces.map(s => s.name).join(', '),
        space_codes: spaces.map(s => s.code),
        revenue: Number(q.total),
        revenue_locked: locked,
      }
    })

    return NextResponse.json({
      total_bookings: dedupedQuotes.length, total_revenue: totalRevenue,
      pipeline_revenue: pipelineRevenue,
      avg_duration_hrs: dedupedQuotes.length ? +(totalDurationHrs / dedupedQuotes.length).toFixed(1) : 0,
      bookings,
      chart_revenue: buildChartRevenue(bookings),
      chart_spaces:  buildChartSpaces(bookings),
    })
  } catch (err) {
    console.error('[GET /api/reports]', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
