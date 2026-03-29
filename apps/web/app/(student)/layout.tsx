'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentNav } from '@/components/StudentNav'
import { XpToastProvider } from '@/components/gamification/XpToastProvider'
import { getUser } from '@/lib/auth'
import type { User } from '@caseflow/types'

export default function StudentRouteLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const u = getUser()
    if (!u || u.role !== 'student') {
      router.push('/login')
    } else {
      setUser(u)
    }
  }, [router])

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <XpToastProvider>
      <div className="flex flex-col min-h-screen">
        <StudentNav 
          userName={user.name}
          userInitials={initials}
          totalXp={0} // Default to 0 until API supports it
          streak={0}  // Default to 0 until API supports it
          currentPath="/"
        />
        <main className="flex-1 bg-surface-page">
          {children}
        </main>
      </div>
    </XpToastProvider>
  )
}
