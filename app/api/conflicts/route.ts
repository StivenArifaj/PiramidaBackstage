import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/client'
import { MOCK_CONFLICTS, MOCK_EVENTS, MOCK_SPACES } from '@/lib/db/mock-data'
import type { Conflict } from '@/types/api'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    const conflicts = MOCK_CONFLICTS.map(c => ({
      ...c,
      related_events: MOCK_EVENTS.filter(e => c.related_event_ids.includes(e.id)).map(e => ({
        id: e.id, reference_code: e.reference_code, title: e.title,
        status: e.status, start_at: e.start_at, organizer_name: e.organizer_name,
      })),
      related_spaces: MOCK_SPACES
        .filter(s => c.related_space_ids?.includes(s.id))
        .map(s => ({ id: s.id, code: s.code, name: s.name, floor: s.floor, color: s.color })),
    }))
    return NextResponse.json({ conflicts, total: conflicts.length })
  }

  try {
    const db = createAdminClient()

    // Find all event_spaces for active events, grouped by space
    const { data: esRows, error } = await db
      .from('event_spaces')
      .select(`
        space_id,
        event_id,
        events!inner(id, reference_code, title, status, start_at, end_at, organizer_name),
        spaces!inner(id, code, name, floor, color)
      `)
      .in('events.status', ['confirmed', 'in_progress', 'quoted'])

    if (error) throw new Error(error.message)

    // Group by space_id and find overlapping time windows
    const bySpace = new Map<string, typeof esRows>()
    for (const row of esRows ?? []) {
      const arr = bySpace.get(row.space_id) ?? []
      arr.push(row)
      bySpace.set(row.space_id, arr)
    }

    const conflicts: Conflict[] = []
    for (const [, rows] of bySpace) {
      if (rows.length < 2) continue

      for (let i = 0; i < rows.length; i++) {
        for (let j = i + 1; j < rows.length; j++) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const evtA = (rows[i] as any).events
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const evtB = (rows[j] as any).events
          if (!evtA || !evtB) continue

          const aStart = new Date(evtA.start_at).getTime()
          const aEnd   = new Date(evtA.end_at).getTime()
          const bStart = new Date(evtB.start_at).getTime()
          const bEnd   = new Date(evtB.end_at).getTime()

          // Overlap check: A starts before B ends AND A ends after B starts
          if (aStart < bEnd && aEnd > bStart) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const space = (rows[i] as any).spaces
            conflicts.push({
              id: `conflict-${rows[i].event_id}-${rows[j].event_id}`,
              type: 'space_double_booked',
              severity: 'high',
              description: `"${evtA.title}" and "${evtB.title}" both booked in ${space?.name ?? rows[i].space_id} with overlapping times.`,
              related_event_ids: [rows[i].event_id, rows[j].event_id],
              related_space_ids: [rows[i].space_id],
            })
          }
        }
      }
    }

    return NextResponse.json({ conflicts, total: conflicts.length })
  } catch (err) {
    console.error('[GET /api/conflicts]', err)
    return NextResponse.json({ conflicts: [], total: 0 }, { status: 500 })
  }
}
