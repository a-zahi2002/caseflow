import { Hono } from 'hono'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { success } from '../lib/response.js'
import type { AppEnv } from '../types.js'

export const notificationsRouter = new Hono<AppEnv>()
notificationsRouter.use('*', authMiddleware)

// GET /api/notifications
notificationsRouter.get('/', async (c) => {
  const user = c.get('user')
  const limit = parseInt(c.req.query('limit') ?? '20')
  const before = c.req.query('before')

  const where: any = { userId: user.id }
  if (before) where.createdAt = { lt: new Date(before) }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return success(c, notifications)
})

// POST /api/notifications/read-all
notificationsRouter.post('/read-all', async (c) => {
  const user = c.get('user')
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })
  return success(c, { success: true })
})

// PATCH /api/notifications/:id/read
notificationsRouter.patch('/:id/read', async (c) => {
  const { id } = c.req.param()
  const user = c.get('user')

  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  })
  return success(c, { success: true })
})
