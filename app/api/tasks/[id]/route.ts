import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/db/client'
import { MOCK_TASKS } from '@/lib/db/mock-data'
import type { Task } from '@/types/api'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return Boolean(url && key && url.startsWith('http'))
}

const patchSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'done', 'blocked']).optional(),
  assigned_to: z.string().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const patch = parsed.data

    if (!isSupabaseConfigured()) {
      const task = MOCK_TASKS.find(t => t.id === id)
      if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      if (patch.status) task.status = patch.status as Task['status']
      if (patch.assigned_to !== undefined) task.assigned_to = patch.assigned_to
      return NextResponse.json({ task })
    }

    const db = createAdminClient()
    const { data, error } = await db
      .from('tasks')
      .update(patch)
      .eq('id', id)
      .select()
      .limit(1)

    if (error) throw new Error(error.message)
    if (!data?.length) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    const row = data[0]
    const task: Task = {
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

    return NextResponse.json({ task })
  } catch (err) {
    console.error('[PATCH /api/tasks/[id]]', err)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
