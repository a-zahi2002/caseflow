import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/require-role.js'
import { success, error } from '../lib/response.js'
import { CaseFilterSchema, CreateCaseSchema, UpdateCaseSchema } from '@caseflow/types'
import { NotFoundError, ForbiddenError } from '../lib/errors.js'

import type { AppEnv } from '../types.js'

export const casesRouter = new Hono<AppEnv>()

// GET /api/cases — public, filterable
casesRouter.get('/', async (c) => {
  const query = CaseFilterSchema.parse({
    specialty: c.req.query('specialty'),
    difficulty: c.req.query('difficulty'),
    q: c.req.query('q'),
    filter: c.req.query('filter'),
    page: c.req.query('page'),
    limit: c.req.query('limit'),
  })

  const where: any = { status: 'PUBLISHED', deletedAt: null }
  if (query.specialty) where.specialty = query.specialty
  if (query.difficulty) where.difficulty = query.difficulty
  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
      { tags: { has: query.q } },
    ]
  }

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: {
        steps: { select: { id: true }, orderBy: { order: 'asc' } },
      },
    }),
    prisma.case.count({ where }),
  ])

  return success(c, cases, 200, {
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  })
})

// GET /api/cases/my — educator/admin cases list
casesRouter.get('/my', authMiddleware, requireRole('EDUCATOR', 'ADMIN'), async (c) => {
  const user = c.get('user')
  const cases = await prisma.case.findMany({
    where: { authorId: user.id, deletedAt: null },
    include: {
      _count: {
        select: { attempts: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  })
  return success(c, cases)
})

// GET /api/cases/:id — public, steps only if authenticated
casesRouter.get('/:id', async (c) => {
  const { id } = c.req.param()
  const caseData = await prisma.case.findUnique({
    where: { id, deletedAt: null },
    include: {
      steps: { orderBy: { order: 'asc' } },
      author: { select: { id: true } },
    },
  })

  if (!caseData) throw new NotFoundError('Case')
  return success(c, caseData)
})

// POST /api/cases — educator only
casesRouter.post('/', authMiddleware, requireRole('EDUCATOR', 'ADMIN'), zValidator('json', CreateCaseSchema), async (c) => {
  const user = c.get('user')
  const { patientPersona, ...rest } = c.req.valid('json')

  const newCase = await prisma.case.create({
    data: {
      ...rest,
      patientName: patientPersona.name,
      patientAge: patientPersona.age,
      patientGender: patientPersona.sex,
      chiefComplaint: patientPersona.presentingComplaint,
      patientBackground: patientPersona.background,
      authorId: user.id,
      status: 'DRAFT',
    },
  })

  return success(c, newCase, 201)
})

// PATCH /api/cases/:id — educator (own) or admin (any)
casesRouter.patch('/:id', authMiddleware, zValidator('json', UpdateCaseSchema), async (c) => {
  const { id } = c.req.param()
  const user = c.get('user')
  const profile = c.get('userProfile')
  const data = c.req.valid('json')

  const existing = await prisma.case.findUnique({ where: { id } })
  if (!existing) throw new NotFoundError('Case')

  if (existing.authorId !== user.id && profile?.role !== 'ADMIN') {
    throw new ForbiddenError('You can only edit your own cases')
  }

  const { patientPersona, ...rest } = data
  const updateData: any = { ...rest }
  if (patientPersona) {
    if (patientPersona.name) updateData.patientName = patientPersona.name
    if (patientPersona.age !== undefined) updateData.patientAge = patientPersona.age
    if (patientPersona.sex) updateData.patientGender = patientPersona.sex
    if (patientPersona.presentingComplaint) updateData.chiefComplaint = patientPersona.presentingComplaint
    if (patientPersona.background) updateData.patientBackground = patientPersona.background
  }

  // Strip undefined properties to satisfy exactOptionalPropertyTypes: true
  const filteredUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined)
  )

  const updated = await prisma.case.update({ where: { id }, data: filteredUpdateData })
  return success(c, updated)
})

// POST /api/cases/:id/publish — educator
casesRouter.post('/:id/publish', authMiddleware, requireRole('EDUCATOR', 'ADMIN'), async (c) => {
  const { id } = c.req.param()
  const user = c.get('user')

  const existing = await prisma.case.findUnique({
    where: { id },
    include: { steps: true },
  })
  if (!existing) throw new NotFoundError('Case')
  if (existing.authorId !== user.id) throw new ForbiddenError('Not your case')

  // Pre-publish checks
  if (existing.steps.length === 0) return error(c, 'Case must have at least 1 step', 422, 'VALIDATION_ERROR')
  if (!existing.patientBackground) return error(c, 'Patient background is required', 422, 'VALIDATION_ERROR')
  if (!existing.title) return error(c, 'Title is required', 422, 'VALIDATION_ERROR')

  const updated = await prisma.case.update({
    where: { id },
    data: { status: 'PUBLISHED' },
  })

  return success(c, updated)
})

// POST /api/cases/:id/archive
casesRouter.post('/:id/archive', authMiddleware, requireRole('EDUCATOR', 'ADMIN'), async (c) => {
  const { id } = c.req.param()
  const updated = await prisma.case.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  })
  return success(c, updated)
})

// DELETE /api/cases/:id — admin only, soft delete
casesRouter.delete('/:id', authMiddleware, requireRole('ADMIN'), async (c) => {
  const { id } = c.req.param()
  await prisma.case.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
  return success(c, { deleted: true })
})

// POST /api/cases/:id/bookmark
casesRouter.post('/:id/bookmark', authMiddleware, async (c) => {
  const { id } = c.req.param()
  const user = c.get('user')

  await prisma.bookmark.upsert({
    where: { userId_caseId: { userId: user.id, caseId: id } },
    create: { userId: user.id, caseId: id },
    update: {},
  })

  return success(c, { bookmarked: true })
})

// DELETE /api/cases/:id/bookmark
casesRouter.delete('/:id/bookmark', authMiddleware, async (c) => {
  const { id } = c.req.param()
  const user = c.get('user')

  await prisma.bookmark.deleteMany({
    where: { userId: user.id, caseId: id },
  })

  return success(c, { bookmarked: false })
})
