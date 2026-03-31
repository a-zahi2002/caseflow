'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { XpBar } from '@/components/gamification/XpBar'
import { BadgeGrid } from '@/components/gamification/BadgeGrid'
import { cn } from '@/lib/utils'
import { getUser } from '@/lib/auth'
import { apiClient } from '@/lib/api-client'
import { Loader2 } from 'lucide-react'
import { User, computeLevel, StudentProgressData, XP_PER_LEVEL } from '@caseflow/types'

const MOCK_PROGRESS = {
  totalXp: 3240,
  casesCompleted: 47,
  casesAttempted: 52,
  overallAverageScore: 78,
  institutionRank: 4,
  weeklyXp: [180, 320, 240, 480],
  specialtyPerformance: [
    { specialty: 'Cardiology', averageScore: 84, casesCompleted: 12 },
    { specialty: 'Respiratory', averageScore: 78, casesCompleted: 9 },
    { specialty: 'Emergency', averageScore: 72, casesCompleted: 8 },
    { specialty: 'Neurology', averageScore: 65, casesCompleted: 11 },
    { specialty: 'GI', averageScore: 58, casesCompleted: 7 },
  ],
  weakAreas: [
    { 
      specialty: 'Neurology', 
      issue: 'Clinical Localisation',
      affectedCases: 4, 
      suggestedFocus: 'Focus on cranial nerve examination in neurology cases',
      emoji: '🧠'
    },
    { 
      specialty: 'Pharmacology', 
      issue: 'Drug Dosing',
      affectedCases: 3, 
      suggestedFocus: 'Review sepsis antibiotic protocol and dosing',
      emoji: '💊'
    },
  ],
  badges: [
    { badgeId: 'first_blood', unlockedAt: new Date(), isNew: false },
    { badgeId: 'week_warrior', unlockedAt: new Date(), isNew: true },
    { badgeId: 'cardiologist', unlockedAt: new Date(), isNew: false },
    { badgeId: 'neuro_master', unlockedAt: new Date(), isNew: false },
  ]
}

const MOCK_LEADERBOARD = [
  { rank: 1, userId: 'u1', name: 'Rashmi Perera', avatarInitials: 'RP', totalXp: 5820, level: 15, streak: 30, casesCompleted: 89, institution: 'University of Colombo', isCurrentUser: false },
  { rank: 2, userId: 'u2', name: 'Nimal Silva', avatarInitials: 'NS', totalXp: 4990, level: 13, streak: 14, casesCompleted: 76, institution: 'University of Colombo', isCurrentUser: false },
  { rank: 3, userId: 'u3', name: 'Priya Fernando', avatarInitials: 'PF', totalXp: 4310, level: 12, streak: 21, casesCompleted: 68, institution: 'University of Colombo', isCurrentUser: false },
  { rank: 4, userId: 'u4', name: 'Ashan Karunaratne', avatarInitials: 'AK', totalXp: 3240, level: 12, streak: 7, casesCompleted: 47, institution: 'University of Colombo', isCurrentUser: true },
  { rank: 5, userId: 'u5', name: 'Kasun Wijesinghe', avatarInitials: 'KW', totalXp: 2980, level: 10, streak: 5, casesCompleted: 41, institution: 'University of Colombo', isCurrentUser: false },
  { rank: 6, userId: 'u6', name: 'Shalini Mendis', avatarInitials: 'SM', totalXp: 2650, level: 9, streak: 3, casesCompleted: 36, institution: 'University of Colombo', isCurrentUser: false },
]

// Internal StatCard component content
function StatCard({ label, value, suffix, accent, delta }: {
  label: string
  value: string | number
  suffix?: string
  accent: 'brand' | 'reward' | 'danger' | 'purple'
  delta?: string
}) {
  const accentColors = {
    brand: 'bg-brand',
    reward: 'bg-reward',
    danger: 'bg-danger',
    purple: 'bg-[#7C3AED]'
  }

  return (
    <div className="relative bg-white border border-border-default rounded-xl p-4 shadow-sm overflow-hidden h-28 flex flex-col justify-between">
      <div className={cn("absolute top-0 left-0 right-0 h-[3px]", accentColors[accent])} />
      <div>
        <span className="text-[10px] font-bold font-mono text-text-tertiary uppercase tracking-[0.08em] block mb-1">
          {label}
        </span>
        <div className="flex items-baseline leading-none">
          <span className="text-2xl font-bold text-text-primary">{value}</span>
          {suffix && <span className="text-[13px] font-medium text-text-secondary ml-1">{suffix}</span>}
        </div>
      </div>
      {delta && <span className="text-[11px] font-bold font-mono text-text-secondary uppercase tracking-tight">{delta}</span>}
    </div>
  )
}

export default function ProgressPage() {
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
        console.error('Failed to load progress data', err)
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-mono font-bold text-outline uppercase tracking-widest animate-pulse">Analyzing your progress...</p>
    </div>
  )

  if (!progress) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
       <span className="material-symbols-outlined text-5xl text-error mb-2">error</span>
       <p className="text-error font-heading font-bold uppercase tracking-widest">Failed to load progress data</p>
       <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20">Retry</button>
    </div>
  )

  const { user, metrics } = progress
  const { level, currentLevelXp, nextLevelXp, progressPercent } = computeLevel(user.totalXp)

  return (
    <div className="flex-1 p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Hero Profile Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-surface-container-lowest shadow-xl bg-surface-container">
              <div className="w-full h-full flex items-center justify-center text-5xl font-heading font-black text-primary bg-primary-container">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg ring-2 ring-white">Lvl {level}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-heading font-extrabold tracking-tight text-on-surface">{user.name}</h1>
              <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">Senior Resident</span>
            </div>
            <p className="text-on-surface-variant max-w-xl font-sans leading-relaxed">
              Specializing in Clinical Diagnostics. Ranked in the top 5% of the clinical cohort for diagnostic accuracy in high-pressure simulations.
            </p>
            <div className="flex gap-6 pt-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider font-bold">Success Rate</span>
                <span className="text-xl font-heading font-bold text-primary">{Math.round(metrics.overallAvgScore)}%</span>
              </div>
              <div className="w-px h-8 bg-outline-variant/30 self-center"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider font-bold">Cases Solved</span>
                <span className="text-xl font-heading font-bold text-primary">{metrics.totalCompleted}</span>
              </div>
              <div className="w-px h-8 bg-outline-variant/30 self-center"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider font-bold">Total XP</span>
                <span className="text-xl font-heading font-bold text-primary">{user.totalXp.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 bg-surface-container-low p-6 rounded-2xl relative overflow-hidden group border border-outline-variant/20">
          <div className="relative z-10">
            <h3 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-4 font-bold">Next Milestone</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-heading font-extrabold text-secondary">{nextLevelXp - (XP_PER_LEVEL[level-1] || 0) - currentLevelXp}</span>
              <span className="text-on-surface-variant text-sm font-sans font-bold">XP to Level {level + 1}</span>
            </div>
            <div className="mt-4 w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-secondary h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(133,83,0,0.3)]" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-secondary/10 group-hover:scale-110 transition-transform duration-500" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
        </div>
      </section>

      {/* Bento Grid Layout for Achievements & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Radar */}
        <div className="lg:col-span-1 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 relative">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-heading font-bold text-on-surface">Clinical Proficiency</h2>
            <span className="material-symbols-outlined text-outline">insights</span>
          </div>
          <div className="aspect-square relative flex items-center justify-center rounded-full border border-outline-variant/20 bg-[radial-gradient(circle,#bcc9c6_1px,transparent_1px)] bg-[size:24px_24px]">
            {/* Simulated Radar Shape */}
            <div className="absolute inset-10 bg-primary/10 border-2 border-primary/40 rotate-45" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}></div>
            <div className="absolute inset-16 bg-primary/20 border border-primary/50 rotate-12" style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}></div>
            {/* Monospace Labels */}
            <span className="absolute top-2 font-mono text-[9px] text-primary uppercase font-black tracking-tighter">Diagnostic (92)</span>
            <span className="absolute bottom-2 font-mono text-[9px] text-primary uppercase font-black tracking-tighter">Emergency (64)</span>
            <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 font-mono text-[9px] text-primary uppercase font-black tracking-tighter">Surgical (78)</span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 font-mono text-[9px] text-primary uppercase font-black tracking-tighter">Communicative (88)</span>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-sans font-bold text-on-surface-variant">Avg Diagnostic Speed</span>
              <span className="font-mono text-sm text-primary font-black">1.2s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-sans font-bold text-on-surface-variant">Clinical Accuracy</span>
              <span className="font-mono text-sm text-primary font-black">94.8%</span>
            </div>
          </div>
        </div>

        {/* Badge Gallery */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-heading font-bold text-on-surface">Distinction Badges</h2>
            <button className="text-primary text-sm font-bold hover:underline">View All {user.badges.length}</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 flex-1">
             {user.badges.slice(0, 9).map((b) => (
                <div key={b.badgeId} className="flex flex-col items-center gap-3 group">
                   <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed group-hover:scale-110 transition-transform shadow-sm">
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                   </div>
                   <div className="text-center">
                      <p className="text-xs font-heading font-bold text-on-surface truncate max-w-[80px]">{b.badgeId.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                      <p className="text-[9px] font-mono text-outline uppercase font-bold tracking-tighter">Unlocked</p>
                   </div>
                </div>
             ))}
             <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-outline-variant text-outline-variant hover:border-primary hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">more_horiz</span>
             </div>
          </div>
        </div>
      </div>

      {/* Specialty Breakdown */}
      <section className="space-y-6">
        <h2 className="text-2xl font-heading font-extrabold text-on-surface tracking-tight">Competency Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 space-y-4">
              <h3 className="text-sm font-heading font-bold uppercase tracking-widest text-outline">Clinical Specialty Performance</h3>
              <div className="space-y-4">
                {metrics.specialtyBreakdown.map((s) => (
                  <div key={s.specialty} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono font-bold uppercase tracking-wider">
                      <span>{s.specialty}</span>
                      <span className="text-primary">{Math.round(s.avgScore)}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,104,95,0.2)]" 
                        style={{ width: `${s.avgScore}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 flex flex-col justify-center items-center text-center">
              <span className="material-symbols-outlined text-6xl text-secondary/20 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <h3 className="text-2xl font-heading font-black text-on-surface mb-2">{user.currentStreak} Day Streak</h3>
              <p className="text-sm text-on-surface-variant font-sans max-w-[250px] mb-6">
                Consistency is key to clinical mastery. You've completed cases for {user.currentStreak} consecutive days!
              </p>
              <div className="flex gap-2">
                 {[1,2,3,4,5,6,7].map(d => (
                    <div key={d} className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold",
                      d <= (user.currentStreak % 8) ? "bg-secondary text-white shadow-md" : "bg-surface-container-high text-outline"
                    )}>
                      {['M','T','W','T','F','S','S'][d-1]}
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Milestone Timeline */}
      <section className="space-y-6 pb-20">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-on-surface tracking-tight">Milestone Timeline</h2>
            <p className="text-sm text-on-surface-variant font-sans opacity-80">Recent progression events and earned clinical rewards.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-mono font-black rounded-full uppercase tracking-widest border border-tertiary/20 shadow-sm">
              Level {level} Achieved
            </span>
          </div>
        </div>
        <div className="space-y-0 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[2px] before:bg-outline-variant/20">
          {/* Mock Timeline Events */}
          <div className="relative pl-16 py-4 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-primary border-4 border-surface group-hover:scale-150 transition-transform z-10 shadow-sm"></div>
            <div className="bg-surface-container-low p-5 rounded-2xl border border-transparent hover:border-primary/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm group-hover:shadow-md">
              <div className="flex gap-4">
                <div className="bg-surface-container-lowest p-3 rounded-xl flex items-center justify-center h-fit shadow-inner ring-1 ring-black/5">
                  <span className="material-symbols-outlined text-primary">clinical_notes</span>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-on-surface">Completed Simulation: Cardiac Emergency</h4>
                  <p className="text-sm text-on-surface-variant font-sans opacity-80">Stabilized patient with acute myocardial infarction.</p>
                  <span className="text-[10px] font-mono text-outline uppercase mt-2 block font-bold">2 hours ago</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black text-primary">+450 XP</span>
                <span className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-[9px] font-mono font-black uppercase tracking-tighter border border-secondary/20 shadow-sm">Advanced Diagnostician</span>
              </div>
            </div>
          </div>
          <div className="relative pl-16 py-4 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-secondary border-4 border-surface group-hover:scale-150 transition-transform z-10 shadow-sm"></div>
            <div className="bg-secondary-container/10 p-5 rounded-2xl border border-secondary/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-secondary/5 to-transparent"></div>
              <div className="flex gap-4 relative z-10">
                <div className="bg-secondary p-3 rounded-xl flex items-center justify-center h-fit text-white shadow-lg">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>keyboard_double_arrow_up</span>
                </div>
                <div>
                  <h4 className="font-heading font-black text-secondary text-lg">PROMOTED TO LEVEL {level}</h4>
                  <p className="text-sm text-on-surface-variant font-sans font-medium">Unlocked: Advanced Neurological Simulation Modules.</p>
                  <span className="text-[10px] font-mono text-outline uppercase mt-2 block font-bold">Yesterday</span>
                </div>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <span className="font-mono text-xs font-black text-secondary uppercase tracking-widest">Rank Up</span>
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined">military_tech</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


