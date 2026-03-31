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

  const specialtyInfo: Record<string, { bg: string; text: string; icon: string }> = {
    Cardiology: { bg: 'bg-red-100', text: 'text-red-700', icon: 'favorite' },
    Neurology: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'psychology' },
    Respiratory: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'airway' },
    Emergency: { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'emergency' },
    Diagnostic: { bg: 'bg-teal-100', text: 'text-teal-700', icon: 'biotech' },
  }

  const { bg, text, icon } = specialtyInfo[caseItem.specialty] || { bg: 'bg-surface-variant', text: 'text-on-surface-variant', icon: 'clinical_notes' }

  return (
    <div className="group bg-surface-container-lowest rounded-xl p-1 relative overflow-hidden transition-all hover:translate-y-[-4px] hover:shadow-xl">
      <div className="bg-surface-container-low rounded-lg p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <span className={cn("px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider", bg, text)}>
            {caseItem.specialty}
          </span>
          <span className="text-[10px] font-mono text-outline-variant px-2 py-1 border border-outline-variant/20 rounded font-bold">
            ID: #{caseItem.id.slice(0, 4).toUpperCase()}
          </span>
        </div>
        
        <h3 className="text-xl font-heading font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
          {caseItem.title}
        </h3>
        
        <p className="text-sm text-on-surface-variant font-sans mb-6 line-clamp-2">
          {caseItem.description}
        </p>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "material-symbols-outlined text-lg",
                caseItem.difficulty === 'advanced' ? "text-error" : caseItem.difficulty === 'intermediate' ? "text-secondary" : "text-primary"
              )}>
                signal_cellular_alt{caseItem.difficulty === 'intermediate' ? '_2_bar' : caseItem.difficulty === 'beginner' ? '_1_bar' : ''}
              </span>
              <span className={cn(
                "text-xs font-heading font-bold uppercase tracking-wider",
                caseItem.difficulty === 'advanced' ? "text-error" : caseItem.difficulty === 'intermediate' ? "text-secondary" : "text-primary"
              )}>
                {caseItem.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-outline">
              <span className="material-symbols-outlined text-lg">schedule</span>
              <span className="text-xs font-mono font-bold uppercase tracking-tight">25 MIN</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-outline-variant uppercase font-bold">Potential Reward</span>
              <span className="text-sm font-mono font-bold text-secondary">+{xpReward} XP</span>
            </div>
            <Link 
              href={`/simulation/start/${caseItem.id}`}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary transition-transform group-hover:scale-110 active:scale-95"
            >
              <span className="material-symbols-outlined">play_arrow</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CaseLibraryPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [specialty, setSpecialty] = useState('all')

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
  })

  const specialtyFilters = ['All', 'Emergency', 'Chronic Care', 'Diagnostic', 'Pediatric', 'Trauma']

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono font-bold text-outline uppercase tracking-widest animate-pulse">Accessing Medical Database...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-10">
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-heading font-bold tracking-tight text-on-surface mb-2">Case Simulation Library</h1>
          <p className="text-on-surface-variant font-sans">Select a clinical scenario to begin your residency training hours.</p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-low p-1.5 rounded-xl shadow-inner border border-outline-variant/30">
          <div className="relative flex-1 min-w-[300px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              type="text" 
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm font-sans text-on-surface placeholder:text-outline/60"
              placeholder="Search case name or symptoms..."
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface rounded-lg text-sm font-bold hover:bg-white transition-colors border border-outline-variant/20 shadow-sm">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filter
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {specialtyFilters.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialty(s === 'All' ? 'all' : s.toLowerCase())}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
              (specialty === 'all' && s === 'All') || specialty === s.toLowerCase()
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"
            )}
          >
            {s === 'All' ? 'All Cases' : s}
          </button>
        ))}
      </div>

      {/* Grid of Cases */}
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => (
            <CaseCard key={c.id} caseItem={c} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-surface-container-low border border-dashed border-outline-variant/50 rounded-3xl text-center">
          <span className="material-symbols-outlined text-5xl text-outline mb-4">search_off</span>
          <h3 className="text-xl font-heading font-bold mb-2">No matching cases found</h3>
          <p className="text-on-surface-variant max-w-xs mb-6">Try adjusting your search filters or specialty selection.</p>
          <button 
            onClick={() => { setQ(''); setSpecialty('all') }}
            className="text-primary font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Footer Stats */}
      <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-surface-container-low rounded-3xl border border-outline-variant/20">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-primary">
            <span className="material-symbols-outlined text-3xl">assignment_turned_in</span>
            <h4 className="text-lg font-heading font-bold">Weekly Quota</h4>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[75%] rounded-full shadow-sm"></div>
          </div>
          <div className="flex justify-between text-[11px] font-mono font-bold text-outline uppercase tracking-wider">
            <span>12/16 CASES COMPLETED</span>
            <span>75%</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-secondary">
            <span className="material-symbols-outlined text-3xl">workspace_premium</span>
            <h4 className="text-lg font-heading font-bold">Active Rank</h4>
          </div>
          <p className="text-sm font-sans text-on-surface-variant leading-relaxed">
            You are currently in the <strong>Top 15%</strong> of Residents. Complete 3 more Hard cases to reach Lead Resident status.
          </p>
        </div>
        <div className="flex items-center justify-end">
          <Link 
            href="/progress"
            className="flex items-center gap-3 px-8 py-4 bg-white border border-outline-variant text-primary font-heading font-bold rounded-2xl hover:bg-primary hover:text-on-primary transition-all shadow-sm hover:shadow-md group"
          >
            View Detailed Portfolio
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

