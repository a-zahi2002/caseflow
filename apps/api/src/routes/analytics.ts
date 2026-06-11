import { Hono } from 'hono';
import { prisma } from '@caseflow/db';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/require-role.js';
import { success } from '../lib/response.js';
import type { AppEnv } from '../types.js';
import type { EducatorAnalytics, CaseStat } from '@caseflow/types';

export const analyticsRouter = new Hono<AppEnv>();

analyticsRouter.use('*', authMiddleware);

/**
 * GET /analytics/educator
 * Aggregates performance data for all cases authored by the current educator.
 */
analyticsRouter.get('/educator', requireRole('EDUCATOR', 'ADMIN'), async (c) => {
  const user = c.get('user');
  const authorId = user.id;

  // 1. Fetch all cases by this author with their attempts
  const cases = await prisma.case.findMany({
    where: { authorId, deletedAt: null },
    include: {
      attempts: {
        select: {
          status: true,
          score: true,
          evaluation: {
            select: {
              stepEvaluations: true,
            }
          },
          createdAt: true,
        },
      },
      _count: {
        select: { attempts: true },
      },
    },
  });

  // 2. Aggregate analytics
  const caseStats: CaseStat[] = [];
  let totalAttempts = 0;
  let totalCompleted = 0;
  let totalScoreSum = 0;
  const specialtyCounts: Record<string, number> = {};

  for (const caseData of cases) {
    const attempts = caseData.attempts;
    const completedAttempts = attempts.filter((a: any) => a.status === 'COMPLETED');
    
    const attemptCount = caseData._count.attempts;
    const completedCount = completedAttempts.length;
    
    totalAttempts += attemptCount;
    totalCompleted += completedCount;

    const avgScore = completedCount > 0
      ? completedAttempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / completedCount
      : 0;
    
    totalScoreSum += avgScore * completedCount;

    const completionRate = attemptCount > 0
      ? (completedCount / attemptCount) * 100
      : 0;

    // Determine most commonly missed step from stepEvaluations
    const stepMisses: Record<string, number> = {};
    completedAttempts.forEach((a: any) => {
      const evalData = a.evaluation;
      if (evalData && Array.isArray(evalData.stepEvaluations)) {
        evalData.stepEvaluations.forEach((f: any) => {
          if (f.passed === false && f.stepType) {
            stepMisses[f.stepType] = (stepMisses[f.stepType] || 0) + 1;
          }
        });
      }
    });

    const sortedMisses = Object.entries(stepMisses).sort((a, b) => b[1] - a[1]);
    const topMiss = sortedMisses[0];
    const mostMissedStep = topMiss
      ? { type: topMiss[0], missedCount: topMiss[1] }
      : undefined;

    caseStats.push({
      id: caseData.id,
      title: caseData.title,
      specialty: caseData.specialty,
      attemptCount,
      averageScore: Number(avgScore.toFixed(2)),
      completionRate: Number(completionRate.toFixed(1)),
      ...(mostMissedStep ? { mostMissedStep } : {}),
    });

    specialtyCounts[caseData.specialty] = (specialtyCounts[caseData.specialty] || 0) + 1;
  }

  const overallAvgScore = totalCompleted > 0 ? totalScoreSum / totalCompleted : 0;
  const overallCompletionRate = totalAttempts > 0 ? (totalCompleted / totalAttempts) * 100 : 0;

  const analytics: EducatorAnalytics = {
    totalCases: cases.length,
    totalAttempts,
    averageScore: Number(overallAvgScore.toFixed(2)),
    completionRate: Number(overallCompletionRate.toFixed(1)),
    casesBySpecialty: specialtyCounts,
    caseStats,
  };

  return success(c, analytics);
});
