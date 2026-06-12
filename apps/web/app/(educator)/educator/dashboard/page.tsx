'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api-client'
import { Loader2 } from 'lucide-react'
import type { EducatorAnalytics } from '@caseflow/types'

export default function EducatorDashboard() {
  const [analytics, setAnalytics] = useState<EducatorAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await apiClient.get<EducatorAnalytics>('/analytics/educator')
        if (res.success) {
          setAnalytics(res.data)
        }
      } catch (err) {
        console.error('Failed to load educator analytics')
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-ping opacity-20"></div>
      </div>
      <p className="text-sm font-black text-on-surface-variant uppercase tracking-widest animate-pulse">Syncing Clinical Registry...</p>
    </div>
  )

  if (!analytics) return (
     <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-in zoom-in duration-500">
       <div className="w-20 h-20 bg-error-container/30 rounded-3xl flex items-center justify-center text-error border border-error/10 shadow-lg">
         <span className="material-symbols-outlined text-4xl">error</span>
       </div>
       <div>
         <h1 className="text-2xl font-heading font-black">Data Fetch Failure</h1>
         <p className="text-on-surface-variant max-w-sm mt-2">We couldn't synchronize with the analytics core. Check your connection and retry.</p>
       </div>
       <button onClick={() => window.location.reload()} className="px-8 py-3 bg-primary text-on-primary rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">Retry Pull</button>
    </div>
  )

  const kpis = [
    { label: 'Diagnostic Accuracy', value: `${analytics.averageScore}%`, icon: 'biotech', color: 'primary' },
    { label: 'Total Consultations', value: analytics.totalAttempts.toLocaleString(), suffix: 'PTS', icon: 'person_play', color: 'secondary' },
    { label: 'Completion Rate', value: `${analytics.completionRate}%`, icon: 'task_alt', color: 'tertiary' },
  ]

  const chartData = analytics.caseStats.slice(0, 5).map(s => ({
    label: s.title,
    value: s.averageScore,
    height: `${s.averageScore}%`
  }))

  const activities = analytics.caseStats.slice(0, 4).map(s => ({
    name: s.title,
    action: 'viewing',
    target: 'performance metrics',
    id: s.id.slice(0, 6).toUpperCase(),
    time: 'Last synced',
    icon: 'clinical_notes',
    type: 'info'
  }))

  return (
    <div className="space-y-12 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-10 -mr-20 -mt-20"></div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low glass rounded-full mb-4 border border-outline-variant/30">
            <span className="material-symbols-outlined text-[14px] text-primary">school</span>
            <span className="text-[10px] font-mono font-black text-on-surface-variant uppercase tracking-widest">Educator Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-on-surface mb-2 tracking-tight">Analytics Core</h1>
          <p className="text-on-surface-variant max-w-2xl font-sans text-lg font-medium opacity-80">High-level performance monitoring across active clinical cohorts and simulation tracking.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-surface-container-lowest glass rounded-2xl border border-outline-variant/20 shadow-sm relative z-10 hover:shadow-md transition-shadow">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
          </div>
          <div>
            <div className="text-[9px] font-bold text-outline uppercase">Active Term</div>
            <div className="text-xs font-mono font-black uppercase tracking-widest">Q3 ACADEMIC CYCLE</div>
          </div>
        </div>
      </section>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <div 
            key={kpi.label} 
            className="bg-surface-container-lowest glass p-8 rounded-3xl relative overflow-hidden group border border-outline-variant/20 shadow-sm hover:shadow-xl transition-all duration-300"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${kpi.color}/10 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110`}></div>
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className={`w-12 h-12 flex items-center justify-center bg-${kpi.color}-container/20 text-${kpi.color} group-hover:bg-${kpi.color} group-hover:text-on-${kpi.color} rounded-2xl shadow-sm transition-colors duration-300`}>
                <span className="material-symbols-outlined">{kpi.icon}</span>
              </div>
              <span className={`text-[10px] font-mono font-black text-${kpi.color} px-3 py-1 bg-${kpi.color}/10 border border-${kpi.color}/20 rounded-full uppercase tracking-tighter`}>
                Live Metric
              </span>
            </div>
            
            <h3 className="text-sm font-heading font-bold text-on-surface-variant mb-1 relative z-10">{kpi.label}</h3>
            
            <div className="flex items-baseline gap-2 relative z-10 mb-6">
              <span className={`text-5xl font-heading font-black text-${kpi.color === 'primary' ? 'primary' : 'on-surface'}`}>{kpi.value}</span>
              {kpi.suffix && <span className="text-[11px] font-mono font-black text-on-surface-variant opacity-60 uppercase">{kpi.suffix}</span>}
            </div>
            
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden shadow-inner relative z-10">
              <div 
                className={`bg-${kpi.color} h-full rounded-full transition-all duration-1000 ease-out`} 
                style={{ width: kpi.value.includes('%') ? kpi.value : '70%' }}
              ></div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cohort Performance Chart */}
        <div className="lg:col-span-8 bg-surface-container-lowest glass p-8 rounded-3xl border border-outline-variant/20 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 relative z-10">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl font-heading font-black tracking-tight">Cohort Performance</h2>
              <p className="text-xs font-mono uppercase font-bold text-on-surface-variant opacity-80 tracking-widest mt-1">Diagnostic Speed & Accuracy</p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2 text-[10px] font-mono font-black rounded-xl border border-outline-variant/30 hover:bg-surface-container-high transition-all shadow-sm">EXPORT CSV</button>
              <button className="px-5 py-2 text-[10px] font-mono font-black rounded-xl bg-primary text-on-primary shadow-sm hover:brightness-110 transition-all">MONTHLY VIEW</button>
            </div>
          </div>
          
          <div className="relative h-72 w-full flex items-end gap-6 sm:gap-10 pt-10 px-2 sm:px-4 z-10">
            {/* Y Axis */}
            <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] font-mono font-black text-on-surface-variant opacity-40 uppercase tracking-tighter">
              <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute inset-0 pt-10 flex flex-col justify-between pointer-events-none ml-6 sm:ml-8">
              {[0, 25, 50, 75, 100].map((v) => (
                <div key={v} className="border-t border-outline-variant/10 w-full"></div>
              ))}
            </div>
            
            {/* Bars */}
            <div className="flex w-full h-full ml-6 sm:ml-8 items-end gap-4 sm:gap-8">
              {chartData.map((d, i) => (
                <div key={d.label} className="flex-1 flex flex-col items-center group/bar cursor-pointer relative z-10 h-full justify-end">
                  <div className="w-full bg-surface-container-high/50 rounded-t-2xl relative h-[90%] transition-all group-hover/bar:bg-primary-container/20 overflow-hidden border border-outline-variant/5 border-b-0">
                    <div 
                      className="absolute bottom-0 w-full bg-primary rounded-t-xl transition-all duration-1000 group-hover/bar:brightness-110 shadow-lg" 
                      style={{ height: d.height, animationDelay: `${i * 150}ms` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/20 to-transparent"></div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface text-on-surface text-xs font-mono font-black px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover/bar:opacity-100 transition-all transform group-hover/bar:-translate-y-2 pointer-events-none whitespace-nowrap border border-outline-variant/20 z-20">
                      {d.value}% Accuracy
                    </div>
                  </div>
                  <p className="mt-4 text-[10px] font-heading font-black text-center leading-tight uppercase tracking-tight opacity-70 group-hover/bar:opacity-100 group-hover/bar:text-primary transition-all h-8">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest glass p-8 rounded-3xl shadow-sm border border-outline-variant/20 flex-1 flex flex-col relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-tertiary/5 rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-heading font-black tracking-tight">Live Activity</h2>
              <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined text-sm">filter_list</span>
              </button>
            </div>
            
            <div className="space-y-6 flex-1 relative z-10">
              {activities.map((a, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="relative">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105",
                      a.type === 'success' ? "bg-primary-container text-primary" :
                      a.type === 'milestone' ? "bg-tertiary-fixed text-on-tertiary-fixed" :
                      a.type === 'warning' ? "bg-error-container text-error" : "bg-surface-container-high text-on-surface-variant"
                    )}>
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                    </div>
                    {i !== activities.length - 1 && (
                      <div className="absolute top-14 left-1/2 w-px h-8 bg-outline-variant/20 -translate-x-1/2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-heading font-bold text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {a.name} <span className="font-sans font-medium text-on-surface-variant">{a.action}</span> {a.target}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {a.id && <span className="text-[9px] font-mono font-black bg-surface-container-high px-2 py-0.5 rounded text-primary uppercase shadow-sm">{a.id}</span>}
                      <span className="text-[9px] font-mono font-bold text-outline uppercase ml-auto">{a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-4 text-[11px] font-heading font-black text-primary border border-primary/20 rounded-2xl hover:bg-primary hover:text-on-primary transition-all uppercase tracking-widest shadow-sm relative z-10">
              View Complete Audit Log
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Insights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12">
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary-container p-10 rounded-[2rem] text-on-primary flex flex-col justify-between relative overflow-hidden shadow-xl shadow-primary/20 group">
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex px-3 py-1 bg-on-primary/10 rounded-full mb-6">
              <span className="text-[10px] font-mono font-black text-primary-fixed uppercase tracking-widest">Impact Report</span>
            </div>
            <h3 className="text-3xl font-heading font-black mb-4 tracking-tight">Clinical Registry Impact</h3>
            <p className="text-base text-primary-fixed/90 max-w-md font-sans font-medium leading-relaxed">
              Managing <strong className="text-white">{analytics.totalCases} clinical scenarios</strong> with <strong className="text-white">{analytics.totalAttempts} validated student attempts</strong>. 
              Your authored cases maintain an average diagnostic success rate of <strong className="text-white">{analytics.averageScore}%</strong>.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 relative z-10 mt-10">
            <button className="px-8 py-4 bg-surface text-primary text-xs font-heading font-black rounded-2xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
              Engagement Audit
            </button>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest glass p-8 rounded-[2rem] border border-outline-variant/20 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-20 h-20 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary group-hover:text-on-secondary transition-all shadow-sm relative z-10">
            <span className="material-symbols-outlined text-secondary group-hover:text-on-secondary text-4xl transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
          </div>
          <p className="text-[10px] font-mono font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 relative z-10">Authored Cases</p>
          <h4 className="text-5xl font-heading font-black tracking-tighter text-on-surface relative z-10">{analytics.totalCases}</h4>
          <p className="text-[10px] font-mono font-bold text-secondary mt-3 uppercase tracking-tight flex items-center justify-center gap-1 bg-secondary/10 px-3 py-1 rounded-full relative z-10">
            <span className="material-symbols-outlined text-[12px]">fact_check</span> Active
          </p>
        </div>

        <div className="bg-surface-container-lowest glass p-8 rounded-[2rem] border border-outline-variant/20 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-20 h-20 rounded-full bg-tertiary-container/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-tertiary group-hover:text-on-tertiary transition-all shadow-sm relative z-10">
            <span className="material-symbols-outlined text-tertiary group-hover:text-on-tertiary text-4xl transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <p className="text-[10px] font-mono font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 relative z-10">Student Attempts</p>
          <h4 className="text-5xl font-heading font-black tracking-tighter text-on-surface relative z-10">{analytics.totalAttempts}</h4>
          <p className="text-[10px] font-mono font-bold text-tertiary mt-3 uppercase tracking-tight flex items-center justify-center gap-1 bg-tertiary/10 px-3 py-1 rounded-full relative z-10">
            <span className="material-symbols-outlined text-[12px]">verified</span> Validated
          </p>
        </div>
      </section>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-50">
        <button className="w-14 h-14 bg-surface-container-lowest glass text-on-surface rounded-2xl shadow-lg border border-outline-variant/20 flex items-center justify-center hover:scale-110 transition-all group">
          <span className="material-symbols-outlined group-hover:text-primary transition-colors">print</span>
        </button>
        <button className="w-16 h-16 bg-primary text-on-primary rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border border-primary-container hover:rotate-90">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        </button>
      </div>
    </div>
  )
}
