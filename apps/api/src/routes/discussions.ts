import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { success } from '../lib/response.js'
import { NotFoundError } from '../lib/errors.js'
import type { AppEnv } from '../types.js'
import type { DiscussionMessage } from '@caseflow/types'

export const discussionsRouter = new Hono<AppEnv>()

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
})

// GET /discussions/:caseId - Public (but auth helps get user context if needed, though not required for display)
discussionsRouter.get('/:caseId', async (c) => {
  const caseId = c.req.param('caseId')

  const caseExists = await prisma.case.findUnique({
    where: { id: caseId },
    select: { id: true },
  })
  if (!caseExists) throw new NotFoundError('Case not found')

  const discussions = await prisma.discussion.findMany({
    where: { caseId },
    include: {
      user: {
        select: {
          name: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Group by parentId
  const parents = discussions.filter(d => !d.parentId)
  const replies = discussions.filter(d => d.parentId)

  const messages: DiscussionMessage[] = parents.map(p => ({
    id: p.id,
    caseId: p.caseId,
    userId: p.userId,
    userName: p.user.name,
    userRole: p.user.role as 'student' | 'educator' | 'admin',
    content: p.content,
    parentId: p.parentId,
    createdAt: p.createdAt.toISOString(),
    replies: replies
      .filter(r => r.parentId === p.id)
      .map(r => ({
        id: r.id,
        caseId: r.caseId,
        userId: r.userId,
        userName: r.user.name,
        userRole: r.user.role as 'student' | 'educator' | 'admin',
        content: r.content,
        parentId: r.parentId,
        createdAt: r.createdAt.toISOString(),
      }))
  }))

  return success(c, messages)
})

// auth middleware for posting
discussionsRouter.post('/:caseId', authMiddleware, zValidator('json', commentSchema), async (c) => {
  const caseId = c.req.param('caseId')
  const { content } = c.req.valid('json')
  const userId = c.get('jwtPayload').sub

  const comment = await prisma.discussion.create({
    data: {
      caseId,
      userId,
      content,
    },
    include: {
      user: {
        select: {
          name: true,
          role: true,
        },
      },
    },
  })

  const response: DiscussionMessage = {
    id: comment.id,
    caseId: comment.caseId,
    userId: comment.userId,
    userName: comment.user.name,
    userRole: comment.user.role as 'student' | 'educator' | 'admin',
    content: comment.content,
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    replies: [],
  }

  return success(c, response, 201)
})

discussionsRouter.post('/:caseId/reply/:parentId', authMiddleware, zValidator('json', commentSchema), async (c) => {
  const caseId = c.req.param('caseId')
  const parentId = c.req.param('parentId')
  const { content } = c.req.valid('json')
  const userId = c.get('jwtPayload').sub

  // Verify parent exists
  const parent = await prisma.discussion.findUnique({
    where: { id: parentId },
    select: { parentId: true }
  })

  if (!parent) throw new NotFoundError('Parent comment not found')
  if (parent.parentId) throw new Error('Nested replies are capped at one level deep') // Requirement: "nested replies (one level deep)"

  const reply = await prisma.discussion.create({
    data: {
      caseId,
      userId,
      content,
      parentId,
    },
    include: {
      user: {
        select: {
          name: true,
          role: true,
        },
      },
    },
  })

  const response: DiscussionMessage = {
    id: reply.id,
    caseId: reply.caseId,
    userId: reply.userId,
    userName: reply.user.name,
    userRole: reply.user.role as 'student' | 'educator' | 'admin',
    content: reply.content,
    parentId: reply.parentId,
    createdAt: reply.createdAt.toISOString(),
  }

  return success(c, response, 201)
})
