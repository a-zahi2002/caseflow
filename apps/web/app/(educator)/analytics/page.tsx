'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import type { EducatorAnalytics } from '@caseflow/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { TrendingUp, Users, Target, BookOpen } from 'lucide-react'

export default function EducatorAnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState<EducatorAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    apiClient.get<EducatorAnalytics>('/analytics/educator', token).then((res) => {
      if (res.success) {
        setData(res.data)
      }
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return <div className="p-8 text-center text-gray-500">Failed to load analytics.</div>
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Educator Analytics</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Cases"
          value={data.totalCases}
          icon={<BookOpen className="h-4 w-4 text-blue-600" />}
          description="Authored cases"
        />
        <StatCard
          title="Total Attempts"
          value={data.totalAttempts}
          icon={<Users className="h-4 w-4 text-purple-600" />}
          description="Combined student attempts"
        />
        <StatCard
          title="Average Score"
          value={`${data.averageScore}%`}
          icon={<Target className="h-4 w-4 text-green-600" />}
          description="Course-wide average"
        />
        <StatCard
          title="Completion Rate"
          value={`${data.completionRate}%`}
          icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
          description="Average completion"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance Chart */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Average Score per Case</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.caseStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="title" hide={data.caseStats.length > 5} />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="averageScore" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Specialty distribution */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-6">Cases by Specialty</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={Object.entries(data.casesBySpecialty).map(([name, count]) => ({ name, count }))}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Case Stats Table */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold">Detailed Case Statistics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-gray-400 bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Case Title</th>
                <th className="px-6 py-3 font-medium text-center">Attempts</th>
                <th className="px-6 py-3 font-medium text-center">Avg Score</th>
                <th className="px-6 py-3 font-medium text-center">Completion</th>
                <th className="px-6 py-3 font-medium">Commonly Missed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.caseStats.map((stat) => (
                <tr key={stat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{stat.title}</div>
                    <div className="text-xs text-gray-500">{stat.specialty}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">{stat.attemptCount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                      stat.averageScore >= 80 ? 'bg-green-100 text-green-700' :
                      stat.averageScore >= 50 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {stat.averageScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">{stat.completionRate}%</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {stat.mostMissedStep ? (
                      <span className="flex items-center space-x-1">
                        <span className="capitalize">{stat.mostMissedStep.type}</span>
                        <span className="text-xs text-gray-400">({stat.mostMissedStep.missedCount})</span>
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({ title, value, icon, description }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  )
}
