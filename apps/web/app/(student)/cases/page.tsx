import { Metadata } from 'next'
import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Case Library — CBL Platform',
}

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

const MOCK_CASES: Case[] = [
  {
    id: 'c1',
    title: 'Acute Chest Pain — Possible MI',
    specialty: 'Cardiology',
    difficulty: 'intermediate',
    rating: 4.8,
    attemptCount: 1200,
    isCompleted: false,
    bestScore: null,
    tags: ['ECG', 'Troponin', 'STEMI'],
    description: '45M with crushing substernal chest pain radiating to the left arm and jaw. ST elevation noted in leads II, III and aVF on initial ECG.'
  },
  {
    id: 'c2',
    title: 'COPD Exacerbation — Acute Dyspnea',
    specialty: 'Respiratory',
    difficulty: 'beginner',
    rating: 4.6,
    attemptCount: 890,
    isCompleted: true,
    bestScore: 82,
    tags: ['COPD', 'Spirometry', 'Bronchodilator'],
    description: '62F smoker with 3-day worsening dyspnea and productive cough. Known COPD — assess severity and initiate appropriate management.'
  },
  {
    id: 'c3',
    title: 'Thunderclap Headache — SAH vs Migraine',
    specialty: 'Neurology',
    difficulty: 'advanced',
    rating: 4.9,
    attemptCount: 560,
    isCompleted: false,
    bestScore: null,
    tags: ['LP', 'CT-Head', 'SAH'],
    description: '28F with sudden worst-ever headache, neck stiffness and photophobia. Differentiate subarachnoid haemorrhage from migraine and manage appropriately.'
  },
  {
    id: 'c4',
    title: 'Septic Shock — Source Identification',
    specialty: 'Emergency',
    difficulty: 'advanced',
    rating: 4.7,
    attemptCount: 430,
    isCompleted: false,
    bestScore: null,
    tags: ['Sepsis', 'Cultures', 'Fluids'],
    description: '55M diabetic with fever, hypotension and altered consciousness. Identify the septic focus and initiate time-critical resuscitation.'
  },
  {
    id: 'c5',
    title: 'TIA — Risk Stratification and Management',
    specialty: 'Neurology',
    difficulty: 'beginner',
    rating: 4.5,
    attemptCount: 720,
    isCompleted: true,
    bestScore: 91,
    tags: ['ABCD2', 'Antiplatelet', 'Imaging'],
    description: '67M hypertensive with 30-minute episode of right-sided weakness now fully resolved. Apply ABCD2 score and determine appropriate management pathway.'
  },
  {
    id: 'c6',
    title: 'Palpitations — AF vs SVT',
    specialty: 'Cardiology',
    difficulty: 'intermediate',
    rating: 4.7,
    attemptCount: 640,
    isCompleted: false,
    bestScore: null,
    tags: ['ECG', 'Adenosine', 'Cardioversion'],
    description: '38F with sudden-onset palpitations, mild dyspnea and an irregular pulse on examination. Work up the arrhythmia and initiate rate or rhythm control.'
  }
]

interface CaseLibraryProps {
  searchParams: {
    specialty?: string
    difficulty?: string
    q?: string
  }
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
    <div className="relative bg-white border border-border-default rounded-xl p-5 flex flex-col gap-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover overflow-hidden h-full group">
      {caseItem.isCompleted && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-brand-light text-brand-text border border-border-brand font-mono text-[9px] font-bold uppercase tracking-wider">
            ✓ Completed
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-widest border border-transparent", bg, text)}>
          {caseItem.specialty}
        </span>
        <span 
          className="text-[10px] font-mono font-bold uppercase tracking-tight"
          style={{ color: caseItem.difficulty === 'beginner' ? 'var(--brand)' : caseItem.difficulty === 'intermediate' ? '#D97706' : '#DC2626' }}
        >
          {caseItem.difficulty}
        </span>
      </div>

      <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-1 min-h-[1.25rem]">
        {caseItem.title}
      </h3>

      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 min-h-[2.5rem]">
        {caseItem.description}
      </p>

      <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
        {caseItem.tags.map((tag) => (
          <span 
            key={tag} 
            className="px-1.5 py-0.5 bg-surface-subtle border border-border-default rounded-sm text-text-tertiary font-mono text-[10px] whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-border-default">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold font-mono text-[#92400E]">⚡ +{xpReward} XP</span>
          {caseItem.bestScore !== null && (
            <span className="text-[10px] font-bold font-mono text-brand-text">Best: {caseItem.bestScore}%</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-text-tertiary">
          <span>👥 {caseItem.attemptCount.toLocaleString()}</span>
          <span>⭐ {caseItem.rating.toFixed(1)}</span>
        </div>
      </div>

      <Link 
        href={`/simulation/${caseItem.id}`}
        className="mt-1 w-full h-10 rounded-lg border border-border-brand flex items-center justify-center bg-transparent text-brand font-bold text-[13px] hover:bg-brand hover:text-white transition-all shadow-sm active:translate-y-0.5"
      >
        {caseItem.isCompleted ? 'Retry Case →' : 'Start Case →'}
      </Link>
    </div>
  )
}

export default function CaseLibraryPage({ searchParams }: CaseLibraryProps) {
  const { specialty, difficulty, q } = searchParams
  
  const filteredCases = MOCK_CASES.filter((c) => {
    const sMatch = !specialty || specialty === 'all' || c.specialty.toLowerCase() === specialty.toLowerCase()
    const dMatch = !difficulty || difficulty === 'all' || c.difficulty.toLowerCase() === difficulty.toLowerCase()
    
    let qMatch = true
    if (q) {
      const term = q.toLowerCase()
      const content = `${c.title} ${c.description} ${c.tags.join(' ')}`.toLowerCase()
      qMatch = content.includes(term)
    }
    
    return sMatch && dMatch && qMatch
  })

  const specialtyFilters = ['all', 'cardiology', 'neurology', 'respiratory', 'emergency']
  const difficultyFilters = ['all', 'beginner', 'intermediate', 'advanced']

  const getFilterUrl = (key: string, value: string) => {
    const params = new URLSearchParams()
    if (specialty) params.set('specialty', specialty)
    if (difficulty) params.set('difficulty', difficulty)
    if (q) params.set('q', q)
    
    if (value === 'all') params.delete(key)
    else params.set(key, value)
    
    return `/cases?${params.toString()}`
  }

  return (
    <div className="max-w-[880px] mx-auto p-6 flex flex-col gap-5">
      {/* SECTION 1: Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <h1 className="text-[22px] font-bold text-text-primary tracking-tight">Case Library</h1>
          <span className="text-xs font-bold font-mono text-text-tertiary uppercase tracking-wider">{filteredCases.length} cases</span>
        </div>
        
        <form action="/cases" method="GET" className="relative group">
          <input 
            type="text" 
            name="q"
            defaultValue={q}
            placeholder="Search cases…"
            className="w-[220px] h-[38px] pl-4 pr-10 border border-border-default rounded-full text-[13px] font-medium bg-white focus:outline-none focus:border-brand transition-all shadow-sm"
          />
          {specialty && <input type="hidden" name="specialty" value={specialty} />}
          {difficulty && <input type="hidden" name="difficulty" value={difficulty} />}
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand">
             <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>
      </div>

      {/* SECTION 2: Filter Chips */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {specialtyFilters.map((s) => (
            <Link
              key={s}
              href={getFilterUrl('specialty', s)}
              className={cn(
                "px-3.5 py-1.5 rounded-full border border-border-default text-[12px] font-bold capitalize transition-all hover:bg-surface-subtle hover:text-text-primary",
                (!specialty && s === 'all') || specialty === s 
                  ? "bg-brand-light border-border-brand text-brand-text" 
                  : "text-text-secondary bg-white"
              )}
            >
              {s}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {difficultyFilters.map((d) => (
            <Link
              key={d}
              href={getFilterUrl('difficulty', d)}
              className={cn(
                "px-3.5 py-1.5 rounded-full border border-border-default text-[12px] font-bold capitalize transition-all hover:bg-surface-subtle hover:text-text-primary",
                (!difficulty && d === 'all') || difficulty === d 
                  ? "bg-brand-light border-border-brand text-brand-text" 
                  : "text-text-secondary bg-white"
              )}
            >
              {d}
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION 3: Grid or Empty State */}
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
          {filteredCases.map((c) => (
            <CaseCard key={c.id} caseItem={c} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-white border border-dashed border-border-default rounded-2xl animate-slide-up">
          <SearchX className="w-10 h-10 text-text-tertiary mb-4 opacity-40" />
          <h3 className="text-base font-bold text-text-secondary mb-2">No cases match your filters</h3>
          <Link href="/cases" className="text-sm font-bold font-mono text-brand uppercase tracking-widest hover:underline">
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  )
}
