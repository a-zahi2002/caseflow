import { Hono } from 'hono'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { success } from '../lib/response.js'
import { xpToLevel, getLevelTitle, xpToNextLevel } from '@caseflow/types'
import type { AppEnv } from '../types.js'

export const progressRouter = new Hono<AppEnv>()
progressRouter.use('*', authMiddleware)

// GET /api/progress/stats
progressRouter.get('/stats', async (c) => {
  const user = c.get('user')

  const profile = await prisma.userProfile.findUnique({ where: { id: user.id } })
  if (!profile) return success(c, null)

  const [completedCount, inProgressCount, avgScoreResult, totalDuration] = await Promise.all([
    prisma.attempt.count({ where: { studentId: user.id, status: 'COMPLETED' } }),
    prisma.attempt.count({ where: { studentId: user.id, status: { in: ['ACTIVE', 'PAUSED'] } } }),
    prisma.attempt.aggregate({ where: { studentId: user.id, status: 'COMPLETED' }, _avg: { score: true } }),
    prisma.attempt.findMany({
      where: { studentId: user.id, status: 'COMPLETED', completedAt: { not: null } },
      select: { startedAt: true, completedAt: true },
    }),
  ])

  const totalMinutes = totalDuration.reduce((sum, a) => {
    if (!a.completedAt) return sum
    return sum + (a.completedAt.getTime() - a.startedAt.getTime()) / 60000
  }, 0)

  const level = xpToLevel(profile.xp)
  const levelProgress = xpToNextLevel(profile.xp)

  return success(c, {
    xp: profile.xp,
    level,
    levelTitle: getLevelTitle(level),
    levelProgress: levelProgress.progress,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    casesCompleted: completedCount,
    casesInProgress: inProgressCount,
    averageScore: avgScoreResult._avg.score ?? 0,
    totalStudyMinutes: Math.round(totalMinutes),
  })
})

// GET /api/progress/leaderboard
progressRouter.get('/leaderboard', async (c) => {
  const period = c.req.query('period') ?? 'alltime'
  const specialty = c.req.query('specialty')

  // TODO: Use Redis sorted set for cached leaderboard
  // For now, query directly from DB
  const profiles = await prisma.userProfile.findMany({
    where: { deletedAt: null, role: 'STUDENT' },
    orderBy: { xp: 'desc' },
    take: 50,
  })

  const leaderboard = profiles.map((p, i) => ({
    rank: i + 1,
    userId: p.id,
    name: '', // Will be joined with auth user table
    level: xpToLevel(p.xp),
    xp: p.xp,
  }))

  return success(c, leaderboard)
})

// GET /api/progress/recommendations
progressRouter.get('/recommendations', async (c) => {
  const user = c.get('user')

  const profile = await prisma.userProfile.findUnique({ where: { id: user.id } })
  if (!profile) return success(c, [])

  // Get completed case IDs
  const completedAttempts = await prisma.attempt.findMany({
    where: { studentId: user.id, status: 'COMPLETED' },
    select: { caseId: true },
  })
  const completedIds = completedAttempts.map(a => a.caseId)

  // Recommend cases matching specialties that aren't completed
  const recommendations = await prisma.case.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
      id: { notIn: completedIds },
      ...(profile.specialties.length > 0 && { specialty: { in: profile.specialties } }),
    },
    orderBy: { totalAttempts: 'desc' },
    take: 3,
  })

  return success(c, recommendations)
})
