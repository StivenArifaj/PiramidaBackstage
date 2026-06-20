import { NextResponse } from 'next/server'
import { getTasksForEvent } from '@/lib/db/queries/events'
import { MOCK_TASKS } from '@/lib/db/mock-data'
import type { ListTasksResponse } from '@/types/api'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const event_id = searchParams.get('event_id')

    let tasks
    if (event_id) {
      tasks = await getTasksForEvent(event_id)
    } else {
      // Return all tasks (mock fallback includes all; Supabase could add pagination)
      tasks = MOCK_TASKS
    }

    const response: ListTasksResponse = { tasks }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[GET /api/tasks]', err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}
