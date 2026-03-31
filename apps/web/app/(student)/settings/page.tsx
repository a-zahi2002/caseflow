'use client'

import { useEffect, useState } from 'react'
import { getUser } from '@/lib/auth'
import type { User } from '@caseflow/types'
import { User as UserIcon, Shield, Bell, Database, Globe, Key, Trash2, Camera, Mail, BadgeCheck, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  
  useEffect(() => {
    setUser(getUser())
  }, [])

  if (!user) return null

  const settingsGroups = [
    {
      title: "Account Preferences",
      description: "Manage your personal information and clinical profile.",
      items: [
        { icon: <UserIcon size={18} />, label: "Profile Information", color: "text-primary", active: true },
        { icon: <Mail size={18} />, label: "Notification Settings" },
        { icon: <Shield size={18} />, label: "Security & Privacy" },
        { icon: <Database size={18} />, label: "Data Management" },
      ]
    },
    {
      title: "App Settings",
      description: "Customize the platform experience for your workflow.",
      items: [
        { icon: <Zap size={18} />, label: "AI Patient Persona Level" },
        { icon: <Globe size={18} />, label: "Language & Region" },
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <header className="mb-12">
        <h1 className="text-4xl font-heading font-black tracking-tight text-on-surface mb-2">Platform Settings</h1>
        <p className="text-on-surface-variant opacity-70 font-sans font-medium text-lg leading-relaxed">Configure your medical education workspace and clinical encounter parameters.</p>
      </header>

      <div className="grid md:grid-cols-4 gap-12">
        {/* Navigation */}
        <aside className="md:col-span-1 border-r border-outline-variant/30 pr-8 space-y-8 h-fit">
          {settingsGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h3 className="text-[10px] font-mono font-black text-outline uppercase tracking-widest px-2">{group.title}</h3>
              <nav className="space-y-1">
                {group.items.map((item, iIdx) => (
                  <button 
                    key={iIdx} 
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                      item.active 
                        ? "bg-primary-container text-on-primary-container shadow-sm font-bold scale-[1.02]" 
                        : "text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary hover:translate-x-1"
                    )}
                  >
                    <span className={cn(item.active ? "text-primary" : "text-outline group-hover:text-primary")}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          ))}
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors mt-auto">
            <Trash2 size={18} />
            Deactivate Account
          </button>
        </aside>

        {/* Content */}
        <div className="md:col-span-3 pb-20">
          {/* Profile Card */}
          <section className="bg-white border border-outline-variant/30 rounded-3xl p-8 shadow-xl shadow-primary/5 mb-8">
            <div className="flex items-center gap-6 mb-10">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-secondary-container flex items-center justify-center text-on-secondary-container text-4xl font-heading font-black shadow-lg shadow-secondary/10 group-hover:scale-105 transition-transform duration-300">
                  {user.name.charAt(0)}
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-xl border-4 border-white active:scale-90 transition-transform">
                  <Camera size={18} />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-heading font-black text-on-surface leading-tight flex items-center gap-2">
                  {user.name}
                  <BadgeCheck size={20} className="text-primary" />
                </h2>
                <p className="text-on-surface-variant font-mono text-[10px] uppercase font-black tracking-widest opacity-60 mb-2 mt-1">{user.role}</p>
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1 bg-primary/10 rounded-lg text-[10px] font-mono font-black text-primary uppercase tracking-widest">Lv. {Math.floor((user.totalXp ?? 0) / 1000) + 1} Scholar</div>
                   <div className="px-3 py-1 bg-amber-50 rounded-lg text-[10px] font-mono font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                      <span className="text-[8px]">🔥</span> {user.currentStreak ?? 0} Day Streak
                   </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-outline uppercase tracking-widest ml-1">Full Name</label>
                <div className="px-5 py-4 bg-surface-container-low rounded-2xl text-sm font-semibold text-on-surface border border-outline-variant/50">{user.name}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-outline uppercase tracking-widest ml-1">Email Registry</label>
                <div className="px-5 py-4 bg-surface-container-low rounded-2xl text-sm font-semibold text-on-surface border border-outline-variant/50">{user.email}</div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-outline uppercase tracking-widest ml-1">Institution Affiliate</label>
                <div className="px-5 py-4 bg-surface-container-low rounded-2xl text-sm font-semibold text-on-surface border border-outline-variant/50">{user.institution || "Independent Clinician"}</div>
              </div>
              <div className="space-y-1.5 pt-4">
                 <button className="w-full h-full py-4 bg-primary text-on-primary rounded-2xl font-heading font-bold text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
                   Update Credentials
                 </button>
              </div>
            </div>
          </section>

          {/* Security Summary */}
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                  <Key size={24} />
               </div>
               <div>
                  <p className="text-sm font-bold text-on-surface leading-tight">Two-Factor Authentication</p>
                  <p className="text-[11px] font-sans font-medium text-on-surface-variant opacity-70">Secured via medical professional protocols.</p>
               </div>
            </div>
            <div className="px-4 py-2 bg-emerald-100 text-emerald-700 text-[10px] font-mono font-black uppercase tracking-widest rounded-lg">Active</div>
          </section>
        </div>
      </div>
    </div>
  )
}
