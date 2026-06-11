'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { pageVariants, staggerChildren, slideUp } from '@/lib/motion'
import { DIFFICULTY_CONFIG } from '@caseflow/types'
import type { Case } from '@caseflow/types'
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Archive,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EducatorCasesPage() {
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const { data: casesData, isLoading, refetch } = useQuery({
    queryKey: ['admin-cases'],
    queryFn: async () => {
      // In a real app, this would be an educator-specific endpoint (e.g. /api/educator/cases)
      // For this demo, using admin endpoint if they have admin role, else it would fetch their own cases
      const res = await api.get<Case[]>('/api/admin/cases')
      return res.data
    },
  })

  // Filter logic
  const cases = (casesData || []).filter(c => {
    if (filter !== 'ALL' && c.status !== filter) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const publishCase = async (id: string) => {
    await api.post(`/api/cases/${id}/publish`)
    refetch()
  }

  const archiveCase = async (id: string) => {
    await api.post(`/api/cases/${id}/archive`)
    refetch()
  }

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
          <h1 className="text-3xl font-bold text-foreground">Manage Cases</h1>
          <p className="text-muted-foreground mt-1">
            Author and manage your clinical simulations.
          </p>
        </div>
        
        <Link 
          href="/educator/cases/new" 
          className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand/90 text-white font-semibold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Case
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-surface-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex bg-surface border border-border rounded-lg p-1 w-full sm:w-auto">
            {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                  filter === f ? 'bg-surface-2 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-2 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">Case Title & Specialty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground animate-pulse">
                    Loading cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="w-8 h-8 mb-3 opacity-50" />
                      <p>No cases found matching your filters.</p>
                      {filter !== 'ALL' && (
                        <button onClick={() => setFilter('ALL')} className="mt-2 text-brand hover:underline">
                          Clear status filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {cases.map((c) => {
                    const diffConfig = DIFFICULTY_CONFIG[c.difficulty as keyof typeof DIFFICULTY_CONFIG]
                    return (
                      <motion.tr 
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-surface hover:bg-surface-2/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground mb-1">{c.title || 'Untitled Case'}</div>
                          <div className="text-xs text-muted-foreground">{c.specialty}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase",
                            c.status === 'PUBLISHED' ? "bg-success/10 text-success" :
                            c.status === 'DRAFT' ? "bg-warning/10 text-warning" :
                            "bg-surface-2 text-muted-foreground"
                          )}>
                            {c.status === 'PUBLISHED' && <CheckCircle2 className="w-3 h-3" />}
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="inline-flex text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded border"
                            style={{ backgroundColor: diffConfig.bg, color: diffConfig.color, borderColor: diffConfig.color + '40' }}
                          >
                            {diffConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div>{c.totalAttempts} <span className="text-xs">attempts</span></div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/educator/cases/${c.id}`} className="p-2 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            
                            {c.status === 'DRAFT' && (
                              <button onClick={() => publishCase(c.id)} className="p-2 text-muted-foreground hover:text-success hover:bg-success/10 rounded-lg transition-colors" title="Publish">
                                <Upload className="w-4 h-4" />
                              </button>
                            )}
                            
                            {c.status === 'PUBLISHED' && (
                              <button onClick={() => archiveCase(c.id)} className="p-2 text-muted-foreground hover:text-warning hover:bg-warning/10 rounded-lg transition-colors" title="Archive">
                                <Archive className="w-4 h-4" />
                              </button>
                            )}

                            <button className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
