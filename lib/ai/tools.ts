import type { ChatCompletionTool } from 'openai/resources/chat/completions'

export const groqTools: ChatCompletionTool[] = [
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
      name: 'create_event_request',
      description:
        'Create an event booking request. Only call this after the user has confirmed all details.',
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
]

// Keep the old export name as an alias for any remaining Gemini references during transition
export const geminiTools = groqTools
