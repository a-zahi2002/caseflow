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
    <div className="max-w-[1000px] mx-auto p-8 flex flex-col gap-10">
      {/* SECTION 1: Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-1 tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-[13px] font-bold font-mono text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">{user.role}</span>
            <span>{user.institution || 'Medical Institute'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 shadow-sm">
              <Flame className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-sm font-bold text-red-700">{user.currentStreak} Day Streak</span>
           </div>
        </div>
      </div>

      {/* SECTION 2: Stats HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          label="Cases Completed" 
          value={metrics.totalCompleted} 
          accent="brand" 
          icon={<Award className="w-5 h-5" />}
          delta={metrics.totalCompleted > 0 ? "Building clinical experience" : "Start your clinical journey"} 
        />
        <StatCard 
          label="Overall Score" 
          value={Math.round(metrics.overallAvgScore)} 
          suffix="%" 
          accent="reward" 
          icon={<TrendingUp className="w-5 h-5" />}
          delta={metrics.overallAvgScore >= 75 ? "Excellent proficiency" : "Keep practicing"} 
        />
        <StatCard 
          label="Total Attempts" 
          value={metrics.totalAttempts}
          accent="danger" 
          icon={<Flame className="w-5 h-5" />}
          delta="Keep pushing your limits"
        />
        <StatCard 
          label="Learning Goal" 
          value="75" 
          suffix="%" 
          accent="purple" 
          icon={<Target className="w-5 h-5" />}
          delta="Target medical proficiency" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8">
           {/* SECTION 3: Progress Tracker */}
           <div className="bg-white border border-border-default rounded-3xl p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-text-primary tracking-tight">Active Progress</h2>
                <Link href="/progress" className="text-xs font-bold text-brand uppercase tracking-widest hover:underline">Full Analytics →</Link>
             </div>
             <XpBar 
               totalXp={user?.totalXp ?? 0} 
               institutionRank={0}
               institutionTotal={500}
             />
           </div>

           {/* SECTION 4: Recent Activity */}
           {progress?.recentAttempts && progress.recentAttempts.length > 0 ? (
             <div className="space-y-4">
                <h2 className="text-xs font-bold font-mono text-text-tertiary uppercase tracking-[0.2em]">Recent Encounters</h2>
                <div className="grid gap-3">
                  {progress.recentAttempts.slice(0, 3).map((a) => (
                    <Link 
                      key={a.id} 
                      href={a.status === 'completed' ? `/attempts/${a.id}/result` : `/simulation/run/${a.id}`}
                      className="group bg-white border border-border-default rounded-2xl p-4 flex items-center justify-between transition-all hover:border-brand/40 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg border border-slate-100 group-hover:bg-brand/5 transition-colors">
                          {a.status === 'completed' ? '✅' : '⏳'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors">{a.caseTitle}</h4>
                          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tight">{a.specialty} · {new Date(a.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm font-bold text-text-primary">{a.score ?? '--'}%</div>
                         <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter">{a.status}</div>
                      </div>
                    </Link>
                  ))}
                </div>
             </div>
           ) : (
             <div className="bg-white border border-dashed border-border-default rounded-3xl p-16 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl shadow-inner mb-2">
                  🎯
                </div>
                <div className="max-w-xs space-y-2">
                  <h3 className="text-xl font-bold text-text-primary tracking-tight">Ready to begin?</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">Explore standardized medical cases and start building your diagnostic expertise today.</p>
                </div>
                <Link 
                  href="/cases"
                  className="mt-4 px-8 py-3 bg-brand text-white text-[13px] font-bold rounded-xl hover:bg-brand-hover transition-all shadow-xl shadow-brand/20 active:translate-y-0.5"
                >
                  Browse Case Library
                </Link>
              </div>
           )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <BadgeGrid userBadges={user?.badges || []} />
           <StreakTracker 
             streak={{ 
               currentStreak: user.currentStreak, 
               longestStreak: user.longestStreak, 
               last7Days: [], // This could be calculated from attempts if needed
               lastActiveDate: user.lastActiveDate ? new Date(user.lastActiveDate) : new Date(), 
               completedToday: user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() === new Date().toDateString() : false
             }} 
           />
        </div>
      </div>
    </div>
  )
}
