'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import type { Case } from '@caseflow/types'

export default function CasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    apiClient.get<Case[]>('/cases', token).then((res) => {
      if (res.success) setCases(res.data)
      setLoading(false)
    })
  }, [router])

  async function startCase(caseId: string) {
    const token = getToken()
    if (!token) return

    const res = await apiClient.post<{ attemptId: string }>(
      '/simulation/start',
      { caseId },
      token
    )

    if (res.success) {
      router.push(`/simulation/${res.data.attemptId}`)
    }
  }

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading cases...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Case Library</h1>
      <div className="grid gap-4">
        {cases.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between"
          >
            <div>
              <h2 className="text-base font-medium text-gray-900">{c.title}</h2>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-gray-500">{c.specialty}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500 capitalize">{c.difficulty}</span>
              </div>
              <div className="flex gap-2 mt-2">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => startCase(c.id)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Case
            </button>
          </div>
        ))}
        {cases.length === 0 && (
          <p className="text-gray-500 text-sm">No cases available yet.</p>
        )}
      </div>
    </div>
  )
}
