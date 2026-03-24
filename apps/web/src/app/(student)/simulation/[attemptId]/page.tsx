'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SimulationClient } from '@/lib/simulation'
import { getToken } from '@/lib/auth'
import { config } from '@/lib/config'

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Patient Simulation</h1>
          <p className="text-xs text-gray-500 mt-0.5">Speak to the patient as you would in a clinical setting</p>
        </div>
        <div className="flex items-center gap-6">
          {/* Hearts */}
          <div className="flex items-center gap-1">
            {hearts.map((alive, i) => (
              <span key={i} className={`text-lg ${alive ? 'text-red-500' : 'text-gray-300'}`}>
                ♥
              </span>
            ))}
          </div>
          <button
            onClick={endSimulation}
            disabled={isEnded}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            End Consultation
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-12">
            Introduce yourself to the patient to begin
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'student'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.content}
              {msg.streaming && (
                <span className="inline-block w-1 h-4 bg-current ml-0.5 animate-pulse" />
              )}
            </div>
          </div>
        ))}
        {isPatientTyping && messages[messages.length - 1]?.role !== 'patient' && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 text-xs">{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isPatientTyping || isEnded}
            placeholder="Talk to the patient..."
            rows={2}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isPatientTyping || isEnded}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
