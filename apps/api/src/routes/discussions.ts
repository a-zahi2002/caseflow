import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { success } from '../lib/response.js'
import { CreateDiscussionPostSchema } from '@caseflow/types'
import { NotFoundError, ForbiddenError } from '../lib/errors.js'
import { requireRole } from '../middleware/require-role.js'

export const discussionsRouter = new Hono()

// GET /api/discussions/:caseId — threaded posts
discussionsRouter.get('/:caseId', async (c) => {
  const { caseId } = c.req.param()

  const posts = await prisma.discussionPost.findMany({
    where: { caseId, parentId: null, deletedAt: null },
    include: {
      author: { select: { id: true, avatarUrl: true, role: true } },
      replies: {
        where: { deletedAt: null },
        include: { author: { select: { id: true, avatarUrl: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return success(c, posts)
})

// POST /api/discussions/:caseId — create post
discussionsRouter.post('/:caseId', authMiddleware, zValidator('json', CreateDiscussionPostSchema), async (c) => {
  const { caseId } = c.req.param()
  const user = c.get('user') as { id: string }
  const { content, parentId } = c.req.valid('json')

  const post = await prisma.discussionPost.create({
    data: {
      caseId,
      authorId: user.id,
      content,
      parentId: parentId ?? null,
    },
    include: { author: { select: { id: true, avatarUrl: true, role: true } } },
  })

  return success(c, post, 201)
})

// POST /api/discussions/posts/:id/upvote
discussionsRouter.post('/posts/:id/upvote', authMiddleware, async (c) => {
  const { id } = c.req.param()
  const post = await prisma.discussionPost.update({
    where: { id },
    data: { upvotes: { increment: 1 } },
  })
  return success(c, post)
})

// DELETE /api/discussions/posts/:id/upvote
discussionsRouter.delete('/posts/:id/upvote', authMiddleware, async (c) => {
  const { id } = c.req.param()
  const post = await prisma.discussionPost.update({
    where: { id },
    data: { upvotes: { decrement: 1 } },
  })
  return success(c, post)
})

// PATCH /api/discussions/posts/:id/official — educator toggle
discussionsRouter.patch('/posts/:id/official', authMiddleware, requireRole('EDUCATOR', 'ADMIN'), async (c) => {
  const { id } = c.req.param()
  const post = await prisma.discussionPost.findUnique({ where: { id } })
  if (!post) throw new NotFoundError('Post')

  const updated = await prisma.discussionPost.update({
    where: { id },
    data: { isOfficial: !post.isOfficial },
  })
  return success(c, updated)
})

// DELETE /api/discussions/posts/:id
discussionsRouter.delete('/posts/:id', authMiddleware, async (c) => {
  const { id } = c.req.param()
  const user = c.get('user') as { id: string }
  const profile = c.get('userProfile') as { role: string }

  const post = await prisma.discussionPost.findUnique({ where: { id } })
  if (!post) throw new NotFoundError('Post')
  if (post.authorId !== user.id && profile.role !== 'ADMIN') {
    throw new ForbiddenError('Cannot delete this post')
  }

  await prisma.discussionPost.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
  return success(c, { deleted: true })
})
