'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
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
  diagnosis: 'bg-green-50 text-green-700 border-green-200',
  management: 'bg-red-50 text-red-700 border-red-200',
}

const difficultyColors = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-red-50 text-red-700',
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
    return <div className="text-gray-400 text-sm p-8">Loading case...</div>
  }

  if (!caseData) return null

  const persona = caseData.patientPersona as {
    age: number
    sex: string
    presentingComplaint: string
    background: string
  }

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.push('/cases')}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
      >
        ← Back to cases
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-semibold text-gray-900">{caseData.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${difficultyColors[caseData.difficulty]}`}>
                {caseData.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{caseData.specialty}</span>
              {caseData.timeLimit && (
                <>
                  <span>•</span>
                  <span>{caseData.timeLimit} min time limit</span>
                </>
              )}
              <span>•</span>
              <span>{caseData._count.attempts} attempts by other students</span>
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              {caseData.tags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={startCase}
            disabled={starting}
            className="shrink-0 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {starting ? 'Starting...' : 'Start Case'}
          </button>
        </div>
      </div>

      {/* Patient info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Patient Presentation
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-xs text-gray-500">Age</span>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{persona.age} years old</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Sex</span>
            <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{persona.sex}</p>
          </div>
        </div>
        <div className="mb-4">
          <span className="text-xs text-gray-500">Presenting Complaint</span>
          <p className="text-sm text-gray-900 mt-0.5">{persona.presentingComplaint}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Background</span>
          <p className="text-sm text-gray-900 mt-0.5">{persona.background}</p>
        </div>
      </div>

      {/* Case steps */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Case Structure — {caseData.steps.length} steps
        </h2>
        <div className="space-y-3">
          {caseData.steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 shrink-0 mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${stepTypeColors[step.type]}`}>
                    {stepTypeLabels[step.type]}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{step.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start CTA */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={startCase}
          disabled={starting}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {starting ? 'Starting simulation...' : 'Begin Simulation →'}
        </button>
      </div>
    </div>
  )
}
