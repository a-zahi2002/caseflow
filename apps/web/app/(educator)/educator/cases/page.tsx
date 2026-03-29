'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import type { Case } from '@caseflow/types'

type CaseWithCount = Case & { _count: { attempts: number } }

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  review: 'bg-amber-50 text-amber-700',
  published: 'bg-green-50 text-green-700',
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-50 text-green-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-red-50 text-red-700',
}

export default function EducatorCasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<CaseWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    apiClient.get<CaseWithCount[]>('/cases/my', token).then((res) => {
      if (res.success) setCases(res.data)
      setLoading(false)
    })
  }, [router])

  async function publishCase(id: string) {
    const token = getToken()
    if (!token) return

    const res = await apiClient.patch<Case>(
      `/cases/${id}`,
      { status: 'published' },
      token
    )
    if (res.success) {
      setCases((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'published' } : c))
      )
    }
  }

  if (loading) return <div className="text-gray-400 text-sm">Loading your cases...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Cases</h1>
        <button
          onClick={() => router.push('/educator/create')}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Case
        </button>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm mb-4">You haven't created any cases yet.</p>
          <button
            onClick={() => router.push('/educator/create')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Create your first case
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-medium text-gray-900">{c.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${statusColors[c.status]}`}>
                      {c.status}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${difficultyColors[c.difficulty]}`}>
                      {c.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{c.specialty}</span>
                    <span>•</span>
                    <span>{c._count.attempts} attempts</span>
                    {c.timeLimit && (
                      <>
                        <span>•</span>
                        <span>{c.timeLimit} min</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {c.status === 'draft' && (
                    <button
                      onClick={() => publishCase(c.id)}
                      className="px-3 py-1.5 text-xs font-medium text-green-700 border border-green-300 rounded-lg hover:bg-green-50"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/educator/cases/${c.id}/edit`)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

