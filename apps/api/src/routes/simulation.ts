import { Hono } from 'hono'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { NotFoundError, AppError } from '../lib/errors.js'
import { success } from '../lib/response.js'
import type { AppEnv } from '../types.js'

export const simulationRouter = new Hono<AppEnv>()

simulationRouter.use('*', authMiddleware)

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
