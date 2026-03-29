'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, X, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SimulationChatProps {
  caseId: string
  attemptId: string
  currentStep: 'history' | 'examination' | 'investigation' | 'diagnosis' | 'management'
  patientName: string
  patientEmoji: string
}

interface Message {
  role: 'student' | 'patient'
  content: string
  timestamp: string
}

const MOCK_RESPONSES = [
  "This pain started about 2 hours ago, right in the middle of my chest. It feels like something is squeezing very tightly. My left arm also feels numb.",
  "Yes doctor, I have high blood pressure and diabetes. I take amlodipine and metformin. I haven't taken anything for this pain.",
  "When you press on my chest, the pain doesn't change much — it's constant. I'm also very sweaty.",
  "I prefer to keep still, moving makes me feel worse. My wife says I went pale about an hour ago.",
  "Yes, something similar happened briefly about 3 weeks ago but it went away in 10 minutes. I didn't see a doctor at the time."
]

const QUICK_ACTIONS = {
  history: ['Where is the pain?', 'How long has this been going on?', 'Any similar episodes before?', 'Any other symptoms?'],
  examination: ['Auscultate the heart', 'Auscultate the lungs', 'Check for peripheral oedema', 'Assess JVP'],
  investigation: ['Order an ECG', 'Order FBC and U&E', 'Request a chest X-ray', 'Order troponin'],
  diagnosis: ['My primary diagnosis is...', 'I need to rule out...', 'The differentials include...'],
  management: ['Establish IV access', 'Give aspirin 300mg stat', 'Call the cardiology team', 'Start continuous monitoring'],
}

export function SimulationChat({ 
  caseId, attemptId, currentStep, patientName, patientEmoji 
}: SimulationChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'patient', content: `Hello doctor. My name is ${patientName}. I'm having some chest pain...`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [wsReady, setWsReady] = useState(false)
  const [cycleIndex, setCycleIndex] = useState(0)
  
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setWsReady(true), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = (text?: string) => {
    const content = text || input.trim()
    if (!content || isTyping || !wsReady) return

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [...prev, { role: 'student', content, timestamp }])
    setInput('')
    setIsTyping(true)

    const delay = Math.floor(Math.random() * 500) + 1500
    setTimeout(() => {
      const reply = MOCK_RESPONSES[cycleIndex % MOCK_RESPONSES.length]!
      setMessages((prev) => [...prev, { 
        role: 'patient', 
        content: reply, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }])
      setCycleIndex((prev) => prev + 1)
      setIsTyping(false)
    }, delay)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const actions = QUICK_ACTIONS[currentStep] || []

  return (
    <div className="flex flex-col h-full bg-white border border-border-default rounded-xl overflow-hidden shadow-card">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border-default">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            wsReady ? "bg-brand animate-pulse-brand" : "bg-text-tertiary"
          )} />
          <span className="text-[13px] font-bold text-text-primary uppercase tracking-tight">AI Patient Simulation</span>
          <span className="text-[11px] font-mono text-text-tertiary uppercase tracking-widest">— meditron-7b</span>
        </div>
        <span className="text-[11px] font-mono font-bold text-text-secondary uppercase tracking-widest px-2.5 py-1 bg-surface-subtle border border-border-default rounded-md">
          Step: {currentStep}
        </span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex flex-col", m.role === 'student' ? 'items-end' : 'items-start')}>
            <div className={cn("flex gap-2.5 max-w-[78%]", m.role === 'student' ? 'flex-row-reverse' : 'flex-row')}>
              <div className={cn(
                "w-[30px] h-[30px] rounded-full flex-shrink-0 flex items-center justify-center text-sm shadow-sm",
                m.role === 'student' ? "bg-brand-light" : "bg-blue-50"
              )}>
                {m.role === 'student' ? '👨⚕️' : patientEmoji}
              </div>
              <div className={cn(
                "px-3.5 py-2.5 text-[13px] leading-relaxed border shadow-sm",
                m.role === 'student' 
                  ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF] font-mono rounded-[12px_4px_12px_12px]"
                  : "bg-surface-subtle border-border-default text-text-primary rounded-[4px_12px_12px_12px]"
              )}>
                {m.content}
              </div>
            </div>
            <span className={cn("block font-mono text-[9px] text-text-tertiary mt-1 px-1", m.role === 'student' ? 'text-right' : 'text-left')}>
               {m.timestamp}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start">
            <div className="flex gap-2.5 max-w-[78%]">
              <div className="w-[30px] h-[30px] rounded-full flex-shrink-0 bg-blue-50 flex items-center justify-center text-sm">
                {patientEmoji}
              </div>
              <div className="bg-surface-subtle border border-border-default rounded-[4px_12px_12px_12px] px-3.5 py-2.5 flex items-center gap-1.5 h-[38px]">
                <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce [animation-duration:900ms]" />
                <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce [animation-duration:900ms] [animation-delay:200ms]" />
                <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce [animation-duration:900ms] [animation-delay:400ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border-default bg-white">
        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {actions.map((act) => (
            <button
              key={act}
              onClick={() => sendMessage(act)}
              disabled={isTyping}
              className="px-3 py-1 bg-surface-subtle border border-border-default rounded-full text-[11px] font-bold text-text-secondary hover:border-brand hover:text-brand transition-all disabled:opacity-40 shadow-sm"
            >
              {act}
            </button>
          ))}
        </div>

        {/* Input Row */}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!wsReady || isTyping}
            rows={1}
            placeholder="Ask the patient or perform an examination…"
            className="flex-1 bg-surface-subtle border border-border-default rounded-lg px-3.5 py-2.5 text-[13px] font-medium resize-none min-h-[42px] max-h-[120px] focus:outline-none focus:border-brand transition-all shadow-inner"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!wsReady || isTyping || !input.trim()}
            className="w-[42px] h-[42px] flex items-center justify-center bg-brand text-white text-lg font-bold rounded-lg hover:bg-brand-hover transition-all disabled:opacity-40 shadow-md active:translate-y-0.5"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}

