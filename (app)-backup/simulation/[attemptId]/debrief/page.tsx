'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { pageVariants, staggerChildren, slideUp } from '@/lib/motion'
import type { Attempt, Case, CaseStep, SimMessage } from '@caseflow/types'
import { 
  Trophy, 
  Clock, 
  Target, 
  ClipboardCheck, 
  ArrowRight, 
  MessageSquare,
  Award
} from 'lucide-react'

type PopulatedAttempt = Attempt & { 
  case: Case & { steps: CaseStep[] }
  messages: SimMessage[] 
}

export default function DebriefPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: async () => {
      const res = await api.get<PopulatedAttempt>(`/api/simulation/${attemptId}`)
      return res.data
    },
  })

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center text-muted-foreground animate-pulse">Loading debrief...</div>
  }

  if (!attempt || (attempt.status !== 'COMPLETED' && attempt.status !== 'FAILED')) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Simulation not finished</h2>
        <p className="text-muted-foreground mb-6">Complete the simulation to view the debrief.</p>
        <button onClick={() => router.push(`/simulation/${attemptId}`)} className="text-brand font-medium hover:underline">
          Return to simulation
        </button>
      </div>
    )
  }

  const durationMs = attempt.completedAt 
    ? new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()
    : 0
  const durationMins = Math.round(durationMs / 60000)

  return (
    <motion.div 
      className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand/10 text-brand mb-6">
          <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">Case Completed</h1>
        <p className="text-lg text-muted-foreground">You've finished the {attempt.case.title} simulation.</p>
      </div>

      <motion.div variants={staggerChildren} className="grid sm:grid-cols-3 gap-6 mb-12">
        <motion.div variants={slideUp} className="bg-surface border border-border rounded-2xl p-6 text-center shadow-sm">
          <Target className="w-6 h-6 text-brand mx-auto mb-3" />
          <div className="text-3xl font-bold text-foreground">{attempt.score ?? 0}%</div>
          <div className="text-sm text-muted-foreground font-medium mt-1">Overall Score</div>
        </motion.div>
        
        <motion.div variants={slideUp} className="bg-surface border border-border rounded-2xl p-6 text-center shadow-sm">
          <Award className="w-6 h-6 text-xp mx-auto mb-3" />
          <div className="text-3xl font-bold text-foreground">+{attempt.xpEarned ?? 0}</div>
          <div className="text-sm text-muted-foreground font-medium mt-1">XP Earned</div>
        </motion.div>

        <motion.div variants={slideUp} className="bg-surface border border-border rounded-2xl p-6 text-center shadow-sm">
          <Clock className="w-6 h-6 text-success mx-auto mb-3" />
          <div className="text-3xl font-bold text-foreground">{durationMins}m</div>
          <div className="text-sm text-muted-foreground font-medium mt-1">Time Spent</div>
        </motion.div>
      </motion.div>

      <motion.div variants={slideUp} className="bg-surface border border-border rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
          <ClipboardCheck className="w-5 h-5 text-brand" /> Learning Outcomes
        </h2>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You successfully completed the critical steps of the clinical presentation. Review your notes and compare them with the expected findings below.
          </p>
          
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="font-semibold mb-4">Your Clinical Notes:</h3>
            <div className="bg-surface-2 rounded-xl p-5 whitespace-pre-wrap text-sm text-foreground font-mono">
              {attempt.notes || <span className="text-muted-foreground italic">No notes recorded during this session.</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href={`/cases/${attempt.caseId}/discussion`}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-surface border border-border hover:bg-surface-2 text-foreground font-semibold rounded-xl transition-all"
        >
          <MessageSquare className="w-5 h-5" />
          Join Discussion
        </Link>
        <Link 
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand hover:bg-brand/90 text-white font-semibold rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-[0.98]"
        >
          Return to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </motion.div>
  )
}
