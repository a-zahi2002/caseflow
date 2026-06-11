'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { pageVariants, staggerChildren, slideUp } from '@/lib/motion'
import { SPECIALTIES, DIFFICULTY_CONFIG } from '@caseflow/types'
import type { CaseListItem, PaginationMeta } from '@caseflow/types'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Bookmark, 
  PlayCircle,
  Activity,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

function CaseCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-2 bg-surface-2" />
      <div className="p-5">
        <div className="flex justify-between mb-4">
          <div className="h-5 w-24 bg-surface-2 rounded-full" />
          <div className="h-5 w-16 bg-surface-2 rounded-md" />
        </div>
        <div className="h-6 w-3/4 bg-surface-2 rounded mb-2" />
        <div className="h-4 w-full bg-surface-2 rounded mb-1" />
        <div className="h-4 w-2/3 bg-surface-2 rounded mb-6" />
        <div className="flex gap-4">
          <div className="h-4 w-16 bg-surface-2 rounded" />
          <div className="h-4 w-16 bg-surface-2 rounded" />
        </div>
      </div>
    </div>
  )
}

export default function CasesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '')
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [filterMode, setFilterMode] = useState(searchParams.get('filter') || 'all')

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Update URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (specialty) params.set('specialty', specialty)
    if (difficulty) params.set('difficulty', difficulty)
    if (filterMode !== 'all') params.set('filter', filterMode)
    if (page > 1) params.set('page', page.toString())

    const query = params.toString()
    router.replace(\`/cases\${query ? \`?\${query}\` : ''}\`)
  }, [debouncedSearch, specialty, difficulty, filterMode, page, router])

  const { data, isLoading } = useQuery({
    queryKey: ['cases', debouncedSearch, specialty, difficulty, filterMode, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('q', debouncedSearch)
      if (specialty) params.set('specialty', specialty)
      if (difficulty) params.set('difficulty', difficulty)
      if (filterMode !== 'all') params.set('filter', filterMode)
      params.set('page', page.toString())
      params.set('limit', '12')

      const res = await api.get<CaseListItem[]>(\`/api/cases?\${params.toString()}\`)
      return { cases: res.data, meta: res.meta as unknown as PaginationMeta }
    },
  })

  return (
    <motion.div 
      className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Case Library</h1>
          <p className="text-muted-foreground mt-1">
            Browse and practice over {data?.meta?.total ?? 'many'} clinical scenarios.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cases..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>

          <div className="flex bg-surface border border-border rounded-lg p-1">
            <button
              onClick={() => { setFilterMode('all'); setPage(1) }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                filterMode === 'all' ? 'bg-surface-2 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            <button
              onClick={() => { setFilterMode('bookmarked'); setPage(1) }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5',
                filterMode === 'bookmarked' ? 'bg-surface-2 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Bookmark className="w-3.5 h-3.5" /> Bookmarked
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Specialty
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => { setSpecialty(''); setPage(1) }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                  specialty === '' ? 'bg-brand/10 text-brand font-medium' : 'hover:bg-surface-2 text-foreground'
                )}
              >
                All Specialties
              </button>
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSpecialty(s); setPage(1) }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between group',
                    specialty === s ? 'bg-brand/10 text-brand font-medium' : 'hover:bg-surface-2 text-foreground'
                  )}
                >
                  {s}
                  {specialty === s && <X className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Difficulty
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => { setDifficulty(''); setPage(1) }}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                  difficulty === '' ? 'bg-brand/10 text-brand font-medium' : 'hover:bg-surface-2 text-foreground'
                )}
              >
                Any Difficulty
              </button>
              {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { setDifficulty(key); setPage(1) }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between',
                    difficulty === key ? 'bg-brand/10 text-brand font-medium' : 'hover:bg-surface-2 text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                    {config.label}
                  </div>
                  {difficulty === key && <X className="w-3.5 h-3.5 opacity-50 hover:opacity-100" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => <CaseCardSkeleton key={i} />)}
            </div>
          ) : data?.cases.length === 0 ? (
            <div className="bg-surface border border-border border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No cases found</h3>
              <p className="text-muted-foreground max-w-sm mt-1">
                We couldn't find any cases matching your current filters. Try adjusting your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setSpecialty('')
                  setDifficulty('')
                  setFilterMode('all')
                }}
                className="mt-6 text-brand font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <motion.div variants={staggerChildren} className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {data?.cases.map((c) => {
                    const diffConfig = DIFFICULTY_CONFIG[c.difficulty as keyof typeof DIFFICULTY_CONFIG]
                    return (
                      <motion.div
                        key={c.id}
                        variants={slideUp}
                        layout
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg hover:shadow-brand/5 hover:border-brand/30 transition-all group flex flex-col"
                      >
                        <div className="h-1.5 w-full bg-gradient-to-r from-brand to-accent opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-brand/10 text-brand">
                              {c.specialty}
                            </span>
                            <span 
                              className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: diffConfig.bg, color: diffConfig.color }}
                            >
                              {diffConfig.label}
                            </span>
                          </div>
                          
                          <Link href={\`/cases/\${c.id}\`} className="focus:outline-none">
                            <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                              {c.title}
                            </h3>
                          </Link>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1">
                            {c.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5 mt-auto">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              {c.steps?.length || 0} Steps
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {c.estimatedMinutes}m
                            </div>
                            {c.isBookmarked && (
                              <div className="flex items-center gap-1.5 ml-auto text-brand">
                                <Bookmark className="w-3.5 h-3.5 fill-brand" />
                              </div>
                            )}
                          </div>
                          
                          <Link 
                            href={\`/cases/\${c.id}\`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-surface-2 text-foreground font-semibold rounded-lg group-hover:bg-brand group-hover:text-white transition-colors"
                          >
                            <PlayCircle className="w-4 h-4" />
                            View Case
                          </Link>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {data?.meta && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-border">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-surface-2 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {data.meta.totalPages}
                  </span>
                  <button
                    disabled={page === data.meta.totalPages}
                    onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-surface-2 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
