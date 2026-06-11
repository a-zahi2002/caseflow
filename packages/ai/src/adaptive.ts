/**
 * Adaptive difficulty recommendation engine.
 * Looks at the student's last 3 completed attempts to recommend difficulty.
 */
import type { Difficulty } from '@caseflow/types'

export interface AttemptSummary {
  score: number
  difficulty: Difficulty
  completedAt: Date
}

const DIFFICULTY_ORDER: Difficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

/**
 * Recommend next difficulty based on recent attempt history.
 * 
 * Rules:
 * - avg score >= 80% → upgrade difficulty
 * - avg score <= 40% → downgrade difficulty
 * - otherwise → same difficulty
 * - Never upgrade if < 3 attempts at current level
 */
export function recommendNextDifficulty(history: AttemptSummary[]): Difficulty {
  if (history.length === 0) return 'BEGINNER'

  // Get the most recent difficulty
  const sorted = [...history].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
  const currentDifficulty = sorted[0]!.difficulty
  const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty)

  // Get last 3 completed attempts
  const recent = sorted.slice(0, 3)
  const avgScore = recent.reduce((sum, a) => sum + a.score, 0) / recent.length

  // Count attempts at current difficulty level
  const attemptsAtCurrentLevel = history.filter(a => a.difficulty === currentDifficulty).length

  if (avgScore >= 80 && attemptsAtCurrentLevel >= 3 && currentIndex < DIFFICULTY_ORDER.length - 1) {
    return DIFFICULTY_ORDER[currentIndex + 1]!
  }

  if (avgScore <= 40 && currentIndex > 0) {
    return DIFFICULTY_ORDER[currentIndex - 1]!
  }

  return currentDifficulty
}

/**
 * Get recommended cases based on adaptive difficulty and specialties.
 */
export function getRecommendationCriteria(
  history: AttemptSummary[],
  preferredSpecialties: string[],
): { difficulty: Difficulty; specialties: string[] } {
  return {
    difficulty: recommendNextDifficulty(history),
    specialties: preferredSpecialties.length > 0 ? preferredSpecialties : [],
  }
}
