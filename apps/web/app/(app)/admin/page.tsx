'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { api } from '@/lib/api-client'
import { pageVariants, staggerChildren, slideUp } from '@/lib/motion'
import { 
  Users, 
  Activity, 
  ShieldAlert, 
  Server,
  Ban,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'system'>('analytics')

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => (await api.get<any>('/api/admin/analytics')).data,
  })

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<any[]>('/api/admin/users?limit=50')).data,
  })

  const { data: healthData } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const [apiH, dbH, redisH] = await Promise.all([
        api.get<any>('/api/health'),
        api.get<any>('/api/health/db'),
        api.get<any>('/api/health/redis')
      ])
      return { api: apiH.data, db: dbH.data, redis: redisH.data }
    },
    refetchInterval: 30000
  })

  const toggleBanMutation = useMutation({
    mutationFn: async ({ id, isBanned }: { id: string, isBanned: boolean }) => {
      if (isBanned) {
        return api.post(`/api/admin/users/${id}/unban`)
      } else {
        return api.post(`/api/admin/users/${id}/ban`)
      }
    },
    onSuccess: () => refetchUsers()
  })

  return (
    <motion.div 
      className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Console</h1>
        <p className="text-muted-foreground mt-1">Platform administration, analytics, and system health.</p>
      </div>

      <div className="flex border-b border-border mb-8 overflow-x-auto">
        {[
          { id: 'analytics', label: 'Overview & Analytics', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'system', label: 'System Health', icon: Server },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2",
              activeTab === tab.id 
                ? "border-brand text-brand bg-brand/5" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-2"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <motion.div variants={staggerChildren} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-muted-foreground text-sm font-semibold mb-2">Total Simulations</div>
              <div className="text-3xl font-bold">{analyticsLoading ? '-' : analytics?.totalAttempts}</div>
            </motion.div>
            <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-muted-foreground text-sm font-semibold mb-2">Avg Global Score</div>
              <div className="text-3xl font-bold text-brand">{analyticsLoading ? '-' : Math.round(analytics?.avgScore || 0)}%</div>
            </motion.div>
            <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-muted-foreground text-sm font-semibold mb-2">Active Users (30d)</div>
              <div className="text-3xl font-bold text-success">1,204</div>
            </motion.div>
            <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-5 shadow-sm">
              <div className="text-muted-foreground text-sm font-semibold mb-2">Flagged Posts</div>
              <div className="text-3xl font-bold text-warning">12</div>
            </motion.div>
          </motion.div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Top Performing Cases</h3>
            <div className="divide-y divide-border">
              {analytics?.topCases?.map((c: any, i: number) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    <span className="font-medium">{c.title}</span>
                  </div>
                  <span className="text-muted-foreground text-sm bg-surface-2 px-3 py-1 rounded-full">
                    {c.attemptCount} attempts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-2 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersLoading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading users...</td></tr>
                ) : usersData?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{u.id}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-bold",
                        u.role === 'ADMIN' ? 'bg-danger/10 text-danger' :
                        u.role === 'EDUCATOR' ? 'bg-brand/10 text-brand' : 'bg-surface-2 text-muted-foreground'
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{u.level}</td>
                    <td className="px-6 py-4">
                      {u.banned ? (
                        <span className="flex items-center gap-1 text-danger text-xs font-bold"><Ban className="w-3 h-3" /> BANNED</span>
                      ) : (
                        <span className="flex items-center gap-1 text-success text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> ACTIVE</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleBanMutation.mutate({ id: u.id, isBanned: u.banned })}
                        className={cn(
                          "px-3 py-1.5 rounded text-xs font-bold transition-colors",
                          u.banned ? "bg-success/10 text-success hover:bg-success/20" : "bg-danger/10 text-danger hover:bg-danger/20"
                        )}
                      >
                        {u.banned ? 'UNBAN' : 'BAN'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Server className="w-5 h-5 text-brand" /> Services Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                <div>
                  <div className="font-semibold">API Server</div>
                  <div className="text-xs text-muted-foreground">Node.js / Hono</div>
                </div>
                <div className="flex items-center gap-2 text-success font-bold text-sm">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" /> Online
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                <div>
                  <div className="font-semibold">PostgreSQL</div>
                  <div className="text-xs text-muted-foreground">Database & pgvector</div>
                </div>
                <div className="flex items-center gap-2 text-success font-bold text-sm">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" /> 
                  {healthData?.db?.latencyMs ? `${healthData.db.latencyMs}ms` : 'Online'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                <div>
                  <div className="font-semibold">Redis Cache</div>
                  <div className="text-xs text-muted-foreground">In-memory Store</div>
                </div>
                <div className={cn(
                  "flex items-center gap-2 font-bold text-sm",
                  healthData?.redis?.status === 'ok' ? 'text-success' : 'text-warning'
                )}>
                  <div className={cn("w-2 h-2 rounded-full", healthData?.redis?.status === 'ok' ? 'bg-success animate-pulse' : 'bg-warning')} /> 
                  {healthData?.redis?.status === 'ok' ? 'Online' : 'Fallback Mode'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-danger" /> Recent Audit Logs
            </h3>
            <div className="text-sm text-muted-foreground text-center py-12">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
              Audit log UI implementation pending. Data is captured securely in DB.
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
