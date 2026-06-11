'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { useSession } from '@/lib/auth-client'
import { pageVariants, staggerChildren, slideUp } from '@/lib/motion'
import { 
  Activity, 
  Award, 
  Flame, 
  Clock, 
  ChevronRight,
  PlayCircle
} from 'lucide-react'
import type { ProgressStats, Case } from '@caseflow/types'

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse">
          <div className="h-5 w-5 bg-surface-2 rounded mb-4" />
          <div className="h-8 w-16 bg-surface-2 rounded mb-2" />
          <div className="h-4 w-24 bg-surface-2 rounded" />
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['progress-stats'],
    queryFn: () => api.get<ProgressStats>('/api/progress/stats').then(res => res.data),
  })

  const { data: recommendationsData } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get<Case[]>('/api/progress/recommendations').then(res => res.data),
  })

  const stats = statsData
  const recommendations = recommendationsData ?? []

  return (
    <motion.div 
      className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Doctor'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your clinical progress overview.
        </p>
      </div>

      {statsLoading ? (
        <StatsSkeleton />
      ) : stats ? (
        <motion.div variants={staggerChildren} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-4 text-brand">
              <div className="p-2 bg-brand/10 rounded-lg"><Activity className="w-5 h-5" /></div>
              <span className="font-semibold text-sm">Cases Completed</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.casesCompleted}</div>
            <div className="text-sm text-muted-foreground mt-1">{stats.casesInProgress} in progress</div>
          </motion.div>

          <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-xp/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-4 text-xp">
              <div className="p-2 bg-xp/10 rounded-lg"><Award className="w-5 h-5" /></div>
              <span className="font-semibold text-sm">Current Level</span>
            </div>
            <div className="text-3xl font-bold text-foreground">Lv. {stats.level}</div>
            <div className="text-sm text-muted-foreground mt-1">{stats.levelTitle}</div>
            
            {/* Mini XP Bar */}
            <div className="mt-4 h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-xp rounded-full transition-all duration-1000"
                style={{ width: `${stats.levelProgress}%` }}
              />
            </div>
          </motion.div>

          <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-warning/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-4 text-warning">
              <div className="p-2 bg-warning/10 rounded-lg"><Flame className="w-5 h-5" /></div>
              <span className="font-semibold text-sm">Day Streak</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground mt-1">Best: {stats.longestStreak} days</div>
          </motion.div>

          <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-4 text-success">
              <div className="p-2 bg-success/10 rounded-lg"><Clock className="w-5 h-5" /></div>
              <span className="font-semibold text-sm">Study Time</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{Math.round(stats.totalStudyMinutes / 60)}h {stats.totalStudyMinutes % 60}m</div>
            <div className="text-sm text-muted-foreground mt-1">Total time simulating</div>
          </motion.div>
        </motion.div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recommended for you</h2>
            <Link href="/cases" className="text-sm font-medium text-brand hover:text-brand/80 flex items-center gap-1">
              Browse library <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {recommendations.length > 0 ? recommendations.map((c) => (
              <div key={c.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-md transition-all group flex flex-col">
                <div className="h-2 bg-gradient-to-r from-brand to-accent" />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                      {c.specialty}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground bg-surface-2 px-2 py-1 rounded-md">
                      {c.difficulty}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2 line-clamp-1">{c.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{c.description}</p>
                  
                  <Link 
                    href={`/cases/${c.id}`}
                    className="mt-auto flex items-center justify-center gap-2 w-full py-2 bg-brand/10 text-brand font-medium rounded-lg hover:bg-brand hover:text-white transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Begin Case
                  </Link>
                </div>
              </div>
            )) : (
              <div className="sm:col-span-2 bg-surface-2 border border-border border-dashed rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Complete a case to get personalized recommendations.</p>
                <Link href="/cases" className="inline-block mt-4 text-brand font-medium">View all cases &rarr;</Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Recent Badges</h2>
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex flex-col gap-4">
              {/* Placeholder for badges */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-surface-2">
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">First Blood</p>
                  <p className="text-xs text-muted-foreground">Completed your first case</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-surface-2">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm">Getting Started</p>
                  <p className="text-xs text-muted-foreground">3-day streak</p>
                </div>
              </div>
            </div>
            <Link href="/settings/profile" className="block text-center mt-4 text-sm font-medium text-brand">
              View all badges
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
