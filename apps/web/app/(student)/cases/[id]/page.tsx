'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { Case, CaseStep } from '@caseflow/types'

type CaseWithSteps = Case & {
  steps: CaseStep[]
  author: { id: string; name: string }
  _count: { attempts: number }
}

const stepTypeLabels: Record<string, string> = {
  history: 'History Taking',
  examination: 'Examination',
  investigation: 'Investigations',
  diagnosis: 'Diagnosis',
  management: 'Management',
}

const stepTypeColors: Record<string, string> = {
  history: 'bg-blue-50 text-blue-700 border-blue-200',
  examination: 'bg-purple-50 text-purple-700 border-purple-200',
  investigation: 'bg-amber-50 text-amber-700 border-amber-200',
  diagnosis: 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/20',
  management: 'bg-error-container text-error border-error/20',
}

const difficultyConfig = {
  beginner: { color: 'text-primary', bg: 'bg-primary-container/30 border-primary/20', icon: 'signal_cellular_alt_1_bar' },
  intermediate: { color: 'text-secondary', bg: 'bg-secondary-fixed border-secondary/20', icon: 'signal_cellular_alt_2_bar' },
  advanced: { color: 'text-error', bg: 'bg-error-container border-error/20', icon: 'signal_cellular_alt' },
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [caseData, setCaseData] = useState<CaseWithSteps | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    apiClient.get<CaseWithSteps>(`/cases/${id}`, token).then((res) => {
      if (res.success) setCaseData(res.data)
      else router.push('/cases')
      setLoading(false)
    })
  }, [id, router])

  async function startCase() {
    const token = getToken()
    if (!token || !caseData) return

    setStarting(true)
    const res = await apiClient.post<{ attemptId: string }>(
      '/simulation/start',
      { caseId: caseData.id },
      token
    )

    if (res.success) {
      router.push(`/simulation/run/${res.data.attemptId}`)
    } else {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono font-bold text-outline uppercase tracking-widest animate-pulse">Loading Clinical Case...</p>
      </div>
    )
  }

  if (!caseData) return null

  const persona = {
    age: caseData.patientAge,
    sex: caseData.patientGender,
    presentingComplaint: caseData.chiefComplaint,
    background: caseData.patientBackground,
  }

  const diffKey = caseData.difficulty.toLowerCase() as keyof typeof difficultyConfig
  const diff = difficultyConfig[diffKey] || difficultyConfig.beginner

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      {/* Back */}
      <button
        onClick={() => router.push('/cases')}
        className="text-sm text-on-surface-variant hover:text-primary font-heading font-bold flex items-center gap-2 group"
      >
        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Back to Case Library
      </button>

      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-heading font-black text-on-surface tracking-tight">{caseData.title}</h1>
              <span className={cn("px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest border", diff.bg, diff.color)}>
                {caseData.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-on-surface-variant font-medium">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">medical_services</span>
                <span>{caseData.specialty}</span>
              </div>
              {caseData.estimatedMinutes && (
                <>
                  <span className="text-outline-variant">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-outline">schedule</span>
                    <span>{caseData.estimatedMinutes} min limit</span>
                  </div>
                </>
              )}
              <span className="text-outline-variant">•</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-outline">group</span>
                <span>{caseData._count.attempts} attempts</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-4">
              {caseData.tags.map((tag) => (
                <span key={tag} className="text-xs bg-primary-container/30 text-primary px-3 py-1 rounded-full font-bold border border-primary/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={startCase}
            disabled={starting}
            className="shrink-0 px-8 py-3 bg-primary text-on-primary text-sm font-heading font-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            {starting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-sm">play_arrow</span>
            )}
            {starting ? 'Starting...' : 'Start Simulation'}
          </button>
        </div>
      </div>

      {/* Patient info */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 shadow-sm">
        <h2 className="text-sm font-heading font-black text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">person</span>
          Patient Presentation
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <span className="text-[10px] font-mono font-bold text-outline uppercase tracking-widest">Age</span>
            <p className="text-lg font-heading font-black text-on-surface mt-1">{persona.age}y</p>
          </div>
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <span className="text-[10px] font-mono font-bold text-outline uppercase tracking-widest">Sex</span>
            <p className="text-lg font-heading font-black text-on-surface mt-1 capitalize">{persona.sex}</p>
          </div>
          <div className="col-span-2 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <span className="text-[10px] font-mono font-bold text-outline uppercase tracking-widest">Author</span>
            <p className="text-lg font-heading font-black text-on-surface mt-1">{caseData.author?.name || 'Unknown'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-primary-container/10 rounded-xl border border-primary/10">
            <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">Presenting Complaint</span>
            <p className="text-sm text-on-surface mt-1 font-medium">{persona.presentingComplaint}</p>
          </div>
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <span className="text-[10px] font-mono font-bold text-outline uppercase tracking-widest">Background</span>
            <p className="text-sm text-on-surface mt-1 font-medium">{persona.background}</p>
          </div>
        </div>
      </div>

      {/* Case steps */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl p-8 shadow-sm">
        <h2 className="text-sm font-heading font-black text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">clinical_notes</span>
          Case Structure — {caseData.steps.length} Steps
        </h2>
        <div className="space-y-4">
          {caseData.steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-start gap-4 p-5 bg-surface-container-low border border-outline-variant/10 rounded-2xl group hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-on-primary text-xs font-heading font-black shrink-0 mt-0.5 shadow-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-on-surface mb-2">{step.name}</h3>
                <div className="text-xs text-on-surface-variant space-y-1">
                  <span className="font-semibold">Expected Findings:</span>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 font-medium">
                    {step.expectedFindings.map((finding, fi) => (
                      <li key={fi}>{finding}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start CTA */}
      <div className="flex justify-end">
        <button
          onClick={startCase}
          disabled={starting}
          className="px-10 py-4 bg-primary text-on-primary font-heading font-black text-sm rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center gap-3"
        >
          {starting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="material-symbols-outlined">play_arrow</span>
          )}
          {starting ? 'Initializing simulation...' : 'Begin Clinical Encounter →'}
        </button>
      </div>
    </div>
  )
}
