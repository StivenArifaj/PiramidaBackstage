import { searchAvailableSpaces, getSpaceByCode } from '@/lib/db/queries/spaces'
import {
  createEvent,
  getEventById,
  insertQuote,
} from '@/lib/db/queries/events'
import { generateQuote } from '@/lib/pricing/quote'
import type { CreateEventRequest } from '@/types/api'

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

  const spaceName = event.spaces[0]?.name ?? 'TBC'
  return [
    `Event created successfully!`,
    `Reference: ${event.reference_code}`,
    `Title: ${event.title}`,
    `Space: ${spaceName}`,
    `Date: ${event.start_at} → ${event.end_at}`,
    `Attendees: ${event.attendees_count}`,
    `Status: ${event.status}`,
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
