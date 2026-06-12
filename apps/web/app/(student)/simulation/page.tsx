'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, ClipboardIcon, History, Search, Loader2, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import type { StudentProgressData } from '@caseflow/types'

interface RecommendedCase {
  id: string
  title: string
  specialty: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export default function SimulationDashboard() {
  const [progress, setProgress] = useState<StudentProgressData | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendedCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [progRes, casesRes] = await Promise.all([
          apiClient.get<StudentProgressData>('/progress/me'),
          apiClient.get<RecommendedCase[]>('/cases?limit=3')
        ])

        if (progRes.success) setProgress(progRes.data)
        if (casesRes.success && Array.isArray(casesRes.data)) setRecommendations(casesRes.data)
      } catch (err) {
        console.error('Failed to load simulation dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
      <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest animate-pulse">Synchronizing Clinical Data...</p>
    </div>
  )

  const metrics = progress?.metrics || { totalCompleted: 0, overallAvgScore: 0, totalAttempts: 0 }

  return (
    <div className="max-w-[1000px] mx-auto p-8 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">AI Patient Simulations</h1>
          <p className="text-sm text-text-secondary mt-1 max-w-sm">Advance your proficiency through evidence-based AI patient simulations.</p>
        </div>
        <Link 
          href="/cases"
          className="flex items-center gap-2 px-6 py-3 bg-brand text-white text-[13px] font-bold rounded-xl shadow-xl shadow-brand/20 hover:bg-brand-hover transition-all active:translate-y-0.5"
        >
          <Search className="w-4 h-4" />
          Find New Case
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        <div className="space-y-10">
          {/* Active / Recently Started */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
              <h2 className="text-xs font-bold font-mono text-text-tertiary uppercase tracking-widest">Recommended for You</h2>
            </div>
            
            <div className="grid gap-4">
              {recommendations.length > 0 ? recommendations.map((c) => (
                <div key={c.id} className="group bg-white border border-border-default rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-brand/40 hover:shadow-xl">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-surface-subtle rounded-xl flex items-center justify-center text-2xl border border-slate-100 group-hover:bg-brand/5 group-hover:scale-105 transition-all shadow-inner">
                      {['🫀', '🦷', '🧠', '🫁', '🦴'][c.id.charCodeAt(0) % 5]}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary mb-1 group-hover:text-brand transition-colors">{c.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-brand uppercase tracking-widest bg-brand-light px-2 py-0.5 rounded border border-border-brand">{c.specialty}</span>
                        <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">• {c.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/simulation/start/${c.id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 text-[12px] font-bold text-brand bg-white border border-border-brand rounded-xl hover:bg-brand hover:text-white transition-all shadow-sm active:translate-y-0.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Simulation
                  </Link>
                </div>
              )) : (
                <div className="p-10 border border-dashed border-border-default rounded-2xl text-center">
                  <p className="text-sm text-text-tertiary">No cases available in the library yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* How it works */}
          <section className="bg-gradient-to-br from-brand/5 via-brand/5 to-reward-light/5 border border-brand/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <ClipboardIcon className="w-32 h-32" />
            </div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight mb-6">Simulation Workflow</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { icon: '💬', title: 'Consult', desc: 'Engage in non-linear history taking with the AI persona.' },
                { icon: '🔬', title: 'Evaluate', desc: 'Interpret clinical findings and prioritize investigations.' },
                { icon: '🎯', title: 'Synthesize', desc: 'Formulate a management plan and receive expert feedback.' }
              ].map((step, i) => (
                <div key={i} className="space-y-3 relative z-10">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight">{step.title}</h3>
                  <p className="text-[12px] text-text-secondary leading-relaxed font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-border-default rounded-2xl p-6 shadow-sm">
            <h3 className="text-[10px] font-bold font-mono text-text-tertiary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <History className="w-4 h-4" />
              Summary
            </h3>
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest block mb-1">Avg Precision</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-text-primary">{Math.round(metrics.overallAvgScore)}</span>
                  <span className="text-sm font-bold text-text-tertiary">%</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-50">
                <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest block mb-1">Clinical Rank</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-text-primary">Intern</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-border-default rounded-2xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
               <Award className="w-6 h-6 text-text-tertiary" />
            </div>
            <p className="text-[12px] text-text-secondary italic font-medium">"Clinical judgment is the art of seeing the invisible through the evident."</p>
          </div>
        </div>
      </div>
    </div>
  )
}
