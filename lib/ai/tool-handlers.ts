import { searchAvailableSpaces, getSpaceByCode } from '@/lib/db/queries/spaces'
import {
  createEvent,
  getEventById,
  insertQuote,
  insertTasks,
} from '@/lib/db/queries/events'
import { generateQuote } from '@/lib/pricing/quote'
import { generateTasks } from '@/lib/tasks/generate'
import { createAdminClient } from '@/lib/db/client'
import { MOCK_EVENTS, MOCK_QUOTES, MOCK_CONFLICTS } from '@/lib/db/mock-data'
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
      case 'search_spaces':
        return await handleSearchSpaces(args)
      case 'check_space_availability':
        return await handleCheckAvailability(args)
      case 'create_event_request':
        return await handleCreateEvent(args)
      case 'generate_quote':
        return await handleGenerateQuote(args)
      case 'list_assets_needed':
        return handleListAssets(args)
      case 'get_dashboard_metrics':
        return await handleGetDashboardMetrics()
      case 'get_pending_quotes':
        return await handleGetPendingQuotes(args)
      default:
        return `Unknown tool: ${name}`
    }
  } catch (err) {
    return `Error executing ${name}: ${err instanceof Error ? err.message : 'unknown error'}`
  }
}

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

  // Mirror the same post-creation pipeline as POST /api/events
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

// ── Admin tools ───────────────────────────────────────────────────────────────

async function handleGetDashboardMetrics(): Promise<string> {
  if (!isSupabaseConfigured()) {
    const byStatus: Record<string, number> = {}
    for (const e of MOCK_EVENTS) {
      byStatus[e.status] = (byStatus[e.status] ?? 0) + 1
    }
    const pendingQuotes = MOCK_QUOTES.filter(q => !q.accepted_at)
    const pipeline = pendingQuotes.reduce((s, q) => s + q.total, 0)
    const lines = [
      '📊 Dashboard Metrics (mock data):',
      ...Object.entries(byStatus).map(([s, n]) => `  • ${s}: ${n} event${n !== 1 ? 's' : ''}`),
      `  • Active conflicts: ${MOCK_CONFLICTS.length}`,
      `  • Pending quotes: ${pendingQuotes.length} (€${pipeline.toFixed(2)} pipeline)`,
    ]
    return lines.join('\n')
  }

  const db = createAdminClient()

  // Events by status
  const { data: eventRows } = await db.from('events').select('status')
  const byStatus: Record<string, number> = {}
  for (const row of eventRows ?? []) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1
  }

  // Pending quotes count + pipeline value
  const { data: pendingQuoteRows } = await db
    .from('quotes')
    .select('total')
    .is('accepted_at', null)
  const pendingCount = (pendingQuoteRows ?? []).length
  const pipeline = (pendingQuoteRows ?? []).reduce((s, q) => s + Number(q.total), 0)

  // Active conflicts — overlap detection on event_spaces
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
  const lines = [
    `📊 Live Dashboard Metrics (${total} total events):`,
    ...Object.entries(byStatus).map(([s, n]) => `  • ${s}: ${n}`),
    `  • Active conflicts: ${conflictCount}${conflictCount > 0 ? ' ⚠️ action required' : ' ✓ clear'}`,
    `  • Pending quotes: ${pendingCount} · pipeline €${pipeline.toFixed(2)}`,
  ]
  return lines.join('\n')
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
      const expired = q.valid_until && new Date(q.valid_until) < new Date() ? ' ⚠️ EXPIRED' : ''
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
    const expired = q.valid_until && new Date(q.valid_until) < new Date() ? ' ⚠️ EXPIRED' : ''
    lines.push(`  • ${evt?.title ?? '?'} (${evt?.reference_code ?? '?'}) — ${evt?.organizer_name ?? '?'} — €${Number(q.total).toFixed(2)} — valid until ${expiry}${expired} — Quote ID: ${q.id}`)
  }
  return lines.join('\n')
}
