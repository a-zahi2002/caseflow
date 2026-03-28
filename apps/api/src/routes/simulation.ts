import { Hono } from 'hono'
import { createNodeWebSocket } from '@hono/node-ws'
import { streamPatientResponse, getPatientResponse } from '@caseflow/ai'
import { prisma } from '@caseflow/db'
import { ollamaClient } from '../lib/ollama-client.js'
import { authMiddleware } from '../middleware/auth.js'
import { NotFoundError, AppError } from '../lib/errors.js'
import type { AppEnv } from '../types.js'
import type { OllamaMessage, PatientPromptOptions } from '@caseflow/ai'

export const simulationRouter = new Hono<AppEnv>()

// WebSocket message types — client sends these
interface ClientMessage {
  type: 'message' | 'end_simulation'
  content?: string
}

// WebSocket message types — server sends these
interface ServerMessage {
  type: 'patient_response' | 'stream_chunk' | 'stream_end' | 'error' | 'simulation_ended'
  content?: string
  heartsRemaining?: number
  timeElapsed?: number
}

function send(ws: { send: (data: string) => void }, msg: ServerMessage): void {
  ws.send(JSON.stringify(msg))
}

// POST /simulation/start — creates an Attempt and returns the attemptId
// The client then opens a WebSocket using that attemptId
simulationRouter.post('/start', authMiddleware, async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const body = await c.req.json().catch(() => ({}))
    const { caseId } = body

    console.log(`[SIMULATION_START] caseId: ${caseId}, user: ${payload.sub}`)

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: { steps: { orderBy: { order: 'asc' } } },
    })

    if (!caseData) throw new NotFoundError('Case')

    const attempt = await prisma.attempt.create({
      data: {
        userId: payload.sub,
        caseId,
        status: 'in_progress',
        heartsRemaining: 3,
        timeElapsed: 0,
      } as any,
    })

    return c.json({ success: true, data: { attemptId: attempt.id } }, 201)
  } catch (err) {
    console.error('[SIMULATION_START_ERROR]', err)
    throw err
  }
})

// GET /simulation/:attemptId/ws — WebSocket upgrade
simulationRouter.get('/:attemptId/ws', authMiddleware, async (c) => {
  const { attemptId } = c.req.param()

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      case: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!attempt) throw new NotFoundError('Attempt')
  if (attempt.status !== 'in_progress') {
    throw new AppError('This simulation has already ended', 400, 'SIMULATION_ENDED')
  }

  // Rebuild conversation history from saved messages
  const conversationHistory: OllamaMessage[] = attempt.messages.map((m) => ({
    role: m.role === 'student' ? 'user' : 'assistant',
    content: m.content,
  }))

  // Build patient prompt options from case data
  const persona = attempt.case.patientPersona as any as PatientPromptOptions['persona']

  const promptOptions: PatientPromptOptions = {
    persona,
    caseTitle: attempt.case.title,
    specialty: attempt.case.specialty,
    heartsRemaining: (attempt as any).heartsRemaining,
    timeElapsed: (attempt as any).timeElapsed,
    timeLimit: (attempt.case as any).timeLimit ?? undefined,
  }

  // Upgrade to WebSocket
  const { upgradeWebSocket } = createNodeWebSocket({ app: simulationRouter })

  return upgradeWebSocket(c, {
    async onMessage(event: any, ws: any) {
      try {
        const data = JSON.parse(event.data.toString()) as ClientMessage

        if (data.type === 'end_simulation') {
          // Fetch full attempt details for evaluation
          const completedAttempt = await prisma.attempt.findUnique({
            where: { id: attemptId },
            include: {
              case: { include: { steps: { orderBy: { order: 'asc' } } } },
              messages: { orderBy: { createdAt: 'asc' } },
            },
          })

          if (!completedAttempt) throw new NotFoundError('Attempt')

          // Run Evaluator
          const { runEvaluator } = await import('@caseflow/ai')
          const evalResult = await runEvaluator({
            ollama: ollamaClient,
            expectedFindings: completedAttempt.case.steps.map(s => ({
              stepType: s.type,
              findings: s.expectedFindings
            })),
            messages: completedAttempt.messages.map(m => ({
              role: m.role as 'student' | 'patient',
              content: m.content
            }))
          })

          await prisma.attempt.update({
            where: { id: attemptId },
            data: { 
              status: 'completed', 
              completedAt: new Date(),
              score: evalResult.overallScore,
              evalResult: evalResult as any
            },
          })

          send(ws, { type: 'simulation_ended' })
          ws.close()
          return
        }

        if (data.type === 'message' && data.content) {
          // Save student message
          await prisma.simMessage.create({
            data: {
              attemptId,
              role: 'student' as any,
              content: data.content,
            },
          })

          // Stream patient response token by token
          let fullResponse = ''

          for await (const chunk of streamPatientResponse(ollamaClient, {
            studentMessage: data.content,
            conversationHistory,
            promptOptions,
          })) {
            fullResponse += chunk
            send(ws, { type: 'stream_chunk', content: chunk })
          }

          // Save patient message
          await prisma.simMessage.create({
            data: {
              attemptId,
              role: 'patient' as any,
              content: fullResponse,
            },
          })

          // Update conversation history for next turn
          conversationHistory.push(
            { role: 'user', content: data.content },
            { role: 'assistant', content: fullResponse }
          )

          send(ws, {
            type: 'stream_end',
            heartsRemaining: (attempt as any).heartsRemaining,
            timeElapsed: (attempt as any).timeElapsed,
          })
        }
      } catch (err) {
        console.error('Simulation error:', err)
        send(ws, { type: 'error', content: 'Something went wrong. Please try again.' })
      }
    },

    onClose() {
      console.log(`Simulation WebSocket closed for attempt ${attemptId}`)
    },

    onError(err: any) {
      console.error(`Simulation WebSocket error for attempt ${attemptId}:`, err)
    },
  })
})
