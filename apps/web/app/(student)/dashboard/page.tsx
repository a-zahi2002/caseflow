'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { XpBar } from '@/components/gamification/XpBar'
import { BadgeGrid } from '@/components/gamification/BadgeGrid'
import { StreakTracker } from '@/components/gamification/StreakTracker'
import { cn } from '@/lib/utils'
import { getUser } from '@/lib/auth'
import type { User } from '@caseflow/types'

// Mock Data for metrics that aren't yet in the DB
const MOCK_STATS = {
  specialization: 'Medical Student',
  studyYear: 3,
  totalXp: 0,
  casesCompleted: 0,
  totalCases: 100,
  casesThisWeek: 0,
  overallAverageScore: 0,
  scoreImprovement: 0,
  institutionRank: 0,
  institutionTotal: 500,
  rankImprovement: 0,
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: new Date(),
    completedToday: false,
    last7Days: []
  },
  badges: []
}

const mockInProgress: any[] = [] // Empty for new users

// Internal Components
interface StatCardProps {
  label: string
  value?: string | number
  suffix?: string
  accent: 'brand' | 'reward' | 'danger' | 'purple'
  delta?: React.ReactNode
}

function StatCard({ label, value, suffix, accent, delta }: StatCardProps) {
  const accentColors = {
    brand: 'bg-brand',
    reward: 'bg-reward',
    danger: 'bg-danger',
    purple: 'bg-[#7C3AED]'
  }

  return (
    <div className="relative bg-white border border-border-default rounded-xl p-4 shadow-sm overflow-hidden flex flex-col justify-between h-28">
      <div className={cn("absolute top-0 left-0 right-0 h-[3px]", accentColors[accent])} />
      <div>
        <span className="text-[10px] font-bold font-mono text-text-tertiary uppercase tracking-wider block mb-1">
          {label}
        </span>
        <div className="flex items-baseline leading-none">
          <span className="text-2xl font-bold text-text-primary">{value}</span>
          {suffix && <span className="text-[13px] font-medium text-text-secondary ml-1">{suffix}</span>}
        </div>
      </div>
      <div className="mt-2 text-xs font-medium text-text-tertiary">
        {delta}
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  if (!user) return (
    <div className="flex items-center justify-center p-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  )

  const firstName = user.name.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-[880px] mx-auto p-6 flex flex-col gap-8">
      {/* SECTION 1: Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-[13px] font-bold font-mono text-text-secondary uppercase tracking-widest">
          {user.institution || 'Medical Student'} · 🔥 {MOCK_STATS.streak.currentStreak}-day streak
        </p>
      </div>

      {/* SECTION 2: Stats HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Cases Completed" 
          value={MOCK_STATS.casesCompleted} 
          suffix={`/${MOCK_STATS.totalCases}`} 
          accent="brand" 
          delta="Start your first case" 
        />
        <StatCard 
          label="Avg Score" 
          value={`${MOCK_STATS.overallAverageScore}%`} 
          accent="reward" 
          delta="No attempts yet" 
        />
        <StatCard 
          label="Current Streak" 
          value={MOCK_STATS.streak.currentStreak}
          suffix="days"
          accent="danger" 
          delta="Keep it up!"
        />
        <StatCard 
          label="Institution Rank" 
          value="--" 
          suffix={`of ${MOCK_STATS.institutionTotal}`} 
          accent="purple" 
          delta="Join the leaderboard" 
        />
      </div>

      {/* EMPTY STATE OR CONTINUE SECTION */}
      <div className="bg-white border border-dashed border-border-default rounded-2xl p-12 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-surface-subtle rounded-full flex items-center justify-center text-2xl">
          🎯
        </div>
        <div className="max-w-xs">
          <h2 className="text-lg font-bold text-text-primary mb-1">Ready to start?</h2>
          <p className="text-sm text-text-secondary">Explore medical cases and start building your clinical skills today.</p>
        </div>
        <Link 
          href="/cases"
          className="px-6 py-2.5 bg-brand text-white text-sm font-bold rounded-full hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
        >
          Browse Cases
        </Link>
      </div>

      {/* SECTION 3: XpBar */}
      <XpBar 
        totalXp={MOCK_STATS.totalXp} 
        institutionRank={0}
        institutionTotal={MOCK_STATS.institutionTotal}
      />
    </div>
  )
}
