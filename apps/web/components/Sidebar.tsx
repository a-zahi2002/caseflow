'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LogOut, Settings, HelpCircle, LayoutDashboard, Users, FolderOpen, FlaskConical, BarChart3, Plus } from 'lucide-react'
import { clearAuth } from '@/lib/auth'

interface SidebarProps {
  userName: string
  userRole: string
  userAvatar?: string
}

export function Sidebar({ userName, userRole, userAvatar }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Patients', href: '/cases', icon: <Users size={20} /> },
    { label: 'Case Files', href: '/attempts', icon: <FolderOpen size={20} /> },
    { label: 'Simulations', href: '/simulation', icon: <FlaskConical size={20} /> },
    { label: 'Analytics', href: '/progress', icon: <BarChart3 size={20} /> },
  ]

  const bottomItems = [
    { label: 'Settings', href: '/settings', icon: <Settings size={20} /> },
    { label: 'Support', href: '/support', icon: <HelpCircle size={20} /> },
  ]

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white flex flex-col p-6 space-y-2 border-r border-outline-variant/20 z-40 shadow-sm">
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <FlaskConical size={24} />
        </div>
        <h1 className="text-2xl font-heading font-black tracking-tighter text-on-surface">Caseflow</h1>
      </div>
      
      <div className="flex items-center space-x-3 px-3 py-4 mb-8 bg-surface-container-low rounded-2xl border border-outline-variant/10">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary-container flex items-center justify-center text-primary font-heading font-black text-lg shadow-inner">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            userName.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-heading font-black text-on-surface truncate">{userName}</p>
          <p className="text-[9px] font-mono font-black tracking-widest uppercase text-outline truncate opacity-70">{userRole}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 group",
                isActive
                  ? "bg-primary text-on-primary shadow-xl shadow-primary/20 font-black"
                  : "text-on-surface-variant hover:text-primary hover:bg-primary/5 font-bold"
              )}
            >
              <span className={cn("transition-transform group-hover:scale-110", isActive ? "text-on-primary" : "text-outline group-hover:text-primary")}>{item.icon}</span>
              <span className="text-sm tracking-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="pt-6 space-y-1 border-t border-outline-variant/20">
        <Link 
          href="/cases"
          className="w-full mb-6 py-4 bg-primary-container text-primary rounded-2xl font-heading font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-3 border border-primary/10"
        >
          <Plus size={16} strokeWidth={3} />
          New Simulation
        </Link>

        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center space-x-4 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-2xl transition-all duration-200 group font-bold"
          >
            <span className="text-outline group-hover:text-primary transition-transform group-hover:scale-110">{item.icon}</span>
            <span className="text-sm tracking-tight">{item.label}</span>
          </Link>
        ))}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all duration-200 group font-bold"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-sm tracking-tight">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

