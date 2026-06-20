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
  // all_time — use a wide window
  return { from: '2000-01-01T00:00:00Z', to: '2100-01-01T00:00:00Z' }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dateRange = searchParams.get('date_range') ?? 'all_time'
    const spaceCodes = searchParams.get('space_codes')?.split(',').filter(Boolean) ?? []

    const { from, to } = rangeFilter(dateRange)

    if (!isSupabaseConfigured()) {
      let events = MOCK_EVENTS.filter(e => {
        const inRange = e.start_at >= from && e.start_at <= to
        if (!inRange) return false
        if (spaceCodes.length > 0) {
          const codes = e.spaces.map(s => s.code)
          return spaceCodes.some(c => codes.includes(c))
        }
        return true
      })

      const quotes = MOCK_QUOTES.filter(q => events.some(e => e.id === q.event_id))
      const totalRevenue = quotes.reduce((s, q) => s + q.total, 0)
      const totalDurationHrs = events.reduce((s, e) => {
        const hrs = (new Date(e.end_at).getTime() - new Date(e.start_at).getTime()) / 3600000
        return s + hrs
      }, 0)

      return NextResponse.json({
        total_bookings: events.length,
        total_revenue: totalRevenue,
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
          }
        }),
      })
    }

    const db = createAdminClient()

    let query = db
      .from('events')
      .select('id, reference_code, title, organizer_name, status, start_at, end_at, attendees_count, event_spaces(spaces(code,name)), quotes(total)')
      .gte('start_at', from)
      .lte('start_at', to)
      .not('status', 'in', '("cancelled")')
      .order('start_at', { ascending: false })

    const { data: eventsData, error } = await query
    if (error) throw new Error(error.message)

    const events = eventsData ?? []

    // Filter by space code if provided
    const filtered = spaceCodes.length > 0
      ? events.filter((e: Record<string, unknown>) => {
          const esp = (e.event_spaces as Array<{ spaces: { code: string } | null }> | null) ?? []
          const codes = esp.map(es => es.spaces?.code).filter(Boolean)
          return spaceCodes.some(c => codes.includes(c))
        })
      : events

    const totalRevenue = filtered.reduce((s: number, e: Record<string, unknown>) => {
      const qs = (e.quotes as Array<{ total: number }> | null) ?? []
      return s + qs.reduce((ss: number, q: { total: number }) => ss + Number(q.total), 0)
    }, 0)

    const totalDurationHrs = filtered.reduce((s: number, e: Record<string, unknown>) => {
      const hrs = (new Date(e.end_at as string).getTime() - new Date(e.start_at as string).getTime()) / 3600000
      return s + hrs
    }, 0)

    return NextResponse.json({
      total_bookings: filtered.length,
      total_revenue: totalRevenue,
      avg_duration_hrs: filtered.length ? +(totalDurationHrs / filtered.length).toFixed(1) : 0,
      bookings: filtered.map((e: Record<string, unknown>) => {
        const esp = (e.event_spaces as Array<{ spaces: { name: string } | null }> | null) ?? []
        const qs = (e.quotes as Array<{ total: number }> | null) ?? []
        return {
          id: e.id,
          reference_code: e.reference_code,
          title: e.title,
          organizer_name: e.organizer_name,
          status: e.status,
          start_at: e.start_at,
          end_at: e.end_at,
          attendees_count: e.attendees_count,
          space_names: esp.map(es => es.spaces?.name).filter(Boolean).join(', '),
          revenue: qs.reduce((s, q) => s + Number(q.total), 0),
        }
      }),
    })
  } catch (err) {
    console.error('[GET /api/reports]', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
