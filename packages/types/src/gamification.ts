/**
 * Gamification constants, XP calculations, and badge definitions.
 * Zod schemas are source of truth — TypeScript types inferred.
 */
import { z } from 'zod'

// ─── XP Constants ────────────────────────────────────────────────────
export const XP = {
  CASE_COMPLETE_BASE: 100,
  PERFECT_SCORE_BONUS: 50,
  STREAK_DAY_BONUS: 25,
  SPEED_BONUS: 30,
  FIRST_ATTEMPT_PENALTY: 0,
  RETRY_MULTIPLIER: 0.5,
} as const

// ─── Level Calculation (Quadratic Curve, 1-50) ──────────────────────
export function xpToLevel(totalXP: number): number {
  // Quadratic: level N requires N^2 * 50 XP
  let level = 1
  for (let i = 1; i <= 50; i++) {
    if (totalXP >= levelToXPThreshold(i)) {
      level = i
    } else {
      break
    }
  }
  return level
}

export function levelToXPThreshold(level: number): number {
  if (level <= 1) return 0
  // Quadratic curve: level 2 = 200, level 10 = 5000, level 50 = 125000
  return Math.floor(level * level * 50)
}

export function xpToNextLevel(totalXP: number): { current: number; threshold: number; progress: number } {
  const level = xpToLevel(totalXP)
  const currentThreshold = levelToXPThreshold(level)
  const nextThreshold = levelToXPThreshold(level + 1)
  const progress = nextThreshold > currentThreshold
    ? ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100
  return {
    current: totalXP - currentThreshold,
    threshold: nextThreshold - currentThreshold,
    progress: Math.min(100, Math.floor(progress)),
  }
}

// ─── Score to XP ─────────────────────────────────────────────────────
export interface AttemptMeta {
  isFirstAttempt: boolean
  score: number
  durationMinutes: number
  estimatedMinutes: number
  currentStreak: number
}

export function scoreToXP(score: number, meta: AttemptMeta): number {
  let xp: number = XP.CASE_COMPLETE_BASE

  // Perfect score bonus
  if (score === 100) xp += XP.PERFECT_SCORE_BONUS

  // Speed bonus
  if (meta.durationMinutes < meta.estimatedMinutes * 0.5) xp += XP.SPEED_BONUS

  // Streak bonus (capped at 200)
  xp += Math.min(meta.currentStreak * XP.STREAK_DAY_BONUS, 200)

  // Retry multiplier
  if (!meta.isFirstAttempt) xp = Math.floor(xp * XP.RETRY_MULTIPLIER)

  return xp
}

// ─── Clinical Level Titles ───────────────────────────────────────────
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Medical Student I',
  2: 'Medical Student II',
  3: 'Medical Student III',
  4: 'Clinical Clerk',
  5: 'Junior Resident',
  10: 'Senior Resident',
  15: 'Registrar',
  20: 'Junior Consultant',
  25: 'Consultant',
  30: 'Senior Consultant',
  35: 'Clinical Lead',
  40: 'Head of Department',
  45: 'Medical Director',
  50: 'Chief of Medicine',
}

export function getLevelTitle(level: number): string {
  // Find the highest matching title
  const keys = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a)
  for (const key of keys) {
    if (level >= key) return LEVEL_TITLES[key]!
  }
  return 'Medical Student I'
}

export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  earnedAt: Date
  isNew?: boolean
  badge?: {
    id: string
    key: string
    name: string
    description: string
    iconKey: string
    xpReward: number
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    icon: string
  }
}

// ─── Badge Definitions ───────────────────────────────────────────────
export const BadgeDefinitionSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  iconKey: z.string(),
  xpReward: z.number().int(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  icon: z.string(),
})
export type BadgeDefinition = z.infer<typeof BadgeDefinitionSchema>

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first_case', key: 'first_case', name: 'First Blood', description: 'Completed your first clinical case', iconKey: 'trophy', xpReward: 100, rarity: 'common', icon: '🏆' },
  { id: 'streak_3', key: 'streak_3', name: 'Getting Started', description: '3-day clinical streak', iconKey: 'flame', xpReward: 50, rarity: 'common', icon: '🥉' },
  { id: 'streak_7', key: 'streak_7', name: 'Week Warrior', description: '7-day clinical streak', iconKey: 'flame', xpReward: 150, rarity: 'rare', icon: '🥈' },
  { id: 'streak_30', key: 'streak_30', name: 'Iron Discipline', description: '30-day clinical streak', iconKey: 'flame', xpReward: 500, rarity: 'legendary', icon: '🥇' },
  { id: 'perfect_score', key: 'perfect_score', name: 'The Perfectionist', description: 'Achieved a perfect 100% score', iconKey: 'star', xpReward: 200, rarity: 'rare', icon: '⭐' },
  { id: 'speed_demon', key: 'speed_demon', name: 'Speed Demon', description: 'Completed in under 50% of estimated time', iconKey: 'zap', xpReward: 150, rarity: 'rare', icon: '⚡' },
  { id: 'night_owl', key: 'night_owl', name: 'Night Owl', description: 'Completed a case between 23:00 and 04:00', iconKey: 'moon', xpReward: 75, rarity: 'common', icon: '🦉' },
  { id: 'specialty_master_cardiology', key: 'specialty_master_cardiology', name: 'Heart Expert', description: 'Mastered all Cardiology cases', iconKey: 'heart', xpReward: 300, rarity: 'epic', icon: '❤️' },
  { id: 'specialty_master_neurology', key: 'specialty_master_neurology', name: 'Brain Expert', description: 'Mastered all Neurology cases', iconKey: 'brain', xpReward: 300, rarity: 'epic', icon: '🧠' },
  { id: 'specialty_master_respiratory', key: 'specialty_master_respiratory', name: 'Lung Expert', description: 'Mastered all Respiratory cases', iconKey: 'wind', xpReward: 300, rarity: 'epic', icon: '🫁' },
]

// ─── Leaderboard ─────────────────────────────────────────────────────
export const LeaderboardEntrySchema = z.object({
  rank: z.number().int(),
  userId: z.string(),
  name: z.string(),
  level: z.number().int(),
  xp: z.number().int(),
  avatarInitials: z.string().optional(),
  totalXp: z.number().optional(),
  streak: z.number().optional(),
  casesCompleted: z.number().optional(),
  institution: z.string().optional(),
  isCurrentUser: z.boolean().optional(),
})
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>

export interface StreakStatus {
  currentStreak: number
  longestStreak: number
  completedToday: boolean
  last7Days: {
    date: string
    completed: boolean
  }[]
}

export interface LevelInfo {
  level: number
  title: string
  currentLevelXp: number
  nextLevelXp: number
  progressPercent: number
}

export function computeLevel(totalXp: number): LevelInfo {
  const level = xpToLevel(totalXp)
  const title = getLevelTitle(level)
  const nextLevelInfo = xpToNextLevel(totalXp)
  
  return {
    level,
    title,
    currentLevelXp: nextLevelInfo.current,
    nextLevelXp: nextLevelInfo.threshold,
    progressPercent: nextLevelInfo.progress,
  }
}

export type LeaderboardPeriod = 'weekly' | 'alltime'

// ─── Progress Stats ──────────────────────────────────────────────────
export const ProgressStatsSchema = z.object({
  xp: z.number().int(),
  level: z.number().int(),
  levelTitle: z.string(),
  levelProgress: z.number(),
  currentStreak: z.number().int(),
  longestStreak: z.number().int(),
  casesCompleted: z.number().int(),
  casesInProgress: z.number().int(),
  averageScore: z.number(),
  totalStudyMinutes: z.number(),
})
export type ProgressStats = z.infer<typeof ProgressStatsSchema>
