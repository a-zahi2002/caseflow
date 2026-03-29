'use client'

import { useState, useEffect } from 'react'
import { 
  ClipboardCheck, CheckCircle2, XCircle, Eye, 
  Calendar, User as UserIcon, BookOpen, AlertCircle,
  ChevronRight, ArrowLeft
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import type { ModerationQueueItem } from '@caseflow/types'

export default function ModerationPage() {
  const [items, setItems] = useState<ModerationQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    const token = getToken()
    if (!token) return
    const res = await apiClient.get<ModerationQueueItem[]>('/admin/cases/review', token)
    if (res.success) {
      setItems(res.data)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  const handlePreview = async (id: string) => {
    setSelectedCaseId(id)
    setPreviewLoading(true)
    const token = getToken() ?? undefined
    const res = await apiClient.get<any>(`/cases/${id}`, token)
    if (res.success) {
      setPreviewData(res.data)
    }
    setPreviewLoading(false)
  }

  const handleApprove = async (id: string) => {
    if (!id) return
    const token = getToken() ?? undefined
    const res = await apiClient.patch(`/admin/cases/${id}/approve`, {}, token)
    if (res.success) {
      setItems(prev => prev.filter(item => item.id !== id))
      setSelectedCaseId(null)
    } else {
      alert('Failed to approve: ' + res.error)
    }
  }

  const handleReject = async (id: string) => {
    if (!id) return
    const token = getToken() ?? undefined
    const res = await apiClient.patch(`/admin/cases/${id}/reject`, {}, token)
    if (res.success) {
      setItems(prev => prev.filter(item => item.id !== id))
      setSelectedCaseId(null)
    } else {
      alert('Failed to reject: ' + res.error)
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* List Section */}
      <div className={`flex-1 overflow-auto transition-all ${selectedCaseId ? 'max-w-[50%]' : 'max-w-full'}`}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Content Moderation</h1>
          <p className="text-slate-500 text-sm">Review case submissions before they are published to the library.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Case Title</th>
                  <th className="px-6 py-4">Specialty</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedCaseId === item.id ? 'bg-indigo-50/50 hover:bg-indigo-50/50' : ''}`}
                    onClick={() => handlePreview(item.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                        {item.difficulty}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.specialty}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-900">
                        <UserIcon size={14} className="text-slate-400" />
                        {item.authorName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight size={18} className="text-slate-300 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && !loading && (
            <div className="p-12 text-center text-slate-400">
              <ClipboardCheck className="mx-auto mb-4 opacity-20" size={48} />
              <p>The moderation queue is empty. Great job!</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {selectedCaseId && (
        <div className="w-1/2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <button 
              onClick={() => setSelectedCaseId(null)}
              className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-500 flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => handleReject(selectedCaseId)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button 
                onClick={() => handleApprove(selectedCaseId)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition"
              >
                <CheckCircle2 size={16} />
                Approve
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 space-y-8">
            {previewLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-500 text-sm font-medium">Loading case details...</p>
              </div>
            ) : previewData ? (
              <>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{previewData.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase tracking-widest text-slate-600">{previewData.specialty}</span>
                    <span className="px-2 py-1 bg-indigo-100 rounded text-[10px] font-black uppercase tracking-widest text-indigo-700">{previewData.difficulty}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Author</span>
                    <span className="text-sm font-bold text-slate-900">{previewData.author?.name}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Submitted</span>
                    <span className="text-sm font-bold text-slate-900">{new Date(previewData.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-600" />
                    Patient Persona
                  </h3>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {typeof previewData.patientPersona === 'string' 
                      ? previewData.patientPersona 
                      : JSON.stringify(previewData.patientPersona, null, 2)}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-indigo-600" />
                    Simulation Steps ({previewData.steps?.length || 0})
                  </h3>
                  <div className="space-y-4">
                    {previewData.steps?.map((step: any, idx: number) => (
                      <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Step {idx + 1}: {step.type}</span>
                        </div>
                        <p className="text-sm text-slate-600">{step.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
                <p>Failed to load case data.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

