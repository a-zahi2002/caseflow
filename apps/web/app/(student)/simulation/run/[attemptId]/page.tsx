'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MessageCircle, Heart, Clock, XCircle, Send, User, GraduationCap, Loader2 } from 'lucide-react'
import { SimulationClient } from '@/lib/simulation'
import { getToken } from '@/lib/auth'
import { apiClient } from '@/lib/api-client'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'

interface Message {
  role: 'student' | 'patient'
  content: string
  streaming?: boolean
}

interface SimState {
  heartsRemaining: number
  timeElapsed: number
}

type SimStep = 'history' | 'examination' | 'investigation' | 'diagnosis' | 'management'

const QUICK_ACTIONS: Record<SimStep, string[]> = {
  history: ['Where is the pain?', 'How long has this been going on?', 'Any similar episodes before?', 'Any other symptoms?'],
  examination: ['Auscultate the heart', 'Auscultate the lungs', 'Check for peripheral oedema', 'Assess JVP'],
  investigation: ['Order an ECG', 'Order FBC and U&E', 'Request a chest X-ray', 'Order troponin'],
  diagnosis: ['My primary diagnosis is...', 'I need to rule out...', 'The differentials include...'],
  management: ['Establish IV access', 'Give aspirin 300mg stat', 'Call the cardiology team', 'Start continuous monitoring'],
}

export default function SimulationPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const router = useRouter()
  const clientRef = useRef<SimulationClient | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [attempt, setAttempt] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [simState, setSimState] = useState<SimState>({ heartsRemaining: 3, timeElapsed: 0 })
  const [currentStep, setCurrentStep] = useState<SimStep>('history')
  const [isPatientTyping, setIsPatientTyping] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    async function loadAttempt() {
      try {
        const res = await apiClient.get<any>(`/simulation/${attemptId}`)
        if (res.success) {
          setAttempt(res.data)
          setSimState({ 
            heartsRemaining: res.data.heartsRemaining ?? 3, 
            timeElapsed: res.data.timeElapsed ?? 0 
          })
          // Load existing messages if any
          if (res.data.messages) {
            setMessages(res.data.messages.map((m: any) => ({
              role: m.role,
              content: m.content
            })))
          }
        }
      } catch (err) {
        setError('Failed to load clinical encounter data')
      }
    }

    loadAttempt()

    const client = new SimulationClient({
      attemptId,
      apiUrl: config.apiUrl,
      onChunk: (chunk) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last?.streaming) {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + chunk },
            ]
          }
          return [
            ...prev,
            { role: 'patient', content: chunk, streaming: true },
          ]
        })
      },
      onTurnEnd: (heartsRemaining, timeElapsed) => {
        setIsPatientTyping(false)
        setSimState({ heartsRemaining, timeElapsed })
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last?.streaming) {
            return [...prev.slice(0, -1), { ...last, streaming: false }]
          }
          return prev
        })
      },
      onError: (msg) => {
        setError(msg)
        setIsPatientTyping(false)
      },
      onEnded: () => {
        setIsEnded(true)
        router.push(`/attempts/${attemptId}/result`)
      },
    })

    client.connect()
    clientRef.current = client

    return () => client.disconnect()
  }, [attemptId, router])

  function sendMessage(text?: string) {
    const content = text || input.trim()
    if (!content || isPatientTyping || isEnded) return

    setMessages((prev) => [...prev, { role: 'student', content }])
    setInput('')
    setIsPatientTyping(true)
    setError(null)

    clientRef.current?.sendMessage(content, currentStep)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function endSimulation() {
    clientRef.current?.endSimulation()
  }

  const hearts = Array.from({ length: 3 }, (_, i) => i < simState.heartsRemaining)

  const persona = attempt?.case?.patientPersona
  const isFemale = persona?.sex?.toLowerCase() === 'female'
  const displayName = persona?.name || (isFemale ? 'Ms. Nimali Perera' : 'Mr. Kamal Perera')
  const displayEmoji = persona?.emoji || (isFemale ? '👩🏽‍🦳' : '🧑🏽‍🦳')

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Simulation Header */}
      <header className="bg-white border-b border-border-default px-6 py-3 flex items-center justify-between z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center border border-brand/20">
             <GraduationCap className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary leading-tight">
              {attempt?.case?.title || 'Clinical Encounter'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] uppercase font-bold text-brand tracking-widest bg-brand-light px-2 py-0.5 rounded border border-border-brand">Simulation Active</span>
               <span className="text-[10px] font-mono text-text-tertiary">• Attempt ID: {attemptId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm font-bold font-mono text-text-primary">{Math.floor(simState.timeElapsed / 60)}:{(simState.timeElapsed % 60).toString().padStart(2, '0')}</span>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg">
              {hearts.map((alive, i) => (
                <Heart key={i} className={cn("w-4 h-4 transition-all", alive ? "text-red-500 fill-current" : "text-slate-200")} />
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-border-default" />

          <button
            onClick={endSimulation}
            disabled={isEnded}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all shadow-sm active:translate-y-0.5 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Finish & Evaluate
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: Patient & Progress */}
        <aside className="w-[300px] bg-white border-r border-border-default overflow-y-auto hidden lg:flex flex-col p-6 gap-6 z-10 shadow-sm shadow-black/5">
          {/* Patient Info */}
          <div className="bg-surface-subtle border border-border-default rounded-2xl p-5 flex flex-col items-center text-center shadow-inner">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-[40px] border-2 border-brand-light bg-white mb-4 shadow-sm">
              {displayEmoji}
            </div>
            <h2 className="text-base font-bold text-text-primary leading-tight">
              {displayName}
            </h2>
            <span className="text-[11px] font-bold font-mono text-text-tertiary uppercase tracking-widest mt-1.5">
              {attempt?.case?.patientPersona?.age || 45} {attempt?.case?.patientPersona?.sex || 'Male'} · {attempt?.case?.patientPersona?.presentingComplaint || 'Chest Pain'}
            </span>
          </div>

          {/* Scenario Progress */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold font-mono text-text-tertiary uppercase tracking-[0.08em] block">
              Simulation Progress
            </span>
            <div className="flex flex-col gap-2">
              {['history', 'examination', 'investigation', 'diagnosis', 'management'].map((step, index) => {
                const isActive = currentStep === step
                return (
                  <button 
                    key={step} 
                    onClick={() => setCurrentStep(step as SimStep)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left",
                      isActive ? "bg-brand-light border-border-brand text-brand-text" : "bg-transparent border-transparent text-text-tertiary hover:bg-surface-subtle"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-mono",
                      isActive ? "bg-brand text-white shadow-sm" : "bg-white border border-border-default text-text-tertiary"
                    )}>
                      {index + 1}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">{step}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-auto bg-reward-light border border-reward/20 rounded-xl p-4">
             <div className="flex items-center gap-2 text-reward-text font-bold text-[12px] uppercase font-mono">
               <span>⚡</span>
               <span>Goal: Diagnostic Accuracy</span>
             </div>
          </div>
        </aside>

        {/* MAIN AREA: Chat */}
        <div className="flex-1 flex flex-col bg-slate-50 relative">
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.length === 0 && !attempt && (
                <div className="flex flex-col items-center justify-center p-20 animate-pulse">
                  <Loader2 className="w-8 h-8 text-brand animate-spin mb-4" />
                  <p className="text-sm text-text-tertiary font-bold uppercase tracking-widest">Entering Clinical Briefing...</p>
                </div>
              )}
              
              {messages.length === 0 && attempt && (
                <div className="bg-white border border-border-default rounded-3xl p-10 text-center space-y-4 max-w-sm mx-auto shadow-sm animate-slide-up">
                  <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-2">
                     <MessageCircle className="w-10 h-10 text-brand" />
                  </div>
                  <h3 className="font-bold text-text-primary text-xl">Consultation Phase</h3>
                  <p className="text-sm text-text-secondary">The patient is ready. Begin by introducing yourself and asking about their presenting complaint.</p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3.5 group",
                    msg.role === 'student' ? 'flex-row-reverse animate-slide-up' : 'flex-row'
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-transform group-hover:scale-105",
                    msg.role === 'student' ? "bg-brand text-white border-brand" : "bg-white border-border-default text-text-tertiary text-xl"
                  )}>
                     {msg.role === 'student' ? <User size={16} /> : displayEmoji}
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-lg px-5 py-4 rounded-2xl text-[14px] leading-[1.6] shadow-sm border transition-all hover:shadow-md",
                      msg.role === 'student'
                        ? 'bg-brand text-white border-brand rounded-tr-sm font-medium'
                        : 'bg-white border-border-default text-text-primary rounded-tl-sm'
                    )}
                  >
                    {msg.content}
                    {msg.streaming && (
                      <span className="inline-block w-1.5 h-4 bg-brand/40 ml-1 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
              
              {isPatientTyping && messages[messages.length - 1]?.role !== 'patient' && (
                <div className="flex justify-start items-start gap-3.5 animate-slide-up">
                   <div className="w-9 h-9 rounded-xl bg-white border border-border-default text-xl flex items-center justify-center shrink-0 shadow-sm">
                      {displayEmoji}
                   </div>
                   <div className="bg-white border border-border-default rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-brand/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-brand/30 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <span className="w-2 h-2 bg-brand/30 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-center text-red-600 text-[10px] font-bold font-mono uppercase tracking-[0.2em] shadow-sm animate-shake">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Section */}
          <div className="bg-white border-t border-border-default p-6 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] shrink-0 z-20">
            <div className="max-w-3xl mx-auto">
              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {QUICK_ACTIONS[currentStep].map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    disabled={isPatientTyping || isEnded || !attempt}
                    className="px-3 py-1.5 bg-surface-subtle border border-border-default rounded-full text-[11px] font-bold text-text-secondary hover:border-brand hover:text-brand transition-all disabled:opacity-40 shadow-sm"
                  >
                    {action}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isPatientTyping || isEnded || !attempt}
                  placeholder={attempt ? "Ask the patient a professional question..." : "Loading clinical encounter..."}
                  rows={2}
                  className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-border-default rounded-2xl text-[14px] font-medium resize-none focus:outline-none focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all disabled:opacity-50 disabled:bg-slate-100 shadow-inner"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isPatientTyping || isEnded || !attempt}
                  className="absolute right-4 bottom-4 p-3 bg-brand text-white rounded-xl hover:bg-brand-hover disabled:opacity-50 shadow-lg shadow-brand/20 active:translate-y-0.5 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between px-2">
                 <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest font-mono italic opacity-60">System Ready: {attempt?.case?.specialty || 'General'}</p>
                 <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest font-mono opacity-60">Press Enter ↵</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
