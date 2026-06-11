'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { pageVariants, staggerChildren, slideUp } from '@/lib/motion'
import { 
  Users, 
  BookOpen, 
  CheckSquare, 
  TrendingUp, 
  Plus,
  AlertCircle
} from 'lucide-react'

export default function EducatorDashboardPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Assuming educator sees similar analytics to admin
      const res = await api.get<any>('/api/admin/analytics')
      return res.data
    },
  })

  return (
    <motion.div 
      className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Educator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your cases, monitor student performance, and review pending content.
          </p>
        </div>
        
        <Link 
          href="/educator/cases/new" 
          className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand/90 text-white font-semibold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Case
        </Link>
      </div>

      <motion.div variants={staggerChildren} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4 text-brand">
            <div className="p-2 bg-brand/10 rounded-lg"><BookOpen className="w-5 h-5" /></div>
            <span className="font-semibold text-sm">Active Cases</span>
          </div>
          <div className="text-3xl font-bold text-foreground">12</div>
          <div className="text-sm text-muted-foreground mt-1">Published to library</div>
        </motion.div>

        <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4 text-warning">
            <div className="p-2 bg-warning/10 rounded-lg"><CheckSquare className="w-5 h-5" /></div>
            <span className="font-semibold text-sm">Needs Review</span>
          </div>
          <div className="text-3xl font-bold text-foreground">3</div>
          <div className="text-sm text-muted-foreground mt-1">Pending approval</div>
        </motion.div>

        <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4 text-success">
            <div className="p-2 bg-success/10 rounded-lg"><Users className="w-5 h-5" /></div>
            <span className="font-semibold text-sm">Student Attempts</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{analytics?.totalAttempts || 0}</div>
          <div className="text-sm text-muted-foreground mt-1">Across all your cases</div>
        </motion.div>

        <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4 text-xp">
            <div className="p-2 bg-xp/10 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <span className="font-semibold text-sm">Avg Score</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{Math.round(analytics?.avgScore || 0)}%</div>
          <div className="text-sm text-muted-foreground mt-1">Global average</div>
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Most Popular Cases</h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground animate-pulse">Loading analytics...</div>
            ) : analytics?.topCases?.length > 0 ? (
              <div className="divide-y divide-border">
                {analytics.topCases.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="p-4 hover:bg-surface-2 transition-colors flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{c.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{c.attemptCount} attempts</p>
                    </div>
                    <Link href={`/educator/cases/${c.id}`} className="text-sm text-brand font-medium hover:underline">
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                No case data available yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="space-y-6">
              <div className="relative pl-6 border-l-2 border-border pb-6">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand border-2 border-surface" />
                <p className="text-sm font-semibold">New student completed "Acute Chest Pain"</p>
                <p className="text-xs text-muted-foreground mt-1">Score: 92% • 2 hours ago</p>
              </div>
              <div className="relative pl-6 border-l-2 border-border pb-6">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-warning border-2 border-surface" />
                <p className="text-sm font-semibold">Discussion comment needs attention</p>
                <p className="text-xs text-muted-foreground mt-1">In "Diabetic Ketoacidosis" • 5 hours ago</p>
              </div>
              <div className="relative pl-6 border-l-2 border-transparent">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-success border-2 border-surface" />
                <p className="text-sm font-semibold">"Advanced Nephrology" case published</p>
                <p className="text-xs text-muted-foreground mt-1">Approved by admin • Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
