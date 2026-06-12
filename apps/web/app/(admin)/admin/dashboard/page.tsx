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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-ping opacity-20"></div>
      </div>
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
    { label: 'User Management', href: '/admin/users', icon: 'manage_accounts', desc: 'Manage roles and access' },
    { label: 'Content Moderation', href: '/admin/moderation', icon: 'fact_check', desc: 'Review submitted cases' },
    { label: 'Platform Settings', href: '/admin/settings', icon: 'settings', desc: 'System configuration' },
  ]

  return (
    <div className="space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8 relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full mb-4 border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] font-mono font-black text-on-surface-variant uppercase tracking-widest">Admin Control</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-on-surface mb-3 tracking-tight">System Overview</h1>
          <p className="text-on-surface-variant font-sans text-lg font-medium opacity-80 max-w-xl">Real-time platform oversight and management for Caseflow.</p>
        </div>
        <div className="flex gap-4 relative z-10">
          <Link 
            href="/admin/moderation"
            className="px-6 py-3 bg-surface-container-lowest glass text-on-surface font-heading font-bold rounded-2xl border border-outline-variant/30 hover:bg-surface-container transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">fact_check</span>
            Review Queue
            {(stats?.pendingCases ?? 0) > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-error text-on-error text-[10px] font-mono font-black rounded-full animate-bounce">{stats?.pendingCases}</span>
            )}
          </Link>
          <Link 
            href="/admin/settings"
            className="px-6 py-3 bg-primary text-on-primary font-heading font-bold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2"
          >
            Settings
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div 
            key={m.label} 
            className="bg-surface-container-lowest glass p-8 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${m.color}/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110`}></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className={`px-3 py-1 rounded-full bg-${m.color}/10 text-[10px] font-mono font-black text-${m.color} tracking-widest uppercase border border-${m.color}/20`}>
                {m.label}
              </span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${m.color}-container/20 text-${m.color} group-hover:bg-${m.color} group-hover:text-on-${m.color} transition-colors duration-300`}>
                <span className="material-symbols-outlined">{m.icon}</span>
              </div>
            </div>
            <div className="font-mono text-5xl font-black text-on-surface tracking-tighter mb-4 relative z-10">
              {m.value}
            </div>
            <div className="flex items-center gap-3 relative z-10">
              {m.trend && (
                <div className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="font-mono font-black text-xs">{m.trend}</span>
                </div>
              )}
              {m.badge && (
                <span className={`px-2.5 py-1 bg-${m.color}-fixed text-on-${m.color}-fixed text-[10px] font-mono font-black rounded-full uppercase tracking-tighter shadow-sm`}>
                  {m.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-lowest glass p-8 rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-heading font-black tracking-tight text-on-surface">Recent Users</h2>
                <p className="text-sm text-on-surface-variant mt-1">Latest platform registrations</p>
              </div>
              <Link href="/admin/users" className="text-sm font-heading font-bold text-primary hover:text-primary-container transition-colors flex items-center gap-1 group">
                View All <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
              </Link>
            </div>

            <div className="space-y-4 relative z-10">
              {recentUsers.length > 0 ? recentUsers.map((u, i) => (
                <div key={u.id} className="bg-surface-container-low/50 hover:bg-surface-container-low p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between group transition-all shadow-sm border border-outline-variant/10 hover:border-primary/30">
                  <div className="flex items-center gap-4 min-w-0 mb-4 md:mb-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-on-primary font-heading font-black shadow-md transform group-hover:scale-105 transition-transform">
                      {u.name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-heading font-bold text-on-surface truncate text-lg">{u.name || 'Unknown'}</div>
                      <div className="text-[11px] text-on-surface-variant flex items-center gap-3 mt-1 font-mono font-bold uppercase truncate">
                        <span className={`px-2 py-0.5 rounded text-[9px] ${
                          u.role === 'admin' ? 'bg-tertiary/10 text-tertiary' : 
                          u.role === 'educator' ? 'bg-secondary/10 text-secondary' : 
                          'bg-primary/10 text-primary'
                        }`}>
                          {u.role}
                        </span>
                        <span className="opacity-70 lowercase font-sans">{u.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                    <span className="text-[10px] font-mono text-outline font-bold">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                    <span className={cn(
                      "px-3 py-1.5 text-[10px] font-mono font-black rounded-xl uppercase tracking-widest shadow-sm",
                      u.status === 'active' ? "bg-tertiary-container text-on-tertiary-container" : "bg-error-container text-error"
                    )}>
                      {u.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-on-surface-variant border-2 border-dashed border-outline-variant/30 rounded-2xl">
                  <span className="material-symbols-outlined text-4xl mb-3 opacity-50">group_off</span>
                  <p className="text-sm font-bold">No recent users found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links & System Health */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-surface-container-low to-surface-container-highest p-8 rounded-3xl border border-outline-variant/20 shadow-md">
            <h2 className="text-xl font-heading font-black text-on-surface mb-6 tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">explore</span>
              Navigation
            </h2>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <Link 
                  key={link.label}
                  href={link.href} 
                  className="flex items-center p-4 bg-surface-container-lowest glass rounded-2xl hover:bg-primary hover:text-on-primary transition-all group shadow-sm hover:shadow-lg border border-outline-variant/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center mr-4 group-hover:bg-on-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">{link.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-heading font-bold text-sm tracking-tight">{link.label}</div>
                    <div className="text-[10px] text-on-surface-variant group-hover:text-on-primary/70 mt-0.5">{link.desc}</div>
                  </div>
                  <span className="material-symbols-outlined text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">arrow_forward</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Visual System Status Card */}
          <div className="relative group rounded-3xl overflow-hidden aspect-video shadow-xl border border-outline-variant/20 bg-surface-container-lowest">
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary-container/30 to-primary-container/10"></div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-on-surface) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
            
            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/80 glass rounded-full shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_rgba(0,105,71,0.8)]"></div>
                  <span className="text-on-surface text-[10px] font-mono font-black tracking-widest uppercase">Operational</span>
                </div>
                <span className="material-symbols-outlined text-tertiary">cloud_done</span>
              </div>
              
              <div>
                <h3 className="text-on-surface text-xl font-heading font-black tracking-tight mb-1">Platform Health</h3>
                <div className="flex gap-4">
                  <div className="bg-surface/50 glass px-3 py-1 rounded-lg">
                    <span className="font-mono text-on-surface-variant text-[10px] font-bold uppercase tracking-tighter">Load</span>
                    <div className="font-bold text-sm text-on-surface">12%</div>
                  </div>
                  <div className="bg-surface/50 glass px-3 py-1 rounded-lg">
                    <span className="font-mono text-on-surface-variant text-[10px] font-bold uppercase tracking-tighter">Latency</span>
                    <div className="font-bold text-sm text-on-surface">24ms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB Action */}
      <Link 
        href="/admin/users"
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border border-primary-container z-50 hover:rotate-90 duration-300"
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </Link>
    </div>
  )
}
