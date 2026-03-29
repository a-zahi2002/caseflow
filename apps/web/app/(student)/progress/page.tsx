'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { XpBar } from '@/components/gamification/XpBar'
import { BadgeGrid } from '@/components/gamification/BadgeGrid'
import { cn } from '@/lib/utils'
import { getUser } from '@/lib/auth'
import { User, computeLevel } from '@caseflow/types'

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
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const totalXp = user?.totalXp ?? 0
  const maxXp = Math.max(...MOCK_PROGRESS.weeklyXp)
  const specialtyColors: Record<string, string> = {
    Cardiology: '#BE123C',
    Respiratory: 'var(--brand)',
    Neurology: '#7C3AED',
    Emergency: '#D97706',
    GI: '#0891B2',
  }

  const avatarColors = ['#3730A3', '#6D28D9', '#047857', '#1D4ED8', '#9A3412']

  if (!user) return null

  return (
    <div className="max-w-[880px] mx-auto p-6 flex flex-col gap-6">
      
      {/* SECTION 1: Header */}
      <div className="flex items-baseline gap-2.5">
        <h1 className="text-[22px] font-bold text-text-primary tracking-tight">Progress & Analytics</h1>
        <span className="text-xs font-bold font-mono text-text-tertiary uppercase tracking-widest">Last 30 days</span>
      </div>

      {/* SECTION 2: Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total XP" 
          value={totalXp.toLocaleString()} 
          accent="brand" 
          delta="+0 this month" 
        />
        <StatCard 
          label="Cases Completed" 
          value={MOCK_PROGRESS.casesCompleted} 
          suffix={`/ ${MOCK_PROGRESS.casesAttempted} attempted`} 
          accent="reward" 
        />
        <StatCard 
          label="Avg Score" 
          value={`${MOCK_PROGRESS.overallAverageScore}%`} 
          accent="danger" 
          delta="↑ 4% vs last month" 
        />
        <StatCard 
          label="Institution Rank" 
          value={`#${MOCK_PROGRESS.institutionRank}`} 
          suffix="of 312" 
          accent="purple" 
          delta="↑ 2 positions" 
        />
      </div>

      {/* SECTION 3: XpBar */}
      <XpBar 
        totalXp={totalXp} 
        institutionRank={MOCK_PROGRESS.institutionRank}
        institutionTotal={312}
      />

      {/* SECTION 4: Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Specialty Performance */}
        <div className="bg-white border border-border-default rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold font-mono text-text-tertiary uppercase tracking-[0.08em] block mb-4">
            Performance by specialty
          </span>
          <div className="flex flex-col gap-3">
            {MOCK_PROGRESS.specialtyPerformance.map((item) => (
              <div key={item.specialty} className="flex items-center gap-3">
                <span className="text-[11px] font-bold font-mono text-text-secondary w-[90px] shrink-0 truncate">
                  {item.specialty}
                </span>
                <div className="flex-1 h-2.5 bg-surface-subtle rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${item.averageScore}%`, 
                      backgroundColor: specialtyColors[item.specialty] || 'var(--brand)' 
                    }} 
                  />
                </div>
                <span className="text-[11px] font-bold font-mono text-text-secondary w-8 text-right">
                  {item.averageScore}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly XP Column Chart */}
        <div className="bg-white border border-border-default rounded-xl p-5 shadow-sm">
          <span className="text-[11px] font-bold font-mono text-text-tertiary uppercase tracking-[0.08em] block mb-4">
            Weekly XP earned
          </span>
          <div className="flex items-end gap-3 h-[140px]">
            {MOCK_PROGRESS.weeklyXp.map((xp, i) => {
              const isLatest = i === 3
              return (
                <div key={i} className="flex flex-col items-center flex-1 h-full gap-1.5 grayscale-[0.3] hover:grayscale-0 transition-all">
                  <span className="text-[9px] font-bold font-mono text-text-tertiary">{xp}</span>
                  <div className="flex-1 w-full flex flex-col justify-end">
                    <div 
                      className={cn(
                        "w-full rounded-t-md border transition-all duration-1000",
                        isLatest ? "bg-brand border-brand" : "bg-surface-muted border-border-default"
                      )}
                      style={{ height: `${(xp / maxXp) * 100}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold font-mono uppercase",
                    isLatest ? "text-brand" : "text-text-tertiary"
                  )}>
                    W{i + 1}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* SECTION 5: Leaderboard */}
      <div className="bg-white border border-border-default rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[13px] font-bold font-mono text-text-tertiary uppercase tracking-widest">Leaderboard</h2>
          <span className="text-[11px] font-bold font-mono text-text-tertiary uppercase tracking-tight opacity-70">
            University of Colombo · March 2026
          </span>
        </div>

        {/* Period Tabs */}
        <div className="flex items-center gap-1.5 mb-6">
          {['This Week', 'This Month', 'All Time'].map((tab) => (
            <button
              key={tab}
              className={cn(
                "px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-tight transition-all",
                tab === 'This Month' 
                  ? "bg-brand-light border-brand/30 text-brand-text" 
                  : "bg-white border-border-default text-text-secondary hover:bg-surface-subtle"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Board Rows */}
        <div className="flex flex-col">
          {MOCK_LEADERBOARD.map((userStats) => {
            const isTop3 = userStats.rank <= 3
            const rankColors = ['text-[#D97706]', 'text-[#9CA3AF]', 'text-[#A16207]']
            const avatarBgs = ['bg-[#D97706]', 'bg-[#9CA3AF]', 'bg-[#92400E]']
            
            return (
              <div 
                key={userStats.userId} 
                className={cn(
                  "flex items-center gap-3.5 py-3 transition-colors",
                  userStats.isCurrentUser ? "bg-brand-light border border-brand/20 rounded-xl px-2.5 mx-[-10px] my-1" : "border-b border-border-default last:border-none"
                )}
              >
                <div className={cn(
                  "w-8 text-center font-mono font-black text-xl leading-none",
                  isTop3 ? rankColors[userStats.rank - 1] : userStats.isCurrentUser ? "text-brand" : "text-text-tertiary"
                )}>
                  {userStats.rank}
                </div>
                
                <div className={cn(
                  "w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm",
                  userStats.isCurrentUser ? "bg-gradient-to-br from-brand to-[#0284C7]" : 
                  isTop3 ? avatarBgs[userStats.rank - 1] : "bg-neutral-600"
                )}
                style={!userStats.isCurrentUser && !isTop3 ? { backgroundColor: avatarColors[userStats.rank % avatarColors.length] } : {}}>
                  {userStats.avatarInitials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-[13px] font-bold truncate",
                      userStats.isCurrentUser ? "text-brand" : "text-text-primary"
                    )}>
                      {userStats.isCurrentUser ? user?.name : userStats.name}
                    </span>
                    {userStats.isCurrentUser && <span className="text-[10px] font-bold text-brand uppercase opacity-70">(You)</span>}
                  </div>
                  <div className="text-[10px] font-bold font-mono text-text-tertiary uppercase tracking-tight truncate">
                    {userStats.institution} · {userStats.isCurrentUser ? (user?.currentStreak || 0) : userStats.streak}-day streak
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={cn(
                    "text-[13px] font-bold font-mono leading-none",
                    userStats.isCurrentUser ? "text-brand" : "text-reward-text"
                  )}>
                    {userStats.isCurrentUser ? totalXp.toLocaleString() : userStats.totalXp.toLocaleString()} <span className="text-[10px] opacity-70">XP</span>
                  </div>
                  <div className="text-[10px] font-black font-mono text-text-tertiary uppercase mt-0.5">
                    Lv. {userStats.isCurrentUser ? computeLevel(totalXp).level : userStats.level}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION 6: AI Weak Areas */}
      <div className="bg-white border border-border-default rounded-xl p-5 shadow-sm">
        <div className="flex items-baseline gap-2 mb-4">
          <h2 className="text-[13px] font-bold font-mono text-text-tertiary uppercase tracking-widest">AI-identified weak areas</h2>
          <span className="text-[10px] font-bold font-mono text-text-tertiary uppercase opacity-50">Based on your last 30 cases</span>
        </div>

        <div className="flex flex-col gap-3">
          {MOCK_PROGRESS.weakAreas.map((area, i) => (
            <div 
              key={area.specialty}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all hover:translate-x-1",
                i === 0 ? "bg-[#FFF1F2] border-[#FECDD3]" : "bg-[#FFFBEB] border-[#FDE68A]"
              )}
            >
              <span className="text-2xl drop-shadow-sm">{area.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "text-[13px] font-bold uppercase tracking-tight",
                  i === 0 ? "text-[#BE123C]" : "text-[#D97706]"
                )}>
                  {area.specialty} — {area.issue}
                </h3>
                <p className="text-[11px] font-medium text-text-secondary leading-relaxed mt-0.5">
                  {area.suggestedFocus}
                </p>
                <div className="text-[10px] font-bold font-mono text-text-tertiary uppercase mt-1.5 tracking-widest opacity-70">
                  Affected {area.affectedCases} cases
                </div>
              </div>
              <Link 
                href={`/cases?specialty=${area.specialty.toLowerCase()}`}
                className="px-3.5 py-1.5 bg-white border border-border-default rounded-full text-[11px] font-bold text-text-secondary hover:border-brand hover:text-brand hover:bg-brand-light transition-all shadow-sm"
              >
                Practice →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 7: All Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary uppercase tracking-tight">All Badges</h2>
          <span className="text-[11px] font-bold font-mono text-text-tertiary uppercase tracking-widest">
            {MOCK_PROGRESS.badges.length} / 10 unlocked
          </span>
        </div>
        <div className="bg-white border border-border-default rounded-xl p-5 shadow-sm">
          <BadgeGrid userBadges={MOCK_PROGRESS.badges} />
        </div>
      </div>

    </div>
  )
}

