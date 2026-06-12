'use client'

import { Zap, Bell, Trophy, LogOut } from 'lucide-react'
import { clearAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  totalXp: number
  streak: number
  userAvatar?: string
}

export function TopBar({ totalXp, streak, userAvatar }: TopBarProps) {
  const router = useRouter()

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  return (
    <header className="flex justify-between items-center w-full px-6 py-3 bg-white dark:bg-stone-950 sticky top-0 z-50 shadow-sm dark:shadow-none h-16">
      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-primary font-bold border-b-2 border-primary cursor-default px-2 py-1">XP: {totalXp.toLocaleString()}</span>
          <span className="text-secondary font-medium hover:bg-surface-container-low transition-colors cursor-pointer px-2 py-1 rounded">Streak: {streak} Days</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative flex items-center justify-center">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
        </div>
        
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center">
          <Trophy className="w-5 h-5" />
        </button>

        <div className="relative group ml-2">
          <div className="w-8 h-8 rounded-full bg-surface-container-low overflow-hidden border border-outline-variant cursor-pointer group-hover:ring-2 ring-primary transition-all">
            {userAvatar ? (
              <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white text-xs font-bold">
                U
              </div>
            )}
          </div>

          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-outline-variant/30 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] py-2">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container/20 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
