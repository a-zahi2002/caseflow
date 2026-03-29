'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SearchX, Loader2, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'

interface Case {
  id: string
  title: string
  description: string
  specialty: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  attemptCount: number
  isCompleted: boolean
  bestScore: number | null
  tags: string[]
}

function CaseCard({ caseItem }: { caseItem: Case }) {
  const xpReward = {
    beginner: 180,
    intermediate: 320,
    advanced: 500
  }[caseItem.difficulty]

  const specialtyColors: Record<string, { bg: string; text: string }> = {
    Cardiology: { bg: 'bg-[#FFF1F2]', text: 'text-[#BE123C]' },
    Neurology: { bg: 'bg-[#F5F3FF]', text: 'text-[#5B21B6]' },
    Respiratory: { bg: 'bg-brand-light', text: 'text-brand-text' },
    Emergency: { bg: 'bg-[#FFF7ED]', text: 'text-[#C2410C]' }
  }

  const { bg, text } = specialtyColors[caseItem.specialty] || { bg: 'bg-surface-subtle', text: 'text-text-secondary' }

  return (
    <div className="relative bg-white border border-border-default rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group">
      {caseItem.isCompleted && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20 font-bold text-[9px] uppercase tracking-wider">
            ✓ Completed
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className={cn("inline-flex items-center px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border", bg, text)}>
          {caseItem.specialty}
        </span>
        <span 
          className="text-[10px] font-bold uppercase tracking-tight"
          style={{ color: caseItem.difficulty === 'beginner' ? 'var(--brand)' : caseItem.difficulty === 'intermediate' ? '#D97706' : '#DC2626' }}
        >
          {caseItem.difficulty}
        </span>
      </div>

      <h3 className="text-base font-bold text-text-primary leading-tight line-clamp-1 min-h-[1.25rem] group-hover:text-brand transition-colors">
        {caseItem.title}
      </h3>

      <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2 min-h-[2.5rem]">
        {caseItem.description}
      </p>

      <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
        {caseItem.tags.map((tag) => (
          <span 
            key={tag} 
            className="px-2 py-1 bg-slate-50 border border-border-default rounded-md text-text-tertiary font-bold text-[9px] uppercase tracking-tighter"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#92400E] flex items-center gap-1">
             <span className="text-sm">⚡</span> +{xpReward} XP
          </span>
          {caseItem.bestScore !== null && (
            <span className="text-[10px] font-bold text-brand ring-1 ring-brand/20 px-1.5 rounded bg-brand/5">Best: {caseItem.bestScore}%</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-text-tertiary">
          <span>👥 {caseItem.attemptCount?.toLocaleString() || '0'}</span>
          <span>⭐ {(caseItem.rating || 4.5).toFixed(1)}</span>
        </div>
      </div>

      <Link 
        href={`/simulation/start/${caseItem.id}`}
        className="mt-3 w-full h-11 rounded-xl bg-brand text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all active:translate-y-0.5"
      >
        <Play className="w-4 h-4 fill-current" />
        {caseItem.isCompleted ? 'Retry Encouter' : 'Start Encounter'}
      </Link>
    </div>
  )
}

export default function CaseLibraryPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [specialty, setSpecialty] = useState('all')
  const [sortBy, setSortBy] = useState<'beginner' | 'newest'>('beginner')

  useEffect(() => {
    async function loadCases() {
      try {
        const res = await apiClient.get<{ cases: Case[] }>('/cases')
        if (res.success && res.data?.cases) {
          setCases(res.data.cases)
        }
      } catch (err) {
        console.error('Failed to load cases')
      } finally {
        setLoading(false)
      }
    }
    loadCases()
  }, [])

  const filteredCases = cases.filter((c) => {
    const sMatch = specialty === 'all' || c.specialty.toLowerCase() === specialty.toLowerCase()
    const qMatch = !q || `${c.title} ${c.description} ${c.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())
    return sMatch && qMatch
  }).sort((a, b) => {
    if (sortBy === 'beginner') {
      const order = { beginner: 1, intermediate: 2, advanced: 3 }
      return (order[a.difficulty] || 99) - (order[b.difficulty] || 99)
    }
    return 0 // Keep default (newest)
  })

  const specialtyFilters = ['all', 'Cardiology', 'Neurology', 'Respiratory', 'Emergency', 'Gastroenterology', 'Endocrinology', 'Surgery']

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest animate-pulse">Accessing Medical Database...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto p-8 flex flex-col gap-8">
      {/* SECTION 1: Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Clinical Case Library</h1>
          <p className="text-sm text-text-secondary mt-1 max-w-sm">Advance your proficiency through evidence-based AI patient simulations.</p>
        </div>
        
        <div className="relative group min-w-[300px]">
          <input 
            type="text" 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search specialties, symptoms…"
            className="w-full h-[46px] pl-12 pr-6 border border-border-default rounded-2xl text-[14px] font-medium bg-white focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all shadow-sm"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
             <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      {/* SECTION 2: Filter Chips & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          {specialtyFilters.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialty(s.toLowerCase())}
              className={cn(
                "px-5 py-2 rounded-xl border font-bold text-[12px] uppercase tracking-wider transition-all",
                specialty === s.toLowerCase() 
                  ? "bg-brand border-brand text-white shadow-lg shadow-brand/20" 
                  : "bg-white border-border-default text-text-secondary hover:border-brand/40"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-border-default">
          <button 
            onClick={() => setSortBy('beginner')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-tight transition-all",
              sortBy === 'beginner' ? "bg-white text-brand shadow-sm" : "text-text-tertiary"
            )}
          >
            Sort: Level
          </button>
          <button 
            onClick={() => setSortBy('newest')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-tight transition-all",
              sortBy === 'newest' ? "bg-white text-brand shadow-sm" : "text-text-tertiary"
            )}
          >
            Newest
          </button>
        </div>
      </div>

      {/* SECTION 3: Grid or Empty State */}
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => (
            <CaseCard key={c.id} caseItem={c} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-white border border-dashed border-border-default rounded-3xl animate-slide-up">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <SearchX className="w-8 h-8 text-text-tertiary opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">No matching cases found</h3>
          <button onClick={() => { setQ(''); setSpecialty('all') }} className="text-sm font-bold text-brand uppercase tracking-widest hover:underline">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}

