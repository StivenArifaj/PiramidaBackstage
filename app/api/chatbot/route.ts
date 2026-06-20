import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getGeminiClient } from '@/lib/ai/gemini'
import { geminiTools } from '@/lib/ai/tools'
import { handleToolCall } from '@/lib/ai/tool-handlers'
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt'
import type { ChatRequest, ChatResponse } from '@/types/api'

const chatRequestSchema = z.object({
  session_id: z.string().min(1),
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
})

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

    const { message, history = [] }: ChatRequest = parsed.data

    // Check Gemini key is configured
    if (!process.env.GEMINI_API_KEY) {
      const response: ChatResponse = {
        reply:
          "I'm not available right now — the AI service is not configured. Please use the booking form to submit your request.",
      }
      return NextResponse.json(response)
    }

    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      tools: geminiTools,
    })

    // Convert history from API format to Gemini format
    const geminiHistory = history.map(h => ({
      role: h.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: h.content }],
    }))

    const chat = model.startChat({ history: geminiHistory })

    // First turn: send the user message
    const firstResult = await chat.sendMessage(message)
    const firstResponse = firstResult.response

    // Check for function calls
    const toolCalls: ChatResponse['tool_calls'] = []
    const functionCalls = firstResponse.functionCalls()

    if (functionCalls && functionCalls.length > 0) {
      // Execute all tool calls
      const toolResponseParts: Array<{
        functionResponse: { name: string; response: { result: string } }
      }> = []

      for (const fc of functionCalls) {
        const result = await handleToolCall(fc.name, fc.args as Record<string, unknown>)
        toolCalls.push({ name: fc.name, args: fc.args, result })
        toolResponseParts.push({
          functionResponse: {
            name: fc.name,
            response: { result },
          },
        })
      }

      // Send tool results back to Gemini for the final natural-language response
      const secondResult = await chat.sendMessage(toolResponseParts)
      const finalText = secondResult.response.text()

      // Detect if a create_event_request was called (propose it back for confirmation display)
      const createCall = functionCalls.find(fc => fc.name === 'create_event_request')
      const proposed = createCall
        ? {
            type: 'create_event' as const,
            payload: createCall.args,
            requires_confirmation: false, // already executed
          }
        : undefined

      const response: ChatResponse = {
        reply: finalText,
        tool_calls: toolCalls,
        proposed_action: proposed,
      }
      return NextResponse.json(response)
    }

    // No function calls — plain text response
    const response: ChatResponse = { reply: firstResponse.text() }
    return NextResponse.json(response)
  } catch (err) {
    console.error('[POST /api/chatbot]', err)
    const response: ChatResponse = {
      reply:
        "I encountered an error processing your request. Please try again or use the booking form directly.",
    }
    return NextResponse.json(response)
  }
}
