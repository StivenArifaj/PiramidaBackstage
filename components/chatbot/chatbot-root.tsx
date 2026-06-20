'use client'

import { usePathname } from 'next/navigation'
import { ChatbotCube } from './chatbot-cube'

/** Mounts the chatbot everywhere except the internal /dashboard routes. */
export function ChatbotRoot() {
  const pathname = usePathname()
  if (pathname?.startsWith('/dashboard')) return null
  return <ChatbotCube />
}
