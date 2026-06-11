'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Stethoscope, 
  Trophy, 
  Settings, 
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  GraduationCap
} from 'lucide-react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isEducator = session?.user?.role === 'EDUCATOR' || session?.user?.role === 'ADMIN'

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cases', href: '/cases', icon: Stethoscope },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    ...(isEducator ? [{ name: 'Educator Panel', href: '/educator/dashboard', icon: GraduationCap }] : []),
    { name: 'Settings', href: '/settings/profile', icon: Settings },
  ]

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border z-50 flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-border">
                <span className="text-xl font-bold text-foreground">Caseflow</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-surface-2 rounded-lg">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors',
                      pathname.startsWith(item.href)
                        ? 'bg-brand/10 text-brand'
                        : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn('w-5 h-5', pathname.startsWith(item.href) ? 'text-brand' : 'text-muted-foreground')} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-surface border-r border-border h-screen sticky top-0">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">Caseflow</span>
          </Link>
        </div>
        <div className="flex-1 py-6 flex flex-col gap-1 px-4 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-brand/10 text-brand'
                  : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', pathname.startsWith(item.href) ? 'text-brand' : 'text-muted-foreground')} />
              {item.name}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-danger hover:bg-danger/10 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:bg-surface-2 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cases, discussions (Cmd+K)"
                className="pl-9 pr-4 py-2 bg-surface-2 border-transparent rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-surface transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative p-2 text-muted-foreground hover:bg-surface-2 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-surface" />
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <Link href="/settings/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-foreground leading-none">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Lv. 1 Student</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand to-accent flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background relative">
          {children}
        </main>
      </div>
    </div>
  )
}
