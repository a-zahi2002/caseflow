import { Hono } from 'hono'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/require-role.js'
import { success, error } from '../lib/response.js'
import { NotFoundError } from '../lib/errors.js'

export const adminRouter = new Hono()
adminRouter.use('*', authMiddleware)
adminRouter.use('*', requireRole('ADMIN'))

// GET /api/admin/users
adminRouter.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '20')
  const q = c.req.query('q')

  const where: any = { deletedAt: null }
  // Note: user search by name/email requires joining with better-auth user table
  // For now, filter by profile data only

  const [profiles, total] = await Promise.all([
    prisma.userProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.userProfile.count({ where }),
  ])

  return success(c, profiles, 200, {
    page, limit, total, totalPages: Math.ceil(total / limit),
  })
})

// PATCH /api/admin/users/:id — role change
adminRouter.patch('/users/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  const profile = await prisma.userProfile.update({
    where: { id },
    data: { role: body.role },
  })

  // Audit log
  const user = c.get('user') as { id: string }
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'user.role_change',
      targetType: 'UserProfile',
      targetId: id,
      metadata: { newRole: body.role },
    },
  })

  return success(c, profile)
})

// POST /api/admin/users/:id/ban
adminRouter.post('/users/:id/ban', async (c) => {
  const { id } = c.req.param()
  const user = c.get('user') as { id: string }

  await prisma.userProfile.update({
    where: { id },
    data: { banned: true },
  })

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'user.ban',
      targetType: 'UserProfile',
      targetId: id,
    },
  })

  return success(c, { banned: true })
})

// POST /api/admin/users/:id/unban
adminRouter.post('/users/:id/unban', async (c) => {
  const { id } = c.req.param()
  const user = c.get('user') as { id: string }

  await prisma.userProfile.update({
    where: { id },
    data: { banned: false },
  })

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'user.unban',
      targetType: 'UserProfile',
      targetId: id,
    },
  })

  return success(c, { banned: false })
})

// GET /api/admin/analytics
adminRouter.get('/analytics', async (c) => {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [totalAttempts, avgScore, topCases] = await Promise.all([
    prisma.attempt.count(),
    prisma.attempt.aggregate({ where: { status: 'COMPLETED' }, _avg: { score: true } }),
    prisma.case.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      orderBy: { totalAttempts: 'desc' },
      take: 10,
      select: { id: true, title: true, totalAttempts: true },
    }),
  ])

  return success(c, {
    totalAttempts,
    avgScore: avgScore._avg.score ?? 0,
    topCases: topCases.map(c => ({
      id: c.id,
      title: c.title,
      attemptCount: c.totalAttempts,
    })),
  })
})

// GET /api/admin/audit-log
adminRouter.get('/audit-log', async (c) => {
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '50')

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count(),
  ])

  return success(c, logs, 200, {
    page, limit, total, totalPages: Math.ceil(total / limit),
  })
})

// GET /api/admin/cases — all cases regardless of status
adminRouter.get('/cases', async (c) => {
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '20')

  const [cases, total] = await Promise.all([
    prisma.case.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.case.count({ where: { deletedAt: null } }),
  ])

  return success(c, cases, 200, {
    page, limit, total, totalPages: Math.ceil(total / limit),
  })
})

// POST /api/admin/cases/:id/approve
adminRouter.post('/cases/:id/approve', async (c) => {
  const { id } = c.req.param()
  const user = c.get('user') as { id: string }

  await prisma.case.update({
    where: { id },
    data: { status: 'PUBLISHED' },
  })

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'case.approve',
      targetType: 'Case',
      targetId: id,
    },
  })

  return success(c, { approved: true })
})

// POST /api/admin/cases/:id/reject
adminRouter.post('/cases/:id/reject', async (c) => {
  const { id } = c.req.param()
  const user = c.get('user') as { id: string }
  const body = await c.req.json()

  await prisma.case.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  })

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'case.reject',
      targetType: 'Case',
      targetId: id,
      metadata: { reason: body.reason },
    },
  })

  return success(c, { rejected: true })
})
