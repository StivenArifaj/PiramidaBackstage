import type {
  SpaceWithAvailability,
  Space,
  ListSpacesQuery,
  GetSpaceResponse,
  AvailabilityQuery,
  AvailabilityResponse,
  AvailabilityState,
  EventStatus,
} from '@/types/api'
import type { DbSpace } from '@/types/db'
import { createAdminClient } from '../client'
import { MOCK_SPACES, MOCK_EVENTS, getAvailability } from '../mock-data'

// ─── Supabase availability check ─────────────────────────────────────────────

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

function dbSpaceToApi(row: DbSpace, availability: AvailabilityState = 'available'): SpaceWithAvailability {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    ...(row.name_sq !== null && { name_sq: row.name_sq }),
    floor: row.floor,
    category: row.category,
    ...(row.color !== null && { color: row.color }),
    area_sqm: Number(row.area_sqm),
    capacity_pax: row.capacity_pax,
    ...(row.ceiling_m !== null && { ceiling_m: Number(row.ceiling_m) }),
    hourly_rate_eur: Number(row.hourly_rate_eur),
    setup_types: row.setup_types,
    features: row.features,
    ...(row.plan_x !== null && { plan_x: Number(row.plan_x) }),
    ...(row.plan_y !== null && { plan_y: Number(row.plan_y) }),
    ...(row.description !== null && { description: row.description }),
    photo_urls: row.photo_urls ?? [],
    availability,
  }
}

async function getReservedSpaceIds(from: string, to: string): Promise<Set<string>> {
  const db = createAdminClient()

  const { data: events, error: evErr } = await db
    .from('events')
    .select('id')
    .in('status', ['confirmed', 'in_progress', 'quoted'])
    .lt('start_at', to)
    .gt('end_at', from)

  if (evErr || !events?.length) return new Set()

  const eventIds = (events as { id: string }[]).map(e => e.id)

  const { data: esRows } = await db
    .from('event_spaces')
    .select('space_id')
    .in('event_id', eventIds)

  return new Set((esRows as { space_id: string }[] ?? []).map(r => r.space_id))
}

// ─── listSpaces ───────────────────────────────────────────────────────────────

export async function listSpaces(params: ListSpacesQuery): Promise<SpaceWithAvailability[]> {
  if (!isSupabaseConfigured()) {
    let spaces = MOCK_SPACES.map(s => ({
      ...s,
      availability: getAvailability(s.id, params.available_from, params.available_to),
    }))
    if (params.floor) spaces = spaces.filter(s => s.floor === params.floor)
    if (params.min_capacity) spaces = spaces.filter(s => s.capacity_pax >= params.min_capacity!)
    if (params.features?.length) {
      spaces = spaces.filter(s => params.features!.every(f => s.features.includes(f)))
    }
    return spaces
  }

  try {
    const db = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = db.from('spaces').select('*').eq('is_active', true) as any

    if (params.floor) query = query.eq('floor', params.floor)
    if (params.min_capacity) query = query.gte('capacity_pax', params.min_capacity)
    if (params.features?.length) query = query.contains('features', params.features)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    const rows = (data ?? []) as DbSpace[]

    let reservedIds = new Set<string>()
    if (params.available_from && params.available_to) {
      reservedIds = await getReservedSpaceIds(params.available_from, params.available_to)
    }

    return rows.map(row => dbSpaceToApi(row, reservedIds.has(row.id) ? 'reserved' : 'available'))
  } catch (err) {
    console.warn('[listSpaces] Supabase unavailable, falling back to mock data:', (err as Error).message)
    let spaces = MOCK_SPACES.map(s => ({
      ...s,
      availability: getAvailability(s.id, params.available_from, params.available_to),
    }))
    if (params.floor) spaces = spaces.filter(s => s.floor === params.floor)
    if (params.min_capacity) spaces = spaces.filter(s => s.capacity_pax >= params.min_capacity!)
    if (params.features?.length) {
      spaces = spaces.filter(s => params.features!.every(f => s.features.includes(f)))
    }
    return spaces
  }
}

// ─── getSpaceByCode ───────────────────────────────────────────────────────────

export async function getSpaceByCode(code: string): Promise<GetSpaceResponse | null> {
  const upper = code.toUpperCase()

  if (!isSupabaseConfigured()) {
    const space = MOCK_SPACES.find(s => s.code === upper)
    if (!space) return null
    const upcoming_bookings = MOCK_EVENTS
      .filter(e =>
        e.spaces.some(s => s.code === upper) &&
        ['confirmed', 'quoted', 'in_progress'].includes(e.status)
      )
      .map(e => ({ start_at: e.start_at, end_at: e.end_at, status: e.status }))
    return { space, upcoming_bookings }
  }

  try {
    const db = createAdminClient()

    const { data: rows, error } = await db
      .from('spaces')
      .select('*')
      .eq('code', upper)
      .eq('is_active', true)
      .limit(1)

    if (error) throw new Error(error.message)
    if (!rows?.length) return null

    const row = (rows as DbSpace[])[0]
    const now = new Date().toISOString()

    const { data: esRows } = await db
      .from('event_spaces')
      .select('event_id')
      .eq('space_id', row.id)

    const spaceEventIds = ((esRows ?? []) as { event_id: string }[]).map(r => r.event_id)

    let upcoming_bookings: Array<{ start_at: string; end_at: string; status: EventStatus }> = []

    if (spaceEventIds.length) {
      const { data: evts } = await db
        .from('events')
        .select('start_at, end_at, status')
        .in('id', spaceEventIds)
        .in('status', ['confirmed', 'in_progress', 'quoted'])
        .gte('end_at', now)
        .order('start_at', { ascending: true })
        .limit(10)

      upcoming_bookings = ((evts ?? []) as Array<{ start_at: string; end_at: string; status: string }>)
        .map(e => ({ start_at: e.start_at, end_at: e.end_at, status: e.status as EventStatus }))
    }

    let availability: AvailabilityState = 'available'
    if (upcoming_bookings.length) {
      const first = upcoming_bookings[0]
      availability = first.status === 'quoted' ? 'pending' : 'reserved'
    }

    return { space: dbSpaceToApi(row, availability), upcoming_bookings }
  } catch (err) {
    console.warn('[getSpaceByCode] Supabase unavailable, falling back to mock data:', (err as Error).message)
    const space = MOCK_SPACES.find(s => s.code === upper)
    if (!space) return null
    const upcoming_bookings = MOCK_EVENTS
      .filter(e =>
        e.spaces.some(s => s.code === upper) &&
        ['confirmed', 'quoted', 'in_progress'].includes(e.status)
      )
      .map(e => ({ start_at: e.start_at, end_at: e.end_at, status: e.status }))
    return { space, upcoming_bookings }
  }
}

// ─── searchAvailableSpaces ───────────────────────────────────────────────────

export async function searchAvailableSpaces(params: AvailabilityQuery): Promise<AvailabilityResponse> {
  if (!isSupabaseConfigured()) {
    const filtered = MOCK_SPACES
      .filter(s => !params.capacity || s.capacity_pax >= params.capacity)
      .filter(s => !params.features?.length || params.features.every(f => s.features.includes(f)))

    const matches = filtered.map(s => ({
      space: s as Space,
      availability: getAvailability(s.id, params.from, params.to),
    }))

    const suggested = matches
      .filter(m => m.availability === 'available')
      .sort((a, b) => a.space.capacity_pax - b.space.capacity_pax)
      .slice(0, 3)
      .map(m => m.space)

    return { matches, suggested }
  }

  try {
    const db = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = db.from('spaces').select('*').eq('is_active', true) as any

    if (params.capacity) query = query.gte('capacity_pax', params.capacity)
    if (params.features?.length) query = query.contains('features', params.features)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    const rows = (data ?? []) as DbSpace[]
    const reservedIds = await getReservedSpaceIds(params.from, params.to)

    const matches = rows.map(row => {
      const avail: AvailabilityState = reservedIds.has(row.id) ? 'reserved' : 'available'
      return { space: dbSpaceToApi(row, avail) as Space, availability: avail }
    })

    const suggested = matches
      .filter(m => m.availability === 'available')
      .sort((a, b) => a.space.capacity_pax - b.space.capacity_pax)
      .slice(0, 3)
      .map(m => m.space)

    return { matches, suggested }
  } catch (err) {
    console.warn('[searchAvailableSpaces] Supabase unavailable, falling back to mock data:', (err as Error).message)
    const filtered = MOCK_SPACES
      .filter(s => !params.capacity || s.capacity_pax >= params.capacity)
      .filter(s => !params.features?.length || params.features.every(f => s.features.includes(f)))

    const matches = filtered.map(s => ({
      space: s as Space,
      availability: getAvailability(s.id, params.from, params.to),
    }))

    const suggested = matches
      .filter(m => m.availability === 'available')
      .sort((a, b) => a.space.capacity_pax - b.space.capacity_pax)
      .slice(0, 3)
      .map(m => m.space)

    return { matches, suggested }
  }
}
