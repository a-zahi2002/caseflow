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
      <div className="flex flex-col items-center justify-center p-20 text-center animate-slide-up bg-surface">
        <div className="w-16 h-16 bg-error-container/30 border border-error/10 rounded-2xl flex items-center justify-center mb-4">
           <span className="material-symbols-outlined text-error text-3xl">warning</span>
        </div>
        <h1 className="text-xl font-heading font-bold text-on-surface mb-2 tracking-tight">Clinical Error 404</h1>
        <p className="text-sm text-on-surface-variant mb-8 max-w-sm font-sans">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-primary text-on-primary text-sm font-heading font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[70vh] animate-slide-up bg-surface">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-primary-container border border-primary/20 rounded-3xl flex items-center justify-center animate-pulse shadow-sm">
           <span className="material-symbols-outlined text-primary text-5xl">biotech</span>
        </div>
        <div className="absolute -top-3 -right-3">
          <div className="w-8 h-8 bg-surface border border-outline-variant/30 rounded-full flex items-center justify-center shadow-md">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-heading font-extrabold text-on-surface tracking-tight">Clinical Sim | Encounter</h1>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-on-surface-variant font-sans font-medium tracking-wide">Synthesizing patient persona & clinical records...</p>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce shadow-[0_0_8px_rgba(0,104,95,0.4)]" />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:200ms] shadow-[0_0_8px_rgba(0,104,95,0.4)]" />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:400ms] shadow-[0_0_8px_rgba(0,104,95,0.4)]" />
          </div>
        </div>
      </div>

      <div className="mt-16 p-6 bg-surface-container-low border border-outline-variant/20 rounded-3xl max-w-sm w-full shadow-sm">
        <div className="flex items-center gap-4 text-left">
          <div className="w-1.5 h-12 bg-primary rounded-full shadow-sm" />
          <div>
            <span className="text-[10px] font-bold font-mono text-outline-variant uppercase tracking-[0.2em] block mb-1">Consultation Tip</span>
            <p className="text-xs text-on-surface-variant font-sans font-medium leading-relaxed italic opacity-80">
              Maintain professional decorum. Use open-ended inquiry to facilitate exhaustive clinical history findings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

