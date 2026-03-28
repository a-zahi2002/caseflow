import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { requireRole } from '../middleware/require-role.js'
import { success } from '../lib/response.js'
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

  const users = await prisma.user.findMany({
    where: {
      ...(role && { role }),
      ...(status && { status }),
      ...(institution && { institution }),
    },
    orderBy: { createdAt: 'desc' },
  })

  const data: UserManagementData[] = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as any,
    institution: u.institution,
    status: u.status as any,
    createdAt: u.createdAt.toISOString(),
  }))

  return success(c, data)
})

const updateRoleSchema = z.object({
  role: z.enum(['student', 'educator', 'admin']),
})

adminRouter.patch('/users/:id/role', zValidator('json', updateRoleSchema), async (c) => {
  const id = c.req.param('id')
  const { role } = c.req.valid('json')

  const user = await prisma.user.update({
    where: { id },
    data: { role: role as any },
  })

  return success(c, { id: user.id, role: user.role })
})

const suspendSchema = z.object({
  suspend: z.boolean(),
})

adminRouter.patch('/users/:id/suspend', zValidator('json', suspendSchema), async (c) => {
  const id = c.req.param('id')
  const { suspend } = c.req.valid('json')

  const user = await prisma.user.update({
    where: { id },
    data: { status: suspend ? 'suspended' : 'active' },
  })

  return success(c, { id: user.id, status: user.status })
})

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
  const settings = await prisma.platformSettings.findUnique({
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
  const input = c.req.valid('json')

  const settings = await prisma.platformSettings.upsert({
    where: { id: 'global' },
    update: input,
    create: {
      id: 'global',
      ...input,
    },
  })

  return success(c, settings)
})
