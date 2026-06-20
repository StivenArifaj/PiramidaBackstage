import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ChatbotRoot } from '@/components/chatbot/chatbot-root'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Piramida Backstage',
    template: '%s — Piramida Backstage',
  },
  description: 'Event space booking for the Pyramid of Tirana. Reserve spaces, generate quotes, and coordinate events at Albania\'s most iconic venue.',
  metadataBase: new URL('https://piramida-backstage.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased" style={{ backgroundColor: 'var(--color-concrete-bone)', color: 'var(--color-concrete-char)', fontFamily: 'var(--font-body)' }}>
        {children}
        <ChatbotRoot />
      </body>
    </html>
  )
}
