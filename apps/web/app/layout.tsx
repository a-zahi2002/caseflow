import { Inter, JetBrains_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import { cn } from '@/lib/utils'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Caseflow | Clinical Case-Based Learning',
  description: 'Master clinical reasoning through AI-powered patient simulations. Practice case-based learning with real-time feedback.',
  keywords: ['medical education', 'case-based learning', 'clinical simulation', 'AI patient'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          jetbrainsMono.variable,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
