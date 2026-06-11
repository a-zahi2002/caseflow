import { Hono } from 'hono'
import { prisma } from '@caseflow/db'
import { success } from '../lib/response.js'

export const searchRouter = new Hono()

// GET /api/search?q=
searchRouter.get('/', async (c) => {
  const q = c.req.query('q')
  if (!q || q.trim().length === 0) {
    return success(c, { cases: [], discussions: [] })
  }

  const [cases, discussions] = await Promise.all([
    prisma.case.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { specialty: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ],
      },
      select: {
        id: true,
        title: true,
        specialty: true,
        difficulty: true,
        tags: true,
      },
      take: 5,
    }),
    prisma.discussionPost.findMany({
      where: {
        deletedAt: null,
        content: { contains: q, mode: 'insensitive' },
      },
      select: {
        id: true,
        caseId: true,
        content: true,
        createdAt: true,
        case: { select: { title: true } },
      },
      take: 5,
    }),
  ])

  // Truncate discussion content for excerpts
  const discussionResults = discussions.map(d => ({
    ...d,
    content: d.content.slice(0, 200) + (d.content.length > 200 ? '...' : ''),
  }))

  return success(c, { cases, discussions: discussionResults })
})
