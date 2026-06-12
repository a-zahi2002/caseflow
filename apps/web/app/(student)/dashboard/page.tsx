'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getUser } from '@/lib/auth'
import { apiClient } from '@/lib/api-client'
import { Loader2 } from 'lucide-react'
import type { User, StudentProgressData } from '@caseflow/types'

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-ping opacity-20"></div>
      </div>
      <p className="text-sm font-black text-on-surface-variant uppercase tracking-widest animate-pulse">Personalizing your experience...</p>
    </div>
  )

  if (!progress) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in zoom-in duration-500">
       <div className="w-20 h-20 bg-error-container/30 rounded-3xl flex items-center justify-center text-error border border-error/10 shadow-lg">
         <span className="material-symbols-outlined text-4xl">person_off</span>
       </div>
       <div>
         <h1 className="text-2xl font-heading font-black">Profile Sync Error</h1>
         <p className="text-on-surface-variant max-w-sm mt-2">Failed to load your clinical profile. Please verify your connection.</p>
       </div>
       <button onClick={() => window.location.reload()} className="px-8 py-3 bg-primary text-on-primary rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">Retry Sync</button>
    </div>
  )

  const user = progress.user
  const firstName = user.name.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const metrics = progress.metrics

  return (
    <div className="p-4 md:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* High-fidelity Dashboard Banner */}
      <section className="relative h-56 md:h-72 w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 border border-outline-variant/20 group bg-surface-container-high">
        <div className="absolute inset-0 bg-gradient-to-tr from-surface/90 via-surface/40 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,var(--color-primary-container),transparent_60%)] opacity-20 z-10"></div>
        
        <div className="relative z-20 h-full flex flex-col justify-end p-8 md:p-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 glass rounded-full mb-6 border border-primary/20 backdrop-blur-md self-start transform group-hover:scale-105 transition-transform">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(0,104,95,0.8)]"></span>
            <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest">Active Clinical Session</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black text-on-surface tracking-tighter leading-none mb-3">
            Clinical <span className="text-primary italic font-serif">Intelligence</span> Hub
          </h1>
          <p className="text-base md:text-xl font-sans font-medium text-on-surface-variant max-w-2xl opacity-90">
            Augmenting medical expertise through high-fidelity AI-driven patient encounters.
          </p>
        </div>
      </section>

      {/* Welcome Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-2 md:px-0 relative">
        <div className="absolute -top-20 right-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-heading font-black tracking-tight text-on-surface mb-3">
            {greeting}, {firstName}
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            {metrics.totalAttempts === 0 ? (
              "Welcome to your clinical residency training. Select a case below to begin your professional journey and build your portfolio."
            ) : (
              <>
                You've completed <strong className="text-primary">{Math.round(metrics.totalCompleted / (metrics.totalCompleted + 5) * 100)}%</strong> of your targets. 
                Your diagnostic accuracy currently stands at <strong className="text-primary">{Math.round(metrics.overallAvgScore)}%</strong> across all cases.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-4">
          <div className="flex-1 sm:flex-none bg-surface-container-lowest glass p-5 rounded-2xl border border-outline-variant/20 min-w-[160px] shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="font-mono text-[10px] uppercase text-on-surface-variant mb-2 font-black tracking-widest relative z-10">Current Rank</p>
            <div className="flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">military_tech</span>
              <p className="text-xl font-heading font-black text-primary truncate">
                {user.totalXp < 500 ? 'Med Student' : 
                 user.totalXp < 1500 ? 'Junior Res' : 
                 user.totalXp < 3000 ? 'Senior Res' : 
                 'Chief Fellow'}
              </p>
            </div>
          </div>
          <div className="flex-1 sm:flex-none bg-surface-container-lowest glass p-5 rounded-2xl border border-outline-variant/20 min-w-[160px] shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="font-mono text-[10px] uppercase text-on-surface-variant mb-2 font-black tracking-widest relative z-10">Avg Accuracy</p>
            <div className="flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">analytics</span>
              <p className="text-2xl font-heading font-black text-secondary">
                {metrics.totalCompleted > 0 ? `${Math.round(metrics.overallAvgScore)}%` : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout Grid: Bento Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Case Cards (Left Column) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-heading font-black">Active Case Files</h3>
            <Link href="/cases" className="text-primary text-sm font-bold hover:text-primary-container transition-colors flex items-center gap-1 group">
              Browse Catalog <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {progress.recentAttempts.length > 0 ? (
              progress.recentAttempts.slice(0, 2).map((attempt, i) => (
                <div 
                  key={attempt.id} 
                  className="bg-surface-container-lowest glass p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/20 relative overflow-hidden group flex flex-col"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Decorative corner */}
                  <div className={`absolute top-0 right-0 w-24 h-24 ${attempt.status === 'completed' ? 'bg-tertiary/10' : 'bg-secondary/10'} rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <span className="font-mono text-[10px] text-on-surface-variant px-2.5 py-1 bg-surface-container rounded-lg uppercase font-black tracking-widest border border-outline-variant/30">ID: {attempt.id.slice(0, 8)}</span>
                      <h4 className="text-xl font-heading font-black mt-4 leading-tight group-hover:text-primary transition-colors">{attempt.caseTitle}</h4>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-widest shadow-sm",
                      attempt.status === 'completed' ? "bg-tertiary text-on-tertiary" : "bg-secondary text-on-secondary"
                    )}>
                      {attempt.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-on-surface-variant mb-8 leading-relaxed flex-1 relative z-10">
                    <strong className="text-on-surface">{attempt.specialty}</strong> clinical scenario. Progress actively tracked and synced with the pulse analytics engine.
                  </p>
                  
                  <div className="flex items-center justify-between relative z-10 mt-auto pt-6 border-t border-outline-variant/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[16px]">{attempt.status === 'completed' ? 'verified' : 'pending'}</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">{attempt.score ? `${attempt.score}% Match` : 'In Progress'}</span>
                    </div>
                    <Link 
                      href={attempt.status === 'completed' ? `/attempts/${attempt.id}/result` : `/simulation/run/${attempt.id}`}
                      className="bg-surface-container-high text-on-surface px-5 py-2.5 rounded-xl text-sm font-heading font-black hover:bg-primary hover:text-on-primary active:scale-95 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      {attempt.status === 'completed' ? 'Review' : 'Resume'} 
                      <span className="material-symbols-outlined text-[18px]">
                        {attempt.status === 'completed' ? 'visibility' : 'play_arrow'}
                      </span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 bg-surface-container-lowest glass p-16 rounded-[2rem] border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-outline">clinical_notes</span>
                </div>
                <h4 className="text-2xl font-heading font-black mb-3">No Active Cases</h4>
                <p className="text-base text-on-surface-variant max-w-sm mb-8">Start your first clinical simulation to begin building your professional profile.</p>
                <Link href="/cases" className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-heading font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Browse Catalog
                </Link>
              </div>
            )}
          </div>

          {/* Performance Analytics */}
          <div className="bg-surface-container-lowest glass p-8 md:p-10 rounded-[2rem] border border-outline-variant/20 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container/30 pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 relative z-10">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-2xl font-heading font-black tracking-tight">Diagnostic Performance</h3>
                <p className="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-widest mt-1">Simulation success metrics (30 days)</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 text-xs font-bold rounded-full bg-surface text-on-surface shadow-sm border border-outline-variant/20">Monthly</button>
                <button className="px-4 py-1.5 text-xs font-bold rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">Weekly</button>
              </div>
            </div>
            
            {/* Performance Chart - Dynamic Data */}
            <div className="relative h-56 w-full flex items-end justify-between gap-2 sm:gap-6 px-2 sm:px-4 z-10">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                {[1, 2, 3, 4].map((v) => <div key={v} className="border-t border-outline-variant/10 w-full"></div>)}
              </div>
              
              {progress.trend.length > 0 ? (
                progress.trend.slice(-6).map((point, i) => (
                  <div key={i} className="flex-1 bg-surface-container h-full rounded-t-xl relative group overflow-hidden border border-outline-variant/10 border-b-0">
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary-container transition-all duration-1000 group-hover:brightness-110" 
                      style={{ height: `${point.score}%`, animationDelay: `${i * 100}ms` }}
                    >
                      <div className="absolute top-0 w-full h-1 bg-white/30"></div>
                      
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[10px] font-mono font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl pointer-events-none">
                        {Math.round(point.score)}% - {point.caseTitle}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                [1, 2, 3, 4, 5, 6].map((_, i) => (
                  <div key={i} className="flex-1 bg-surface-container-high/30 h-full rounded-t-xl border border-outline-variant/10 border-b-0"></div>
                ))
              )}
            </div>
            <div className="flex justify-between mt-4 text-[9px] sm:text-[10px] font-mono font-black text-on-surface-variant uppercase tracking-widest px-2 sm:px-4 relative z-10">
              {progress.trend.length > 0 ? (
                progress.trend.slice(-6).map((p, i) => (
                  <span key={i} className="truncate w-12 text-center sm:w-auto">{new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                ))
              ) : (
                <span className="w-full text-center">NO DATA AVAILABLE</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Rewards & History */}
        <div className="lg:col-span-4 space-y-8">
          {/* Daily Challenges Widget */}
          <div className="bg-gradient-to-br from-secondary to-secondary-container p-8 rounded-[2rem] text-on-secondary shadow-xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <h3 className="text-xl font-heading font-black">Daily Streak</h3>
            </div>
            
            <div className="flex items-baseline gap-2 mb-8 relative z-10">
              <span className="text-6xl font-heading font-black tracking-tighter">{user.currentStreak}</span>
              <span className="text-lg font-mono font-bold opacity-80 uppercase tracking-widest">Days</span>
            </div>
            
            <div className="space-y-5 relative z-10">
              <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                <div className="flex justify-between text-xs font-mono font-bold uppercase tracking-widest mb-3 opacity-90">
                  <span>Next Milestone</span>
                  <span>{user.totalXp % 1000} / 1000 XP</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-1000 ease-out relative" 
                    style={{ width: `${(user.totalXp % 1000) / 10}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-8 bg-white text-secondary py-3.5 rounded-xl font-heading font-black text-sm hover:bg-surface-container transition-colors active:scale-95 shadow-md relative z-10">
              View Achievements
            </button>
          </div>

          {/* Recent History */}
          <div className="bg-surface-container-lowest glass p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm relative overflow-hidden">
            <h3 className="text-xl font-heading font-black mb-8 tracking-tight">Recent History</h3>
            <div className="space-y-6">
              {progress.recentAttempts.slice(0, 3).map((a) => (
                <div key={a.id} className="flex gap-4 group cursor-pointer">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105",
                    a.status === 'completed' ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-secondary-fixed text-on-secondary-fixed"
                  )}>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {a.status === 'completed' ? 'check_circle' : 'pending'}
                    </span>
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-heading font-bold truncate group-hover:text-primary transition-colors">{a.caseTitle}</p>
                    <p className="text-[10px] font-mono font-bold text-on-surface-variant uppercase tracking-wider mt-1.5">
                      <span className={a.score ? 'text-primary' : ''}>{a.score ? `${a.score}% Match` : 'In Progress'}</span> • {new Date(a.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/attempts" className="w-full mt-10 py-4 text-xs font-heading font-black text-on-surface-variant border border-outline-variant/30 rounded-2xl hover:bg-surface-container hover:text-on-surface transition-all flex items-center justify-center uppercase tracking-widest group">
              Full Activity Log
              <span className="material-symbols-outlined text-[16px] ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Kinetic Achievement Toast */}
      {user.totalXp > 2000 && (
        <div className="fixed bottom-8 right-8 bg-surface-container-lowest glass p-5 pr-14 rounded-2xl shadow-2xl border border-primary/20 flex items-center gap-5 animate-bounce-subtle z-50">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white shadow-lg transform rotate-12 hover:rotate-0 transition-transform">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          </div>
          <div>
            <p className="text-[10px] font-mono font-black text-primary uppercase tracking-widest mb-1">Level Up</p>
            <p className="text-base font-heading font-black text-on-surface">Diagnostic Master II</p>
          </div>
          <button className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}
    </div>
  )
}
