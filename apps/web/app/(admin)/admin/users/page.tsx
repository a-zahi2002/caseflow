'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Users, Search, Shield, UserX, UserCheck, 
  MoreVertical, Filter, Download, Mail, Plus,
  Edit2, Trash2, X, Check, Loader2, AlertCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import type { UserManagementData } from '@caseflow/types'

// --- Components ---

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// --- Page ---

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserManagementData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserManagementData | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    institution: '',
    status: 'active'
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Search Debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchUsers()
  }, [debouncedSearch, filterRole, filterStatus])

  const fetchUsers = async () => {
    setLoading(true)
    const token = getToken()
    if (!token) return

    let query = `?search=${encodeURIComponent(debouncedSearch)}`
    if (filterRole) query += `&role=${filterRole}`
    if (filterStatus) query += `&status=${filterStatus}`

    const res = await apiClient.get<UserManagementData[]>(`/admin/users${query}`, token)
    if (res.success) {
      setUsers(res.data)
      setError(null)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  const handleOpenAdd = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student',
      institution: '',
      status: 'active'
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (user: UserManagementData) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Keep empty unless changing
      role: user.role,
      institution: user.institution || '',
      status: user.status
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    const token = getToken()
    if (!token) return

    const payload: any = { ...formData }
    if (!payload.password) delete payload.password // Don't send empty password
    if (editingUser) delete payload.status // Use toggle methods or include in payload if general update supports it

    // In my new API, PATCH /admin/users/:id supports status too
    if (editingUser) {
      const res = await apiClient.patch<UserManagementData>(`/admin/users/${editingUser.id}`, payload, token)
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? res.data : u))
        setIsModalOpen(false)
      } else {
        setFormError(res.error)
      }
    } else {
      const res = await apiClient.post<UserManagementData>(`/admin/users`, payload, token)
      if (res.success) {
        setUsers(prev => [res.data, ...prev])
        setIsModalOpen(false)
      } else {
        setFormError(res.error)
      }
    }
    setFormLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    const token = getToken()
    if (!token) return

    const res = await apiClient.delete(`/admin/users/${id}`, token)
    if (res.success) {
      setUsers(prev => prev.filter(u => u.id !== id))
    } else {
      alert('Failed to delete user: ' + res.error)
    }
  }

  const handleToggleStatus = async (user: UserManagementData) => {
    const token = getToken()
    if (!token) return

    const newStatus = user.status === 'active' ? 'suspended' : 'active'
    const res = await apiClient.patch<UserManagementData>(`/admin/users/${user.id}`, { status: newStatus }, token)
    if (res.success) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
    } else {
      alert('Failed to update status: ' + res.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm">Manage roles, permissions, and account status for all platform users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export CSV
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-indigo-700 rounded-xl text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm shadow-indigo-100"
          >
            <Plus size={16} />
            Add New User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or institution..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm p-2 outline-none"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="educator">Educator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm p-2 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Institution</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm ring-2 ring-white shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail size={12} className="opacity-70" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 
                          u.role === 'educator' ? 'bg-blue-100 text-blue-700' : 
                          'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {u.institution || <span className="text-slate-300 font-normal">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold
                        ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          className={`p-2 rounded-lg transition ${u.status === 'suspended' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-rose-600 hover:bg-rose-50'}`}
                        >
                          {u.status === 'suspended' ? <UserCheck size={18} /> : <UserX size={18} />}
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          title="Edit User"
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          title="Delete User"
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="group-hover:hidden text-slate-400 p-2">
                        <MoreVertical size={18} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && users.length === 0 && (
          <div className="p-20 text-center text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="opacity-20" size={32} />
            </div>
            <h3 className="text-slate-900 font-bold">No users found</h3>
            <p className="text-sm">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? 'Edit User Details' : 'Create New User Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm flex gap-2 items-center">
              <AlertCircle size={16} />
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Dr. Jane Doe" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
            <input 
              required
              type="email" 
              placeholder="jane.doe@university.edu" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              {editingUser ? 'Password (Leave blank to keep current)' : 'Account Password'}
            </label>
            <input 
              required={!editingUser}
              type="password" 
              placeholder={editingUser ? '••••••••' : 'Minimum 8 characters'} 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">User Role</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm appearance-none"
              >
                <option value="student">Student</option>
                <option value="educator">Educator</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm appearance-none"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Institution</label>
            <input 
              type="text" 
              placeholder="e.g. Oxford Medical School" 
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={formLoading}
              className="flex-[2] px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {formLoading ? <Loader2 className="animate-spin" size={18} /> : editingUser ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
