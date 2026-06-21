import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/db/client'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

export type MaintenanceStatus = 'clean' | 'needs_cleaning' | 'maintenance'

export interface MaintenanceLog {
  id: string
  space_code: string
  space_name: string
  floor: string
  status: MaintenanceStatus
  assigned_worker: string | null
  next_action_at: string | null
  notes: string | null
  is_offline?: boolean
  created_at: string
  updated_at: string
}

// In-memory mock for dev fallback
const MOCK_MAINTENANCE: MaintenanceLog[] = [
  { id: 'm1', space_code: 'BLUE',   space_name: 'Blue Space',         floor: 'l0',        status: 'clean',          assigned_worker: 'Arben Hoxha', next_action_at: new Date(Date.now() + 7*86400000).toISOString(),  notes: null,                                 created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'm2', space_code: 'ORANGE', space_name: 'Orange Space',       floor: 'l0',        status: 'needs_cleaning', assigned_worker: 'Elsa Koci',   next_action_at: new Date(Date.now() + 86400000).toISOString(),   notes: 'Post-event deep clean required',     created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'm3', space_code: 'A1',     space_name: 'Ground Ring A1',     floor: 'l0',        status: 'clean',          assigned_worker: null,          next_action_at: new Date(Date.now() + 14*86400000).toISOString(),notes: null,                                 created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'm4', space_code: 'B1',     space_name: 'Basement Studio B1', floor: 'l_minus_1', status: 'maintenance',    assigned_worker: 'Drita Leka',  next_action_at: new Date(Date.now() + 2*86400000).toISOString(),  notes: 'HVAC filter replacement scheduled', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'm5', space_code: 'BE1',    space_name: 'Basement Box BE1',   floor: 'l_minus_1', status: 'clean',          assigned_worker: null,          next_action_at: new Date(Date.now() + 14*86400000).toISOString(),notes: null,                                 created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'm6', space_code: 'GREEN',  space_name: 'Green Box',          floor: 'exterior',  status: 'needs_cleaning', assigned_worker: 'Arben Hoxha', next_action_at: new Date(Date.now() + 86400000).toISOString(),   notes: 'Weather exposure — exterior scrub', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'm7', space_code: 'YELLOW', space_name: 'Yellow Roof Box',    floor: 'roof',      status: 'clean',          assigned_worker: null,          next_action_at: new Date(Date.now() + 7*86400000).toISOString(),  notes: null,                                 created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'm8', space_code: 'L3-A',   space_name: 'Level 3 Suite A',    floor: 'l3',        status: 'clean',          assigned_worker: 'Elsa Koci',   next_action_at: new Date(Date.now() + 7*86400000).toISOString(),  notes: null,                                 created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'm9', space_code: 'L3-B',   space_name: 'Level 3 Suite B',    floor: 'l3',        status: 'needs_cleaning', assigned_worker: null,          next_action_at: new Date(Date.now() + 3*86400000).toISOString(),  notes: 'Carpet stain — specialist required', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export async function GET() {
  try {
    // ── Mock fallback ─────────────────────────────────────────────────────────
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ logs: MOCK_MAINTENANCE, offline_spaces: [] })
    }

    // ── Live Supabase path ────────────────────────────────────────────────────
    const db = createAdminClient()

    // 1. All maintenance log entries
    const { data: logsData, error: logsErr } = await db
      .from('maintenance_logs')
      .select('*')
      .order('floor')
      .order('space_code')

    if (logsErr) throw new Error(logsErr.message)

    // 2. Spaces currently offline via kill switch (is_active = false)
    //    These are surfaced as a separate list so the UI can highlight them distinctly.
    const { data: offlineData, error: offErr } = await db
      .from('spaces')
      .select('code, name, floor')
      .eq('is_active', false)
      .order('floor')
      .order('code')

    if (offErr) {
      console.warn('[GET /api/maintenance] offline spaces query failed:', offErr.message)
    }

    // Merge: if an offline space already has a maintenance log, mark the log as offline.
    // Return offline spaces separately so the UI can show a dedicated "Kill Switch Offline" section.
    const logSpaceCodes = new Set((logsData ?? []).map((l: Record<string, unknown>) => l.space_code as string))

    type OfflineRow = { code: string; name: string; floor: string }
    const offlineSpaces = ((offlineData ?? []) as OfflineRow[]).map(s => ({
      code: s.code,
      name: s.name,
      floor: s.floor,
      has_log: logSpaceCodes.has(s.code),
    }))

    const logs = (logsData ?? []).map((l: Record<string, unknown>) => ({
      ...l,
      is_offline: offlineSpaces.some(o => o.code === l.space_code),
    }))

    return NextResponse.json({ logs, offline_spaces: offlineSpaces })
  } catch (err) {
    console.error('[GET /api/maintenance]', err)
    return NextResponse.json({ error: 'Failed to fetch maintenance logs' }, { status: 500 })
  }
}

const scheduleSchema = z.object({
  space_code: z.string().min(1),
  space_name: z.string().min(1),
  floor: z.string().min(1),
  status: z.enum(['clean', 'needs_cleaning', 'maintenance']),
  assigned_worker: z.string().optional(),
  next_action_at: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = scheduleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
    }

    const payload = {
      ...parsed.data,
      assigned_worker: parsed.data.assigned_worker ?? null,
      next_action_at: parsed.data.next_action_at ?? null,
      notes: parsed.data.notes ?? null,
    }

    if (!isSupabaseConfigured()) {
      const newLog: MaintenanceLog = {
        id: `m${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      MOCK_MAINTENANCE.push(newLog)
      return NextResponse.json({ log: newLog }, { status: 201 })
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from('maintenance_logs')
      .insert(payload)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return NextResponse.json({ log: data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/maintenance]', err)
    return NextResponse.json({ error: 'Failed to create maintenance log' }, { status: 500 })
  }
}
