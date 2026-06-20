import type { Event, Task } from '@/types/api'

let _taskCounter = 100

export function generateTasks(event: Event): Task[] {
  const start = new Date(event.start_at).getTime()
  const end = new Date(event.end_at).getTime()
  const setupAt = event.setup_start_at ? new Date(event.setup_start_at).getTime() : start - 7200000
  const teardownAt = event.teardown_end_at ? new Date(event.teardown_end_at).getTime() : end + 3600000

  const tasks: Task[] = [
    { id: `tg-${++_taskCounter}`, event_id: event.id, title: `Stage & furniture setup — ${event.spaces[0]?.name ?? 'venue'}`, description: `Arrange ${event.attendees_count} seats in ${event.spaces[0]?.setup_types[0] ?? 'theater'} layout.`, team: 'logistics', due_at: new Date(setupAt).toISOString(), status: 'pending' },
    { id: `tg-${++_taskCounter}`, event_id: event.id, title: 'AV system calibration', description: 'Test projector, microphones, and speakers. Confirm gain levels.', team: 'av', due_at: new Date(setupAt + 3600000).toISOString(), status: 'pending', depends_on_task_id: `tg-${_taskCounter - 1}` },
    { id: `tg-${++_taskCounter}`, event_id: event.id, title: 'Reception desk and signage setup', team: 'reception', due_at: new Date(start - 1800000).toISOString(), status: 'pending' },
    { id: `tg-${++_taskCounter}`, event_id: event.id, title: 'Security briefing and access control', team: 'security', due_at: new Date(start - 900000).toISOString(), status: 'pending' },
    { id: `tg-${++_taskCounter}`, event_id: event.id, title: 'Event in progress — monitor AV', team: 'av', due_at: new Date(start).toISOString(), status: 'pending' },
    { id: `tg-${++_taskCounter}`, event_id: event.id, title: 'Post-event teardown and furniture return', team: 'logistics', due_at: new Date(teardownAt).toISOString(), status: 'pending' },
    { id: `tg-${++_taskCounter}`, event_id: event.id, title: 'AV equipment return to storage', team: 'av', due_at: new Date(teardownAt + 1800000).toISOString(), status: 'pending', depends_on_task_id: `tg-${_taskCounter - 1}` },
    { id: `tg-${++_taskCounter}`, event_id: event.id, title: 'Final cleaning and space handover', team: 'cleaning', due_at: new Date(teardownAt + 3600000).toISOString(), status: 'pending' },
  ]

  return tasks
}
