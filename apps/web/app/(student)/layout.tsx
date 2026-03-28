import Link from 'next/link'
import { LayoutDashboard, GraduationCap, Trophy, MessageSquare, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive?: boolean
}

function SidebarItem({ href, icon, label, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
        isActive 
          ? "bg-primary text-white shadow-sm" 
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-white border-r border-border flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Caseflow</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          <SidebarItem 
            href="/dashboard" 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Dashboard" 
            isActive 
          />
          <SidebarItem 
            href="/cases" 
            icon={<History className="w-4 h-4" />} 
            label="Cases" 
          />
          <SidebarItem 
            href="/progress" 
            icon={<Trophy className="w-4 h-4" />} 
            label="My Progress" 
          />
          <SidebarItem 
            href="/discussions" 
            icon={<MessageSquare className="w-4 h-4" />} 
            label="Discussions" 
          />
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <SidebarItem 
            href="/settings" 
            icon={<Settings className="w-4 h-4" />} 
            label="Settings" 
          />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-sm font-medium text-gray-500">Academic Term: Spring 2024</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-700 font-mono">2,450 XP</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-border" />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
