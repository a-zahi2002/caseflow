import { Hono } from 'hono'
import { z } from 'zod'
import { prisma, type Difficulty, type CaseStatus } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/require-role.js'
import { success, error } from '../lib/response.js'
import { NotFoundError } from '../lib/errors.js'
import type { AppEnv } from '../types.js'

export const casesRouter = new Hono<AppEnv>()

// All case routes require authentication
casesRouter.use('*', authMiddleware)

// Query schema for list endpoint
const listQuerySchema = z.object({
  specialty: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
})

// GET /cases — list published cases with search, filter, pagination
casesRouter.get('/', async (c) => {
  const query = c.req.query()
  const parsed = listQuerySchema.safeParse(query)

  if (!parsed.success) {
    return error(c, 'Invalid query parameters', 422, 'VALIDATION_ERROR')
  }

  const { specialty, difficulty, tag, search, page, limit } = parsed.data
  const skip = (page - 1) * limit

  const where = {
    status: 'published' as const,
    ...(specialty && { specialty: { equals: specialty, mode: 'insensitive' as const } }),
    ...(difficulty && { difficulty }),
    ...(tag && { tags: { has: tag } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { specialty: { contains: search, mode: 'insensitive' as const } },
        { tags: { has: search } },
      ],
    }),
  }

  const payload = c.get('jwtPayload')
  const [casesRaw, total] = await Promise.all([
    prisma.case.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true },
        },
        attempts: {
          where: { userId: payload.sub },
          select: { status: true, score: true },
        },
        _count: {
          select: { attempts: true },
        },
      },
    }),
    prisma.case.count({ where }),
  ])

  const cases = casesRaw.map((c) => {
    const userAttempts = c.attempts
    const isCompleted = userAttempts.some((a) => a.status === 'completed')
    const bestScore = userAttempts.length > 0
      ? Math.max(...userAttempts.map((a) => a.score ?? 0))
      : null

    return {
      ...c,
      isCompleted,
      bestScore,
      attemptCount: c._count?.attempts || 0,
      rating: 4.5,
    }
  })

  return success(c, {
    cases,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
})

// GET /cases/my — educator's own cases (all statuses)
casesRouter.get('/my', requireRole('educator', 'admin'), async (c) => {
  const payload = c.get('jwtPayload')

  const cases = await prisma.case.findMany({
    where: { authorId: payload.sub },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { attempts: true } },
      steps: { orderBy: { order: 'asc' } },
    },
  })

  return success(c, cases)
})

// GET /cases/:id — get single case with steps
casesRouter.get('/:id', async (c) => {
  const { id } = c.req.param()

  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: 'asc' } },
      author: { select: { id: true, name: true } },
      _count: { select: { attempts: true } },
    },
  })

  if (!caseData) throw new NotFoundError('Case')

  // Students can only see published cases
  // Educators can see their own drafts
  const payload = c.get('jwtPayload')
  if (
    caseData.status !== 'published' &&
    caseData.authorId !== payload.sub &&
    payload.role !== 'admin'
  ) {
    throw new NotFoundError('Case')
  }

  return success(c, caseData)
})

// POST /cases — create a new case (educator + admin only)
casesRouter.post('/', requireRole('educator', 'admin'), async (c) => {
  const payload = c.get('jwtPayload')

  const createSchema = z.object({
    title: z.string().min(3).max(200).trim(),
    specialty: z.string().min(2).max(100).trim(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    patientPersona: z.object({
      age: z.number().min(0).max(120),
      sex: z.enum(['male', 'female', 'other']),
      presentingComplaint: z.string().min(5).max(500),
      background: z.string().max(1000),
    }),
    tags: z.array(z.string()).max(10).default([]),
    timeLimit: z.number().min(5).max(120).optional(),
    steps: z.array(z.object({
      order: z.number(),
      type: z.enum(['history', 'examination', 'investigation', 'diagnosis', 'management']),
      content: z.string().min(5),
      expectedFindings: z.any()
    })).optional()
  })

  const body = await c.req.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 422, 'VALIDATION_ERROR')
  }

  const { title, specialty, difficulty, patientPersona, tags, timeLimit, steps } = parsed.data
  const newCase = await prisma.case.create({
    data: {
      title,
      specialty,
      difficulty: difficulty as Difficulty,
      patientPersona: patientPersona as any,
      tags,
      ...(timeLimit !== undefined && { timeLimit }),
      authorId: payload.sub as string,
      status: 'draft' as CaseStatus,
      ...(steps && {
        steps: {
          create: steps.map(s => ({
             order: s.order,
             type: s.type as any,
             content: s.content,
             expectedFindings: s.expectedFindings as any
          }))
        }
      })
    },
    include: {
      steps: true
    }
  })

  return success(c, newCase, 201)
})

// POST /cases/:id/steps — add a step to a case
casesRouter.post('/:id/steps', requireRole('educator', 'admin'), async (c) => {
  const { id } = c.req.param()
  const payload = c.get('jwtPayload')

  const caseData = await prisma.case.findUnique({ where: { id } })
  if (!caseData) throw new NotFoundError('Case')

  if (caseData.authorId !== payload.sub && payload.role !== 'admin') {
    return error(c, 'You do not have permission to edit this case', 403, 'FORBIDDEN')
  }

  const stepSchema = z.object({
    type: z.enum(['history', 'examination', 'investigation', 'diagnosis', 'management']),
    content: z.string().min(5).max(1000).trim(),
    expectedFindings: z.object({
      keyPoints: z.array(z.string()).min(1),
      redFlags: z.array(z.string()),
    }),
  })

  const body = await c.req.json()
  const parsed = stepSchema.safeParse(body)

  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 422, 'VALIDATION_ERROR')
  }

  // Get current highest order
  const lastStep = await prisma.caseStep.findFirst({
    where: { caseId: id },
    orderBy: { order: 'desc' },
  })

  const step = await prisma.caseStep.create({
    data: {
      caseId: id,
      order: (lastStep?.order ?? 0) + 1,
      ...parsed.data,
    },
  })

  return success(c, step, 201)
})

// PATCH /cases/:id — update a case (author or admin only)
casesRouter.patch('/:id', requireRole('educator', 'admin'), async (c) => {
  const { id } = c.req.param()
  const payload = c.get('jwtPayload')

  const caseData = await prisma.case.findUnique({ where: { id } })
  if (!caseData) throw new NotFoundError('Case')

  if (caseData.authorId !== payload.sub && payload.role !== 'admin') {
    return error(c, 'You do not have permission to edit this case', 403, 'FORBIDDEN')
  }

  const updateSchema = z.object({
    title: z.string().min(3).max(200).trim().optional(),
    specialty: z.string().min(2).max(100).trim().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    status: z.enum(['draft', 'review', 'published']).optional(),
    tags: z.array(z.string()).max(10).optional(),
    timeLimit: z.number().min(5).max(120).optional(),
  })

  const body = await c.req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 422, 'VALIDATION_ERROR')
  }

  const updated = await prisma.case.update({
    where: { id },
    data: {
      ...(parsed.data.title && { title: parsed.data.title }),
      ...(parsed.data.specialty && { specialty: parsed.data.specialty }),
      ...(parsed.data.difficulty && { difficulty: parsed.data.difficulty as Difficulty }),
      ...(parsed.data.status && { status: parsed.data.status as CaseStatus }),
      ...(parsed.data.tags && { tags: parsed.data.tags }),
      ...(parsed.data.timeLimit !== undefined && { timeLimit: parsed.data.timeLimit }),
    },
  })

  return success(c, updated)
})

// DELETE /cases/:id — delete a case (author or admin only)
casesRouter.delete('/:id', requireRole('educator', 'admin'), async (c) => {
  const { id } = c.req.param()
  const payload = c.get('jwtPayload')

  const caseData = await prisma.case.findUnique({ where: { id } })
  if (!caseData) throw new NotFoundError('Case')

  if (caseData.authorId !== payload.sub && payload.role !== 'admin') {
    return error(c, 'You do not have permission to delete this case', 403, 'FORBIDDEN')
  }

  await prisma.case.delete({ where: { id } })
  return success(c, { deleted: true })
})
