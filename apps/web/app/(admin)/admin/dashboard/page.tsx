'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalCases: number
  totalAttempts: number
  pendingCases: number
  usersByRole: { student: number; educator: number; admin: number }
}

interface RecentUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const token = getToken()
        const [statsRes, usersRes] = await Promise.all([
          apiClient.get<AdminStats>('/admin/stats', token ?? undefined),
          apiClient.get<RecentUser[]>('/admin/users?limit=5', token ?? undefined),
        ])

        if (statsRes.success) setStats(statsRes.data)
        if (usersRes.success) setRecentUsers(usersRes.data)
      } catch (err) {
        console.error('Failed to load admin dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-sm font-black text-on-surface-variant uppercase tracking-widest animate-pulse">Loading Administrative Data...</p>
    </div>
  )

  const metrics = [
    { 
      label: 'Total Active Users', 
      value: stats?.totalUsers?.toLocaleString() || '0', 
      trend: `${stats?.usersByRole?.student || 0} students`, 
      icon: 'group', 
      color: 'primary' 
    },
    { 
      label: 'Published Cases', 
      value: stats?.totalCases?.toString() || '0', 
      badge: 'Active',
      icon: 'clinical_notes', 
      color: 'tertiary' 
    },
    { 
      label: 'Total Simulations', 
      value: stats?.totalAttempts?.toLocaleString() || '0', 
      icon: 'play_circle', 
      color: 'secondary' 
    },
  ]

  const quickLinks = [
    { label: 'User Management', href: '/admin/users', icon: 'manage_accounts' },
    { label: 'Content Moderation', href: '/admin/moderation', icon: 'fact_check' },
    { label: 'Platform Settings', href: '/admin/settings', icon: 'settings' },
  ]

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-heading font-black text-on-surface mb-2 tracking-tight">Admin Control Center</h1>
          <p className="text-on-surface-variant font-sans font-medium opacity-80">Real-time platform oversight for Caseflow.</p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/admin/moderation"
            className="px-6 py-2.5 bg-surface-container-lowest text-on-surface font-heading font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-container transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">fact_check</span>
            Review Queue
            {(stats?.pendingCases ?? 0) > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-secondary text-on-secondary text-[9px] font-mono font-black rounded-full">{stats?.pendingCases}</span>
            )}
          </Link>
          <Link 
            href="/admin/settings"
            className="px-6 py-2.5 bg-secondary text-on-secondary font-heading font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-secondary/20 active:scale-95"
          >
            Admin Settings
          </Link>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {metrics.map((m) => (
          <div key={m.label} className="bg-surface-container-lowest p-6 rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-all group" style={{ borderLeftColor: `var(--${m.color})` }}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-mono font-black text-${m.color} tracking-widest uppercase`}>{m.label}</span>
              <span className={`material-symbols-outlined text-${m.color}-container transition-transform group-hover:scale-110`}>{m.icon}</span>
            </div>
            <div className="font-mono text-4xl font-black text-on-surface tracking-tighter">{m.value}</div>
            <div className="flex items-center gap-2 mt-3">
              {m.trend && <span className="text-primary font-mono font-black text-xs">{m.trend}</span>}
              {m.badge && <span className={`px-2 py-0.5 bg-${m.color}-fixed text-on-${m.color}-fixed text-[9px] font-mono font-black rounded-full uppercase tracking-tighter shadow-sm`}>{m.badge}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-heading font-black tracking-tight">Recent Users</h2>
              <Link href="/admin/users" className="text-sm font-heading font-bold text-primary hover:underline">View All Users</Link>
            </div>
            <div className="space-y-4">
              {recentUsers.length > 0 ? recentUsers.map((u, i) => (
                <div key={u.id} className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group hover:translate-x-2 transition-all shadow-sm">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary font-heading font-bold shadow-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-heading font-bold text-on-surface truncate">{u.name}</div>
                      <div className="text-[10px] text-on-surface-variant flex items-center gap-3 mt-1 font-mono font-bold uppercase truncate">
                        <span className="text-primary">{u.role}</span>
                        <span className="opacity-60">{u.email}</span>
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-1 text-[9px] font-mono font-black rounded-full uppercase tracking-tighter",
                    u.status === 'active' ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-error-container text-error"
                  )}>
                    {u.status}
                  </span>
                </div>
              )) : (
                <div className="p-10 text-center text-on-surface-variant">
                  <p className="text-sm">No users found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links & System Health */}
        <div className="space-y-8">
          <div className="bg-surface-container-highest p-8 rounded-3xl border border-outline-variant/10 shadow-inner">
            <h2 className="text-xl font-heading font-black text-on-surface mb-6 tracking-tight">Quick Navigation</h2>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link 
                  key={link.label}
                  href={link.href} 
                  className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl hover:bg-primary hover:text-on-primary transition-all group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">{link.icon}</span>
                    <span className="font-heading font-bold text-sm tracking-tight">{link.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Role Distribution */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
            <h3 className="text-sm font-heading font-black text-on-surface-variant uppercase tracking-widest mb-4">Role Distribution</h3>
            <div className="space-y-3">
              {[
                { label: 'Students', count: stats?.usersByRole?.student || 0, color: 'bg-primary' },
                { label: 'Educators', count: stats?.usersByRole?.educator || 0, color: 'bg-secondary' },
                { label: 'Admins', count: stats?.usersByRole?.admin || 0, color: 'bg-tertiary' },
              ].map(role => (
                <div key={role.label} className="flex items-center justify-between">
                  <span className="text-sm font-heading font-bold text-on-surface">{role.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", role.color)} 
                        style={{ width: `${stats?.totalUsers ? (role.count / stats.totalUsers * 100) : 0}%` }} 
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-on-surface-variant w-8 text-right">{role.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual System Status Card */}
          <div className="relative group rounded-3xl overflow-hidden aspect-video shadow-xl border border-outline-variant/10">
            <div className="absolute inset-0 bg-primary-container/20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,104,95,0.8)]"></div>
                <span className="text-white text-[10px] font-mono font-black tracking-widest uppercase opacity-80">System Status: Operational</span>
              </div>
              <h3 className="text-white text-lg font-heading font-black tracking-tight">Platform Health</h3>
              <div className="flex gap-4 mt-2">
                <span className="font-mono text-white/60 text-[10px] font-bold uppercase tracking-tighter">Cases: {stats?.totalCases || 0}</span>
                <span className="font-mono text-white/60 text-[10px] font-bold uppercase tracking-tighter">Users: {stats?.totalUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB Action */}
      <Link 
        href="/admin/users"
        className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-on-primary rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group ring-4 ring-primary-container/20 z-50"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-all duration-500" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </Link>
    </div>
  )
}
