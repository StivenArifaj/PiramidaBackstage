import { NextResponse } from 'next/server'
import { MOCK_EVENTS, MOCK_CONFLICTS, MOCK_ASSETS } from '@/lib/db/mock-data'
import type { DashboardOverviewResponse, SpaceFloor } from '@/types/api'

export async function GET() {
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

  const floors: SpaceFloor[] = ['l0', 'l3', 'l_minus_1', 'exterior', 'roof']
  const occupancy_by_floor = floors.map(floor => ({
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
