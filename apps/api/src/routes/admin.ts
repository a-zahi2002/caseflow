import { Hono } from 'hono'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/require-role.js'
import { success, error } from '../lib/response.js'
import { NotFoundError } from '../lib/errors.js'
import type { AppEnv } from '../types.js'
import type { 
  UserManagementData, 
  ModerationQueueItem, 
  PlatformSettingsData 
} from '@caseflow/types'

export const adminRouter = new Hono<AppEnv>()

// Enforce admin for everything
adminRouter.use('*', authMiddleware)
adminRouter.use('*', requireRole('admin'))

// --- User Management ---

adminRouter.get('/users', async (c) => {
  const role = c.req.query('role') as any
  const status = c.req.query('status') as any
  const institution = c.req.query('institution')
  const search = c.req.query('search')

  const users = await prisma.user.findMany({
    where: {
      ...(role && { role }),
      ...(status && { status } as any),
      ...(institution && { institution }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { institution: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  })

  const data: UserManagementData[] = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as any,
    institution: u.institution,
    status: (u as any).status,
    createdAt: u.createdAt.toISOString(),
  }))

  return success(c, data)
})

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(['student', 'educator', 'admin']).default('student'),
  institution: z.string().optional(),
})

adminRouter.post('/users', zValidator('json', createUserSchema), async (c) => {
  const { name, email, password, role, institution } = (c.req as any).valid('json')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return error(c, 'User with this email already exists', 409)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as any,
      institution: institution || null,
    },
  })

  const data: UserManagementData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as any,
    institution: user.institution,
    status: (user as any).status,
    createdAt: user.createdAt.toISOString(),
  }

  return success(c, data, 201)
})

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().toLowerCase().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['student', 'educator', 'admin']).optional(),
  institution: z.string().optional(),
  status: z.enum(['active', 'suspended']).optional(),
})

adminRouter.patch('/users/:id', zValidator('json', updateUserSchema), async (c) => {
  const id = c.req.param('id')
  const updates = (c.req as any).valid('json')

  if (updates.email) {
    const existing = await prisma.user.findFirst({
      where: { email: updates.email, NOT: { id } }
    })
    if (existing) {
      return error(c, 'Email already taken by another user', 409)
    }
  }

  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 12)
    delete updates.password
  }

  const user = await prisma.user.update({
    where: { id },
    data: updates,
  })

  const data: UserManagementData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as any,
    institution: user.institution,
    status: (user as any).status,
    createdAt: user.createdAt.toISOString(),
  }

  return success(c, data)
})

adminRouter.delete('/users/:id', async (c) => {
  const id = c.req.param('id')
  
  // Optional: prevent deleting self
  // const me = c.get('jwtPayload').sub
  // if (id === me) return error(c, 'Cannot delete yourself', 400)

  await prisma.user.delete({ where: { id } })
  
  return success(c, { id, deleted: true })
})

// Consolidating specific updates into the general PATCH route above
// Keeping these for backward compatibility if needed, or remove them
// For now, let's keep the general one as the primary.

// --- Content Moderation ---

adminRouter.get('/cases/review', async (c) => {
  const cases = await prisma.case.findMany({
    where: { status: 'review' },
    include: {
      author: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const data: ModerationQueueItem[] = cases.map(cs => ({
    id: cs.id,
    title: cs.title,
    specialty: cs.specialty,
    difficulty: cs.difficulty as any,
    authorName: cs.author.name,
    submittedAt: cs.updatedAt.toISOString(),
  }))

  return success(c, data)
})

adminRouter.patch('/cases/:id/approve', async (c) => {
  const id = c.req.param('id')
  await prisma.case.update({
    where: { id },
    data: { status: 'published' },
  })
  return success(c, { id, status: 'published' })
})

adminRouter.patch('/cases/:id/reject', async (c) => {
  const id = c.req.param('id')
  await prisma.case.update({
    where: { id },
    data: { status: 'draft' },
  })
  // Note: in a real app, notify author here
  return success(c, { id, status: 'draft' })
})

// --- Platform Settings ---

adminRouter.get('/settings', async (c) => {
  const settings = await (prisma as any).platformSettings.findUnique({
    where: { id: 'global' },
  })

  if (!settings) {
    // Initial default
    const defaultSettings: PlatformSettingsData = {
      institutionName: 'CBL Platform',
      allowedSpecialties: [],
      discussionsEnabled: true,
      communitySubmissionsEnabled: true,
    }
    return success(c, defaultSettings)
  }

  const data: PlatformSettingsData = {
    institutionName: settings.institutionName,
    allowedSpecialties: settings.allowedSpecialties,
    discussionsEnabled: settings.discussionsEnabled,
    communitySubmissionsEnabled: settings.communitySubmissionsEnabled,
  }

  return success(c, data)
})

const settingsSchema = z.object({
  institutionName: z.string().min(1),
  allowedSpecialties: z.array(z.string()),
  discussionsEnabled: z.boolean(),
  communitySubmissionsEnabled: z.boolean(),
})

adminRouter.put('/settings', zValidator('json', settingsSchema), async (c) => {
  const input = (c.req as any).valid('json')
  const settings = await (prisma as any).platformSettings.upsert({
    where: { id: 'global' },
    update: input,
    create: {
      id: 'global',
      ...(input as any),
    },
  })

  return success(c, settings)
})
