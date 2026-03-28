'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  Trophy, CheckCircle2, AlertCircle, ArrowLeft, 
  Lightbulb, CaseLower, ChevronRight, BookOpen, Clock
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import type { Attempt } from '@caseflow/types'
import Link from 'next/link'

export default function AttemptResultPage() {
  const { id } = useParams()
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setError('You must be logged in to view results')
      setLoading(false)
      return
    }

    apiClient.get<Attempt>(`/simulation/attempts/${id}`, token)
      .then((res) => {
        if (res.success) {
          setAttempt(res.data)
        } else {
          setError(res.error)
        }
      })
      .catch(() => setError('Failed to load attempt result'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  if (error || !attempt) return (
    <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg max-w-2xl mx-auto mt-12">
      <AlertCircle className="mx-auto mb-2" />
      <p>{error || 'Attempt not found'}</p>
      <Link href="/progress" className="mt-4 inline-block text-red-700 font-medium">
        Back to Progress
      </Link>
    </div>
  )

  const { evalResult, score } = attempt as any

  if (!evalResult) return (
    <div className="p-12 text-center bg-white border border-slate-200 rounded-xl max-w-2xl mx-auto mt-12">
      <Clock className="mx-auto mb-4 text-slate-300 animate-pulse" size={48} />
      <h2 className="text-xl font-bold text-slate-900 mb-2">Evaluation in progress</h2>
      <p className="text-slate-500 mb-6">Our AI is currently analyzing your performance. This usually takes about 30 seconds.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Refresh Page
      </button>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-20">
      <Link href="/progress" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition mb-4">
        <ArrowLeft size={16} />
        <span>Back to Progress</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/30">
            <Trophy size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Clinical Performance Report</h1>
          <p className="text-indigo-100 max-w-md">Excellent work completing the simulation. Here is a detailed breakdown of your clinical reasoning.</p>
          
          <div className="mt-8 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20">
            <span className="text-indigo-100 text-sm font-medium block uppercase tracking-wider mb-1">Overall Score</span>
            <span className="text-5xl font-black">{Math.round(score || 0)}%</span>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {/* Learning Points */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-indigo-900">
              <Lightbulb size={24} />
              <h2 className="text-xl font-bold">Top Learning Points</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {evalResult.topLearningPoints.map((point: string, i: number) => (
                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative pt-8">
                  <span className="absolute top-4 left-4 text-4xl font-black text-slate-200 leading-none">{i + 1}</span>
                  <p className="text-slate-700 relative z-10">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Step Breakdown */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-indigo-900">
              <CheckCircle2 size={24} />
              <h2 className="text-xl font-bold">Step-by-Step Breakdown</h2>
            </div>
            <div className="space-y-4">
              {evalResult.stepFeedback.map((step: any, i: number) => (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="uppercase text-xs font-black tracking-widest text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                        {step.stepType}
                      </span>
                    </div>
                    <span className={`font-bold ${step.score >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                      {step.score}%
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">What you did well</h4>
                      <p className="text-slate-600 text-sm">{step.didWell}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Areas for improvement</h4>
                      <p className="text-slate-600 text-sm">{step.missed}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Suggested Next Cases */}
          <section className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center gap-2 mb-6 text-indigo-900">
              <BookOpen size={24} />
              <h2 className="text-xl font-bold">Continue Your Learning</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {evalResult.suggestedCases.map((title: string, i: number) => (
                <Link 
                  key={i} 
                  href={`/cases?search=${encodeURIComponent(title)}`}
                  className="bg-white p-4 rounded-xl border border-indigo-200 hover:border-indigo-400 transition group flex flex-col justify-between"
                >
                  <span className="text-sm font-medium text-slate-900 block mb-4">{title}</span>
                  <span className="text-indigo-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Start Case <ChevronRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
