import { Hono } from 'hono'
import { streamPatientResponse, getPatientResponse } from '@caseflow/ai'
import { prisma } from '@caseflow/db'
import { ollamaClient } from '../lib/ollama-client.js'
import { authMiddleware } from '../middleware/auth.js'
import { NotFoundError, AppError } from '../lib/errors.js'
import { upgradeWebSocket } from '../lib/ws.js'
import { success, error } from '../lib/response.js'
import type { AppEnv } from '../types.js'
import type { OllamaMessage, PatientPromptOptions } from '@caseflow/ai'

export const simulationRouter = new Hono<AppEnv>()

simulationRouter.use('*', authMiddleware)

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


// GET /simulation/:attemptId — Get specific attempt details
simulationRouter.get('/:attemptId', async (c) => {
  const { attemptId } = c.req.param()
  const payload = c.get('jwtPayload')

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      case: {
        include: {
          steps: { orderBy: { order: 'asc' } }
        }
      },
      messages: { orderBy: { createdAt: 'asc' } }
    }
  })

  if (!attempt) throw new NotFoundError('Attempt')

  // Security check: only the owner or an educator/admin can see this
  if (attempt.userId !== payload.sub && payload.role !== 'admin' && payload.role !== 'educator') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  return success(c, attempt)
})

// POST /simulation/start — creates an Attempt and returns the attemptId
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

  return upgradeWebSocket(c, {
    async onMessage(event: any, ws: any) {
      try {
        const data = JSON.parse(event.data.toString()) as ClientMessage

        if (data.type === 'end_simulation') {
          const completedAttempt = await prisma.attempt.findUnique({
            where: { id: attemptId },
            include: {
              case: { include: { steps: { orderBy: { order: 'asc' } } } },
              messages: { orderBy: { createdAt: 'asc' } },
            },
          })

          if (!completedAttempt) throw new NotFoundError('Attempt')

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

          const { overallScore } = evalResult
          const { XP_AWARDS } = await import('@caseflow/types')
          
          let xpAwarded = 0
          const difficulty = completedAttempt.case.difficulty
          
          if (difficulty === 'beginner') xpAwarded += XP_AWARDS.CASE_COMPLETE_BEGINNER
          else if (difficulty === 'intermediate') xpAwarded += XP_AWARDS.CASE_COMPLETE_INTERMEDIATE
          else if (difficulty === 'advanced') xpAwarded += XP_AWARDS.CASE_COMPLETE_ADVANCED
          
          if (overallScore >= 90) xpAwarded += XP_AWARDS.SCORE_BONUS_90_PLUS
          else if (overallScore >= 80) xpAwarded += XP_AWARDS.SCORE_BONUS_80_PLUS
          if (overallScore === 100) xpAwarded += XP_AWARDS.PERFECT_SCORE

          await prisma.$transaction([
            prisma.attempt.update({
              where: { id: attemptId },
              data: { 
                status: 'completed', 
                completedAt: new Date(),
                score: overallScore,
                evalResult: evalResult as any
              },
            }),
            prisma.user.update({
              where: { id: completedAttempt.userId },
              data: { 
                totalXp: { increment: xpAwarded },
                lastActiveDate: new Date()
              }
            })
          ])

          send(ws, { type: 'simulation_ended' })
          ws.close()
          return
        }

        if (data.type === 'message' && data.content) {
          await prisma.simMessage.create({
            data: {
              attemptId,
              role: 'student' as any,
              content: data.content,
            },
          })

          let fullResponse = ''

          for await (const chunk of streamPatientResponse(ollamaClient, {
            studentMessage: data.content,
            conversationHistory,
            promptOptions,
          })) {
            fullResponse += chunk
            send(ws, { type: 'stream_chunk', content: chunk })
          }

          await prisma.simMessage.create({
            data: {
              attemptId,
              role: 'patient' as any,
              content: fullResponse,
            },
          })

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
      } catch (err: any) {
        console.error('Simulation error:', err)
        send(ws, { 
          type: 'error', 
          content: process.env.NODE_ENV === 'development' 
            ? `AI Error: ${err.message || 'Unknown error'}` 
            : 'Something went wrong. Please try again.' 
        })
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
