'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MessageCircle, Heart, Clock, XCircle, Send, User } from 'lucide-react'
import { SimulationClient } from '@/lib/simulation'
import { getToken } from '@/lib/auth'
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

export default function SimulationPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const router = useRouter()
  const clientRef = useRef<SimulationClient | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [simState, setSimState] = useState<SimState>({ heartsRemaining: 3, timeElapsed: 0 })
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
        router.push(`/simulation/${attemptId}/results`)
      },
    })

    client.connect()
    clientRef.current = client

    return () => client.disconnect()
  }, [attemptId, router])

  function sendMessage() {
    const content = input.trim()
    if (!content || isPatientTyping || isEnded) return

    setMessages((prev) => [...prev, { role: 'student', content }])
    setInput('')
    setIsPatientTyping(true)
    setError(null)

    clientRef.current?.sendMessage(content)
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

  return (
    <div className="flex flex-col h-screen bg-background bg-slate-50">
      {/* Simulation Header */}
      <div className="bg-white border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
             <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Clinical Encounter</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] uppercase font-bold text-primary tracking-widest bg-primary/5 px-2 rounded border border-primary/10">Active Simulation</span>
               <span className="text-[10px] font-mono text-muted-foreground">• {attemptId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {/* Stats Bar */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold font-mono text-foreground">{Math.floor(simState.timeElapsed / 60)}:{(simState.timeElapsed % 60).toString().padStart(2, '0')}</span>
            </div>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg">
              {hearts.map((alive, i) => (
                <Heart key={i} className={cn("w-4 h-4 transition-all", alive ? "text-red-500 fill-current" : "text-slate-200")} />
              ))}
            </div>
          </div>

          <button
            onClick={endSimulation}
            disabled={isEnded}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all shadow-sm active:translate-y-0.5"
          >
            <XCircle className="w-4 h-4" />
            Finish Encounter
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 bg-white border border-border rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                 <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">Begin the Consultation</h3>
              <p className="text-sm text-muted-foreground">The patient is waiting. Introduce yourself or ask about their symptoms to start the simulation.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-4",
                msg.role === 'student' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-1",
                msg.role === 'student' ? "bg-primary text-white border-primary" : "bg-white border-border text-slate-400"
              )}>
                 {msg.role === 'student' ? <User size={14} /> : <User size={14} />}
              </div>
              <div
                className={cn(
                  "max-w-lg px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm border",
                  msg.role === 'student'
                    ? 'bg-primary text-white border-primary rounded-tr-sm'
                    : 'bg-white border-border text-foreground rounded-tl-sm'
                )}
              >
                {msg.content}
                {msg.streaming && (
                  <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-pulse" />
                )}
              </div>
            </div>
          ))}

          {isPatientTyping && messages[messages.length - 1]?.role !== 'patient' && (
            <div className="flex justify-start items-start gap-4">
               <div className="w-8 h-8 rounded-full bg-white border border-border text-slate-400 flex items-center justify-center shrink-0">
                  <User size={14} />
               </div>
               <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center text-red-600 text-xs font-bold font-mono uppercase tracking-widest">{error}</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border-t border-border p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isPatientTyping || isEnded}
              placeholder="Ask the patient a question..."
              rows={2}
              className="w-full pl-6 pr-16 py-4 bg-background border border-border rounded-2xl text-sm resize-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all disabled:opacity-50 disabled:bg-slate-50 shadow-inner"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isPatientTyping || isEnded}
              className="absolute right-4 bottom-4 p-2.5 bg-primary text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:translate-y-0.5"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between px-2">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono italic">Diagnostic precision matters</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Press Enter to Send</p>
          </div>
        </div>
      </div>
    </div>
  )
}
