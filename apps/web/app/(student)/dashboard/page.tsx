import { Metadata } from 'next'
import Link from 'next/link'
import { XpBar } from '@/components/gamification/XpBar'
import { BadgeGrid } from '@/components/gamification/BadgeGrid'
import { StreakTracker } from '@/components/gamification/StreakTracker'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Dashboard — CBL Platform',
}

// Mock Data content
const mockProgress = {
  name: 'Ashan Karunaratne',
  specialization: 'Internal Medicine',
  studyYear: 2,
  totalXp: 3240,
  casesCompleted: 47,
  totalCases: 120,
  casesThisWeek: 3,
  overallAverageScore: 78,
  scoreImprovement: 4,
  institutionRank: 4,
  institutionTotal: 312,
  rankImprovement: 2,
  streak: {
    currentStreak: 7,
    longestStreak: 14,
    lastActiveDate: new Date(),
    completedToday: true,
    last7Days: [
      { date: '2026-03-22', completed: true },
      { date: '2026-03-23', completed: true },
      { date: '2026-03-24', completed: true },
      { date: '2026-03-25', completed: true },
      { date: '2026-03-26', completed: true },
      { date: '2026-03-27', completed: true },
      { date: '2026-03-28', completed: true },
    ]
  },
  badges: [
    { badgeId: 'first_blood', unlockedAt: new Date(), isNew: false },
    { badgeId: 'week_warrior', unlockedAt: new Date(), isNew: true },
    { badgeId: 'cardiologist', unlockedAt: new Date(), isNew: false },
    { badgeId: 'neuro_master', unlockedAt: new Date(), isNew: false },
  ]
}

const mockInProgress = [
  {
    id: 'case-001',
    title: 'Acute Chest Pain — Possible MI',
    specialty: 'Cardiology',
    difficulty: 'intermediate' as const,
    progressPercent: 40,
    currentStep: 2,
    totalSteps: 5,
    xpReward: 320,
    minutesLeft: 15
  },
  {
    id: 'case-002',
    title: 'COPD Exacerbation — Acute Dyspnea',
    specialty: 'Respiratory',
    difficulty: 'beginner' as const,
    progressPercent: 20,
    currentStep: 1,
    totalSteps: 5,
    xpReward: 180,
    minutesLeft: 25
  }
]

// Internal Components content
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
      <div className="mt-2">
        {typeof delta === 'string' ? (
          <span className="text-[11px] font-bold font-mono text-text-secondary uppercase tracking-tight">
            {delta}
          </span>
        ) : (
          delta
        )}
      </div>
    </div>
  )
}

interface InProgressCaseCardProps {
  id: string
  title: string
  specialty: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  progressPercent: number
  currentStep: number
  totalSteps: number
  xpReward: number
  minutesLeft: number
}

function InProgressCaseCard({
  id,
  title,
  specialty,
  difficulty,
  progressPercent,
  currentStep,
  totalSteps,
  xpReward,
  minutesLeft
}: InProgressCaseCardProps) {
  const difficultyConfig = {
    beginner: { label: 'Beginner', color: 'var(--brand)', bg: 'bg-brand/5', border: 'border-brand/20' },
    intermediate: { label: 'Intermediate', color: '#D97706', bg: 'bg-amber-50', border: 'border-amber-200' },
    advanced: { label: 'Advanced', color: '#DC2626', bg: 'bg-red-50', border: 'border-red-200' }
  }

  const { color, label, bg, border } = difficultyConfig[difficulty]

  return (
    <Link 
      href={`/simulation/start/${id}`}
      className="bg-white border border-border-default rounded-xl p-[18px] flex flex-col gap-4 shadow-sm hover:-translate-y-0.5 hover:shadow-hover transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-brand uppercase tracking-widest border border-brand/20 px-2.5 py-1 rounded-md">
          {specialty}
        </span>
        <span 
          className={cn("text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full border", bg, border)}
          style={{ color }}
        >
          {label}
        </span>
      </div>

      <h3 className="text-sm font-bold text-text-primary leading-tight line-clamp-2 min-h-8">
        {title}
      </h3>

      <div className="space-y-2">
        <div className="w-full h-1 bg-surface-subtle rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%`, backgroundColor: color }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold font-mono uppercase tracking-tight">
          <span style={{ color: '#92400E' }}>⚡ +{xpReward} XP</span>
          <span className="text-text-tertiary">
            Step {currentStep}/{totalSteps} · ~{minutesLeft} min left
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function StudentDashboard() {
  const firstName = mockProgress.name.split(' ')[0]
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
          {mockProgress.specialization} · Year {mockProgress.studyYear} · 🔥 {mockProgress.streak.currentStreak}-day streak
        </p>
      </div>

      {/* SECTION 2: Stats HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Cases Completed" 
          value={mockProgress.casesCompleted} 
          suffix={`/${mockProgress.totalCases}`} 
          accent="brand" 
          delta={`↑ ${mockProgress.casesThisWeek} this week`} 
        />
        <StatCard 
          label="Avg Score" 
          value={`${mockProgress.overallAverageScore}%`} 
          accent="reward" 
          delta={`↑ ${mockProgress.scoreImprovement}% vs last week`} 
        />
        <StatCard 
          label="Current Streak" 
          accent="danger" 
          delta={<div className="-mt-1"><StreakTracker streak={mockProgress.streak} compact /></div>} 
        />
        <StatCard 
          label="Institution Rank" 
          value={`#${mockProgress.institutionRank}`} 
          suffix={`of ${mockProgress.institutionTotal}`} 
          accent="purple" 
          delta={`↑ ${mockProgress.rankImprovement} positions`} 
        />
      </div>

      {/* SECTION 3: XpBar */}
      <XpBar 
        totalXp={mockProgress.totalXp} 
        institutionRank={mockProgress.institutionRank}
        institutionTotal={mockProgress.institutionTotal}
      />

      {/* SECTION 4: Achievements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary uppercase tracking-tight">Achievements</h2>
          <span className="text-[11px] font-bold font-mono text-text-tertiary uppercase tracking-widest">
            {mockProgress.badges.length} unlocked
          </span>
        </div>
        <div className="bg-white border border-border-default rounded-xl p-5 shadow-sm">
          <BadgeGrid userBadges={mockProgress.badges} limit={10} />
          <div className="mt-5 pt-5 border-t border-border-default">
            <Link href="/progress" className="text-xs font-bold font-mono text-brand uppercase tracking-widest hover:underline">
              View all achievements →
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 5: Continue where you left off */}
      {mockInProgress.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary uppercase tracking-tight">Continue</h2>
            <span className="text-[11px] font-bold font-mono text-text-tertiary uppercase tracking-widest">
              {mockInProgress.length} in progress
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockInProgress.map(item => (
              <InProgressCaseCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

