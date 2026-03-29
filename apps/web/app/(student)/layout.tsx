import { ReactNode } from 'react'
import { StudentNav } from '@/components/StudentNav'
import { XpToastProvider } from '@/components/gamification/XpToastProvider'

export default function StudentRouteLayout({ children }: { children: ReactNode }) {
  return (
    <XpToastProvider>
      <div className="flex flex-col min-h-screen">
        <StudentNav 
          userName="Ashan Karunaratne"
          userInitials="AK"
          totalXp={3240}
          streak={7}
          currentPath="/"
        />
        <main className="flex-1 bg-surface-page">
          {children}
        </main>
      </div>
    </XpToastProvider>
  )
}

