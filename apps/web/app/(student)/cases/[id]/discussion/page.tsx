'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  MessageSquare, Send, Reply, User as UserIcon, 
  Clock, AlertCircle, Loader2, ArrowLeft
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { getToken, getUser } from '@/lib/auth'
import type { DiscussionMessage, User } from '@caseflow/types'
import Link from 'next/link'

export default function DiscussionPage() {
  const { id } = useParams()
  const [messages, setMessages] = useState<DiscussionMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const token = getToken()
  const user = getUser()

  useEffect(() => {
    fetchDiscussions()
  }, [id])

  const fetchDiscussions = async () => {
    const res = await apiClient.get<DiscussionMessage[]>(`/discussions/${id}`)
    if (res.success) {
      setMessages(res.data)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newComment.trim() || submitting) return

    setSubmitting(true)
    
    // Optimistic update
    const tempId = Math.random().toString(36).substring(7)
    const optimisticComment: DiscussionMessage = {
      id: tempId,
      caseId: id as string,
      userId: user?.id || '',
      userName: user?.name || 'You',
      userRole: user?.role || 'student',
      content: newComment,
      parentId: null,
      createdAt: new Date().toISOString(),
      replies: []
    }

    setMessages(prev => [...prev, optimisticComment])
    const currentComment = newComment
    setNewComment('')

    const res = await apiClient.post<DiscussionMessage>(`/discussions/${id}`, { content: currentComment }, token)
    
    if (res.success) {
      setMessages(prev => prev.map(m => m.id === tempId ? res.data : m))
    } else {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setNewComment(currentComment)
      alert('Failed to post comment: ' + res.error)
    }
    setSubmitting(false)
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!token || !replyContent.trim() || submitting) return

    setSubmitting(true)
    
    // Optimistic update
    const tempId = Math.random().toString(36).substring(7)
    const optimisticReply: DiscussionMessage = {
      id: tempId,
      caseId: id as string,
      userId: user?.id || '',
      userName: user?.name || 'You',
      userRole: user?.role || 'student',
      content: replyContent,
      parentId: parentId,
      createdAt: new Date().toISOString()
    }

    setMessages(prev => prev.map(m => {
      if (m.id === parentId) {
        return { ...m, replies: [...(m.replies || []), optimisticReply] }
      }
      return m
    }))

    const currentReply = replyContent
    setReplyContent('')
    setReplyTo(null)

    const res = await apiClient.post<DiscussionMessage>(`/discussions/${id}/reply/${parentId}`, { content: currentReply }, token)
    
    if (res.success) {
      setMessages(prev => prev.map(m => {
        if (m.id === parentId) {
          return { 
            ...m, 
            replies: (m.replies || []).map((r: DiscussionMessage) => r.id === tempId ? res.data : r)
          }
        }
        return m
      }))
    } else {
      setMessages(prev => prev.map(m => {
        if (m.id === parentId) {
          return { ...m, replies: (m.replies || []).filter((r: DiscussionMessage) => r.id !== tempId) }
        }
        return m
      }))
      setReplyTo(parentId)
      setReplyContent(currentReply)
      alert('Failed to post reply: ' + res.error)
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-indigo-600" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/cases/${id}`} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 border-l-4 border-indigo-600 pl-4">Case Discussion</h1>
        </div>
      </div>

      {/* Main Comment Box */}
      {token ? (
        <form onSubmit={handleSubmitComment} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <UserIcon size={20} />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts or clinical reasoning..."
                className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-700"
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-slate-400">{newComment.length} / 2000</span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium"
                >
                  <Send size={18} />
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto shadow-sm">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Join the Consultation</h3>
          <p className="text-slate-500 max-w-sm mx-auto">You need to be logged in to participate in the case discussion and share your insights.</p>
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Log in to Join
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6 pb-20">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MessageSquare className="mx-auto mb-4 opacity-20" size={48} />
            <p>No comments yet. Be the first to start the discussion!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="group">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative z-10 transition hover:border-slate-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{msg.userName}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded 
                          ${msg.userRole === 'educator' ? 'bg-indigo-100 text-indigo-700' : 
                            msg.userRole === 'admin' ? 'bg-amber-100 text-amber-700' : 
                            'bg-slate-100 text-slate-600'}`}>
                          {msg.userRole}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={12} />
                        <span>{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                
                {token && (
                  <div className="mt-4 flex items-center gap-4">
                    <button 
                      onClick={() => setReplyTo(replyTo === msg.id ? null : msg.id)}
                      className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5"
                    >
                      <Reply size={14} />
                      Reply
                    </button>
                  </div>
                )}

                {/* Reply Form */}
                {replyTo === msg.id && (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full min-h-[80px] p-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        onClick={() => setReplyTo(null)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-md transition"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleSubmitReply(msg.id)}
                        disabled={!replyContent.trim() || submitting}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                      >
                        Post Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Nested Replies */}
              {msg.replies && msg.replies.length > 0 && (
                <div className="ml-12 mt-4 space-y-4 border-l-2 border-slate-100 pl-6">
                  {msg.replies.map((reply: DiscussionMessage) => (
                    <div key={reply.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm text-slate-900">{reply.userName}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1 py-0.5 rounded 
                          ${reply.userRole === 'educator' ? 'bg-indigo-100 text-indigo-700' : 
                            'bg-white text-slate-600 border border-slate-200'}`}>
                          {reply.userRole}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-auto">{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 text-sm whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
