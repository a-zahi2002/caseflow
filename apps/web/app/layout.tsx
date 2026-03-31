import { Manrope, Plus_Jakarta_Sans, DM_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import { cn } from '@/lib/utils'
import './globals.css'

const fontSans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
})

const fontHeading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
})

const fontMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Caseflow | CBL & SBL Platform',
  description: 'Clinical Case-Based Learning Platform for Medical Education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontHeading.variable,
          fontMono.variable
        )}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}

