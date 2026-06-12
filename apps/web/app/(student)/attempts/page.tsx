'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { getUser } from '@/lib/auth'
import type { StudentProgressData } from '@caseflow/types'
import { Calendar, ChevronRight, FileText, Activity, Layers, CheckCircle2, Clock, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CaseFilesPage() {
  const [data, setData] = useState<StudentProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiClient.get<StudentProgressData>('/progress/me')
        if (res.success) {
          setData(res.data)
        }
      } catch (err) {
        console.error('Failed to fetch case files:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-surface-variant/20 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 w-full bg-surface-variant/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const attempts = data?.recentAttempts || []

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Layers size={24} />
          </div>
          <h1 className="text-3xl font-heading font-black tracking-tight text-on-surface">Case Files</h1>
        </div>
        <p className="text-on-surface-variant opacity-70 font-sans font-medium">Review your clinical encounter history and past simulations.</p>
      </header>

      {attempts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-surface-variant/20 flex items-center justify-center text-outline mb-6">
            <FileText size={40} />
          </div>
          <h2 className="text-xl font-heading font-bold text-on-surface mb-2">No encounters yet</h2>
          <p className="text-on-surface-variant opacity-70 max-w-sm text-center mb-10">You haven't started any clinical cases yet. Begin your first encounter to build your history.</p>
          <Link 
            href="/cases"
            className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-heading font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Explore Cases
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {attempts.map((attempt) => (
            <Link 
              key={attempt.id}
              href={attempt.status === 'completed' ? `/attempts/${attempt.id}/result` : `/simulation/run/${attempt.id}`}
              className="group bg-white border border-outline-variant/30 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-start sm:items-center gap-5">
                <div className={cn(
                  "shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                  attempt.status === 'completed' ? "bg-emerald-50 text-emerald-600" : 
                  attempt.status === 'in_progress' ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400"
                )}>
                  {attempt.status === 'completed' ? <CheckCircle2 size={28} /> : 
                   attempt.status === 'in_progress' ? <PlayCircle size={28} className="animate-pulse" /> : <Clock size={28} />}
                </div>
                <div>
                  <h3 className="text-lg font-heading font-black text-on-surface group-hover:text-primary transition-colors leading-tight mb-1">{attempt.caseTitle}</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-variant/40 rounded-lg text-xs font-mono font-black text-outline uppercase tracking-wider">
                      <Activity size={12} className="text-primary" />
                      {attempt.specialty}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-sans font-semibold text-outline">
                      <Calendar size={12} />
                      {new Date(attempt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-10">
                <div className="text-right">
                  {attempt.score !== null ? (
                    <>
                      <p className="text-[10px] font-mono font-black text-outline uppercase tracking-widest mb-0.5">Clinical Proficiency</p>
                      <p className={cn(
                        "text-3xl font-heading font-black tracking-tighter",
                        (attempt.score ?? 0) >= 80 ? "text-emerald-600" : 
                        (attempt.score ?? 0) >= 60 ? "text-amber-600" : "text-rose-600"
                      )}>
                        {(attempt.score ?? 0).toFixed(0)}<span className="text-lg opacity-40">%</span>
                      </p>
                    </>
                  ) : (
                    <div className="px-4 py-2 bg-surface-variant/40 rounded-xl text-[10px] font-mono font-black text-outline uppercase tracking-widest leading-none">
                      {attempt.status.replace('_', ' ')}
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-2xl bg-surface-variant/20 text-outline group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
