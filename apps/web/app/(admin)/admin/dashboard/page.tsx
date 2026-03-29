'use client'

import { StatCard } from '@/components/dashboard-stats'
import { Users, Shield, FileText, Activity, ArrowRight, UserPlus, Clock, Settings } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Total Users',
      value: '1,284',
      subValue: '28 new today',
      icon: Users,
      trend: { value: '12%', positive: true }
    },
    {
      label: 'Pending Cases',
      value: '14',
      subValue: 'Needs review',
      icon: Shield,
      trend: { value: '3', positive: false }
    },
    {
      label: 'Active Simulations',
      value: '432',
      subValue: 'Currently live',
      icon: Activity,
    },
    {
      label: 'System Health',
      value: '99.9%',
      subValue: 'All systems go',
      icon: Clock,
    }
  ]

  const recentActions = [
    { user: 'Dr. Sarah Wilson', action: 'Created new case', time: '2 mins ago', icon: FileText },
    { user: 'System', action: 'Automated backup completed', time: '1 hour ago', icon: Activity },
    { user: 'Admin John', action: 'Approved 3 user accounts', time: '2 hours ago', icon: UserPlus },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500 mt-1">Platform-wide statistics and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Platform Activity</h2>
            <Link href="/admin/moderation" className="text-sm font-medium text-[#E11D48] hover:underline flex items-center gap-1">
              View Audit Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActions.map((action, i) => (
              <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{action.user}</p>
                  <p className="text-xs text-gray-500">{action.action}</p>
                </div>
                <span className="text-xs text-gray-400">{action.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <Link 
            href="/admin/users?status=pending" 
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#E11D48] hover:bg-red-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <UserPlus className="w-4 h-4 text-gray-400 group-hover:text-[#E11D48]" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#E11D48]">Approve Users</span>
            </div>
            <span className="bg-red-100 text-[#E11D48] text-[10px] font-bold px-1.5 py-0.5 rounded">12</span>
          </Link>
          <Link 
            href="/admin/moderation" 
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#E11D48] hover:bg-red-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-gray-400 group-hover:text-[#E11D48]" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#E11D48]">Review Content</span>
            </div>
            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">4</span>
          </Link>
          <Link 
            href="/admin/settings" 
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#E11D48] hover:bg-red-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-gray-400 group-hover:text-[#E11D48]" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#E11D48]">System Config</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
