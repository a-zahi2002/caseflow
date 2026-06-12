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

  const isFemale = attempt?.case?.patientGender?.toLowerCase() === 'female'
  const displayName = attempt?.case?.patientName || (isFemale ? 'Ms. Nimali Perera' : 'Mr. Kamal Perera')
  const displayEmoji = isFemale ? '👩🏽‍🦳' : '🧑🏽‍🦳'

  return (
    <div className="p-8 flex-1 bg-surface h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      {/* Breadcrumbs / Context */}
      <div className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-on-surface tracking-tight mb-1">
            {attempt?.case?.title || 'Clinical Encounter'}: Case #{attemptId.slice(0, 4).toUpperCase()}
          </h1>
          <p className="text-on-surface-variant font-sans">
            Simulation Stage: <span className="text-primary font-bold uppercase tracking-wider">{currentStep}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-6 mr-4 bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline">schedule</span>
              <span className="text-sm font-bold font-mono text-on-surface">{Math.floor(simState.timeElapsed / 60)}:{(simState.timeElapsed % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {hearts.map((alive, i) => (
                <span key={i} className={cn(
                  "material-symbols-outlined text-lg transition-all",
                  alive ? "text-error" : "text-outline-variant/30"
                )} style={{ fontVariationSettings: alive ? "'FILL' 1" : "'FILL' 0" }}>
                  favorite
                </span>
              ))}
            </div>
          </div>
          <button 
            onClick={endSimulation}
            disabled={isEnded}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-error to-[#d32f2f] text-white rounded-lg text-sm font-heading font-bold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">cancel</span> 
            End & Evaluate
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Vitals & Visualizer */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">
          {/* Vitals Monitor */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden border border-outline-variant/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-bold text-on-surface flex items-center gap-2 text-sm uppercase tracking-widest">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,104,95,0.5)]"></span>
                Real-Time Vitals
              </h3>
              <span className="font-mono text-[10px] text-outline font-bold tracking-widest bg-surface-container-low px-2 py-1 rounded">SIM_FEED_v2.4</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-surface-container-low border-l-4 border-primary shadow-sm group hover:scale-[1.02] transition-transform">
                <p className="font-heading text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Heart Rate</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-on-surface">94</span>
                  <span className="font-mono text-[10px] text-outline">BPM</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low border-l-4 border-tertiary shadow-sm group hover:scale-[1.02] transition-transform">
                <p className="font-heading text-[9px] font-black text-tertiary uppercase tracking-[0.2em] mb-1">SpO2</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-on-surface">98</span>
                  <span className="font-mono text-[10px] text-outline">%</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-error-container/30 border-l-4 border-error shadow-sm group hover:scale-[1.02] transition-transform">
                <p className="font-heading text-[9px] font-black text-error uppercase tracking-[0.2em] mb-1">BP</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-mono text-2xl font-bold text-on-error-container">145/92</span>
                  <span className="font-mono text-[9px] text-on-error-container/60 uppercase">mmHg</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low border-l-4 border-secondary shadow-sm group hover:scale-[1.02] transition-transform">
                <p className="font-heading text-[9px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Temp</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-on-surface">38.4</span>
                  <span className="font-mono text-[10px] text-outline">°C</span>
                </div>
              </div>
            </div>
            {/* Waveform Visualization */}
            <div className="mt-6 h-16 w-full bg-[#0a0f0e] rounded-lg relative overflow-hidden ring-1 ring-white/5 shadow-inner">
              <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
                <path d="M0 32 Q 15 10, 30 32 T 60 32 T 90 32 T 120 32 T 150 32 T 180 32 T 210 32 T 240 32 T 270 32 T 300 32" fill="none" stroke="#008378" strokeWidth="1.5" vectorEffect="non-scaling-stroke"></path>
              </svg>
              <div className="absolute inset-0 flex items-center px-4 justify-between">
                <span className="font-mono text-[9px] text-primary-fixed uppercase font-bold tracking-widest opacity-80">ECG Lead II</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed shadow-[0_0_8px_rgba(107,216,203,1)]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed/20"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed/20"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Visualizer & Info */}
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[300px] border border-outline-variant/20">
            <div className="w-full md:w-1/2 relative bg-surface-container-high">
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {displayEmoji}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <span className="px-2 py-1 rounded bg-surface/80 text-on-surface font-mono text-[10px] uppercase tracking-widest font-bold shadow-sm backdrop-blur-sm ring-1 ring-outline-variant/20">
                  Patient Profile: {displayName}
                </span>
              </div>
            </div>
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
              <h4 className="font-heading font-bold text-lg mb-4 text-on-surface">Briefing Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/10">
                  <span className="text-xs text-outline font-sans font-bold uppercase tracking-wider">Demographics</span>
                  <span className="text-sm font-mono font-bold">{attempt?.case?.patientAge || 45}y / {attempt?.case?.patientGender || 'M'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/10">
                  <span className="text-xs text-outline font-sans font-bold uppercase tracking-wider">Complaint</span>
                  <span className="text-sm font-mono font-bold text-primary">{attempt?.case?.chiefComplaint || 'Chest Pain'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-outline-variant/10">
                  <span className="text-xs text-outline font-sans font-bold uppercase tracking-wider">Risk Level</span>
                  <span className="text-sm font-mono font-bold text-error">Moderate Shock Risk</span>
                </div>
              </div>
              <p className="text-[13px] text-on-surface-variant font-sans mt-6 italic bg-surface-container-low p-3 rounded-lg ring-1 ring-outline-variant/10">
                "{messages[1]?.content || 'Initializing patient encounter...'}"
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Interface & History */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 h-full overflow-hidden min-h-0">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 flex flex-col flex-1 min-h-0">
            {/* Step Navigation */}
            <div className="flex border-b border-outline-variant/10 overflow-x-auto no-scrollbar">
              {(['history', 'examination', 'investigation', 'diagnosis', 'management'] as SimStep[]).map((step, i) => (
                <button
                  key={step}
                  onClick={() => setCurrentStep(step)}
                  className={cn(
                    "flex-1 min-w-0 px-2 py-3 text-[10px] font-heading font-bold uppercase tracking-[0.1em] transition-all whitespace-nowrap",
                    currentStep === step
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-outline hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <span className="hidden sm:inline">{i + 1}. </span>{step}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 no-scrollbar">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 group",
                    msg.role === 'student' ? 'flex-row-reverse animate-slide-up' : 'flex-row animate-slide-up'
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 text-sm transition-transform group-hover:scale-110",
                    msg.role === 'student' ? "bg-primary text-on-primary border-primary shadow-sm" : "bg-white border-outline-variant/30 text-outline shadow-sm"
                  )}>
                     {msg.role === 'student' ? <span className="material-symbols-outlined text-sm">person</span> : displayEmoji}
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed shadow-sm ring-1",
                      msg.role === 'student'
                        ? 'bg-primary text-on-primary border-primary ring-white/10 rounded-tr-sm font-medium'
                        : 'bg-white border-outline-variant/10 text-on-surface ring-black/5 rounded-tl-sm'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isPatientTyping && messages[messages.length - 1]?.role !== 'patient' && (
                <div className="flex justify-start items-start gap-3 animate-slide-up">
                   <div className="w-8 h-8 rounded-lg bg-white border border-outline-variant/30 text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {displayEmoji}
                   </div>
                   <div className="bg-white border border-outline-variant/10 rounded-xl rounded-tl-sm px-4 py-3 shadow-sm ring-1 ring-black/5">
                    <div className="flex gap-2">
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:200ms]" />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:400ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Console Input Area */}
            <div className="p-6 bg-surface-container-low border-t border-outline-variant/20">
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {QUICK_ACTIONS[currentStep].map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    disabled={isPatientTyping || isEnded}
                    className="whitespace-nowrap px-3 py-1.5 bg-white border border-outline-variant/30 rounded-lg text-[10px] font-bold text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-40 shadow-sm"
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
                  placeholder="Inquire clinical details..."
                  rows={2}
                  className="w-full pl-5 pr-14 py-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-sm font-sans resize-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:opacity-50 shadow-inner placeholder:text-outline-variant/60"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isPatientTyping || isEnded || !attempt}
                  className="absolute right-3 bottom-3 p-2.5 bg-primary text-on-primary rounded-lg hover:brightness-110 disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between px-1">
                 <p className="text-[10px] font-mono font-bold text-outline/60 uppercase tracking-widest italic flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                   System Status: Nominal
                 </p>
                 <span className="text-[10px] font-mono font-bold text-outline/60 uppercase tracking-widest">Type command ↵</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
