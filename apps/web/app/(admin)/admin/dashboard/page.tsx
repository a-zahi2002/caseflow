'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function AdminDashboard() {
  const metrics = [
    { label: 'Total Active Users', value: '5,000+', trend: '+12%', icon: 'group', color: 'primary' },
    { label: 'Server Uptime', value: '99.9%', badge: 'Operational', icon: 'cloud_done', color: 'tertiary' },
    { label: 'License Utilization', value: '85%', icon: 'stars', color: 'secondary' },
  ]

  const actions = [
    { title: 'Updated Global Simulation Protocol', id: 'AD-9021', time: '24 mins ago', user: 'Dr. Aris Thorne', icon: 'update', color: 'primary' },
    { title: 'Authorized University of Med-Tech', id: 'INS-774', time: '2 hours ago', user: 'System Automator', icon: 'verified_user', color: 'secondary' },
    { title: 'Renewed SSL Certification Bundle', id: 'SEC-004', time: '5 hours ago', user: 'Network Ops', icon: 'security', color: 'tertiary' },
  ]

  const quickLinks = [
    { label: 'Institution Settings', icon: 'apartment' },
    { label: 'User Management', icon: 'manage_accounts' },
    { label: 'Security Audit Logs', icon: 'lock_open' },
  ]

  const institutions = [
    { id: 'UNIV-4482', name: 'Stanford Medical Center', status: 'ACTIVE', seats: '482 / 500', lastActive: 'Nov 12, 2023', color: 'tertiary' },
    { id: 'UNIV-1293', name: 'Johns Hopkins Training', status: 'ACTIVE', seats: '840 / 1000', lastActive: 'Nov 14, 2023', color: 'tertiary' },
    { id: 'GOV-8821', name: 'NHS National Simulation', status: 'PENDING', seats: '0 / 2500', lastActive: 'Pending Sync', color: 'secondary' },
  ]

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-heading font-black text-on-surface mb-2 tracking-tight">Global Health Monitor</h1>
          <p className="text-on-surface-variant font-sans font-medium opacity-80">Real-time infrastructure and license oversight for Caseflow.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-surface-container-lowest text-on-surface font-heading font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-container transition-all shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export Logs
          </button>
          <button className="px-6 py-2.5 bg-secondary text-on-secondary font-heading font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-secondary/20 active:scale-95">
            Admin Settings
          </button>
        </div>
      </div>

      {/* Kinetic Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {metrics.map((m) => (
          <div key={m.label} className="bg-surface-container-lowest p-6 rounded-2xl border-l-4 shadow-sm hover:shadow-md transition-all group" style={{ borderLeftColor: `var(--${m.color})` }}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] font-mono font-black text-${m.color} tracking-widest uppercase`}>{m.label}</span>
              <span className={`material-symbols-outlined text-${m.color}-container transition-transform group-hover:scale-110`}>{m.icon}</span>
            </div>
            <div className="font-mono text-4xl font-black text-on-surface tracking-tighter">{m.value}</div>
            <div className="flex items-center gap-2 mt-3">
              {m.trend && <span className="text-primary font-mono font-black text-xs">{m.trend} <span className="text-[10px] font-sans font-bold text-on-surface-variant opacity-60">vs last month</span></span>}
              {m.badge && <span className={`px-2 py-0.5 bg-${m.color}-fixed text-on-${m.color}-fixed text-[9px] font-mono font-black rounded-full uppercase tracking-tighter shadow-sm`}>{m.badge}</span>}
              {m.label === 'License Utilization' && (
                <div className="w-full bg-surface-container-low h-1.5 rounded-full shadow-inner overflow-hidden">
                  <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: m.value }}></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Admin Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-heading font-black tracking-tight">Recent Admin Actions</h2>
              <button className="text-sm font-heading font-bold text-primary hover:underline">View All Logs</button>
            </div>
            <div className="space-y-4">
              {actions.map((a, i) => (
                <div key={i} className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group hover:translate-x-2 transition-all shadow-sm">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl bg-${a.color}-fixed flex items-center justify-center shadow-sm`}>
                      <span className={`material-symbols-outlined text-${a.color} text-xl`}>{a.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-heading font-bold text-on-surface truncate">{a.title}</div>
                      <div className="text-[10px] text-on-surface-variant flex items-center gap-3 mt-1 font-mono font-bold uppercase truncate">
                        <span className="text-primary">{a.id}</span>
                        <span className="opacity-60">{a.time}</span>
                        <span className="text-primary normal-case">{a.user}</span>
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant opacity-0 group-hover:opacity-100 transition-all ml-4">chevron_right</span>
                </div>
              ))}
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
                  href="#" 
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

          {/* Visual System Status Card */}
          <div className="relative group rounded-3xl overflow-hidden aspect-video shadow-xl border border-outline-variant/10">
            <div className="absolute inset-0 bg-primary-container/20 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,104,95,0.8)]"></div>
                <span className="text-white text-[10px] font-mono font-black tracking-widest uppercase opacity-80">Sync Status: Active</span>
              </div>
              <h3 className="text-white text-lg font-heading font-black tracking-tight">Cloud Core: North America</h3>
              <div className="flex gap-4 mt-2">
                <span className="font-mono text-white/60 text-[10px] font-bold uppercase tracking-tighter">Latency: 14ms</span>
                <span className="font-mono text-white/60 text-[10px] font-bold uppercase tracking-tighter">Load: 32%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table Section */}
      <div className="mt-12 bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-heading font-black tracking-tight">Recent Institutions</h2>
            <p className="text-[10px] font-mono uppercase font-black text-on-surface-variant opacity-60 tracking-widest mt-1">Platform-wide seat allocation</p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-surface-container-highest rounded-xl text-[10px] font-mono font-black text-on-surface-variant uppercase shadow-inner">Page 1 of 42</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-on-surface-variant text-[10px] font-mono font-black uppercase tracking-widest">
                <th className="px-4 pb-2">Institution ID</th>
                <th className="px-4 pb-2">Name</th>
                <th className="px-4 pb-2">Status</th>
                <th className="px-4 pb-2">Seats Used</th>
                <th className="px-4 pb-2">Last Activity</th>
                <th className="px-4 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst) => (
                <tr key={inst.id} className="bg-surface-container-lowest hover:bg-surface-bright transition-all group shadow-sm rounded-2xl">
                  <td className="px-4 py-5 font-mono text-xs font-black text-primary rounded-l-2xl">{inst.id}</td>
                  <td className="px-4 py-5 font-heading font-black text-on-surface text-sm">{inst.name}</td>
                  <td className="px-4 py-5">
                    <span className={`px-3 py-1 bg-${inst.color}-fixed text-on-${inst.color}-fixed text-[9px] font-mono font-black rounded-full uppercase tracking-tighter border border-${inst.color}/10`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="px-4 py-5 font-mono text-xs font-bold opacity-70">{inst.seats}</td>
                  <td className="px-4 py-5 text-[10px] font-mono font-bold uppercase text-on-surface-variant opacity-60">{inst.lastActive}</td>
                  <td className="px-4 py-5 text-right rounded-r-2xl">
                    <button className="material-symbols-outlined text-outline hover:text-primary transition-all p-1.5 hover:bg-surface-variant/20 rounded-lg">more_vert</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAB Action */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-on-primary rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group ring-4 ring-primary-container/20 z-50">
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-all duration-500" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>
    </div>
  )
}

