import { Hono } from 'hono'
import { prisma } from '@caseflow/db'
import { authMiddleware } from '../middleware/auth.js'
import { success } from '../lib/response.js'
import type { AppEnv } from '../types.js'
import type { StudentProgressData } from '@caseflow/types'

export const progressRouter = new Hono<AppEnv>()

progressRouter.use('*', authMiddleware)

progressRouter.get('/me', async (c) => {
  const jwtPayload = c.get('jwtPayload')
  const userId = jwtPayload.sub

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: {
      case: {
        select: {
          title: true,
          specialty: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Basic metrics
  const totalAttempts = attempts.length
  const completedAttempts = attempts.filter((a) => a.status === 'completed')
  const totalCompleted = completedAttempts.length
  
  const overallAvgScore = totalCompleted > 0
    ? completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / totalCompleted
    : 0

  const completionRate = totalAttempts > 0 ? (totalCompleted / totalAttempts) * 100 : 0

  // Specialty breakdown
  const specialtyStats: Record<string, { totalScore: number; completedCount: number; totalCount: number }> = {}
  
  attempts.forEach((a) => {
    const s = a.case.specialty
    if (!specialtyStats[s]) {
      specialtyStats[s] = { totalScore: 0, completedCount: 0, totalCount: 0 }
    }
    specialtyStats[s].totalCount++
    if (a.status === 'completed') {
      specialtyStats[s].completedCount++
      specialtyStats[s].totalScore += a.score || 0
    }
  })

  const specialtyBreakdown = Object.entries(specialtyStats).map(([specialty, stats]) => ({
    specialty,
    avgScore: stats.completedCount > 0 ? stats.totalScore / stats.completedCount : 0,
    attempts: stats.totalCount,
  }))

  // Weak areas
  const weakAreas = specialtyBreakdown.filter((s) => s.avgScore < 60 && s.attempts > 0)

  // Recent attempts
  const recentAttempts = attempts.slice(0, 10).map((a) => ({
    id: a.id,
    caseTitle: a.case.title,
    specialty: a.case.specialty,
    score: a.score,
    status: a.status as 'in_progress' | 'completed' | 'abandoned',
    date: a.createdAt.toISOString(),
  }))

  // Trend (score over time)
  const trend = [...completedAttempts]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((a) => ({
      date: a.createdAt.toISOString(),
      score: a.score || 0,
      caseTitle: a.case.title,
    }))

  const progressData: StudentProgressData = {
    metrics: {
      totalAttempts,
      totalCompleted,
      overallAvgScore,
      completionRate,
      specialtyBreakdown,
    },
    recentAttempts,
    weakAreas,
    trend,
  }

  return success(c, progressData)
})
