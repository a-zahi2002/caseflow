'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
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
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <XpToastProvider>
      <div className="flex bg-surface min-h-screen">
        <Sidebar 
          userName={user.name} 
          userRole={user.role === 'student' ? 'Medical Student' : user.role} 
        />
        <div className="flex-1 ml-64 flex flex-col">
          <TopBar 
            totalXp={user.totalXp ?? 0}
            streak={user.currentStreak ?? 0}
          />
          <main className="flex-1 p-0">
            {children}
          </main>
        </div>
      </div>
    </XpToastProvider>
  )
}
