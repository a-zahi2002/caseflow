import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { success, error } from '../lib/response.js'
import { upgradeWebSocket } from '../lib/ws.js'
import { StartSimulationSchema } from '@caseflow/types'
import { NotFoundError, ForbiddenError, AppError } from '../lib/errors.js'
import { simulationManager } from '../lib/simulation-manager.js'

export const simulationRouter = new Hono()

// All simulation routes require auth
simulationRouter.use('*', authMiddleware)

// POST /api/simulation/start — create a new attempt
simulationRouter.post('/start', zValidator('json', StartSimulationSchema), async (c) => {
  const user = c.get('user') as { id: string }
  const { caseId } = c.req.valid('json')

  // Verify case exists and is published
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: { steps: { orderBy: { order: 'asc' } } },
  })
  if (!caseData) throw new NotFoundError('Case')
  if (caseData.status !== 'PUBLISHED') throw new AppError('Case is not published', 400, 'CASE_NOT_PUBLISHED')

  // Check prerequisites
  if (caseData.prerequisiteCaseIds.length > 0) {
    const completedPrereqs = await prisma.attempt.count({
      where: {
        studentId: user.id,
        caseId: { in: caseData.prerequisiteCaseIds },
        status: 'COMPLETED',
        score: { gte: 60 },
      },
    })

    if (completedPrereqs < caseData.prerequisiteCaseIds.length) {
      throw new ForbiddenError('Prerequisites not met')
    }
  }

  // Check for existing active attempt
  const existingActive = await prisma.attempt.findFirst({
    where: { studentId: user.id, caseId, status: { in: ['ACTIVE', 'PAUSED'] } },
  })
  if (existingActive) {
    return success(c, { attemptId: existingActive.id, resumed: true })
  }

  // Create new attempt
  const attempt = await prisma.attempt.create({
    data: {
      studentId: user.id,
      caseId,
      status: 'ACTIVE',
      currentStepOrder: 0,
      heartsRemaining: 3,
    },
  })

  // Increment totalAttempts on case
  await prisma.case.update({
    where: { id: caseId },
    data: { totalAttempts: { increment: 1 } },
  })

  return success(c, { attemptId: attempt.id, resumed: false }, 201)
})

// GET /api/simulation/:id — get attempt with messages (for reconnect)
simulationRouter.get('/:id', async (c) => {
  const { id } = c.req.param()
  const user = c.get('user') as { id: string }

  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      case: {
        include: { steps: { orderBy: { order: 'asc' } } },
      },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!attempt) throw new NotFoundError('Attempt')
  if (attempt.studentId !== user.id) throw new ForbiddenError('Not your attempt')

  return success(c, attempt)
})

// POST /api/simulation/:id/pause
simulationRouter.post('/:id/pause', async (c) => {
  const { id } = c.req.param()
  const user = c.get('user') as { id: string }

  const attempt = await prisma.attempt.findUnique({ where: { id } })
  if (!attempt) throw new NotFoundError('Attempt')
  if (attempt.studentId !== user.id) throw new ForbiddenError('Not your attempt')
  if (attempt.status !== 'ACTIVE') return error(c, 'Attempt is not active', 400, 'INVALID_STATE')

  const updated = await prisma.attempt.update({
    where: { id },
    data: { status: 'PAUSED' },
  })

  return success(c, updated)
})

// POST /api/simulation/:id/abandon
simulationRouter.post('/:id/abandon', async (c) => {
  const { id } = c.req.param()
  const user = c.get('user') as { id: string }

  const attempt = await prisma.attempt.findUnique({ where: { id } })
  if (!attempt) throw new NotFoundError('Attempt')
  if (attempt.studentId !== user.id) throw new ForbiddenError('Not your attempt')

  const updated = await prisma.attempt.update({
    where: { id },
    data: { status: 'ABANDONED' },
  })

  return success(c, updated)
})

// GET /api/simulation/:id/ws — WebSocket endpoint
simulationRouter.get('/:id/ws', upgradeWebSocket((c) => {
  const { id } = c.req.param()
  
  return {
    onOpen: async (evt, ws) => {
      // Handle logic via manager
      const handlers = await simulationManager.handleConnection(ws, id)
      // Attach handlers to ws context for future events
      ;(ws as any)._handlers = handlers
    },
    onMessage: (evt, ws) => {
      const handlers = (ws as any)._handlers
      if (handlers?.onMessage) handlers.onMessage(evt.data.toString())
    },
    onClose: (evt, ws) => {
      const handlers = (ws as any)._handlers
      if (handlers?.onClose) handlers.onClose()
    }
  }
}))
