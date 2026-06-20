import type { ChatCompletionTool } from 'openai/resources/chat/completions'

// ── Client (Concierge) tools — read-only + advisory, no DB writes ─────────────

export const clientTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_spaces',
      description:
        'Search for available spaces matching a date range, minimum capacity, and optional required features.',
      parameters: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Start datetime in ISO 8601 format (e.g. 2026-10-21T14:00:00)',
          },
          to: {
            type: 'string',
            description: 'End datetime in ISO 8601 format',
          },
          capacity: {
            type: 'number',
            description: 'Minimum number of guests the space must accommodate',
          },
          features: {
            type: 'array',
            description:
              'Required space features (projector, mixer, natural_light, stage, av_booth, kitchen)',
            items: { type: 'string' },
          },
        },
        required: ['from', 'to'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_space_availability',
      description: 'Check whether a specific space (by code) is available for a given date range.',
      parameters: {
        type: 'object',
        properties: {
          space_code: {
            type: 'string',
            description:
              'Space code, e.g. BLUE, ORANGE, GREEN, YELLOW, L3-RED, ROOF-YELLOW, A1–A15, B1–B8, BE1–BE16',
          },
          from: { type: 'string', description: 'Start datetime in ISO 8601 format' },
          to: { type: 'string', description: 'End datetime in ISO 8601 format' },
        },
        required: ['space_code', 'from', 'to'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_assets_needed',
      description:
        'Recommend the standard AV / furniture assets for an event given its size and setup type.',
      parameters: {
        type: 'object',
        properties: {
          attendees: { type: 'number' },
          setup_type: {
            type: 'string',
            description: 'theater, roundtable, standing, exhibition, flex',
          },
        },
        required: ['attendees', 'setup_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'find_ideal_space',
      description:
        'Find the top 3 spaces that best match an event type, guest count, and vibe. Always use this instead of guessing.',
      parameters: {
        type: 'object',
        properties: {
          event_type: {
            type: 'string',
            description: 'conference, workshop, reception, exhibition, launch, party, concert',
          },
          guest_count: {
            type: 'number',
            description: 'Expected number of attendees',
          },
          vibe: {
            type: 'string',
            description:
              'Desired atmosphere, e.g. "intimate", "large stage", "outdoor", "industrial", "cultural"',
          },
        },
        required: ['guest_count'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submit_special_request',
      description:
        'Log a special client request (unusual setup, custom catering, accessibility needs, etc.) for admin review.',
      parameters: {
        type: 'object',
        properties: {
          user_email: {
            type: 'string',
            description: 'Email of the client making the request',
          },
          space_code: {
            type: 'string',
            description: 'Space code the request relates to, if known',
          },
          request_details: {
            type: 'string',
            description: 'Full description of the special request',
          },
        },
        required: ['user_email', 'request_details'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_space_booking_url',
      description:
        'Get the booking URL for a specific space. After calling this tool, output exactly [REDIRECT_TO_SPACE:CODE] so the frontend can redirect the user.',
      parameters: {
        type: 'object',
        properties: {
          space_code: {
            type: 'string',
            description: 'Space code, e.g. BLUE, ORANGE, GREEN, YELLOW',
          },
        },
        required: ['space_code'],
      },
    },
  },
]

// Backward-compat alias — old imports still work
export const groqTools = clientTools
export const geminiTools = clientTools

// ── Admin (Ops Director) tools — BI metrics + write access ───────────────────

export const adminTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_event_request',
      description:
        'Create an event booking request on behalf of an organizer. Only call this after all details are confirmed.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Name of the event' },
          event_type: {
            type: 'string',
            description: 'conference, workshop, reception, exhibition, launch',
          },
          organizer_name: { type: 'string' },
          organizer_email: { type: 'string' },
          organizer_org: { type: 'string', description: 'Organization name (optional)' },
          attendees_count: { type: 'number', description: 'Expected number of guests' },
          start_at: { type: 'string', description: 'Event start datetime in ISO 8601' },
          end_at: { type: 'string', description: 'Event end datetime in ISO 8601' },
          preferred_space_codes: {
            type: 'array',
            description: 'Preferred space codes to book (e.g. ["BLUE"])',
            items: { type: 'string' },
          },
        },
        required: [
          'title',
          'organizer_name',
          'organizer_email',
          'attendees_count',
          'start_at',
          'end_at',
        ],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_quote',
      description: 'Generate a pricing quote for an already-created event.',
      parameters: {
        type: 'object',
        properties: {
          event_id: { type: 'string', description: 'UUID of the event' },
        },
        required: ['event_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_dashboard_metrics',
      description:
        'Returns live venue metrics: event counts broken down by status, active scheduling conflicts, pending quote count, and total pipeline value in EUR. Call this first when asked for a summary or overview.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pending_quotes',
      description:
        'Returns a list of quotes awaiting acceptance, each with event title, organizer name, EUR total, and validity date.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of quotes to return. Defaults to 10.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'query_reservations',
      description:
        'Query the reservations register. Filter by date range and/or status to see upcoming or past bookings.',
      parameters: {
        type: 'object',
        properties: {
          date_from: {
            type: 'string',
            description: 'Filter events starting on or after this date (ISO 8601)',
          },
          date_to: {
            type: 'string',
            description: 'Filter events ending on or before this date (ISO 8601)',
          },
          status: {
            type: 'string',
            description:
              'Event status filter: requested, quoted, confirmed, in_progress, completed, cancelled',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_client_history',
      description:
        'Look up past bookings and lifetime spend for a client by organizer name or email.',
      parameters: {
        type: 'object',
        properties: {
          organizer_name: {
            type: 'string',
            description: 'Partial or full organizer name to search for',
          },
          email: {
            type: 'string',
            description: 'Exact organizer email to search for',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_financial_metrics',
      description:
        'Calculate Total Revenue (accepted quotes) vs Pipeline Revenue (pending quotes) for a given time period.',
      parameters: {
        type: 'object',
        properties: {
          time_period: {
            type: 'string',
            description:
              'Period to analyse: "this_month", "last_30_days", "last_90_days", "this_year", "all_time"',
          },
        },
        required: ['time_period'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_space_utilization',
      description:
        'Analyse event_spaces bookings to rank the most popular rooms by booking count and total hours used.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Number of top spaces to return. Defaults to 5.',
          },
        },
      },
    },
  },
]
