'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Search, Shield, UserX, UserCheck, 
  MoreVertical, Filter, Download, Mail
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import type { UserManagementData } from '@caseflow/types'

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserManagementData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [filterRole, filterStatus])

  const fetchUsers = async () => {
    const token = getToken()
    if (!token) return

    let query = ''
    if (filterRole) query += `?role=${filterRole}`
    if (filterStatus) {
      query += query ? `&status=${filterStatus}` : `?status=${filterStatus}`
    }

    const res = await apiClient.get<UserManagementData[]>(`/admin/users${query}`, token)
    if (res.success) {
      setUsers(res.data)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  const handleChangeRole = async (id: string, newRole: string) => {
    const token = getToken()
    if (!token) return

    const res = await apiClient.patch(`/admin/users/${id}/role`, { role: newRole }, token)
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole as any } : u))
    } else {
      alert('Failed to update role: ' + res.error)
    }
  }

  const handleToggleSuspend = async (id: string, isSuspended: boolean) => {
    const token = getToken()
    if (!token) return

    const res = await apiClient.patch(`/admin/users/${id}/suspend`, { suspend: !isSuspended }, token)
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: isSuspended ? 'active' : 'suspended' } : u))
    } else {
      alert('Failed to update status: ' + res.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm">Manage roles, permissions, and account status for all platform users.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or institution..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg text-sm p-2"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="educator">Educator</option>
            <option value="admin">Admin</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg text-sm p-2"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Institution</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail size={12} />
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="text-xs bg-slate-100 border-none rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="student">Student</option>
                      <option value="educator">Educator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {u.institution || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest 
                      ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleSuspend(u.id, u.status === 'suspended')}
                        title={u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                        className={`p-2 rounded-lg transition ${u.status === 'suspended' ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                      >
                        {u.status === 'suspended' ? <UserCheck size={18} /> : <UserX size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !loading && (
          <div className="p-12 text-center text-slate-400">
            <Users className="mx-auto mb-4 opacity-20" size={48} />
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

