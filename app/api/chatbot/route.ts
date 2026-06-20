import { NextResponse } from 'next/server'
import { z } from 'zod'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { clientTools, adminTools } from '@/lib/ai/tools'
import { handleToolCall } from '@/lib/ai/tool-handlers'
import { SYSTEM_PROMPT, ADMIN_SYSTEM_PROMPT } from '@/lib/ai/system-prompt'
import type { ChatRequest, ChatResponse } from '@/types/api'

const chatRequestSchema = z.object({
  session_id: z.string().min(1),
  message: z.string().min(1),
  isAdmin: z.boolean().optional().default(false),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
})

function getGroqClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY!,
    baseURL: 'https://api.groq.com/openai/v1',
  })
}

const MODEL = 'llama-3.3-70b-versatile'
const MAX_TOOL_ROUNDS = 5

// Client gets read-only/advisory tools only; admin gets the full dual-brain toolset
const CLIENT_TOOLS = clientTools
const ADMIN_TOOLS  = [...clientTools, ...adminTools]

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = chatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { message, history = [], isAdmin } = parsed.data

    // Select persona and tool set based on caller identity
    const systemPrompt = isAdmin ? ADMIN_SYSTEM_PROMPT : SYSTEM_PROMPT
    const tools        = isAdmin ? ADMIN_TOOLS : CLIENT_TOOLS

    if (!process.env.GROQ_API_KEY) {
      const response: ChatResponse = {
        reply: isAdmin
          ? "AI Ops Director unavailable — GROQ_API_KEY not configured."
          : "I'm not available right now — the AI service is not configured. Please use the booking form to submit your request.",
      }
      return NextResponse.json(response)
    }

    const client = getGroqClient()

    // Build message array for Groq
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(history as ChatRequest['history'] ?? []).map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ]

    const toolCalls: ChatResponse['tool_calls'] = []

    // Agentic loop — up to MAX_TOOL_ROUNDS of tool calling
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const completion = await client.chat.completions.create({
        model: MODEL,
        messages,
        tools,
        tool_choice: 'auto',
        temperature: isAdmin ? 0.3 : 0.5,
        max_tokens: 1024,
      })

      const choice = completion.choices[0]
      const assistantMsg = choice.message

      // Always push the assistant message into history for multi-turn coherence
      messages.push(assistantMsg as ChatCompletionMessageParam)

      // If no tool calls, we're done
      if (!assistantMsg.tool_calls?.length) {
        const reply = assistantMsg.content ?? ''

        // Detect if the last tool call was create_event_request
        const createCall = toolCalls.find(tc => tc.name === 'create_event_request')

        const response: ChatResponse = {
          reply,
          ...(toolCalls.length > 0 && { tool_calls: toolCalls }),
          ...(createCall && {
            proposed_action: {
              type: 'create_event' as const,
              payload: createCall.args,
              requires_confirmation: false,
            },
          }),
        }
        return NextResponse.json(response)
      }

      // Execute each tool call and feed results back
      const toolResultMessages: ChatCompletionMessageParam[] = []
      for (const tc of assistantMsg.tool_calls) {
        // Only handle standard function tool calls (not custom tool types)
        if (tc.type !== 'function') continue

        const args = JSON.parse(tc.function.arguments ?? '{}')
        const result = await handleToolCall(tc.function.name, args)

        toolCalls.push({ name: tc.function.name, args, result })

        toolResultMessages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: result,
        })
      }

      messages.push(...toolResultMessages)
    }

    // Rounds exhausted but tool data is in the message history.
    // Force one final call with tool_choice:'none' so the LLM synthesizes all
    // accumulated tool results into a plain-text response instead of calling more tools.
    const synthesis = await client.chat.completions.create({
      model: MODEL,
      messages,
      tool_choice: 'none',
      temperature: isAdmin ? 0.3 : 0.5,
      max_tokens: 1024,
    })

    const synthesisReply = synthesis.choices[0].message.content ?? ''
    const createCall = toolCalls.find(tc => tc.name === 'create_event_request')

    const response: ChatResponse = {
      reply: synthesisReply,
      ...(toolCalls.length > 0 && { tool_calls: toolCalls }),
      ...(createCall && {
        proposed_action: {
          type: 'create_event' as const,
          payload: createCall.args,
          requires_confirmation: false,
        },
      }),
    }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[POST /api/chatbot]', err)
    const response: ChatResponse = {
      reply:
        'I encountered an error processing your request. Please try again or use the booking form directly.',
    }
    return NextResponse.json(response)
  }
}
