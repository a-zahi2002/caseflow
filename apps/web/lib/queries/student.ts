import { StudentProgressData, StudentProgressSummary, LeaderboardEntry, computeLevel } from '@caseflow/types'
import { apiClient } from '../api-client'
import { getUser } from '../auth'

export async function getStudentProgress(): Promise<StudentProgressSummary> {
  const user = getUser()
  const res = await apiClient.get<StudentProgressData>('/progress/me')
  
  if (!res.success) {
    throw new Error(res.error || 'Failed to fetch progress')
  }

  const data = res.data

  return {
    totalXp: user?.totalXp || 0,
    level: computeLevel(user?.totalXp || 0),
    streak: {
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      lastActiveDate: user?.lastActiveDate ? new Date(user.lastActiveDate) : null,
      completedToday: false,
      last7Days: []
    },
    casesCompleted: data.metrics.totalCompleted,
    casesAttempted: data.metrics.totalAttempts,
    overallAverageScore: data.metrics.overallAvgScore,
    specialtyPerformance: data.metrics.specialtyBreakdown.map((s: { specialty: string; avgScore: number; attempts: number }) => ({
       specialty: s.specialty,
       casesAttempted: s.attempts,
       casesCompleted: s.attempts,
       averageScore: s.avgScore,
       totalXp: 0
    })),
    weakAreas: data.weakAreas.map(w => ({
       specialty: w.specialty,
       issue: 'Performance Gap',
       affectedCases: w.attempts,
       suggestedFocus: 'Review guidelines for this specialty'
    })),
    badges: user?.badges?.map((b: any) => ({ ...b, isNew: false })) || [],
    institutionRank: 4,
    weeklyXp: [180, 420, 320, 500],
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // Mock leaderboard for now as there is no /leaderboard endpoint yet content.
  // This matches Phase 6/7 plans content.
  return [
    { rank: 1, userId: 'u1', name: 'Rashmi Perera', avatarInitials: 'RP', xp: 5820, totalXp: 5820, level: 15, streak: 30, casesCompleted: 89, institution: 'University of Colombo', isCurrentUser: false },
    { rank: 2, userId: 'u2', name: 'Nimal Silva', avatarInitials: 'NS', xp: 4990, totalXp: 4990, level: 13, streak: 14, casesCompleted: 76, institution: 'University of Colombo', isCurrentUser: false },
    { rank: 3, userId: 'u3', name: 'Priya Fernando', avatarInitials: 'PF', xp: 4310, totalXp: 4310, level: 12, streak: 21, casesCompleted: 68, institution: 'University of Colombo', isCurrentUser: false },
  ]
}

