'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { XpBar } from '@/components/gamification/XpBar'
import { BadgeGrid } from '@/components/gamification/BadgeGrid'
import { StreakTracker } from '@/components/gamification/StreakTracker'
import { cn } from '@/lib/utils'
import { getUser } from '@/lib/auth'
import { apiClient } from '@/lib/api-client'
import { Loader2, TrendingUp, Award, Flame, Target } from 'lucide-react'
import type { User, StudentProgressData } from '@caseflow/types'

// Internal Components
interface StatCardProps {
  label: string
  value?: string | number
  suffix?: string
  accent: 'brand' | 'reward' | 'danger' | 'purple'
  delta?: React.ReactNode
  icon: React.ReactNode
}

function StatCard({ label, value, suffix, accent, delta, icon }: StatCardProps) {
  const accentColors = {
    brand: 'border-brand/20 bg-brand/5 text-brand',
    reward: 'border-reward/20 bg-reward/5 text-reward-text',
    danger: 'border-red-200 bg-red-50 text-red-600',
    purple: 'border-purple-200 bg-purple-50 text-purple-600'
  }

  return (
    <div className="relative bg-white border border-border-default rounded-2xl p-5 shadow-sm transition-all hover:shadow-md group">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-xl border transition-colors group-hover:scale-110 duration-300", accentColors[accent])}>
          {icon}
        </div>
        <div className="text-right">
           <span className="text-[10px] font-bold font-mono text-text-tertiary uppercase tracking-widest block mb-1">
            {label}
          </span>
          <div className="flex items-baseline justify-end leading-none">
            <span className="text-2xl font-bold text-text-primary">{value}</span>
            {suffix && <span className="text-[13px] font-medium text-text-secondary ml-1">{suffix}</span>}
          </div>
        </div>
      </div>
      <div className="mt-2 text-[11px] font-bold text-text-tertiary uppercase tracking-tight flex items-center gap-1.5 border-t border-slate-50 pt-3">
        {delta}
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const [progress, setProgress] = useState<StudentProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await apiClient.get<StudentProgressData>('/progress/me')
        if (res.success) {
          setProgress(res.data)
        }
      } catch (err) {
        console.error('Failed to load dashboard progress')
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
      <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest animate-pulse">Personalizing your experience...</p>
    </div>
  )

  if (!progress) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
       <p className="text-red-500 font-bold uppercase tracking-widest">Failed to load profile</p>
       <button onClick={() => window.location.reload()} className="px-4 py-2 bg-brand text-white rounded-lg text-xs font-bold">Retry</button>
    </div>
  )

  const user = progress.user
  const firstName = user.name.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const metrics = progress.metrics

  return (
    <div className="p-8 space-y-10">
      {/* High-fidelity Dashboard Banner */}
      <section className="relative h-48 md:h-64 w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 border border-outline-variant/10 group bg-surface-container-high">
        <img 
          src="/dash-banner.png" 
          alt="Clinical Dashboard Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-[2s] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-surface/90 via-surface/40 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(0,104,95,0.1),transparent)]"></div>
        
        <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-primary/10 rounded-full mb-4 border border-primary/20 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,104,95,0.6)]"></span>
            <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest">Active Clinical Session</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-on-surface tracking-tighter leading-none mb-2">
            Clinical <span className="text-primary italic">Intelligence</span> Hub
          </h1>
          <p className="text-base md:text-lg font-sans font-medium text-on-surface-variant max-w-lg opacity-80">
            Augmenting medical expertise through high-fidelity AI-driven patient encounters.
          </p>
        </div>
      </section>

      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight text-on-surface mb-2">
            Welcome back, {firstName}
          </h2>
          <p className="text-on-surface-variant max-w-xl">
            You've completed {Math.round(metrics.totalCompleted / (metrics.totalCompleted + 3) * 100) || 0}% of your targets. 
            Your diagnostic accuracy is {Math.round(metrics.overallAvgScore)}% this month.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 min-w-[140px]">
            <p className="font-mono text-[10px] uppercase text-outline mb-1 font-bold tracking-widest">Rank</p>
            <p className="text-xl font-bold text-primary">Chief Fellow</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 min-w-[140px]">
            <p className="font-mono text-[10px] uppercase text-outline mb-1 font-bold tracking-widest">Accuracy</p>
            <p className="text-xl font-bold text-secondary">{Math.round(metrics.overallAvgScore)}%</p>
          </div>
        </div>
      </section>

      {/* Main Layout Grid: Bento Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Case Cards (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-bold">Active Case Files</h3>
            <Link href="/cases" className="text-primary text-sm font-semibold hover:underline">
              View All Patients
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.recentAttempts.length > 0 ? (
              progress.recentAttempts.slice(0, 2).map((attempt) => (
                <div key={attempt.id} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-primary hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-mono text-[10px] text-outline px-2 py-0.5 border border-outline-variant/30 rounded uppercase font-bold">ID: {attempt.id.slice(0, 8)}</span>
                      <h4 className="text-lg font-bold mt-2">{attempt.caseTitle}</h4>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      attempt.status === 'completed' ? "bg-tertiary-container text-on-tertiary-container" : "bg-secondary-fixed text-on-secondary-fixed"
                    )}>
                      {attempt.status}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                    {attempt.specialty} case simulation. Progress tracked and synced with clinical pulse analytics.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface"></div>
                      <div className="w-6 h-6 rounded-full bg-surface-container-highest border-2 border-surface"></div>
                    </div>
                    <Link 
                      href={attempt.status === 'completed' ? `/attempts/${attempt.id}/result` : `/simulation/run/${attempt.id}`}
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform flex items-center gap-2"
                    >
                      {attempt.status === 'completed' ? 'Review' : 'Resume'} 
                      <span className="material-symbols-outlined text-sm">
                        {attempt.status === 'completed' ? 'visibility' : 'play_arrow'}
                      </span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 bg-surface-container-lowest p-12 rounded-xl border border-dashed border-outline-variant flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-outline mb-4">clinical_notes</span>
                <h4 className="text-lg font-bold mb-2">No Active Cases</h4>
                <p className="text-sm text-outline max-w-xs mb-6">Start your first clinical simulation to begin building your professional profile.</p>
                <Link href="/cases" className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-sm">
                  Browse Catalog
                </Link>
              </div>
            )}
          </div>

          {/* Performance Analytics */}
          <div className="bg-surface-container-low p-8 rounded-xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-heading font-bold">Diagnostic Performance</h3>
                <p className="text-sm text-outline">Simulation success metrics over last 30 days</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-bold rounded-full bg-white border border-outline-variant/30 shadow-sm text-on-surface">Monthly</button>
                <button className="px-3 py-1 text-xs font-bold rounded-full text-outline hover:bg-surface-container-high transition-colors">Weekly</button>
              </div>
            </div>
            {/* Performance Chart - Dynamic Data */}
            <div className="relative h-48 w-full flex items-end justify-between gap-4 px-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-outline-variant/10 w-full"></div>
                <div className="border-t border-outline-variant/10 w-full"></div>
                <div className="border-t border-outline-variant/10 w-full"></div>
              </div>
              
              {progress.trend.length > 0 ? (
                progress.trend.slice(-6).map((point, i) => (
                  <div key={i} className="flex-1 bg-primary/10 h-full rounded-t-sm relative group">
                    <div 
                      className="absolute bottom-0 w-full bg-primary transition-all group-hover:opacity-80" 
                      style={{ height: `${point.score}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface p-1 rounded border border-outline-variant/30 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-sm">
                        {Math.round(point.score)}% - {point.caseTitle}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                [1, 2, 3, 4, 5, 6].map((_, i) => (
                  <div key={i} className="flex-1 bg-surface-container-high/30 h-full rounded-t-sm border-b border-outline-variant/10"></div>
                ))
              )}
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-mono font-bold text-outline uppercase tracking-wider px-2">
              {progress.trend.length > 0 ? (
                progress.trend.slice(-6).map((p, i) => (
                  <span key={i}>{new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                ))
              ) : (
                <span>NO DATA AVAILABLE</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Rewards & History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily Challenges Widget */}
          <div className="bg-gradient-to-br from-secondary to-secondary-container p-6 rounded-xl text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <h3 className="text-lg font-heading font-bold">Daily Streak</h3>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black">{user.currentStreak}</span>
              <span className="text-xl font-medium opacity-80">Days</span>
            </div>
            <div className="space-y-4">
              <div className="bg-black/10 p-3 rounded-lg border border-white/10">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-bold">Next Milestone</span>
                  <span>{user.totalXp % 1000} / 1000 XP</span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-1000" 
                    style={{ width: `${(user.totalXp % 1000) / 10}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 bg-white text-secondary py-2 rounded-lg font-bold text-sm hover:bg-secondary-fixed transition-colors active:scale-95">
              View Achievements
            </button>
          </div>

          {/* Recent History */}
          <div className="bg-surface-container-low p-6 rounded-xl">
            <h3 className="text-lg font-heading font-bold mb-6">Recent History</h3>
            <div className="space-y-6">
              {progress.recentAttempts.slice(0, 3).map((a) => (
                <div key={a.id} className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    a.status === 'completed' ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-secondary-fixed text-on-secondary-fixed"
                  )}>
                    <span className="material-symbols-outlined">{a.status === 'completed' ? 'check_circle' : 'pending'}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{a.caseTitle}</p>
                    <p className="text-[10px] font-mono font-bold text-outline uppercase tracking-wider">{a.score ? `${a.score}% Match` : 'In Progress'} • {new Date(a.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/attempts" className="w-full mt-8 py-3 text-sm font-bold text-outline border border-outline-variant/30 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center">
              Full Activity Log
            </Link>
          </div>
        </div>
      </div>

      {/* Kinetic Achievement Toast */}
      {user.totalXp > 2000 && (
        <div className="fixed bottom-8 right-8 bg-surface-container-lowest glass p-4 pr-12 rounded-xl shadow-2xl border border-primary/10 flex items-center gap-4 animate-bounce-subtle z-50">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Level Up</p>
            <p className="text-sm font-bold">Diagnostic Master II</p>
          </div>
          <button className="absolute top-2 right-2 text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </div>
  )
}
