import type { SpaceFloor, SpaceCategory, SpaceColor, EventStatus, AssetType } from './api'

export type { SpaceFloor, SpaceCategory, SpaceColor, EventStatus, AssetType }

export interface DbSpace {
  id: string
  code: string
  name: string
  name_sq: string | null
  floor: SpaceFloor
  category: SpaceCategory
  color: SpaceColor | null
  area_sqm: number
  capacity_pax: number
  ceiling_m: number | null
  hourly_rate_eur: number
  setup_types: string[]
  features: string[]
  plan_x: number | null
  plan_y: number | null
  description: string | null
  description_sq: string | null
  photo_urls: string[]
  is_active: boolean
  created_at: string
}

export interface DbAsset {
  id: string
  type: AssetType
  name: string
  total_qty: number
  storage_location: string
  unit_rate_eur: number
  condition: 'good' | 'fair' | 'maintenance'
  notes: string | null
  created_at: string
}

export interface DbEvent {
  id: string
  reference_code: string
  title: string
  description: string | null
  event_type: string | null
  organizer_name: string
  organizer_email: string
  organizer_phone: string | null
  organizer_org: string | null
  attendees_count: number
  status: EventStatus
  start_at: string
  end_at: string
  setup_start_at: string | null
  teardown_end_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DbEventSpace {
  id: string
  event_id: string
  space_id: string
  setup_type: string | null
}

export interface DbEventAsset {
  id: string
  event_id: string
  asset_id: string
  quantity: number
}

export interface DbQuote {
  id: string
  event_id: string
  line_items: Array<{ description: string; quantity: number; unit_price: number; total: number }>
  subtotal: number
  tax: number
  total: number
  currency: string
  generated_at: string
  valid_until: string | null
  accepted_at: string | null
}

export interface DbTask {
  id: string
  event_id: string
  title: string
  description: string | null
  team: 'logistics' | 'av' | 'cleaning' | 'security' | 'catering' | 'reception'
  due_at: string
  status: 'pending' | 'in_progress' | 'done' | 'blocked'
  assigned_to: string | null
  depends_on_task_id: string | null
  created_at: string
}

export interface DbConversation {
  id: string
  session_id: string
  event_id: string | null
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    tool_calls?: unknown
    tool_result?: unknown
  }>
  started_at: string
  last_activity_at: string
}

export interface DbAuditLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  actor: string
  actor_type: 'user' | 'system' | 'chatbot'
  changes: unknown | null
  created_at: string
}
