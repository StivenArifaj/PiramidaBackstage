import { SchemaType } from '@google/generative-ai'
import type { Tool } from '@google/generative-ai'

export const geminiTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'search_spaces',
        description:
          'Search for available spaces matching a date range, minimum capacity, and optional required features.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            from: {
              type: SchemaType.STRING,
              description: 'Start datetime in ISO 8601 format (e.g. 2026-10-21T14:00:00)',
            },
            to: {
              type: SchemaType.STRING,
              description: 'End datetime in ISO 8601 format',
            },
            capacity: {
              type: SchemaType.NUMBER,
              description: 'Minimum number of guests the space must accommodate',
            },
            features: {
              type: SchemaType.ARRAY,
              description: 'Required space features (projector, mixer, natural_light, stage, av_booth, kitchen)',
              items: { type: SchemaType.STRING },
            },
          },
          required: ['from', 'to'],
        },
      },
      {
        name: 'check_space_availability',
        description: 'Check whether a specific space (by code) is available for a given date range.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            space_code: {
              type: SchemaType.STRING,
              description: 'Space code, e.g. BLUE, ORANGE, GREEN, YELLOW, L3-RED, ROOF-YELLOW',
            },
            from: { type: SchemaType.STRING, description: 'Start datetime in ISO 8601 format' },
            to: { type: SchemaType.STRING, description: 'End datetime in ISO 8601 format' },
          },
          required: ['space_code', 'from', 'to'],
        },
      },
      {
        name: 'create_event_request',
        description:
          'Create an event booking request. Only call this after the user has confirmed all details.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING, description: 'Name of the event' },
            event_type: {
              type: SchemaType.STRING,
              description: 'conference, workshop, reception, exhibition, launch',
            },
            organizer_name: { type: SchemaType.STRING },
            organizer_email: { type: SchemaType.STRING },
            organizer_org: { type: SchemaType.STRING, description: 'Organization name (optional)' },
            attendees_count: { type: SchemaType.NUMBER, description: 'Expected number of guests' },
            start_at: { type: SchemaType.STRING, description: 'Event start datetime in ISO 8601' },
            end_at: { type: SchemaType.STRING, description: 'Event end datetime in ISO 8601' },
            preferred_space_codes: {
              type: SchemaType.ARRAY,
              description: 'Preferred space codes to book (e.g. ["BLUE"])',
              items: { type: SchemaType.STRING },
            },
          },
          required: ['title', 'organizer_name', 'organizer_email', 'attendees_count', 'start_at', 'end_at'],
        },
      },
      {
        name: 'generate_quote',
        description: 'Generate a pricing quote for an already-created event.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            event_id: { type: SchemaType.STRING, description: 'UUID of the event' },
          },
          required: ['event_id'],
        },
      },
      {
        name: 'list_assets_needed',
        description:
          'Recommend the standard AV / furniture assets for an event given its size and setup type.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            attendees: { type: SchemaType.NUMBER },
            setup_type: {
              type: SchemaType.STRING,
              description: 'theater, roundtable, standing, exhibition, flex',
            },
          },
          required: ['attendees', 'setup_type'],
        },
      },
    ],
  },
]
