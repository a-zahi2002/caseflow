'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, Building, List, Layout, 
  MessageSquare, Users, Save, CheckCircle2,
  AlertCircle, Loader2, X
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import type { PlatformSettingsData } from '@caseflow/types'

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettingsData>({
    institutionName: '',
    allowedSpecialties: [],
    discussionsEnabled: true,
    communitySubmissionsEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const token = getToken()
    if (!token) return
    const res = await apiClient.get<PlatformSettingsData>('/admin/settings', token)
    if (res.success) {
      setSettings(res.data)
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const token = getToken()
    if (!token) return

    const res = await apiClient.put('/admin/settings', settings, token)
    if (res.success) {
      setSuccessMessage('Settings updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      alert('Failed to save settings: ' + res.error)
    }
    setSaving(false)
  }

  const addSpecialty = () => {
    if (!newSpecialty.trim()) return
    if (settings.allowedSpecialties.includes(newSpecialty.trim())) return
    setSettings(prev => ({
      ...prev,
      allowedSpecialties: [...prev.allowedSpecialties, newSpecialty.trim()]
    }))
    setNewSpecialty('')
  }

  const removeSpecialty = (name: string) => {
    setSettings(prev => ({
      ...prev,
      allowedSpecialties: prev.allowedSpecialties.filter(s => s !== name)
    }))
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-indigo-600" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 text-sm">Configure global platform behavior and institutional branding.</p>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <Building size={16} className="text-indigo-600" />
              Institutional Branding
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
              <input 
                type="text" 
                value={settings.institutionName}
                onChange={(e) => setSettings(prev => ({ ...prev, institutionName: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="e.g., St. Mary Medical College"
                required
              />
            </div>
          </div>
        </div>

        {/* Content Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <List size={16} className="text-indigo-600" />
              Medical Specialties
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Configure Allowed Specialties</label>
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g., Cardiology, Neurology..."
                />
                <button 
                  type="button" 
                  onClick={addSpecialty}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.allowedSpecialties.map(s => (
                  <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-2 border border-indigo-100">
                    {s}
                    <button type="button" onClick={() => removeSpecialty(s)} className="p-0.5 hover:bg-indigo-200 rounded-full">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {settings.allowedSpecialties.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No specialties configured. All specialties will be allowed by default.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <Layout size={16} className="text-indigo-600" />
              Feature Governance
            </h3>
          </div>
          <div className="p-6 divide-y divide-slate-100">
            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Peer Discussions</h4>
                <p className="text-xs text-slate-500">Allow students and educators to comment on cases.</p>
              </div>
              <button 
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, discussionsEnabled: !prev.discussionsEnabled }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.discussionsEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.discussionsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Community Submissions</h4>
                <p className="text-xs text-slate-500">Enable the "Create Case" tool for non-admin educators.</p>
              </div>
              <button 
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, communitySubmissionsEnabled: !prev.communitySubmissionsEnabled }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.communitySubmissionsEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.communitySubmissionsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Platform Changes
          </button>
        </div>
      </form>
    </div>
  )
}

