import { searchAvailableSpaces, getSpaceByCode, listSpaces } from '@/lib/db/queries/spaces'
import {
  createEvent,
  getEventById,
  getEventByRef,
  getQuoteForEvent,
  insertQuote,
  insertTasks,
} from '@/lib/db/queries/events'
import { generateQuote } from '@/lib/pricing/quote'
import { generateTasks } from '@/lib/tasks/generate'
import { createAdminClient } from '@/lib/db/client'
import { MOCK_EVENTS, MOCK_QUOTES, MOCK_CONFLICTS, MOCK_SPACES } from '@/lib/db/mock-data'
import type { CreateEventRequest } from '@/types/api'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolArgs = Record<string, any>

export async function handleToolCall(
  name: string,
  args: ToolArgs
): Promise<string> {
  try {
    switch (name) {
      // ── Client tools ──────────────────────────────────────────────────────────
      case 'search_spaces':
        return await handleSearchSpaces(args)
      case 'check_space_availability':
        return await handleCheckAvailability(args)
      case 'list_assets_needed':
        return handleListAssets(args)
      case 'find_ideal_space':
        return await handleFindIdealSpace(args)
      case 'submit_special_request':
        return handleSubmitSpecialRequest(args)
      case 'get_space_booking_url':
        return handleGetSpaceBookingUrl(args)
      case 'find_my_booking':
        return await handleFindMyBooking(args)
      // ── Admin tools ───────────────────────────────────────────────────────────
      case 'create_event_request':
        return await handleCreateEvent(args)
      case 'generate_quote':
        return await handleGenerateQuote(args)
      case 'get_dashboard_metrics':
        return await handleGetDashboardMetrics()
      case 'get_pending_quotes':
        return await handleGetPendingQuotes(args)
      case 'query_reservations':
        return await handleQueryReservations(args)
      case 'get_client_history':
        return await handleGetClientHistory(args)
      case 'get_financial_metrics':
        return await handleGetFinancialMetrics(args)
      case 'get_space_utilization':
        return await handleGetSpaceUtilization(args)
      default:
        return `Unknown tool: ${name}`
    }
  } catch (err) {
    return `Error executing ${name}: ${err instanceof Error ? err.message : 'unknown error'}`
  }
}

// ── Client tool handlers ──────────────────────────────────────────────────────

async function handleSearchSpaces(args: ToolArgs): Promise<string> {
  const { from, to, capacity, features } = args
  const result = await searchAvailableSpaces({ from, to, capacity, features })

  if (!result.matches.length) {
    return 'No spaces found matching your criteria.'
  }

  const available = result.matches.filter(m => m.availability === 'available')
  const lines = available.slice(0, 5).map(m => {
    const s = m.space
    return `• ${s.name} (${s.code}) — ${s.capacity_pax} pax, ${s.area_sqm} m², €${s.hourly_rate_eur}/h, floor: ${s.floor}`
  })

  return [
    `Found ${available.length} available space(s):`,
    ...lines,
    result.suggested.length
      ? `Top suggestion: ${result.suggested[0].name} (${result.suggested[0].code})`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
}

async function handleCheckAvailability(args: ToolArgs): Promise<string> {
  const { space_code, from, to } = args
  const result = await getSpaceByCode(space_code)

  if (!result) return `Space "${space_code}" not found.`

  const { space, upcoming_bookings } = result
  const conflicts = upcoming_bookings.filter(
    b =>
      new Date(b.start_at) < new Date(to) &&
      new Date(b.end_at) > new Date(from)
  )

  if (conflicts.length) {
    return `${space.name} is NOT available in the requested window. It has ${conflicts.length} overlapping booking(s). Next free slot may be after ${conflicts[conflicts.length - 1].end_at}.`
  }

  return `${space.name} (${space.code}) is AVAILABLE from ${from} to ${to}. Capacity: ${space.capacity_pax} pax, Rate: €${space.hourly_rate_eur}/h.`
}

function handleListAssets(args: ToolArgs): string {
  const { attendees, setup_type } = args
  const n = Number(attendees)

  const recommendations: string[] = []

  if (setup_type === 'theater') {
    recommendations.push(`• ${n} chairs`)
    recommendations.push(`• 1–2 microphones`)
    recommendations.push(`• 1 projector + 1 screen`)
    recommendations.push(`• 2 speakers`)
  } else if (setup_type === 'roundtable') {
    const tables = Math.ceil(n / 8)
    recommendations.push(`• ${n} chairs`)
    recommendations.push(`• ${tables} round tables (8 pax each)`)
    recommendations.push(`• ${Math.ceil(tables / 2)} microphones`)
    recommendations.push(`• 1 projector + 1 screen`)
  } else if (setup_type === 'standing') {
    recommendations.push(`• ${Math.ceil(n * 0.3)} high tables (cocktail style)`)
    recommendations.push(`• 2 microphones`)
    recommendations.push(`• 2 speakers`)
    recommendations.push(`• Lighting rig for ambience`)
  } else {
    recommendations.push(`• ${n} chairs`)
    recommendations.push(`• ${Math.ceil(n / 6)} tables`)
    recommendations.push(`• 1 projector`)
    recommendations.push(`• 2 microphones`)
  }

  return [
    `Asset recommendations for ${n} guests (${setup_type} layout):`,
    ...recommendations,
    'Confirm with our logistics team to verify current stock levels.',
  ].join('\n')
}

async function handleFindIdealSpace(args: ToolArgs): Promise<string> {
  const { event_type, guest_count, vibe } = args
  const guestCount = Number(guest_count)

  // Build a feature hint from vibe and event_type
  const vibeStr = (vibe ?? '').toLowerCase()
  const typeStr = (event_type ?? '').toLowerCase()

  const featureHints: string[] = []
  if (vibeStr.includes('stage') || typeStr.includes('concert') || typeStr.includes('launch')) {
    featureHints.push('stage')
  }
  if (vibeStr.includes('outdoor') || vibeStr.includes('exterior')) {
    featureHints.push('natural_light')
  }
  if (typeStr.includes('conference') || typeStr.includes('workshop')) {
    featureHints.push('projector')
  }

  let spaces = await listSpaces({ min_capacity: guestCount })

  // Sort: prefer spaces that match feature hints, then by capacity (closest fit first)
  spaces = spaces
    .filter(s => s.availability !== 'reserved')
    .sort((a, b) => {
      const aScore = featureHints.filter(f => a.features.includes(f)).length
      const bScore = featureHints.filter(f => b.features.includes(f)).length
      if (bScore !== aScore) return bScore - aScore
      return a.capacity_pax - b.capacity_pax
    })

  const top3 = spaces.slice(0, 3)

  if (!top3.length) {
    return `No spaces found that can accommodate ${guestCount} guests. The largest available space holds ${
      (await listSpaces({})).sort((a, b) => b.capacity_pax - a.capacity_pax)[0]?.capacity_pax ?? 0
    } pax.`
  }

  const lines = top3.map((s, i) => [
    `${i + 1}. ${s.name} (${s.code})`,
    `   Capacity: ${s.capacity_pax} pax · Area: ${s.area_sqm} m² · Rate: €${s.hourly_rate_eur}/h`,
    `   Floor: ${s.floor} · Features: ${s.features.length ? s.features.join(', ') : 'standard'}`,
    `   Status: ${s.availability}`,
  ].join('\n'))

  return [
    `Top ${top3.length} space${top3.length > 1 ? 's' : ''} for ${guestCount} guests${event_type ? ` (${event_type})` : ''}${vibe ? ` — vibe: ${vibe}` : ''}:`,
    '',
    ...lines,
    '',
    `To proceed with a booking, I can redirect you to the space detail page.`,
  ].join('\n')
}

function handleSubmitSpecialRequest(args: ToolArgs): string {
  const { user_email, space_code, request_details } = args

  // Log for admin visibility (server logs)
  console.info('[SPECIAL_REQUEST]', JSON.stringify({
    timestamp: new Date().toISOString(),
    user_email,
    space_code: space_code ?? 'unspecified',
    request_details,
  }))

  return [
    `Special request logged successfully.`,
    `Submitted by: ${user_email}`,
    space_code ? `Space: ${space_code}` : '',
    `Details: ${request_details}`,
    `Our team will review your request and contact you within 24 hours.`,
  ]
    .filter(Boolean)
    .join('\n')
}

function handleGetSpaceBookingUrl(args: ToolArgs): string {
  const code = (args.space_code ?? '').toUpperCase()
  if (!code) return 'No space code provided.'
  return `Booking URL: /spaces/${code}\n[REDIRECT_TO_SPACE:${code}]`
}

async function handleFindMyBooking(args: ToolArgs): Promise<string> {
  const { email, reference_code } = args
  if (!email || !reference_code) return 'Please provide both your email address and reference code.'

  const event = await getEventByRef(reference_code)

  if (!event) {
    return `No booking found with reference code "${reference_code}". Please check the code from your confirmation email.`
  }

  if (event.organizer_email.toLowerCase() !== String(email).toLowerCase()) {
    return `The email address provided does not match the booking for "${reference_code}". Please use the email you registered with.`
  }

  const quote = await getQuoteForEvent(event.id)
  const trackUrl = `/track/${event.reference_code}`
  const spaceName = event.spaces[0]?.name ?? 'TBC'
  const startDate = new Date(event.start_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  const lines = [
    `Booking found: ${event.reference_code}`,
    `Title: ${event.title}`,
    `Date: ${startDate}`,
    `Space: ${spaceName}`,
    `Status: ${event.status}`,
  ]

  if (quote && !quote.accepted_at) {
    lines.push(`Quote: €${quote.total.toFixed(2)} EUR — pending acceptance`)
  }

  lines.push(`Your booking tracker: ${trackUrl}`)
  lines.push(`Share this link with guests or use it to accept your quote and get directions.`)

  return lines.join('\n')
}

// ── Admin tool handlers ───────────────────────────────────────────────────────

async function handleCreateEvent(args: ToolArgs): Promise<string> {
  const body: CreateEventRequest = {
    title: args.title,
    description: args.description,
    event_type: args.event_type,
    organizer_name: args.organizer_name,
    organizer_email: args.organizer_email,
    organizer_phone: args.organizer_phone,
    organizer_org: args.organizer_org,
    attendees_count: Number(args.attendees_count),
    start_at: args.start_at,
    end_at: args.end_at,
    preferred_space_codes: args.preferred_space_codes,
    setup_type: args.setup_type,
  }

  const { event, matchedSpaceId } = await createEvent(body)

  const quoteData = generateQuote(event)
  await insertQuote(event.id, quoteData)

  const rawTasks = generateTasks(event)
  await insertTasks(rawTasks)

  const spaceName = event.spaces[0]?.name ?? 'TBC'
  return [
    `Event created successfully!`,
    `Reference: ${event.reference_code}`,
    `Title: ${event.title}`,
    `Space: ${spaceName}`,
    `Date: ${event.start_at} → ${event.end_at}`,
    `Attendees: ${event.attendees_count}`,
    `Status: quoted`,
    `Quote & ${rawTasks.length} ops tasks generated automatically.`,
    matchedSpaceId ? '' : 'Note: No matching space was found automatically — an organizer will assign one.',
  ]
    .filter(s => s !== '')
    .join('\n')
}

async function handleGenerateQuote(args: ToolArgs): Promise<string> {
  const event = await getEventById(args.event_id)
  if (!event) return `Event "${args.event_id}" not found.`

  const quoteData = generateQuote(event)
  const quote = await insertQuote(event.id, quoteData)

  return [
    `Quote generated for ${event.title}:`,
    ...quote.line_items.map(li => `  • ${li.description}: €${li.total.toFixed(2)}`),
    `Subtotal: €${quote.subtotal.toFixed(2)}`,
    `VAT (18%): €${quote.tax.toFixed(2)}`,
    `Total: €${quote.total.toFixed(2)} EUR`,
    `Valid until: ${quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('en-GB') : '7 days'}`,
    `Quote ID: ${quote.id}`,
  ].join('\n')
}

async function handleGetDashboardMetrics(): Promise<string> {
  if (!isSupabaseConfigured()) {
    const byStatus: Record<string, number> = {}
    for (const e of MOCK_EVENTS) {
      byStatus[e.status] = (byStatus[e.status] ?? 0) + 1
    }
    const pendingQuotes = MOCK_QUOTES.filter(q => !q.accepted_at)
    const pipeline = pendingQuotes.reduce((s, q) => s + q.total, 0)
    return [
      'Dashboard Metrics (mock data):',
      ...Object.entries(byStatus).map(([s, n]) => `  • ${s}: ${n} event${n !== 1 ? 's' : ''}`),
      `  • Active conflicts: ${MOCK_CONFLICTS.length}`,
      `  • Pending quotes: ${pendingQuotes.length} (€${pipeline.toFixed(2)} pipeline)`,
    ].join('\n')
  }

  const db = createAdminClient()

  const { data: eventRows } = await db.from('events').select('status')
  const byStatus: Record<string, number> = {}
  for (const row of eventRows ?? []) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1
  }

  const { data: pendingQuoteRows } = await db
    .from('quotes')
    .select('total')
    .is('accepted_at', null)
  const pendingCount = (pendingQuoteRows ?? []).length
  const pipeline = (pendingQuoteRows ?? []).reduce((s, q) => s + Number(q.total), 0)

  const { data: esRows } = await db
    .from('event_spaces')
    .select('space_id, event_id, events!inner(status, start_at, end_at)')
    .in('events.status', ['confirmed', 'in_progress', 'quoted'])

  const bySpace = new Map<string, Array<{ start_at: string; end_at: string }>>()
  for (const row of esRows ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const evt = (row as any).events
    if (!evt) continue
    const arr = bySpace.get(row.space_id) ?? []
    arr.push({ start_at: evt.start_at, end_at: evt.end_at })
    bySpace.set(row.space_id, arr)
  }

  let conflictCount = 0
  for (const [, rows] of bySpace) {
    if (rows.length < 2) continue
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const a = rows[i], b = rows[j]
        if (new Date(a.start_at) < new Date(b.end_at) && new Date(a.end_at) > new Date(b.start_at)) {
          conflictCount++
        }
      }
    }
  }

  const total = (eventRows ?? []).length
  return [
    `Live Dashboard Metrics (${total} total events):`,
    ...Object.entries(byStatus).map(([s, n]) => `  • ${s}: ${n}`),
    `  • Active conflicts: ${conflictCount}${conflictCount > 0 ? ' — action required' : ' — clear'}`,
    `  • Pending quotes: ${pendingCount} · pipeline €${pipeline.toFixed(2)}`,
  ].join('\n')
}

async function handleGetPendingQuotes(args: ToolArgs): Promise<string> {
  const limit = Number(args.limit ?? 10)

  if (!isSupabaseConfigured()) {
    const pending = MOCK_QUOTES.filter(q => !q.accepted_at).slice(0, limit)
    if (!pending.length) return 'No pending quotes found.'
    const lines = [`${pending.length} pending quote(s):`]
    for (const q of pending) {
      const evt = MOCK_EVENTS.find(e => e.id === q.event_id)
      const expiry = q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-GB') : 'N/A'
      const expired = q.valid_until && new Date(q.valid_until) < new Date() ? ' EXPIRED' : ''
      lines.push(`  • ${evt?.title ?? 'Unknown event'} — ${evt?.organizer_name ?? '?'} — €${q.total.toFixed(2)} — valid until ${expiry}${expired} — ID: ${q.id}`)
    }
    return lines.join('\n')
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('quotes')
    .select('id, total, valid_until, events(title, reference_code, organizer_name)')
    .is('accepted_at', null)
    .order('generated_at', { ascending: true })
    .limit(limit)

  if (error) throw new Error(error.message)
  if (!data?.length) return 'No pending quotes — all quotes have been actioned.'

  const lines = [`${data.length} pending quote(s):`]
  for (const q of data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const evt = (q as any).events
    const expiry = q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-GB') : 'N/A'
    const expired = q.valid_until && new Date(q.valid_until) < new Date() ? ' EXPIRED' : ''
    lines.push(`  • ${evt?.title ?? '?'} (${evt?.reference_code ?? '?'}) — ${evt?.organizer_name ?? '?'} — €${Number(q.total).toFixed(2)} — valid until ${expiry}${expired} — Quote ID: ${q.id}`)
  }
  return lines.join('\n')
}

async function handleQueryReservations(args: ToolArgs): Promise<string> {
  const { date_from, date_to, status } = args

  if (!isSupabaseConfigured()) {
    let events = [...MOCK_EVENTS]
    if (date_from) events = events.filter(e => new Date(e.start_at) >= new Date(date_from))
    if (date_to)   events = events.filter(e => new Date(e.end_at)   <= new Date(date_to))
    if (status)    events = events.filter(e => e.status === status)
    if (!events.length) return 'There is no data for this.'
    return [
      `${events.length} reservation(s) found:`,
      ...events.map(e =>
        `  • [${e.reference_code}] ${e.title} — ${e.organizer_name} — ${new Date(e.start_at).toLocaleDateString('en-GB')} — ${e.status} — ${e.attendees_count} guests`
      ),
    ].join('\n')
  }

  const db = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = db.from('events').select('reference_code, title, organizer_name, organizer_email, start_at, end_at, status, attendees_count') as any
  if (date_from) query = query.gte('start_at', date_from)
  if (date_to)   query = query.lte('end_at', date_to)
  if (status)    query = query.eq('status', status)
  query = query.order('start_at', { ascending: true }).limit(50)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  if (!data?.length) return 'There is no data for this.'

  return [
    `${data.length} reservation(s) found:`,
    ...data.map((e: {
      reference_code: string; title: string; organizer_name: string;
      start_at: string; status: string; attendees_count: number
    }) =>
      `  • [${e.reference_code}] ${e.title} — ${e.organizer_name} — ${new Date(e.start_at).toLocaleDateString('en-GB')} — ${e.status} — ${e.attendees_count} guests`
    ),
  ].join('\n')
}

async function handleGetClientHistory(args: ToolArgs): Promise<string> {
  const { organizer_name, email } = args
  if (!organizer_name && !email) return 'Provide organizer_name or email to look up client history.'

  if (!isSupabaseConfigured()) {
    let events = [...MOCK_EVENTS]
    if (email) events = events.filter(e => e.organizer_email === email)
    if (organizer_name) events = events.filter(e => e.organizer_name.toLowerCase().includes(organizer_name.toLowerCase()))
    if (!events.length) return 'There is no data for this.'

    const eventIds = new Set(events.map(e => e.id))
    const quotes = MOCK_QUOTES.filter(q => eventIds.has(q.event_id))
    const lifetimeRevenue = quotes.filter(q => q.accepted_at).reduce((s, q) => s + q.total, 0)
    const pipeline = quotes.filter(q => !q.accepted_at).reduce((s, q) => s + q.total, 0)

    return [
      `Client history for ${events[0].organizer_name} (${events[0].organizer_email}):`,
      `  • Total events: ${events.length}`,
      `  • Lifetime revenue: €${lifetimeRevenue.toFixed(2)}`,
      `  • Pipeline (pending): €${pipeline.toFixed(2)}`,
      '',
      'Events:',
      ...events.map(e => `  • [${e.reference_code}] ${e.title} — ${new Date(e.start_at).toLocaleDateString('en-GB')} — ${e.status}`),
    ].join('\n')
  }

  const db = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let evtQuery = db.from('events').select('id, reference_code, title, organizer_name, organizer_email, start_at, status, attendees_count') as any
  if (email) evtQuery = evtQuery.eq('organizer_email', email)
  if (organizer_name) evtQuery = evtQuery.ilike('organizer_name', `%${organizer_name}%`)
  evtQuery = evtQuery.order('start_at', { ascending: false }).limit(20)

  const { data: events, error: evtErr } = await evtQuery
  if (evtErr) throw new Error(evtErr.message)
  if (!events?.length) return 'There is no data for this.'

  const eventIds = (events as { id: string }[]).map(e => e.id)
  const { data: quotes } = await db
    .from('quotes')
    .select('event_id, total, accepted_at')
    .in('event_id', eventIds)

  const lifetimeRevenue = (quotes ?? []).filter(q => q.accepted_at).reduce((s, q) => s + Number(q.total), 0)
  const pipeline = (quotes ?? []).filter(q => !q.accepted_at).reduce((s, q) => s + Number(q.total), 0)

  const first = events[0] as { organizer_name: string; organizer_email: string }
  return [
    `Client history for ${first.organizer_name} (${first.organizer_email}):`,
    `  • Total events: ${events.length}`,
    `  • Lifetime revenue (accepted): €${lifetimeRevenue.toFixed(2)}`,
    `  • Pipeline (pending): €${pipeline.toFixed(2)}`,
    '',
    'Events:',
    ...events.map((e: { reference_code: string; title: string; start_at: string; status: string }) =>
      `  • [${e.reference_code}] ${e.title} — ${new Date(e.start_at).toLocaleDateString('en-GB')} — ${e.status}`
    ),
  ].join('\n')
}

async function handleGetFinancialMetrics(args: ToolArgs): Promise<string> {
  const period = args.time_period ?? 'all_time'
  const now = new Date()
  let fromDate: Date | null = null

  switch (period) {
    case 'this_month':
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'last_30_days':
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'last_90_days':
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'this_year':
      fromDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      fromDate = null
  }

  if (!isSupabaseConfigured()) {
    let quotes = [...MOCK_QUOTES]
    if (fromDate) quotes = quotes.filter(q => new Date(q.generated_at ?? 0) >= fromDate!)
    const confirmed = quotes.filter(q => q.accepted_at)
    const pending = quotes.filter(q => !q.accepted_at)
    const totalRevenue = confirmed.reduce((s, q) => s + q.total, 0)
    const pipelineRevenue = pending.reduce((s, q) => s + q.total, 0)
    return [
      `Financial Metrics — ${period}:`,
      `  • Total Revenue (accepted quotes): €${totalRevenue.toFixed(2)}`,
      `  • Pipeline Revenue (pending quotes): €${pipelineRevenue.toFixed(2)}`,
      `  • Confirmed bookings: ${confirmed.length}`,
      `  • Pending quotes: ${pending.length}`,
    ].join('\n')
  }

  const db = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = db.from('quotes').select('total, accepted_at, generated_at') as any
  if (fromDate) query = query.gte('generated_at', fromDate.toISOString())

  const { data, error } = await query
  if (error) throw new Error(error.message)
  if (!data?.length) return 'There is no data for this.'

  const confirmed = (data as { total: number; accepted_at: string | null }[]).filter(q => q.accepted_at)
  const pending   = (data as { total: number; accepted_at: string | null }[]).filter(q => !q.accepted_at)
  const totalRevenue    = confirmed.reduce((s, q) => s + Number(q.total), 0)
  const pipelineRevenue = pending.reduce((s, q) => s + Number(q.total), 0)

  return [
    `Financial Metrics — ${period}:`,
    `  • Total Revenue (accepted quotes): €${totalRevenue.toFixed(2)}`,
    `  • Pipeline Revenue (pending quotes): €${pipelineRevenue.toFixed(2)}`,
    `  • Confirmed bookings: ${confirmed.length}`,
    `  • Pending quotes: ${pending.length}`,
    `  • Conversion rate: ${data.length ? ((confirmed.length / data.length) * 100).toFixed(1) : 0}%`,
  ].join('\n')
}

async function handleGetSpaceUtilization(args: ToolArgs): Promise<string> {
  const limit = Number(args.limit ?? 5)

  if (!isSupabaseConfigured()) {
    // Count bookings per space from mock events
    const spaceCounts: Record<string, { name: string; code: string; count: number; hours: number }> = {}
    for (const evt of MOCK_EVENTS) {
      if (evt.status === 'cancelled') continue
      const hours = (new Date(evt.end_at).getTime() - new Date(evt.start_at).getTime()) / 3_600_000
      for (const sp of evt.spaces) {
        if (!spaceCounts[sp.code]) spaceCounts[sp.code] = { name: sp.name, code: sp.code, count: 0, hours: 0 }
        spaceCounts[sp.code].count++
        spaceCounts[sp.code].hours += hours
      }
    }
    const ranked = Object.values(spaceCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    if (!ranked.length) return 'There is no data for this.'
    return [
      `Space Utilization — Top ${ranked.length}:`,
      ...ranked.map((s, i) =>
        `  ${i + 1}. ${s.name} (${s.code}) — ${s.count} booking${s.count !== 1 ? 's' : ''}, ${s.hours.toFixed(1)} total hours`
      ),
    ].join('\n')
  }

  const db = createAdminClient()
  const { data: esRows, error } = await db
    .from('event_spaces')
    .select('space_id, event_id, events!inner(status, start_at, end_at), spaces!inner(name, code)')
    .not('events.status', 'eq', 'cancelled')

  if (error) throw new Error(error.message)
  if (!esRows?.length) return 'There is no data for this.'

  const spaceCounts: Record<string, { name: string; code: string; count: number; hours: number }> = {}
  for (const row of esRows) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sp = (row as any).spaces
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const evt = (row as any).events
    if (!sp || !evt) continue
    const key = sp.code as string
    if (!spaceCounts[key]) spaceCounts[key] = { name: sp.name, code: sp.code, count: 0, hours: 0 }
    spaceCounts[key].count++
    spaceCounts[key].hours += (new Date(evt.end_at).getTime() - new Date(evt.start_at).getTime()) / 3_600_000
  }

  const ranked = Object.values(spaceCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)

  if (!ranked.length) return 'There is no data for this.'
  return [
    `Space Utilization — Top ${ranked.length}:`,
    ...ranked.map((s, i) =>
      `  ${i + 1}. ${s.name} (${s.code}) — ${s.count} booking${s.count !== 1 ? 's' : ''}, ${s.hours.toFixed(1)} total hours`
    ),
  ].join('\n')
}
