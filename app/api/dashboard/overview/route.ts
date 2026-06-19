import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({
    events_today: [],
    events_this_week: 0,
    events_this_month: 0,
    active_conflicts: [],
    inventory_low: [],
    occupancy_by_floor: [],
  })
}
