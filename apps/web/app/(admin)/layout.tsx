'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getUser, clearAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || user.role !== 'admin') {
      router.push('/dashboard')
    } else {
      setAuthorized(true)
    }
  }, [router])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  if (!authorized) return null

  const navItems = [
    { label: 'Cohorts', href: '/admin/dashboard', icon: 'group' },
    { label: 'Students', href: '/admin/users', icon: 'monitoring' },
    { label: 'Curriculum', href: '/admin/moderation', icon: 'menu_book' },
    { label: 'User Admin', href: '/admin/users', icon: 'admin_panel_settings' },
    { label: 'System Analytics', href: '/admin/analytics', icon: 'analytics' },
    { label: 'Audit Logs', href: '/admin/audits', icon: 'history' },
  ]

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-low dark:bg-slate-900 flex justify-between items-center w-full px-8 py-4 border-b border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-8">
          <span className="text-xl font-heading font-black tracking-tighter text-primary">Caseflow</span>
          <nav className="hidden md:flex gap-6">
            {['Dashboard', 'Analytics', 'Reports'].map((item) => (
              <Link 
                key={item}
                href={`/admin/${item.toLowerCase()}`} 
                className={cn(
                  "text-sm font-heading font-bold transition-all pb-1",
                  pathname.includes(item.toLowerCase()) ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
                )}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 hover:bg-surface-container rounded-full">notifications</button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 hover:bg-surface-container rounded-full">settings</button>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-heading font-bold border-2 border-primary/10">
            A
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-0 pt-20 pb-6 w-64 bg-surface-container-low dark:bg-slate-900 border-r border-outline-variant/10 h-screen z-40 flex flex-col">
          <div className="px-6 mb-8 mt-4">
            <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-heading font-black text-primary truncate">Admin Panel</div>
                <div className="text-[9px] uppercase tracking-widest text-on-surface-variant font-black opacity-60">System Core</div>
              </div>
            </div>
            <button className="w-full py-4 px-4 bg-primary text-on-primary rounded-xl text-sm font-heading font-black flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-base">add</span>
              Action
            </button>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-heading transition-all group",
                    isActive 
                      ? "text-primary font-black border-r-4 border-primary bg-surface-container-lowest shadow-sm" 
                      : "text-on-surface-variant font-bold hover:bg-surface-container-high hover:text-primary"
                  )}
                >
                  <span className={cn(
                    "material-symbols-outlined text-[20px] transition-transform group-hover:scale-110",
                    isActive ? "fill-[1]" : ""
                  )}>{item.icon}</span>
                  <span className="text-sm tracking-tight">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="px-4 mt-auto pt-6 border-t border-outline-variant/10 space-y-1">
             <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-error font-heading font-bold hover:bg-error-container/10 rounded-xl transition-all group"
            >
              <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">logout</span>
              <span className="text-sm">Sign out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Stage */}
        <main className="flex-1 ml-64 pt-24 px-8 pb-12 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}


