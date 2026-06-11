'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api-client'
import { pageVariants, staggerChildren, slideUp } from '@/lib/motion'
import { useSession } from '@/lib/auth-client'
import { Trophy, Award, Medal, TrendingUp, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type LeaderboardEntry = {
  rank: number
  userId: string
  name: string
  level: number
  xp: number
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1: return <Trophy className="w-6 h-6 text-[#F59E0B]" />
    case 2: return <Medal className="w-6 h-6 text-[#94A3B8]" />
    case 3: return <Medal className="w-6 h-6 text-[#B45309]" />
    default: return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{rank}</span>
  }
}

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const [period, setPeriod] = useState('alltime')

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const res = await api.get<LeaderboardEntry[]>(`/api/progress/leaderboard?period=${period}`)
      return res.data
    },
  })

  // Dummy current user rank for demo
  const currentUserRank = leaderboard?.find(e => e.userId === session?.user?.id)

  return (
    <motion.div 
      className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="w-8 h-8 text-brand" /> Global Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">
            See how you stack up against medical students worldwide.
          </p>
        </div>

        <div className="flex bg-surface border border-border rounded-lg p-1 shrink-0">
          {[
            { id: 'weekly', label: 'This Week' },
            { id: 'monthly', label: 'This Month' },
            { id: 'alltime', label: 'All Time' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all',
                period === p.id ? 'bg-surface-2 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-2 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
              <div className="col-span-6 sm:col-span-7">Student</div>
              <div className="col-span-2 text-center">Level</div>
              <div className="col-span-2 text-right">XP</div>
            </div>

            <div className="flex-1 divide-y divide-border">
              {isLoading ? (
                <div className="p-6 space-y-4 animate-pulse">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 bg-surface-2 rounded-md" />
                      <div className="flex-1 h-8 bg-surface-2 rounded-md" />
                      <div className="w-12 h-8 bg-surface-2 rounded-md" />
                      <div className="w-16 h-8 bg-surface-2 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : leaderboard?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No ranking data available yet.
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={period}
                    variants={staggerChildren}
                    initial="initial"
                    animate="animate"
                  >
                    {leaderboard?.map((entry) => {
                      const isMe = entry.userId === session?.user?.id
                      
                      return (
                        <motion.div 
                          key={entry.userId}
                          variants={slideUp}
                          className={cn(
                            "grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-surface-2/50",
                            isMe ? "bg-brand/5 relative" : ""
                          )}
                        >
                          {isMe && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand" />}
                          
                          <div className="col-span-2 sm:col-span-1 flex justify-center">
                            {getRankIcon(entry.rank)}
                          </div>
                          
                          <div className="col-span-6 sm:col-span-7 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand/80 to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {entry.name?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <div className="truncate">
                              <p className="font-semibold text-sm text-foreground truncate">
                                {entry.name || 'Anonymous User'}
                                {isMe && <span className="ml-2 text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-bold uppercase">You</span>}
                              </p>
                            </div>
                          </div>
                          
                          <div className="col-span-2 flex justify-center">
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-xp/10 text-xp text-xs font-bold">
                              {entry.level}
                            </div>
                          </div>
                          
                          <div className="col-span-2 text-right font-mono font-medium text-sm">
                            {entry.xp.toLocaleString()}
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-brand">
              <TrendingUp className="w-24 h-24" />
            </div>
            
            <h3 className="font-bold text-lg mb-6 relative z-10">Your Standing</h3>
            
            {currentUserRank ? (
              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Rank</p>
                  <p className="text-3xl font-bold text-foreground">#{currentUserRank.rank}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total XP</p>
                  <p className="text-2xl font-bold text-xp">{currentUserRank.xp.toLocaleString()}</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    You're in the top <span className="font-bold text-foreground">{Math.round((currentUserRank.rank / (leaderboard?.length || 1)) * 100)}%</span> of active users. Keep diagnosing to climb higher!
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                <p className="text-muted-foreground mb-4">Complete a case to get placed on the leaderboard.</p>
                <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-brand w-0" />
                </div>
                <p className="text-xs text-brand font-medium mt-2">Unranked</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-brand to-accent rounded-xl p-6 text-white shadow-lg shadow-brand/20">
            <Award className="w-8 h-8 mb-4 text-white/80" />
            <h3 className="font-bold text-lg mb-2">Weekly Challenge</h3>
            <p className="text-sm text-white/80 mb-4">
              Complete 5 Cardiology cases with a score above 80% to earn the Heart Saver badge and 500 bonus XP.
            </p>
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-white rounded-full" style={{ width: '40%' }} />
            </div>
            <p className="text-xs font-bold text-right">2/5 Cases</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
