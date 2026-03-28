'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, BookOpen, Clock, Activity, ChevronRight } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import { cn } from '@/lib/utils'
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

const difficultyStyles = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-100",
  intermediate: "bg-amber-50 text-amber-700 border-amber-100",
  advanced: "bg-red-50 text-red-700 border-red-100"
}

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
    params.set('limit', '12')

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Case Library</h1>
          <p className="text-muted-foreground mt-1 text-sm">Explore interactive clinical scenarios and sharpen your reasoning.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono bg-white px-3 py-1.5 rounded-full border border-border">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-foreground">{data?.pagination.total || 0} Cases Available</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cases, symptoms, or diagnoses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={specialty}
            onChange={(e) => { setSpecialty(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="">All Specialties</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer capitalize"
          >
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-white border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.cases.map((c) => (
              <div
                key={c.id}
                className="group bg-white border border-border rounded-xl p-6 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2.5 py-1 rounded-full border border-primary/10">
                      {c.specialty}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border border-opacity-50",
                      difficultyStyles[c.difficulty as keyof typeof difficultyStyles]
                    )}>
                      {c.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {c.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{c.timeLimit || 30}m</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      <span>{c._count.attempts} Attempts</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startCase(c.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                  >
                    Start Simulation
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data?.cases.length === 0 && (
            <div className="py-20 text-center">
               <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-muted-foreground">No cases found matching your criteria.</p>
               <button onClick={() => {setSearch(''); setSpecialty(''); setDifficulty('')}} className="mt-4 text-primary font-semibold hover:underline">Clear all filters</button>
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-border rounded-lg disabled:opacity-30 hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="text-sm font-mono">
                <span className="text-foreground font-bold">{page}</span>
                <span className="text-muted-foreground"> / {data.pagination.totalPages}</span>
              </div>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="p-2 border border-border rounded-lg disabled:opacity-30 hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
