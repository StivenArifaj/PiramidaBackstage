import type { Event, Space, Asset, Task, Quote, CreateEventRequest } from '@/types/api'
import type { DbEvent, DbSpace, DbAsset, DbTask, DbQuote } from '@/types/db'
import { createAdminClient } from '../client'
import {
  MOCK_EVENTS, MOCK_TASKS, MOCK_QUOTES, MOCK_SPACES,
  nextRefCode, getAvailability,
} from '../mock-data'

// ─── Supabase config check (same pattern as spaces.ts) ───────────────────────

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

// ─── Row-to-API converters ────────────────────────────────────────────────────

function dbSpaceToSpace(row: DbSpace): Space {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    ...(row.name_sq && { name_sq: row.name_sq }),
    floor: row.floor,
    category: row.category,
    ...(row.color && { color: row.color }),
    area_sqm: Number(row.area_sqm),
    capacity_pax: row.capacity_pax,
    ...(row.ceiling_m !== null && { ceiling_m: Number(row.ceiling_m) }),
    hourly_rate_eur: Number(row.hourly_rate_eur),
    setup_types: row.setup_types,
    features: row.features,
    ...(row.plan_x !== null && { plan_x: Number(row.plan_x) }),
    ...(row.plan_y !== null && { plan_y: Number(row.plan_y) }),
    ...(row.description && { description: row.description }),
    photo_urls: row.photo_urls ?? [],
  }
}

function dbAssetToAsset(row: DbAsset): Asset {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    total_qty: row.total_qty,
    available_qty: row.total_qty, // approximation — no reserved count at row level
    storage_location: row.storage_location,
    unit_rate_eur: Number(row.unit_rate_eur),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowToEvent(row: any): Event {
  return {
    id: row.id,
    reference_code: row.reference_code,
    title: row.title,
    ...(row.description && { description: row.description }),
    ...(row.event_type && { event_type: row.event_type }),
    organizer_name: row.organizer_name,
    organizer_email: row.organizer_email,
    ...(row.organizer_phone && { organizer_phone: row.organizer_phone }),
    ...(row.organizer_org && { organizer_org: row.organizer_org }),
    attendees_count: row.attendees_count,
    status: row.status,
    start_at: row.start_at,
    end_at: row.end_at,
    ...(row.setup_start_at && { setup_start_at: row.setup_start_at }),
    ...(row.teardown_end_at && { teardown_end_at: row.teardown_end_at }),
    ...(row.notes && { notes: row.notes }),
    created_at: row.created_at,
    updated_at: row.updated_at,
    spaces: (row.event_spaces ?? [])
      .map((es: { spaces: DbSpace | null }) => es.spaces)
      .filter((s: DbSpace | null): s is DbSpace => s !== null)
      .map(dbSpaceToSpace),
    assets: (row.event_assets ?? [])
      .filter((ea: { assets: DbAsset | null }) => ea.assets !== null)
      .map((ea: { assets: DbAsset; quantity: number }) => ({
        asset: dbAssetToAsset(ea.assets),
        quantity: ea.quantity,
      })),
  }
}

function dbTaskToTask(row: DbTask): Task {
  return {
    id: row.id,
    event_id: row.event_id,
    title: row.title,
    ...(row.description && { description: row.description }),
    team: row.team,
    due_at: row.due_at,
    status: row.status,
    ...(row.assigned_to && { assigned_to: row.assigned_to }),
    ...(row.depends_on_task_id && { depends_on_task_id: row.depends_on_task_id }),
  }
}

function dbQuoteToQuote(row: DbQuote): Quote {
  return {
    id: row.id,
    event_id: row.event_id,
    line_items: row.line_items,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    total: Number(row.total),
    currency: row.currency,
    generated_at: row.generated_at,
    ...(row.valid_until && { valid_until: row.valid_until }),
    ...(row.accepted_at && { accepted_at: row.accepted_at }),
  }
}

const EVENT_SELECT = `
  *,
  event_spaces(setup_type, spaces(*)),
  event_assets(quantity, assets(*))
` as const

// ─── listEvents ───────────────────────────────────────────────────────────────

export async function listEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured()) return MOCK_EVENTS

  const db = createAdminClient()
  const { data, error } = await db
    .from('events')
    .select(EVENT_SELECT)
    .order('start_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbRowToEvent)
}

// ─── getEventById ─────────────────────────────────────────────────────────────

export async function getEventById(id: string): Promise<Event | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_EVENTS.find(e => e.id === id) ?? null
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('events')
    .select(EVENT_SELECT)
    .eq('id', id)
    .limit(1)

  if (error) throw new Error(error.message)
  if (!data?.length) return null
  return dbRowToEvent(data[0])
}

// ─── getEventByRef ────────────────────────────────────────────────────────────

export async function getEventByRef(ref: string): Promise<Event | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_EVENTS.find(e => e.reference_code === ref.toUpperCase()) ?? null
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('events')
    .select(EVENT_SELECT)
    .eq('reference_code', ref.toUpperCase())
    .limit(1)

  if (error) throw new Error(error.message)
  if (!data?.length) return null
  return dbRowToEvent(data[0])
}

// ─── getTasksForEvent ─────────────────────────────────────────────────────────

export async function getTasksForEvent(event_id: string): Promise<Task[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_TASKS.filter(t => t.event_id === event_id)
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('tasks')
    .select('*')
    .eq('event_id', event_id)
    .order('due_at', { ascending: true })

  if (error) throw new Error(error.message)
  return ((data ?? []) as DbTask[]).map(dbTaskToTask)
}

// ─── getQuoteForEvent ─────────────────────────────────────────────────────────

export async function getQuoteForEvent(event_id: string): Promise<Quote | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_QUOTES.find(q => q.event_id === event_id) ?? null
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('quotes')
    .select('*')
    .eq('event_id', event_id)
    .order('generated_at', { ascending: false })
    .limit(1)

  if (error) throw new Error(error.message)
  if (!data?.length) return null
  return dbQuoteToQuote((data[0]) as DbQuote)
}

// ─── getQuoteById ─────────────────────────────────────────────────────────────

export async function getQuoteById(id: string): Promise<Quote | null> {
  if (!isSupabaseConfigured()) {
    return MOCK_QUOTES.find(q => q.id === id) ?? null
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('quotes')
    .select('*')
    .eq('id', id)
    .limit(1)

  if (error) throw new Error(error.message)
  if (!data?.length) return null
  return dbQuoteToQuote((data[0]) as DbQuote)
}

// ─── createEvent ─────────────────────────────────────────────────────────────

export async function createEvent(
  body: CreateEventRequest
): Promise<{ event: Event; matchedSpaceId: string | null }> {
  if (!isSupabaseConfigured()) {
    const matchedSpace = body.preferred_space_codes?.length
      ? MOCK_SPACES.find(
          s =>
            body.preferred_space_codes!.includes(s.code) &&
            s.capacity_pax >= body.attendees_count
        )
      : MOCK_SPACES.filter(
          s =>
            s.capacity_pax >= body.attendees_count &&
            getAvailability(s.id, body.start_at, body.end_at) === 'available'
        ).sort((a, b) => a.capacity_pax - b.capacity_pax)[0]

    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      reference_code: nextRefCode(),
      title: body.title,
      description: body.description,
      event_type: body.event_type,
      organizer_name: body.organizer_name,
      organizer_email: body.organizer_email,
      organizer_phone: body.organizer_phone,
      organizer_org: body.organizer_org,
      attendees_count: body.attendees_count,
      status: 'requested',
      start_at: body.start_at,
      end_at: body.end_at,
      setup_start_at: new Date(
        new Date(body.start_at).getTime() - 7200000
      ).toISOString(),
      teardown_end_at: new Date(
        new Date(body.end_at).getTime() + 3600000
      ).toISOString(),
      spaces: matchedSpace ? [matchedSpace] : [],
      assets: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    MOCK_EVENTS.push(newEvent)
    return { event: newEvent, matchedSpaceId: matchedSpace?.id ?? null }
  }

  const db = createAdminClient()

  // Generate reference code
  const { count } = await db
    .from('events')
    .select('id', { count: 'exact', head: true })
  const refCode = `PB-2026-${String((count ?? 0) + 1).padStart(3, '0')}`

  // Match a space
  let matchedSpaceId: string | null = null
  let matchedSpaceIds: string[] = []

  if (body.preferred_space_codes?.length) {
    const { data: prefSpaces } = await db
      .from('spaces')
      .select('id, code, capacity_pax')
      .in('code', body.preferred_space_codes.map(c => c.toUpperCase()))
      .gte('capacity_pax', body.attendees_count)
      .eq('is_active', true)
      .limit(1)
    matchedSpaceId = (prefSpaces?.[0] as { id: string } | undefined)?.id ?? null
  }

  if (!matchedSpaceId) {
    const { data: avail } = await db
      .from('spaces')
      .select('id')
      .gte('capacity_pax', body.attendees_count)
      .eq('is_active', true)
      .order('capacity_pax', { ascending: true })
      .limit(5)
    matchedSpaceIds = ((avail ?? []) as { id: string }[]).map(r => r.id)
    // exclude already-booked spaces for the requested time window
    if (matchedSpaceIds.length) {
      // Step 1: find conflicting event IDs in the time window
      const { data: conflictEvts } = await db
        .from('events')
        .select('id')
        .in('status', ['confirmed', 'in_progress', 'quoted'])
        .lt('start_at', body.end_at)
        .gt('end_at', body.start_at)

      const conflictIds = ((conflictEvts ?? []) as { id: string }[]).map(r => r.id)

      let bookedSpaceIds = new Set<string>()
      if (conflictIds.length) {
        // Step 2: find which of our candidate spaces are in those events
        const { data: esRows } = await db
          .from('event_spaces')
          .select('space_id')
          .in('space_id', matchedSpaceIds)
          .in('event_id', conflictIds)

        bookedSpaceIds = new Set(((esRows ?? []) as { space_id: string }[]).map(r => r.space_id))
      }

      const freeId = matchedSpaceIds.find(id => !bookedSpaceIds.has(id))
      matchedSpaceId = freeId ?? matchedSpaceIds[0] ?? null
    }
  }

  // Insert event
  const setupStartAt = new Date(
    new Date(body.start_at).getTime() - 7200000
  ).toISOString()
  const teardownEndAt = new Date(
    new Date(body.end_at).getTime() + 3600000
  ).toISOString()

  const { data: evtRows, error: evtErr } = await db
    .from('events')
    .insert({
      reference_code: refCode,
      title: body.title,
      description: body.description ?? null,
      event_type: body.event_type ?? null,
      organizer_name: body.organizer_name,
      organizer_email: body.organizer_email,
      organizer_phone: body.organizer_phone ?? null,
      organizer_org: body.organizer_org ?? null,
      attendees_count: body.attendees_count,
      status: 'requested',
      start_at: body.start_at,
      end_at: body.end_at,
      setup_start_at: setupStartAt,
      teardown_end_at: teardownEndAt,
      notes: null,
    })
    .select(EVENT_SELECT)

  if (evtErr) throw new Error(evtErr.message)
  const newEventRow = evtRows![0]

  // Link to matched space
  if (matchedSpaceId) {
    await db.from('event_spaces').insert({
      event_id: newEventRow.id,
      space_id: matchedSpaceId,
      setup_type: body.setup_type ?? null,
    })
  }

  // Refetch with spaces
  const { data: fresh } = await db
    .from('events')
    .select(EVENT_SELECT)
    .eq('id', newEventRow.id)
    .limit(1)

  return { event: dbRowToEvent(fresh![0]), matchedSpaceId }
}

// ─── updateEvent ─────────────────────────────────────────────────────────────

export async function updateEvent(
  id: string,
  patch: { status?: string; notes?: string }
): Promise<Event | null> {
  if (!isSupabaseConfigured()) {
    const evt = MOCK_EVENTS.find(e => e.id === id)
    if (!evt) return null
    if (patch.status) evt.status = patch.status as Event['status']
    if (patch.notes !== undefined) evt.notes = patch.notes
    evt.updated_at = new Date().toISOString()
    return evt
  }

  const db = createAdminClient()
  const { error } = await db
    .from('events')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return getEventById(id)
}

// ─── insertQuote ─────────────────────────────────────────────────────────────

export async function insertQuote(
  eventId: string,
  quoteData: Omit<Quote, 'id' | 'event_id'>
): Promise<Quote> {
  if (!isSupabaseConfigured()) {
    const q: Quote = { id: `q-${Date.now()}`, event_id: eventId, ...quoteData }
    MOCK_QUOTES.push(q)
    return q
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('quotes')
    .insert({
      event_id: eventId,
      line_items: quoteData.line_items,
      subtotal: quoteData.subtotal,
      tax: quoteData.tax,
      total: quoteData.total,
      currency: quoteData.currency,
      generated_at: quoteData.generated_at,
      valid_until: quoteData.valid_until ?? null,
    })
    .select('*')

  if (error) throw new Error(error.message)
  return dbQuoteToQuote((data![0]) as DbQuote)
}

// ─── insertTasks ─────────────────────────────────────────────────────────────

export async function insertTasks(tasks: Task[]): Promise<Task[]> {
  if (!isSupabaseConfigured()) {
    MOCK_TASKS.push(...tasks)
    return tasks
  }

  const db = createAdminClient()
  const taskInserts = tasks.map(t => ({
    event_id: t.event_id,
    title: t.title,
    description: t.description ?? null,
    team: t.team,
    due_at: t.due_at,
    status: t.status,
    assigned_to: t.assigned_to ?? null,
    // depends_on_task_id skipped: generated IDs are mock strings, not DB UUIDs
    depends_on_task_id: null,
  }))

  const { data, error } = await db.from('tasks').insert(taskInserts).select('*')
  if (error) throw new Error(error.message)
  return ((data ?? []) as DbTask[]).map(dbTaskToTask)
}

// ─── checkSpaceConflict ───────────────────────────────────────────────────────

export async function checkSpaceConflict(
  spaceCode: string,
  startAt: string,
  endAt: string
): Promise<boolean> {
  // Normalise to explicit UTC ISO strings before any comparison.
  // Without this, a local-time string like "2026-08-08T10:00" (no TZ suffix)
  // would be interpreted differently by JS vs PostgreSQL, causing false positives.
  const startIso = new Date(startAt).toISOString()
  const endIso = new Date(endAt).toISOString()

  if (!isSupabaseConfigured()) {
    const hit = MOCK_EVENTS.find(e => {
      if (!['confirmed', 'quoted', 'requested', 'in_progress'].includes(e.status)) return false
      // Overlap: existing event must start before requested end AND end after requested start
      if (new Date(e.end_at) <= new Date(startIso)) return false
      if (new Date(e.start_at) >= new Date(endIso)) return false
      return e.spaces.some(s => s.code.toUpperCase() === spaceCode.toUpperCase())
    })
    return !!hit
  }

  const db = createAdminClient()

  // Step 1: Resolve space code → space ID
  const { data: spaceRows } = await db
    .from('spaces')
    .select('id')
    .eq('code', spaceCode.toUpperCase())
    .limit(1)

  const spaceId = (spaceRows as { id: string }[] | null)?.[0]?.id
  if (!spaceId) return false

  // Step 2: All event IDs ever linked to this specific space
  const { data: esRows } = await db
    .from('event_spaces')
    .select('event_id')
    .eq('space_id', spaceId)

  const spaceEventIds = ((esRows ?? []) as { event_id: string }[]).map(r => r.event_id)
  if (!spaceEventIds.length) return false

  // Step 3: Within that space-scoped set, find any event whose time window
  // genuinely overlaps the requested window AND has an active blocking status.
  //
  // Overlap boundary math (standard interval intersection test):
  //   existing.start_at < requested.end_at   ← existing started before new booking ends
  //   existing.end_at   > requested.start_at  ← existing ends after new booking starts
  //
  // Both sides are explicit UTC ISO strings so PostgreSQL performs a deterministic
  // timestamptz comparison — no string-sort ambiguity.
  const { data: overlapRows } = await db
    .from('events')
    .select('id')
    .in('id', spaceEventIds)
    .in('status', ['confirmed', 'quoted', 'requested', 'in_progress'])
    .lt('start_at', endIso)
    .gt('end_at', startIso)
    .limit(1)

  return (overlapRows?.length ?? 0) > 0
}

// ─── acceptQuote ─────────────────────────────────────────────────────────────

export async function acceptQuote(
  quoteId: string
): Promise<{ event: Event; tasks: Task[] } | null> {
  if (!isSupabaseConfigured()) {
    const quote = MOCK_QUOTES.find(q => q.id === quoteId)
    if (!quote) return null
    const event = MOCK_EVENTS.find(e => e.id === quote.event_id)
    if (!event) return null
    event.status = 'confirmed'
    event.updated_at = new Date().toISOString()
    quote.accepted_at = new Date().toISOString()
    const tasks = MOCK_TASKS.filter(t => t.event_id === event.id)
    return { event, tasks }
  }

  const db = createAdminClient()

  // Mark quote accepted
  const { data: quoteRows, error: qErr } = await db
    .from('quotes')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', quoteId)
    .select('event_id')

  if (qErr) throw new Error(qErr.message)
  const eventId = (quoteRows as { event_id: string }[])[0]?.event_id
  if (!eventId) return null

  // Confirm event
  const { error: evtErr } = await db
    .from('events')
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', eventId)

  if (evtErr) throw new Error(evtErr.message)

  const event = await getEventById(eventId)
  if (!event) return null

  // Tasks were already inserted at event creation — just return them
  const tasks = await getTasksForEvent(eventId)
  return { event, tasks }
}
