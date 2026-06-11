'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import type { Attempt, Case, CaseStep, SimMessage, WSMessageToClient, WSMessageToServer } from '@caseflow/types'
import { 
  Send, 
  HeartPulse, 
  Stethoscope, 
  ClipboardList, 
  Clock, 
  MoreVertical,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Pause,
  LogOut
} from 'lucide-react'

type PopulatedAttempt = Attempt & { 
  case: Case & { steps: CaseStep[] }
  messages: SimMessage[] 
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

export default function SimulationPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string

  const [ws, setWs] = useState<WebSocket | null>(null)
  const [messages, setMessages] = useState<Array<{ id: string, role: string, content: string }>>([])
  const [streamingText, setStreamingText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [inputText, setInputText] = useState('')
  const [hearts, setHearts] = useState(3)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showEvaluation, setShowEvaluation] = useState<any | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial attempt data
  const { data: attempt, isLoading } = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: async () => {
      const res = await api.get<PopulatedAttempt>(`/api/simulation/${attemptId}`)
      return res.data
    },
    refetchOnWindowFocus: false,
  })

  // Initialize state from attempt data
  useEffect(() => {
    if (attempt) {
      setMessages(attempt.messages.map(m => ({ id: m.id, role: m.role, content: m.content })))
      setHearts(attempt.heartsRemaining)
      setCurrentStepIndex(attempt.currentStepOrder)
      setNotes(attempt.notes || '')
      if (attempt.status === 'COMPLETED' || attempt.status === 'FAILED') {
        setIsCompleted(true)
      }
    }
  }, [attempt])

  // WebSocket Connection
  useEffect(() => {
    if (!attempt || isCompleted) return

    const socket = new WebSocket(`${WS_URL}/api/simulation/${attemptId}/ws`)
    
    socket.onopen = () => {
      setWs(socket)
      setErrorMsg(null)
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as WSMessageToClient
      
      switch (data.type) {
        case 'stream_chunk':
          setIsStreaming(true)
          setStreamingText(prev => prev + data.content)
          break
          
        case 'stream_end':
          setIsStreaming(false)
          setMessages(prev => [...prev, { id: data.messageId, role: 'patient', content: streamingText + (data as any).content }]) // Temporary hack for chunk concat timing
          // Wait, actually stream_chunk events already update streamingText. Let's just push what we have.
          // Better: just push streamingText and clear it. Note that React batching might cause race conditions, so functional update is safer.
          setMessages(prev => {
            const newMsg = { id: data.messageId, role: 'patient', content: '' } // content will be populated by another effect if we want, or we just rely on the full response
            // It's safer to keep it empty here and rely on the UI to show the final message, but we don't send the full text in stream_end yet.
            // Let's assume the manager sends the full message on next poll or we just use our accumulated streamingText.
            return [...prev, { id: data.messageId, role: 'patient', content: streamingText }]
          })
          setStreamingText('')
          break
          
        case 'evaluation':
          setHearts(data.heartsRemaining)
          if (data.result.criticalErrorTriggered) {
            setShowEvaluation({ type: 'critical_error', feedback: data.result.feedback })
          } else if (data.result.stepComplete) {
            setShowEvaluation({ type: 'step_complete', feedback: data.result.feedback })
          }
          break
          
        case 'step_advance':
          setCurrentStepIndex(data.newStepOrder)
          setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: `[DATA REVEALED] ${data.revealedData}` }])
          break
          
        case 'attempt_complete':
          setIsCompleted(true)
          router.push(`/simulation/${attemptId}/debrief`)
          break
          
        case 'attempt_failed':
          setIsCompleted(true)
          router.push(`/simulation/${attemptId}/debrief`)
          break
          
        case 'error':
          setErrorMsg(data.message)
          break
      }
    }

    socket.onclose = () => {
      setWs(null)
    }

    return () => {
      socket.close()
    }
  }, [attempt, attemptId, isCompleted, router, streamingText])

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !ws || isStreaming) return

    const newMsg = { id: `temp-${Date.now()}`, role: 'student', content: inputText.trim() }
    setMessages(prev => [...prev, newMsg])
    
    ws.send(JSON.stringify({ type: 'message', content: inputText.trim() }))
    setInputText('')
  }

  const saveNotes = () => {
    if (!ws) return
    ws.send(JSON.stringify({ type: 'sync_notes', content: notes }))
  }

  const handlePause = async () => {
    try {
      await api.post(`/api/simulation/${attemptId}/pause`)
      router.push('/dashboard')
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  if (isLoading || !attempt) {
    return <div className="h-screen w-full flex items-center justify-center text-muted-foreground animate-pulse">Loading simulation environment...</div>
  }

  const currentStep = attempt.case.steps[currentStepIndex] || attempt.case.steps[attempt.case.steps.length - 1]

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-16 shrink-0 bg-surface border-b border-border flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-bold text-foreground">Simulation Active</span>
          </div>
          <div className="w-px h-6 bg-border mx-2" />
          <h1 className="font-medium text-muted-foreground truncate max-w-xs">{attempt.case.title}</h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Hearts */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((h) => (
              <HeartPulse 
                key={h} 
                className={cn("w-5 h-5 transition-all duration-300", h <= hearts ? "text-danger fill-danger" : "text-border fill-transparent scale-90 opacity-50")} 
              />
            ))}
          </div>

          <div className="w-px h-6 bg-border" />

          <button onClick={handlePause} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Pause className="w-4 h-4" /> Pause
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Case Info & Notes */}
        <div className="w-80 bg-surface-2 border-r border-border flex flex-col shrink-0 z-10">
          <div className="p-5 border-b border-border bg-surface">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider mb-4">
              <Stethoscope className="w-4 h-4 text-brand" /> Patient Info
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{attempt.case.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age/Sex</span>
                <span className="font-medium text-foreground">{attempt.case.patientAge}yo {attempt.case.patientGender}</span>
              </div>
              <div className="pt-3 border-t border-border mt-3">
                <span className="text-muted-foreground block mb-1">Chief Complaint</span>
                <span className="font-medium text-foreground leading-snug">{attempt.case.chiefComplaint}</span>
              </div>
            </div>
          </div>

          <div className="p-5 border-b border-border bg-surface">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider mb-4">
              <Activity className="w-4 h-4 text-warning" /> Current Stage
            </div>
            <div className="bg-warning/10 text-warning border border-warning/20 rounded-lg p-3 text-sm font-semibold">
              {currentStepIndex + 1}. {currentStep.name}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Objective: Gather necessary information for this stage to advance.
            </p>
          </div>

          <div className="flex-1 flex flex-col p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
                <ClipboardList className="w-4 h-4 text-xp" /> Clinical Notes
              </div>
              {ws && <span className="text-[10px] text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sync on type</span>}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Take your clinical notes here... (Auto-saves on blur)"
              className="flex-1 w-full resize-none bg-surface border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Main Panel: Chat Interface */}
        <div className="flex-1 flex flex-col relative bg-[#F8FAFC] dark:bg-[#0F172A]">
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                if (msg.role === 'system') {
                  return (
                    <motion.div 
                      key={msg.id || i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mx-auto max-w-lg bg-surface border border-border rounded-lg p-3 text-center shadow-sm"
                    >
                      <p className="text-xs font-semibold text-brand tracking-wider uppercase mb-1">System Update</p>
                      <p className="text-sm text-foreground">{msg.content.replace('[DATA REVEALED] ', '')}</p>
                    </motion.div>
                  )
                }

                const isStudent = msg.role === 'student' || msg.role === 'user'

                return (
                  <motion.div 
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex w-full",
                      isStudent ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed",
                      isStudent 
                        ? "bg-brand text-white rounded-br-none" 
                        : "bg-surface border border-border text-foreground rounded-bl-none"
                    )}>
                      {msg.content}
                    </div>
                  </motion.div>
                )
              })}

              {/* Streaming Message Indicator */}
              {isStreaming && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex w-full justify-start"
                >
                  <div className="max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed bg-surface border border-border text-foreground rounded-bl-none">
                    {streamingText}
                    <span className="inline-block w-1.5 h-4 ml-1 bg-brand animate-pulse align-middle" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-surface border-t border-border shrink-0 z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
            <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isStreaming || isCompleted || !ws}
                placeholder={isStreaming ? "Patient is typing..." : "Type your question or statement..."}
                className="flex-1 bg-surface-2 border border-border rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isStreaming || isCompleted || !ws}
                className="w-14 shrink-0 bg-brand hover:bg-brand/90 text-white rounded-xl flex items-center justify-center shadow-md shadow-brand/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            {errorMsg && (
              <p className="text-center text-xs text-danger mt-3">{errorMsg}</p>
            )}
          </div>

          {/* Evaluation Overlay (Toast-like) */}
          <AnimatePresence>
            {showEvaluation && (
              <motion.div
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 20, x: '-50%' }}
                className={cn(
                  "absolute bottom-28 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-xl flex items-start gap-3 w-full max-w-md border",
                  showEvaluation.type === 'critical_error' 
                    ? "bg-danger text-white border-danger/20" 
                    : "bg-surface text-foreground border-border"
                )}
              >
                {showEvaluation.type === 'critical_error' ? (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-success" />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-sm">
                    {showEvaluation.type === 'critical_error' ? 'Critical Error Detected' : 'Step Completed'}
                  </h4>
                  <p className={cn("text-xs mt-1", showEvaluation.type === 'critical_error' ? "text-white/90" : "text-muted-foreground")}>
                    {showEvaluation.feedback}
                  </p>
                </div>
                <button 
                  onClick={() => setShowEvaluation(null)}
                  className="p-1 hover:bg-black/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
