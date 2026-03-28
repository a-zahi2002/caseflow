'use client'

import { useState, useEffect } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts'
import { 
  History, Trophy, Target, TrendingUp, AlertCircle, 
  ChevronRight, BookOpen, Clock, CheckCircle2
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { getToken, getUser } from '@/lib/auth'
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  if (error || !data) return (
    <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg">
      <AlertCircle className="mx-auto mb-2" />
      <p>{error || 'Something went wrong'}</p>
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
    date: new Date(t.date).toLocaleDateString()
  }))

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Learning Progress</h1>
          <p className="text-slate-500">Track your performance and clinical reasoning over time.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Cases', value: metrics.totalAttempts, icon: BookOpen, color: 'blue' },
          { label: 'Completed', value: metrics.totalCompleted, icon: CheckCircle2, color: 'green' },
          { label: 'Avg. Score', value: `${Math.round(metrics.overallAvgScore)}%`, icon: Trophy, color: 'amber' },
          { label: 'Completion Rate', value: `${Math.round(metrics.completionRate)}%`, icon: Target, color: 'indigo' },
        ].map((m) => (
          <div key={m.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-${m.color}-50 text-${m.color}-600`}>
              <m.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{m.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{m.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Score Trend</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specialty performance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Target size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Performance by specialty</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.5} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-900">Focus Areas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weakAreas.map(s => (
              <div key={s.specialty} className="bg-white p-4 rounded-lg border border-amber-100 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">{s.specialty}</h4>
                  <p className="text-sm text-slate-500">Average: {Math.round(s.avgScore)}% ({s.attempts} cases)</p>
                </div>
                <Link 
                  href={`/cases?specialty=${encodeURIComponent(s.specialty)}`}
                  className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1"
                >
                  Browse <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attempts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <History size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Recent Attempts</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Case Title</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAttempts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{a.caseTitle}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{a.specialty}</td>
                  <td className="px-6 py-4">
                    {a.score !== null ? (
                      <span className={`font-bold ${a.score >= 70 ? 'text-green-600' : a.score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        ${Math.round(a.score || 0)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium 
                      ${a.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        a.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700'}`}>
                      ${a.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/attempts/${a.id}/result`} 
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentAttempts.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <BookOpen className="mx-auto mb-4 opacity-20" size={48} />
            <p>No attempts found. Try starting a simulation case!</p>
          </div>
        )}
      </div>
    </div>
  )
}
