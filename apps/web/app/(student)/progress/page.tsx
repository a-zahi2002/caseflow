'use client'

import { useState, useEffect } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts'
import { 
  History, Trophy, Target, TrendingUp, AlertCircle, 
  ChevronRight, BookOpen, Clock, CheckCircle2, Star, Target as TargetIcon
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import { cn } from '@/lib/utils'
import type { StudentProgressData } from '@caseflow/types'
import Link from 'next/link'

export default function ProgressPage() {
  const [token, setToken] = useState<string | null>(null)
  const [data, setData] = useState<StudentProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = getToken()
    if (!t) {
      setError('You must be logged in to view progress')
      setLoading(false)
      return
    }
    setToken(t)

    apiClient.get<StudentProgressData>('/progress/me', t)
      .then((res) => {
        if (res.success) {
          setData(res.data)
        } else {
          setError(res.error)
        }
      })
      .catch(() => setError('Failed to load progress data'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden relative">
        <div className="h-full bg-primary absolute inset-0 animate-progress" />
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="p-8 text-center bg-red-50 border border-red-100 text-red-600 rounded-xl max-w-lg mx-auto">
      <AlertCircle className="mx-auto mb-3 w-8 h-8 opacity-50" />
      <h3 className="font-bold mb-1">Could not load progress</h3>
      <p className="text-sm opacity-80">{error || 'Something went wrong while fetching your data.'}</p>
    </div>
  )

  const { metrics, recentAttempts, weakAreas, trend } = data

  const radarData = metrics.specialtyBreakdown.map(s => ({
    subject: s.specialty,
    A: s.avgScore,
    fullMark: 100
  }))

  const chartData = trend.map(t => ({
    ...t,
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Learning Progress</h1>
          <p className="text-muted-foreground mt-1 text-sm">Detailed performance analytics and clinical area analysis.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 border border-border rounded-xl shadow-sm">
           <div className="p-2 bg-amber-50 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-500" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Current Streak</p>
              <p className="text-lg font-bold text-foreground font-mono leading-none">12 Days</p>
           </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Cases', value: metrics.totalAttempts, icon: BookOpen, color: 'emerald' },
          { label: 'Completed', value: metrics.totalCompleted, icon: CheckCircle2, color: 'primary' },
          { label: 'Avg. Score', value: `${Math.round(metrics.overallAvgScore)}%`, icon: Star, color: 'amber' },
          { label: 'Accuracy', value: `${Math.round(metrics.completionRate)}%`, icon: TargetIcon, color: 'red' },
        ].map((m) => (
          <div key={m.label} className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all">
            <div className={cn(
              "p-3 rounded-lg flex items-center justify-center transition-colors shadow-sm",
              m.color === 'primary' ? "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white" :
              m.color === 'amber' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white" :
              m.color === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white" :
              "bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white"
            )}>
              <m.icon size={20} className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{m.label}</p>
              <h3 className="text-2xl font-bold text-foreground font-mono leading-tight">{m.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Diagnostic Accuracy Trend</h2>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Last 30 Days</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickMargin={10} font-family="DM Mono" />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickMargin={10} font-family="DM Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0D9488" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specialty performance */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Aptitude distribution</h2>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar 
                  name="Proficiency" 
                  dataKey="A" 
                  stroke="#0D9488" 
                  fill="#0D9488" 
                  fillOpacity={0.2} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-amber-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" />
              <h2 className="text-lg font-bold text-foreground">Recommended Focus Areas</h2>
            </div>
            <p className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-widest border border-amber-200">Attention Needed</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weakAreas.map(s => (
              <div key={s.specialty} className="bg-background p-5 rounded-lg border border-border flex items-center justify-between group hover:border-amber-300 transition-all">
                <div>
                  <h4 className="font-bold text-foreground text-sm uppercase tracking-tight">{s.specialty}</h4>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">Current Proficiency: {Math.round(s.avgScore)}%</p>
                </div>
                <Link 
                  href={`/cases?specialty=${encodeURIComponent(s.specialty)}`}
                  className="p-2 bg-white text-amber-600 rounded-lg border border-border group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm"
                >
                   <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attempts */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Engagement History</h2>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">Last {recentAttempts.length} Encounters</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-border">
                <th className="px-8 py-4">Clinical Scenario</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentAttempts.map((a) => (
                <tr key={a.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 font-bold text-foreground text-sm flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                     {a.caseTitle}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs uppercase tracking-tight font-semibold">{a.specialty}</td>
                  <td className="px-6 py-4">
                    {a.score !== null ? (
                      <span className={cn(
                        "font-bold font-mono text-sm",
                        a.score >= 80 ? 'text-emerald-600' : a.score >= 50 ? 'text-amber-500' : 'text-red-500'
                      )}>
                        {Math.round(a.score || 0)}%
                      </span>
                    ) : (
                      <span className="text-slate-300 font-mono">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border shadow-sm",
                      a.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      a.status === 'in_progress' ? 'bg-primary/5 text-primary border-primary/20' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    )}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                    {new Date(a.date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <Link 
                      href={`/attempts/${a.id}/result`} 
                      className="inline-flex items-center justify-center p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/10"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentAttempts.length === 0 && (
          <div className="p-16 text-center text-slate-400">
            <BookOpen className="mx-auto mb-4 opacity-10" size={64} />
            <h4 className="font-bold text-slate-800">No recent engagement</h4>
            <p className="text-sm mt-1">Visit the Case Library to start your first clinical simulation.</p>
          </div>
        )}
      </div>
    </div>
  )
}
