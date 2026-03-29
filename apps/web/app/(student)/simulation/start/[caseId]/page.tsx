'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Loader2, GraduationCap, ArrowRight } from 'lucide-react'

export default function SimulationStartPage() {
  const router = useRouter()
  const { caseId } = useParams<{ caseId: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function startSimulation() {
      try {
        const res = await apiClient.post<{ attemptId: string }>('/simulation/start', { caseId })
        if (res.success) {
          router.push(`/simulation/run/${res.data.attemptId}`)
        } else {
          setError(res.error || 'Failed to start simulation')
          setLoading(false)
        }
      } catch (err) {
        setError('Something went wrong. Please try again.')
        setLoading(false)
      }
    }

    startSimulation()
  }, [caseId, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center animate-slide-up">
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-4">
           <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Simulation Error</h1>
        <p className="text-sm text-gray-500 mb-6 max-w-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-brand text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] animate-slide-up">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-brand/5 border border-brand/20 rounded-3xl flex items-center justify-center animate-pulse">
           <GraduationCap className="w-10 h-10 text-brand" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Initializing Clinical Encounter</h1>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-sm text-gray-500 font-medium">Preparing the AI patient persona and medical records...</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      </div>

      <div className="mt-12 p-4 bg-surface-subtle border border-border-default rounded-2xl max-w-md w-full">
        <div className="flex items-center gap-3 text-left">
          <div className="w-2 h-10 bg-brand rounded-full" />
          <div>
            <span className="text-[10px] font-bold font-mono text-text-tertiary uppercase tracking-widest block">Pro Tip</span>
            <p className="text-xs text-text-primary font-medium leading-relaxed">
              Introduce yourself to the patient and ask open-ended questions to gather more accurate history findings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
