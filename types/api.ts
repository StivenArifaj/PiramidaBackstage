// =========================
// Domain types (mirrors DB)
// =========================
export type SpaceFloor = 'roof' | 'l3' | 'l0' | 'l_minus_1' | 'exterior'
export type SpaceCategory = 'hero' | 'extension' | 'exterior_box' | 'public_area'
export type SpaceColor = 'blue' | 'orange' | 'green' | 'yellow' | 'red' | 'pink' | 'purple' | 'teal' | 'coral'
export type EventStatus = 'requested' | 'quoted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'red_alert'
export type AssetType = 'chair' | 'table_round' | 'table_rect' | 'microphone' | 'projector' | 'screen' | 'speaker' | 'lighting' | 'stage' | 'barrier' | 'cable' | 'other'
export type AvailabilityState = 'available' | 'reserved' | 'blocked' | 'pending'

export interface Space {
  id: string
  code: string
  name: string
  name_sq?: string
  floor: SpaceFloor
  category: SpaceCategory
  color?: SpaceColor
  area_sqm: number
  capacity_pax: number
  ceiling_m?: number
  hourly_rate_eur: number
  setup_types: string[]
  features: string[]
  plan_x?: number
  plan_y?: number
  description?: string
  photo_urls: string[]
  is_active?: boolean
}

export interface SpaceWithAvailability extends Space {
  availability: AvailabilityState
  next_available_at?: string
}

export interface Asset {
  id: string
  type: AssetType
  name: string
  total_qty: number
  available_qty: number
  storage_location: string
  unit_rate_eur: number
}

export interface Event {
  id: string
  reference_code: string
  title: string
  description?: string
  event_type?: string
  organizer_name: string
  organizer_email: string
  organizer_phone?: string
  organizer_org?: string
  attendees_count: number
  status: EventStatus
  start_at: string
  end_at: string
  setup_start_at?: string
  teardown_end_at?: string
  spaces: Space[]
  assets: Array<{ asset: Asset; quantity: number }>
  notes?: string
  created_at: string
  updated_at: string
}

export interface QuoteLineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Quote {
  id: string
  event_id: string
  line_items: QuoteLineItem[]
  subtotal: number
  tax: number
  total: number
  currency: string
  generated_at: string
  valid_until?: string
  accepted_at?: string
}

export interface Task {
  id: string
  event_id: string
  title: string
  description?: string
  team: 'logistics' | 'av' | 'cleaning' | 'security' | 'catering' | 'reception'
  due_at: string
  status: 'pending' | 'in_progress' | 'done' | 'blocked'
  assigned_to?: string
  depends_on_task_id?: string
}

export interface Conflict {
  id: string
  type: 'space_double_booked' | 'asset_oversold' | 'setup_overlap' | 'capacity_exceeded'
  severity: 'low' | 'medium' | 'high'
  description: string
  related_event_ids: string[]
  related_space_ids?: string[]
  related_asset_ids?: string[]
}

// =========================
// Endpoint contracts
// =========================

export interface ListSpacesQuery {
  floor?: SpaceFloor
  available_from?: string
  available_to?: string
  min_capacity?: number
  features?: string[]
}
export interface ListSpacesResponse {
  spaces: SpaceWithAvailability[]
}

export interface GetSpaceResponse {
  space: SpaceWithAvailability
  upcoming_bookings: Array<{ start_at: string; end_at: string; status: EventStatus }>
}

export interface AvailabilityQuery {
  from: string
  to: string
  capacity?: number
  features?: string[]
}
export interface AvailabilityResponse {
  matches: Array<{ space: Space; availability: AvailabilityState }>
  suggested: Space[]
}

export interface CreateEventRequest {
  title: string
  description?: string
  event_type?: string
  organizer_name: string
  organizer_email: string
  organizer_phone?: string
  organizer_org?: string
  attendees_count: number
  start_at: string
  end_at: string
  preferred_space_codes?: string[]
  setup_type?: string
  features_required?: string[]
}
export interface CreateEventResponse {
  event: Event
  matched_space?: Space
  alternatives?: Space[]
}

export interface ListEventsResponse {
  events: Event[]
}

export interface GetEventResponse {
  event: Event
  quote?: Quote
  tasks: Task[]
  conflicts: Conflict[]
}

export interface UpdateEventRequest {
  status?: EventStatus
  notes?: string
  spaces?: string[]
}

export interface GenerateQuoteRequest {
  event_id: string
}
export interface GenerateQuoteResponse {
  quote: Quote
}

export interface AcceptQuoteResponse {
  event: Event
  tasks_generated: Task[]
}

export interface ListConflictsResponse {
  conflicts: Conflict[]
}

export interface ListTasksResponse {
  tasks: Task[]
}

export interface UpdateTaskRequest {
  status?: Task['status']
  assigned_to?: string
}

export interface ChatRequest {
  session_id: string
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}
export interface ChatResponse {
  reply: string
  tool_calls?: Array<{ name: string; args: unknown; result?: unknown }>
  proposed_action?: {
    type: 'create_event' | 'reserve_space' | 'generate_quote' | 'cancel_event'
    payload: unknown
    requires_confirmation: boolean
  }
}

export interface DashboardOverviewResponse {
  events_today: Event[]
  events_this_week: number
  events_this_month: number
  active_conflicts: Conflict[]
  inventory_low: Array<{ asset: Asset; pct_remaining: number }>
  occupancy_by_floor: Array<{ floor: SpaceFloor; pct: number }>
}
