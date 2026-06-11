import type { WSContext } from 'hono/ws'
import { prisma } from '@caseflow/db'
import { runEvaluator, buildPatientSystemPrompt, getAIProvider } from '@caseflow/ai'
import type { WSMessageToClient, WSMessageToServer, CaseStep, Attempt, Case, EvaluationResult } from '@caseflow/types'
import { WSErrorSchema, WSStreamChunkSchema, WSStreamEndSchema, WSEvaluationSchema, WSStepAdvanceSchema, WSAttemptCompleteSchema, WSAttemptFailedSchema } from '@caseflow/types'

type PopulatedAttempt = Attempt & { case: Case & { steps: CaseStep[] } }

export class SimulationSession {
  private ws: WSContext | null = null
  private attemptId: string
  private isProcessing = false
  private messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }> = []
  private attemptData: PopulatedAttempt | null = null

  constructor(attemptId: string) {
    this.attemptId = attemptId
  }

  async initialize(ws: WSContext) {
    this.ws = ws
    
    // Load attempt data
    const attempt = await prisma.attempt.findUnique({
      where: { id: this.attemptId },
      include: { case: { include: { steps: { orderBy: { order: 'asc' } } } } }
    })

    if (!attempt || attempt.status !== 'ACTIVE') {
      this.sendError('Attempt not found or not active')
      ws.close()
      return
    }

    this.attemptData = attempt as PopulatedAttempt

    // Load past messages
    const pastMsgs = await prisma.simMessage.findMany({
      where: { attemptId: this.attemptId },
      orderBy: { createdAt: 'asc' }
    })

    if (pastMsgs.length === 0) {
      // First time - system prompt + initial greeting
      const systemPrompt = buildPatientSystemPrompt({
        persona: {
          name: attempt.case.patientName,
          age: attempt.case.patientAge,
          sex: attempt.case.patientGender,
          presentingComplaint: attempt.case.chiefComplaint,
          background: attempt.case.patientBackground,
        },
        caseTitle: attempt.case.title,
        specialty: attempt.case.specialty,
        heartsRemaining: attempt.heartsRemaining,
        timeElapsed: Math.round((Date.now() - attempt.startedAt.getTime()) / 60000),
        currentStep: 'history',
      })

      this.messages.push({ role: 'system', content: systemPrompt })
      await prisma.simMessage.create({
        data: { attemptId: this.attemptId, role: 'system', content: systemPrompt, stepOrder: 0 }
      })
      
      // Auto-start with patient greeting
      this.messages.push({ role: 'user', content: 'Hello, please introduce yourself and tell me why you are here.' })
      await this.generatePatientResponse()
    } else {
      // Reconstruct history
      this.messages = pastMsgs.map(m => ({
        role: m.role === 'student' ? 'user' : m.role === 'patient' ? 'assistant' : 'system',
        content: m.content
      }))
    }
  }

  async handleMessage(raw: string) {
    if (this.isProcessing || !this.attemptData) return
    this.isProcessing = true

    try {
      const parsed = JSON.parse(raw) as WSMessageToServer
      
      if (parsed.type === 'ping') {
        this.send({ type: 'heartbeat' })
        this.isProcessing = false
        return
      }

      if (parsed.type === 'sync_notes') {
        await prisma.attempt.update({
          where: { id: this.attemptId },
          data: { notes: parsed.content }
        })
        this.isProcessing = false
        return
      }

      if (parsed.type === 'message') {
        const studentMsg = parsed.content
        
        // 1. Save student message
        this.messages.push({ role: 'user', content: studentMsg })
        await prisma.simMessage.create({
          data: { attemptId: this.attemptId, role: 'student', content: studentMsg, stepOrder: this.attemptData.currentStepOrder }
        })

        // 2. Stream patient response
        await this.generatePatientResponse()

        // 3. Evaluate step (non-blocking if possible, but we wait here for simplicity)
        await this.evaluateCurrentStep()
      }

    } catch (err: any) {
      this.sendError(err.message)
    } finally {
      this.isProcessing = false
    }
  }

  private async generatePatientResponse() {
    if (!this.attemptData) return
    const provider = getAIProvider()
    
    let fullResponse = ''
    try {
      const stream = provider.chatStream(this.messages, { temperature: 0.7, maxTokens: 150 })
      
      for await (const chunk of stream) {
        fullResponse += chunk
        this.send({ type: 'stream_chunk', content: chunk })
      }

      this.messages.push({ role: 'assistant', content: fullResponse })
      
      // Save to DB
      const dbMsg = await prisma.simMessage.create({
        data: { attemptId: this.attemptId, role: 'patient', content: fullResponse, stepOrder: this.attemptData.currentStepOrder }
      })

      this.send({ type: 'stream_end', tokenCount: 0, messageId: dbMsg.id })
    } catch (err: any) {
      this.sendError('AI generation failed: ' + err.message)
    }
  }

  private async evaluateCurrentStep() {
    if (!this.attemptData) return
    
    const currentStepIndex = this.attemptData.currentStepOrder
    const currentStep = this.attemptData.case.steps[currentStepIndex]
    
    if (!currentStep) return // No more steps

    // Gather student messages for this step
    const stepMessages = await prisma.simMessage.findMany({
      where: { attemptId: this.attemptId, role: 'student', stepOrder: currentStepIndex },
      orderBy: { createdAt: 'asc' }
    })

    // If less than 2 messages in this step, don't evaluate yet
    if (stepMessages.length < 2) return

    const provider = getAIProvider()
    const evalResult = await runEvaluator(provider, {
      studentMessages: stepMessages.map(m => m.content),
      expectedFindings: currentStep.expectedFindings,
      criticalErrors: currentStep.criticalErrors,
    })

    // Handle Critical Error -> Lose Heart
    if (evalResult.criticalErrorTriggered) {
      this.attemptData.heartsRemaining -= 1
      await prisma.attempt.update({
        where: { id: this.attemptId },
        data: { heartsRemaining: this.attemptData.heartsRemaining }
      })

      if (this.attemptData.heartsRemaining <= 0) {
        await this.failAttempt('No hearts remaining')
        return
      }
    }

    this.send({ type: 'evaluation', result: evalResult, heartsRemaining: this.attemptData.heartsRemaining })

    // Handle Step Complete -> Advance
    if (evalResult.stepComplete) {
      const nextStepOrder = currentStepIndex + 1
      const isLastStep = nextStepOrder >= this.attemptData.case.steps.length

      this.attemptData.currentStepOrder = nextStepOrder
      await prisma.attempt.update({
        where: { id: this.attemptId },
        data: { currentStepOrder: nextStepOrder }
      })

      if (isLastStep) {
        await this.completeAttempt()
      } else {
        const nextStep = this.attemptData.case.steps[nextStepOrder]!
        this.send({ type: 'step_advance', newStepOrder: nextStepOrder, revealedData: nextStep.revealedData })
        
        // Tell AI that context shifted
        const sysContext = `[SYSTEM] The student successfully advanced to step: ${nextStep.name}. Adjust your responses accordingly if they ask about new revealed data.`
        this.messages.push({ role: 'system', content: sysContext })
        await prisma.simMessage.create({
          data: { attemptId: this.attemptId, role: 'system', content: sysContext, stepOrder: nextStepOrder }
        })
      }
    }
  }

  private async completeAttempt() {
    await prisma.attempt.update({
      where: { id: this.attemptId },
      data: { status: 'COMPLETED', completedAt: new Date(), score: 85, xpEarned: 150 } // Simplified scoring for now
    })
    this.send({ type: 'attempt_complete', finalScore: 85, xpEarned: 150 })
  }

  private async failAttempt(reason: string) {
    await prisma.attempt.update({
      where: { id: this.attemptId },
      data: { status: 'FAILED', completedAt: new Date() }
    })
    this.send({ type: 'attempt_failed', reason })
  }

  private send(msg: WSMessageToClient) {
    if (this.ws && this.ws.readyState === 1) { // 1 = OPEN
      this.ws.send(JSON.stringify(msg))
    }
  }

  private sendError(message: string) {
    this.send({ type: 'error', message })
  }

  disconnect() {
    this.ws = null
  }
}

// In-memory manager
export class SimulationManager {
  private sessions = new Map<string, SimulationSession>()

  async handleConnection(ws: WSContext, attemptId: string) {
    let session = this.sessions.get(attemptId)
    if (!session) {
      session = new SimulationSession(attemptId)
      this.sessions.set(attemptId, session)
    }

    await session.initialize(ws)

    return {
      onMessage: (msg: string) => session!.handleMessage(msg),
      onClose: () => {
        session!.disconnect()
        // Clean up after 5 mins of disconnect
        setTimeout(() => {
          this.sessions.delete(attemptId)
        }, 5 * 60 * 1000)
      }
    }
  }
}

export const simulationManager = new SimulationManager()
