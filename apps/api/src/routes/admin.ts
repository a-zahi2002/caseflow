import { Hono } from 'hono'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/require-role.js'
import { success, error } from '../lib/response.js'
import { NotFoundError } from '../lib/errors.js'
import type { AppEnv } from '../types.js'
import { auth } from '../lib/auth.js'

export const adminRouter = new Hono<AppEnv>()
adminRouter.use('*', authMiddleware)
adminRouter.use('*', requireRole('ADMIN'))

// GET /api/admin/users
adminRouter.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '20')
  const search = c.req.query('search') || c.req.query('q')
  const role = c.req.query('role')
  const status = c.req.query('status')

  const where: any = { deletedAt: null }

  if (role) {
    where.role = role.toUpperCase()
  }

  if (status) {
    where.banned = status === 'suspended'
  }

  if (search) {
    where.OR = [
      {
        user: {
          name: { contains: search, mode: 'insensitive' }
        }
      },
      {
        user: {
          email: { contains: search, mode: 'insensitive' }
        }
      },
      {
        institution: { contains: search, mode: 'insensitive' }
      }
    ]
  }

  const [profiles, total] = await Promise.all([
    prisma.userProfile.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.userProfile.count({ where }),
  ])

  const mappedUsers = profiles.map(p => ({
    id: p.id,
    name: p.user?.name || 'Unknown',
    email: p.user?.email || '',
    role: p.role.toLowerCase(),
    institution: p.institution,
    status: p.banned ? 'suspended' : 'active',
    createdAt: p.createdAt,
  }))

  return success(c, mappedUsers, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
})

// POST /api/admin/users — create new user and user profile
adminRouter.post('/users', async (c) => {
  try {
    const body = await c.req.json()

    if (!body.email || !body.password || !body.name) {
      return error(c, 'Email, password, and name are required', 400)
    }

    // Create user in better-auth
    const signupRes = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
      }
    })

    if (!signupRes || (signupRes as any).error) {
      const errMsg = (signupRes as any).error?.message || 'Failed to create auth user'
      return error(c, errMsg, 400, 'SIGNUP_ERROR')
    }

    const userId = signupRes.user.id
    
    // Create user profile
    const dbRole = body.role ? body.role.toUpperCase() : 'STUDENT'
    const profile = await prisma.userProfile.create({
      data: {
        id: userId,
        role: dbRole === 'ADMIN' || dbRole === 'EDUCATOR' || dbRole === 'STUDENT' ? dbRole : 'STUDENT',
        institution: body.institution || null,
        banned: body.status === 'suspended',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    // Audit log
    const actor = c.get('user')
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: 'user.create',
        targetType: 'UserProfile',
        targetId: userId,
        metadata: { createdEmail: body.email, role: dbRole },
      },
    })

    const mappedUser = {
      id: profile.id,
      name: profile.user?.name || 'Unknown',
      email: profile.user?.email || '',
      role: profile.role.toLowerCase(),
      institution: profile.institution,
      status: profile.banned ? 'suspended' : 'active',
      createdAt: profile.createdAt,
    }

    return success(c, mappedUser, 201)
  } catch (err: any) {
    return error(c, err.message || 'Internal server error', 500)
  }
})

// PATCH /api/admin/users/:id — update user profile and main record
adminRouter.patch('/users/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json()

  // First, verify if user profile exists
  const existingProfile = await prisma.userProfile.findUnique({
    where: { id }
  })
  if (!existingProfile) {
    throw new NotFoundError('User profile')
  }

  // Update user name/email if provided
  if (body.name !== undefined || body.email !== undefined) {
    await prisma.user.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
      }
    })
  }

  // Determine role
  let dbRole: 'STUDENT' | 'EDUCATOR' | 'ADMIN' | undefined = undefined
  if (body.role) {
    const r = body.role.toUpperCase()
    if (r === 'STUDENT' || r === 'EDUCATOR' || r === 'ADMIN') {
      dbRole = r
    }
  }

  // Determine status (banned flag)
  let banned: boolean | undefined = undefined
  if (body.status !== undefined) {
    banned = body.status === 'suspended'
  }

  // Update UserProfile
  const profile = await prisma.userProfile.update({
    where: { id },
    data: {
      ...(dbRole && { role: dbRole }),
      ...(banned !== undefined && { banned }),
      ...(body.institution !== undefined && { institution: body.institution }),
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    }
  })

  // Audit log
  const actor = c.get('user')
  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: 'user.update',
      targetType: 'UserProfile',
      targetId: id,
      metadata: { 
        ...(dbRole && { newRole: dbRole }),
        ...(banned !== undefined && { banned }),
        ...(body.institution !== undefined && { institution: body.institution }),
      },
    },
  })

  const mappedUser = {
    id: profile.id,
    name: profile.user?.name || 'Unknown',
    email: profile.user?.email || '',
    role: profile.role.toLowerCase(),
    institution: profile.institution,
    status: profile.banned ? 'suspended' : 'active',
    createdAt: profile.createdAt,
  }

  return success(c, mappedUser)
})

// DELETE /api/admin/users/:id — soft delete user profile
adminRouter.delete('/users/:id', async (c) => {
  const { id } = c.req.param()

  // First, verify if user profile exists
  const existingProfile = await prisma.userProfile.findUnique({
    where: { id }
  })
  if (!existingProfile) {
    throw new NotFoundError('User profile')
  }

  // Soft delete user profile by setting deletedAt
  await prisma.userProfile.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      banned: true, // ban user to prevent login
    }
  })

  // Audit log
  const actor = c.get('user')
  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: 'user.delete',
      targetType: 'UserProfile',
      targetId: id,
    },
  })

  return success(c, { deleted: true })
})

// POST /api/admin/users/:id/ban
adminRouter.post('/users/:id/ban', async (c) => {
  const { id } = c.req.param()
  const user = c.get('user')

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
  const user = c.get('user')

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
  const user = c.get('user')

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
  const user = c.get('user')
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
