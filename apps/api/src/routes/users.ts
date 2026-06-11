import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { success, error } from '../lib/response.js'
import { UpdateProfileSchema } from '@caseflow/types'
import { NotFoundError } from '../lib/errors.js'

export const usersRouter = new Hono()

// All user routes require auth
usersRouter.use('*', authMiddleware)

// GET /api/users/me
usersRouter.get('/me', async (c) => {
  const user = c.get('user') as { id: string; name: string; email: string }
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    include: {
      badges: { include: { badge: true }, orderBy: { earnedAt: 'desc' } },
    },
  })

  if (!profile) {
    throw new NotFoundError('User profile')
  }

  return success(c, {
    ...user,
    ...profile,
  })
})

// PATCH /api/users/me
usersRouter.patch('/me', zValidator('json', UpdateProfileSchema), async (c) => {
  const user = c.get('user') as { id: string }
  const data = c.req.valid('json')

  const profile = await prisma.userProfile.update({
    where: { id: user.id },
    data,
  })

  return success(c, profile)
})

// GET /api/users/me/badges
usersRouter.get('/me/badges', async (c) => {
  const user = c.get('user') as { id: string }
  const badges = await prisma.userBadge.findMany({
    where: { userId: user.id },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
  })
  return success(c, badges)
})

// GET /api/users/me/attempts
usersRouter.get('/me/attempts', async (c) => {
  const user = c.get('user') as { id: string }
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '10')

  const [attempts, total] = await Promise.all([
    prisma.attempt.findMany({
      where: { studentId: user.id, deletedAt: null },
      include: { case: { select: { id: true, title: true, specialty: true, difficulty: true } } },
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.attempt.count({ where: { studentId: user.id, deletedAt: null } }),
  ])

  return success(c, attempts, 200, {
    page, limit, total, totalPages: Math.ceil(total / limit),
  })
})
