'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import type { Case } from '@caseflow/types'

interface PaginatedCases {
  cases: (Case & { _count: { attempts: number } })[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
const SPECIALTIES = [
  'Cardiology', 'Respiratory', 'Gastroenterology',
  'Neurology', 'Endocrinology', 'Infectious Disease',
  'Renal', 'Haematology', 'Musculoskeletal', 'Psychiatry',
]

export default function CasesPage() {
  const router = useRouter()
  const [data, setData] = useState<PaginatedCases | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (specialty) params.set('specialty', specialty)
    if (difficulty) params.set('difficulty', difficulty)
    params.set('page', String(page))
    params.set('limit', '20')

    apiClient.get<PaginatedCases>(`/cases?${params.toString()}`, token).then((res) => {
      if (res.success) setData(res.data)
      setLoading(false)
    })
  }, [router, search, specialty, difficulty, page])

  async function startCase(caseId: string) {
    const token = getToken()
    if (!token) return
    const res = await apiClient.post<{ attemptId: string }>(
      '/simulation/start',
      { caseId },
      token
    )
    if (res.success) router.push(`/simulation/${res.data.attemptId}`)
  }

  const difficultyColors = {
    beginner: 'bg-green-50 text-green-700',
    intermediate: 'bg-amber-50 text-amber-700',
    advanced: 'bg-red-50 text-red-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Case Library</h1>
        {data && (
          <span className="text-sm text-gray-500">{data.pagination.total} cases</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search cases..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
        />
        <select
          value={specialty}
          onChange={(e) => { setSpecialty(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All specialties</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d} className="capitalize">{d}</option>
          ))}
        </select>
        {(search || specialty || difficulty) && (
          <button
            onClick={() => { setSearch(''); setSpecialty(''); setDifficulty(''); setPage(1) }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Cases grid */}
      {loading ? (
        <div className="text-gray-400 text-sm">Loading cases...</div>
      ) : (
        <>
          <div className="grid gap-4">
            {data?.cases.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-medium text-gray-900">{c.title}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${difficultyColors[c.difficulty]}`}>
                        {c.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>{c.specialty}</span>
                      {c.timeLimit && (
                        <>
                          <span>•</span>
                          <span>{c.timeLimit} min</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{c._count.attempts} attempts</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
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
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => router.push(`/cases/${c.id}`)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => startCase(c.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {data?.cases.length === 0 && (
              <p className="text-gray-500 text-sm">No cases match your filters.</p>
            )}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
