'use client'

import { cn } from '@/lib/utils'

export default function EducatorDashboard() {
  const kpis = [
    { label: 'Diagnostic Accuracy', value: '84%', trend: '+3.2%', icon: 'biotech', color: 'primary' },
    { label: 'Student Engagement', value: '1,240', suffix: 'HRS', icon: 'person_play', color: 'secondary' },
    { label: 'Completion Rate', value: '78%', trend: '-1.5%', icon: 'task_alt', color: 'tertiary' },
  ]

  const chartData = [
    { label: 'Year 1 Residents', value: 92, height: '90%' },
    { label: 'Pediatrics', value: 78, height: '85%' },
    { label: 'Nursing Y2', value: 65, height: '80%' },
    { label: 'Emergency Med', value: 88, height: '95%' },
  ]

  const activities = [
    { name: 'John Doe', action: 'completed', target: 'Advanced Triage', id: 'TR-402', time: '2m ago', icon: 'assignment_turned_in', type: 'success' },
    { name: 'Year 2 Nursing', action: 'achieved', target: '95% accuracy in Sepsis Drill', label: 'MILESTONE', time: '14m ago', icon: 'military_tech', type: 'milestone' },
    { name: 'Dr. Sarah Miller', action: 'flagged', target: 'Critical Review for Pediatric Cohort', label: 'ATTENTION', time: '1h ago', icon: 'error_outline', type: 'warning' },
    { name: '12 New Students', action: 'onboarded', target: 'to Oncology Module', time: '3h ago', icon: 'person_add', type: 'info' },
  ]

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <section className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-black text-on-surface mb-1 tracking-tight">Educator Dashboard</h1>
          <p className="text-on-surface-variant max-w-2xl font-sans font-medium opacity-80">High-level performance monitoring across active clinical cohorts and simulation tracking.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm">
          <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
          <span className="text-[10px] font-mono font-black uppercase tracking-widest">Q3 ACADEMIC CYCLE</span>
        </div>
      </section>

      {/* KPI Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface-container-lowest p-6 rounded-2xl relative overflow-hidden group border border-outline-variant/10 shadow-sm">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110`}></div>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 bg-${kpi.color}-fixed text-on-${kpi.color}-fixed rounded-xl shadow-sm`}>
                <span className="material-symbols-outlined">{kpi.icon}</span>
              </div>
              <span className={`text-[10px] font-mono font-black text-${kpi.color} px-2.5 py-1 border border-${kpi.color}/20 rounded-full uppercase tracking-tighter`}>Live Metric</span>
            </div>
            <h3 className="text-sm font-heading font-bold text-on-surface-variant mb-1">{kpi.label}</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-heading font-black text-${kpi.color === 'primary' ? 'primary' : 'on-surface'}`}>{kpi.value}</span>
              {kpi.suffix && <span className="text-[10px] font-mono font-black text-on-surface-variant opacity-60 uppercase">{kpi.suffix}</span>}
              {kpi.trend && (
                <span className={`text-[10px] font-mono font-black ${kpi.trend.startsWith('+') ? 'text-primary' : 'text-error'} flex items-center`}>
                  <span className="material-symbols-outlined text-[12px]">{kpi.trend.startsWith('+') ? 'arrow_upward' : 'arrow_downward'}</span> {kpi.trend}
                </span>
              )}
            </div>
            <div className="mt-4 w-full bg-surface-container h-1.5 rounded-full overflow-hidden shadow-inner">
              <div className={`bg-${kpi.color} h-full rounded-full`} style={{ width: kpi.value.includes('%') ? kpi.value : '70%' }}></div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cohort Performance Chart */}
        <div className="lg:col-span-8 bg-surface-container-low p-8 rounded-2xl border border-outline-variant/10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-heading font-black tracking-tight">Cohort Performance</h2>
              <p className="text-[10px] font-mono uppercase font-black text-on-surface-variant opacity-60 tracking-widest mt-1">Diagnostic Speed & Accuracy</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-[10px] font-mono font-black rounded-xl border border-outline-variant/30 hover:bg-surface-container-high transition-all shadow-sm">EXPORT</button>
              <button className="px-4 py-2 text-[10px] font-mono font-black rounded-xl bg-surface-container-highest shadow-sm">MONTHLY</button>
            </div>
          </div>
          
          <div className="relative h-64 w-full flex items-end gap-10 pt-10 px-4">
            <div className="absolute left-0 h-full flex flex-col justify-between text-[9px] font-mono font-black text-on-surface-variant opacity-40 uppercase tracking-tighter">
              <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
            </div>
            <div className="absolute inset-0 pt-10 flex flex-col justify-between pointer-events-none">
              {[0, 25, 50, 75, 100].map((v) => <div key={v} className="border-t border-outline-variant/10 w-full"></div>)}
            </div>
            
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center group cursor-pointer relative z-10 h-full justify-end">
                <div className="w-full bg-primary-container/10 rounded-t-2xl relative h-[90%] transition-all group-hover:bg-primary-container/20 overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full bg-primary rounded-t-xl transition-all group-hover:brightness-110 shadow-lg" 
                    style={{ height: d.height }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white/10 to-transparent"></div>
                  </div>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-mono font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">{d.value}%</div>
                </div>
                <p className="mt-4 text-[10px] font-heading font-black text-center leading-tight uppercase tracking-tight opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all">{d.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-heading font-black tracking-tight">Recent Activity</h2>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">filter_list</span>
            </div>
            <div className="space-y-8 flex-1">
              {activities.map((a, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="relative">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                      a.type === 'success' ? "bg-primary-container text-primary" :
                      a.type === 'milestone' ? "bg-tertiary-fixed text-on-tertiary-fixed" :
                      a.type === 'warning' ? "bg-error-container text-error" : "bg-surface-container-high text-on-surface-variant"
                    )}>
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                    </div>
                    {i !== activities.length - 1 && (
                      <div className="absolute top-12 left-1/2 w-px h-10 bg-outline-variant/10 -translate-x-1/2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-heading font-bold text-on-surface leading-tight truncate">
                      {a.name} <span className="font-sans font-medium text-on-surface-variant">{a.action}</span> {a.target}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {a.label && (
                        <span className={cn(
                          "text-[9px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm",
                          a.type === 'milestone' ? "bg-tertiary-fixed-dim/20 text-tertiary" : "bg-error-container/30 text-error"
                        )}>{a.label}</span>
                      )}
                      {a.id && <span className="text-[9px] font-mono font-black bg-surface-container-low px-1.5 py-0.5 rounded text-primary uppercase shadow-sm">{a.id}</span>}
                      <span className="text-[9px] font-mono font-black text-outline uppercase ml-auto">{a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-3 text-[10px] font-heading font-black text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-all uppercase tracking-widest shadow-sm">VIEW ALL ACTIVITY</button>
          </div>
        </div>
      </div>

      {/* Secondary Insights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12">
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary-container p-8 rounded-3xl text-on-primary flex flex-col justify-between relative overflow-hidden shadow-xl shadow-primary/10 group">
          <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-heading font-black mb-2 tracking-tight">Cohort Success Rate</h3>
            <p className="text-sm text-primary-fixed/80 max-w-sm font-sans font-medium">Year 1 Residents are currently outpacing national benchmarks by 12.4% in diagnostic speed while maintaining high safety standards.</p>
          </div>
          <div className="flex items-center gap-4 relative z-10 mt-10">
            <button className="px-8 py-3 bg-surface text-primary text-xs font-heading font-black rounded-full hover:shadow-lg active:scale-95 transition-all uppercase tracking-tighter">Cohort Deep-dive</button>
            <span className="text-[10px] font-mono font-black text-on-primary-fixed opacity-70 uppercase">Updated 4m ago</span>
          </div>
        </div>
        
        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-16 h-16 rounded-2xl bg-secondary-container/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>clinical_notes</span>
          </div>
          <p className="text-[10px] font-mono font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">Average Case Time</p>
          <h4 className="text-4xl font-heading font-black tracking-tighter">18:42</h4>
          <p className="text-[10px] font-mono font-black text-primary mt-2 uppercase tracking-tight flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_down</span> 2m 14s (Improvement)
          </p>
        </div>

        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <p className="text-[10px] font-mono font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">Active Mentors</p>
          <h4 className="text-4xl font-heading font-black tracking-tighter">24</h4>
          <p className="text-[10px] font-mono font-black text-on-surface-variant mt-2 uppercase tracking-tight">Across 6 Departments</p>
        </div>
      </section>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button className="w-14 h-14 bg-surface dark:bg-slate-900 text-on-surface rounded-full shadow-2xl border border-outline-variant/20 flex items-center justify-center hover:scale-110 transition-all group ring-1 ring-black/5">
          <span className="material-symbols-outlined group-hover:text-primary transition-colors">print</span>
        </button>
        <button className="w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group ring-4 ring-primary-container/20">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        </button>
      </div>
    </div>
  )
}


