import { Hono } from 'hono'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { success } from '../lib/response.js'
import type { AppEnv } from '../types.js'

export const casesRouter = new Hono<AppEnv>()

// GET /cases — list all published cases
casesRouter.get('/', authMiddleware, async (c) => {
  const cases = await prisma.case.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      specialty: true,
      difficulty: true,
      status: true,
      tags: true,
      timeLimit: true,
      patientPersona: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
      sourceDocumentUrl: true,
    },
  })
  return success(c, cases)
})
