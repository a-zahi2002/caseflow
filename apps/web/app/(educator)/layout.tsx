'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function EducatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Cohorts', href: '/educator/dashboard', icon: 'group' },
    { label: 'Students', href: '/educator/students', icon: 'monitoring' },
    { label: 'Curriculum', href: '/educator/cases', icon: 'menu_book' },
    { label: 'User Admin', href: '/educator/admin', icon: 'admin_panel_settings' },
    { label: 'System Analytics', href: '/educator/analytics', icon: 'analytics' },
    { label: 'Audit Logs', href: '/educator/audits', icon: 'history' },
  ]

  return (
    <div className="min-h-screen bg-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-8 py-4 bg-surface dark:bg-slate-950 border-b border-outline-variant/10">
        <div className="flex items-center gap-8">
          <span className="text-xl font-heading font-black tracking-tighter text-primary">Caseflow</span>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/educator/dashboard" className={cn(
              "pb-1 text-sm font-heading font-bold transition-all",
              pathname === '/educator/dashboard' ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
            )}>Dashboard</Link>
            <Link href="/educator/analytics" className={cn(
              "pb-1 text-sm font-heading font-bold transition-all",
              pathname === '/educator/analytics' ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
            )}>Analytics</Link>
            <Link href="/educator/reports" className={cn(
              "pb-1 text-sm font-heading font-bold transition-all",
              pathname === '/educator/reports' ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
            )}>Reports</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 hover:bg-surface-container-low rounded-full transition-all">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-surface"></span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-2 hover:bg-surface-container-low rounded-full transition-all">settings</span>
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-outline-variant/20">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-heading font-black text-on-surface">Dr. Educator</p>
              <p className="text-[10px] font-mono uppercase text-on-surface-variant font-bold">Clinical Lead</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-primary-container flex items-center justify-center text-primary font-heading font-bold">
              DE
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-0 pt-20 pb-6 bg-surface-container-low dark:bg-slate-900 w-64 h-screen border-r border-outline-variant/10 z-40">
          <div className="px-6 mb-8 mt-4">
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
              <p className="text-[10px] font-mono text-primary font-black uppercase tracking-widest mb-1 opacity-70">Active View</p>
              <p className="text-sm font-heading font-black text-primary tracking-tight">Educator Control</p>
              <p className="text-[11px] font-sans text-on-surface-variant leading-tight font-medium">Clinical Excellence Unit</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-heading transition-all group",
                    isActive 
                      ? "text-primary bg-primary-container shadow-sm font-black border-r-4 border-primary" 
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary font-bold"
                  )}
                >
                  <span className={cn(
                    "material-symbols-outlined transition-transform group-hover:scale-110",
                    isActive ? "fill-[1]" : ""
                  )}>{item.icon}</span>
                  <span className="text-sm tracking-tight">{item.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="px-4 mt-auto mb-6 pt-10">
            <Link 
              href="/educator/create" 
              className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl text-sm font-heading font-black shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Simulation
            </Link>
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


