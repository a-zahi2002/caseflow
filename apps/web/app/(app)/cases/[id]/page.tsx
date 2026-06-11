'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { pageVariants, slideUp } from '@/lib/motion'
import { DIFFICULTY_CONFIG } from '@caseflow/types'
import type { Case, StartSimulationInput } from '@caseflow/types'
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Stethoscope, 
  Target, 
  PlayCircle,
  Bookmark,
  Share2,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-64 bg-surface border border-border rounded-2xl" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-32 bg-surface border border-border rounded-xl" />
          <div className="h-48 bg-surface border border-border rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-surface border border-border rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const caseId = params.id as string

  const [bookmarked, setBookmarked] = useState(false) // Optimistic state
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data: c, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: async () => {
      const res = await api.get<Case & { isBookmarked?: boolean }>(`/api/cases/${caseId}`)
      setBookmarked(res.data.isBookmarked ?? false)
      return res.data
    },
    retry: false,
  })

  const startMutation = useMutation({
    mutationFn: async (data: StartSimulationInput) => {
      const res = await api.post<{ attemptId: string; resumed: boolean }>('/api/simulation/start', data)
      if (!res.success) throw new Error(res.error || 'Failed to start simulation')
      return res.data
    },
    onSuccess: (data) => {
      router.push(`/simulation/${data.attemptId}`)
    },
    onError: (err: any) => {
      setErrorMsg(err.message)
    }
  })

  const toggleBookmark = async () => {
    setBookmarked(!bookmarked)
    try {
      if (!bookmarked) {
        await api.post(`/api/cases/${caseId}/bookmark`)
      } else {
        await api.delete(`/api/cases/${caseId}/bookmark`)
      }
    } catch {
      // Revert on failure
      setBookmarked(bookmarked)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
        <DetailSkeleton />
      </div>
    )
  }

  if (!c) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Case not found</h1>
        <p className="text-muted-foreground mb-6">The case you're looking for doesn't exist or has been removed.</p>
        <Link href="/cases" className="text-brand font-medium hover:underline">
          &larr; Back to library
        </Link>
      </div>
    )
  }

  const diffConfig = DIFFICULTY_CONFIG[c.difficulty as keyof typeof DIFFICULTY_CONFIG]

  return (
    <motion.div 
      className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Link href="/cases" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </Link>

      {/* Hero */}
      <motion.div variants={slideUp} className="bg-surface border border-border rounded-2xl overflow-hidden mb-8 relative">
        <div className="h-32 lg:h-48 bg-gradient-to-r from-brand/20 via-accent/20 to-brand/10 absolute inset-x-0 top-0" />
        
        <div className="relative pt-24 lg:pt-32 p-6 sm:p-8 flex flex-col lg:flex-row gap-6 lg:items-end justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-brand text-white shadow-sm">
                {c.specialty}
              </span>
              <span 
                className="text-xs font-bold tracking-wide uppercase px-3 py-1 rounded-full border"
                style={{ backgroundColor: diffConfig.bg, color: diffConfig.color, borderColor: diffConfig.color + '40' }}
              >
                {diffConfig.label}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">{c.title}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              {c.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={toggleBookmark}
              className={cn(
                "p-3 rounded-xl border transition-all",
                bookmarked 
                  ? "bg-brand/10 border-brand/30 text-brand" 
                  : "bg-surface border-border text-muted-foreground hover:bg-surface-2"
              )}
            >
              <Bookmark className={cn("w-5 h-5", bookmarked && "fill-brand")} />
            </button>
            <button className="p-3 rounded-xl border border-border bg-surface text-muted-foreground hover:bg-surface-2 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {errorMsg && (
        <div className="mb-8 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 text-danger">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Cannot start simulation</h4>
            <p className="text-sm mt-1 opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand" /> Learning Objectives
            </h2>
            <ul className="space-y-3">
              {c.learningObjectives?.map((obj, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <span className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{obj}</span>
                </li>
              ))}
              {(!c.learningObjectives || c.learningObjectives.length === 0) && (
                <li className="text-muted-foreground italic">No specific objectives listed.</li>
              )}
            </ul>
          </motion.div>

          <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-brand" /> Initial Presentation
            </h2>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <p><strong>Patient:</strong> {c.patientName}, {c.patientAge}yo {c.patientGender}</p>
              <p><strong>Chief Complaint:</strong> {c.chiefComplaint}</p>
              <p><strong>Background:</strong> {c.patientBackground}</p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-6 sticky top-24">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-surface-2 rounded-lg text-center">
                <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <div className="font-bold text-foreground">{c.estimatedMinutes}m</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">Est. Time</div>
              </div>
              <div className="p-4 bg-surface-2 rounded-lg text-center">
                <Users className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                <div className="font-bold text-foreground">{c.totalAttempts}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">Attempts</div>
              </div>
            </div>

            <button
              onClick={() => startMutation.mutate({ caseId: c.id })}
              disabled={startMutation.isPending}
              className="w-full py-3.5 bg-brand hover:bg-brand/90 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {startMutation.isPending ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Begin Simulation
                </>
              )}
            </button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Requires continuous internet connection
            </p>

            <hr className="border-border my-6" />

            <Link 
              href={`/cases/${c.id}/discussion`}
              className="flex items-center justify-between w-full p-4 rounded-xl border border-border hover:bg-surface-2 transition-colors group"
            >
              <div className="flex items-center gap-3 font-medium text-foreground">
                <MessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
                Case Discussion
              </div>
              <span className="text-muted-foreground text-sm">&rarr;</span>
            </Link>
            
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
