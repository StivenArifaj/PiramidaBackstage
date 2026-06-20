import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/client'
import { listEvents } from '@/lib/db/queries/events'
import { MOCK_EVENTS, MOCK_CONFLICTS, MOCK_ASSETS } from '@/lib/db/mock-data'
import type { DashboardOverviewResponse, SpaceFloor } from '@/types/api'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

const FLOORS: SpaceFloor[] = ['l0', 'l3', 'l_minus_1', 'exterior', 'roof']

export async function GET() {
  if (!isSupabaseConfigured()) {
    const now = Date.now()
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(now + 86400000 * 7)
    const monthEnd = new Date(now + 86400000 * 30)

    const activeEvents = MOCK_EVENTS.filter(e => ['confirmed', 'in_progress', 'quoted'].includes(e.status))
    const events_today = activeEvents.filter(e => new Date(e.start_at) >= todayStart && new Date(e.start_at) < new Date(todayStart.getTime() + 86400000))
    const events_this_week = activeEvents.filter(e => new Date(e.start_at) < weekEnd).length
    const events_this_month = activeEvents.filter(e => new Date(e.start_at) < monthEnd).length

    const inventory_low = MOCK_ASSETS
      .filter(a => a.available_qty / a.total_qty < 0.25)
      .map(a => ({ asset: a, pct_remaining: Math.round(a.available_qty / a.total_qty * 100) }))

    const occupancy_by_floor = FLOORS.map(floor => ({
      floor,
      pct: Math.round(Math.random() * 60 + 10),
    }))

    const response: DashboardOverviewResponse = {
      events_today,
      events_this_week,
      events_this_month,
      active_conflicts: MOCK_CONFLICTS,
      inventory_low,
      occupancy_by_floor,
    }
    return NextResponse.json(response)
  }

  try {
    const db = createAdminClient()
    const now = new Date()
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
    const todayEnd   = new Date(todayStart.getTime() + 86400000)
    const weekEnd    = new Date(now.getTime() + 86400000 * 7)
    const monthEnd   = new Date(now.getTime() + 86400000 * 30)

    // Use listEvents() so every event has spaces: Space[] (properly mapped, not raw Supabase rows)
    const allMapped = await listEvents()
    const events = allMapped.filter(e => ['confirmed', 'in_progress', 'quoted'].includes(e.status))

    const events_today = events.filter(
      e => new Date(e.start_at) >= todayStart && new Date(e.start_at) < todayEnd
    )
    const events_this_week = events.filter(e => new Date(e.start_at) < weekEnd).length
    const events_this_month = events.filter(e => new Date(e.start_at) < monthEnd).length

    // Real occupancy: booked spaces per floor / total spaces per floor
    // "Booked now" = events whose window covers the current moment
    const { data: spacesData } = await db.from('spaces').select('id, floor').eq('is_active', true)
    const totalByFloor = new Map<SpaceFloor, number>()
    for (const s of spacesData ?? []) {
      totalByFloor.set(s.floor as SpaceFloor, (totalByFloor.get(s.floor as SpaceFloor) ?? 0) + 1)
    }

    // Spaces booked in active confirmed/in_progress events overlapping now
    const { data: bookedNow } = await db
      .from('event_spaces')
      .select('space_id, spaces!inner(floor), events!inner(status, start_at, end_at)')
      .in('events.status', ['confirmed', 'in_progress'])
      .lte('events.start_at', now.toISOString())
      .gte('events.end_at', now.toISOString())

    const bookedByFloor = new Map<SpaceFloor, Set<string>>()
    for (const row of bookedNow ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const floor = (row as any).spaces?.floor as SpaceFloor
      if (!floor) continue
      if (!bookedByFloor.has(floor)) bookedByFloor.set(floor, new Set())
      bookedByFloor.get(floor)!.add(row.space_id)
    }

    const occupancy_by_floor = FLOORS.map(floor => {
      const total = totalByFloor.get(floor) ?? 1
      const booked = bookedByFloor.get(floor)?.size ?? 0
      return { floor, pct: Math.round((booked / total) * 100) }
    })

    // Asset inventory (reserved qty = sum of event_assets for active events)
    const { data: assetRows } = await db.from('assets').select('*')
    const { data: reservedRows } = await db
      .from('event_assets')
      .select('asset_id, quantity, events!inner(status)')
      .in('events.status', ['confirmed', 'in_progress', 'quoted'])

    const reservedByAsset = new Map<string, number>()
    for (const r of reservedRows ?? []) {
      reservedByAsset.set(r.asset_id, (reservedByAsset.get(r.asset_id) ?? 0) + r.quantity)
    }

    const inventory_low = (assetRows ?? [])
      .map(a => ({
        asset: {
          id: a.id, type: a.type, name: a.name,
          total_qty: a.total_qty,
          available_qty: Math.max(0, a.total_qty - (reservedByAsset.get(a.id) ?? 0)),
          storage_location: a.storage_location,
          unit_rate_eur: Number(a.unit_rate_eur),
        },
        pct_remaining: Math.max(0, Math.round(
          ((a.total_qty - (reservedByAsset.get(a.id) ?? 0)) / a.total_qty) * 100
        )),
      }))
      .filter(x => x.pct_remaining < 50)

    // Conflicts (simple: same space, overlapping active events)
    const { data: esRows } = await db
      .from('event_spaces')
      .select('space_id, event_id, events!inner(id, status, start_at, end_at, title)')
      .in('events.status', ['confirmed', 'in_progress', 'quoted'])

    const bySpace = new Map<string, typeof esRows>()
    for (const row of esRows ?? []) {
      const arr = bySpace.get(row.space_id) ?? []
      arr.push(row)
      bySpace.set(row.space_id, arr)
    }

    const active_conflicts: DashboardOverviewResponse['active_conflicts'] = []
    for (const [spaceId, rows] of bySpace) {
      if (!rows || rows.length < 2) continue
      for (let i = 0; i < rows.length; i++) {
        for (let j = i + 1; j < rows.length; j++) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const a = (rows[i] as any).events
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const b = (rows[j] as any).events
          if (!a || !b) continue
          if (new Date(a.start_at) < new Date(b.end_at) && new Date(a.end_at) > new Date(b.start_at)) {
            active_conflicts.push({
              id: `c-${rows[i].event_id}-${rows[j].event_id}`,
              type: 'space_double_booked',
              severity: 'high',
              description: `"${a.title}" and "${b.title}" overlap in space ${spaceId}`,
              related_event_ids: [rows[i].event_id, rows[j].event_id],
              related_space_ids: [spaceId],
            })
          }
        }
      }
    }

    const response: DashboardOverviewResponse = {
      events_today,
      events_this_week,
      events_this_month,
      active_conflicts,
      inventory_low,
      occupancy_by_floor,
    }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[GET /api/dashboard/overview]', err)
    return NextResponse.json({ error: 'Failed to load overview' }, { status: 500 })
  }
}
