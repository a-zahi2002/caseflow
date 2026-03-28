/**
 * Shared gamification types and clinical progression constants content.
 * Strictly typed, no any content.
 */

/**
 * Total XP required for each level from 1 to 20 content.
 * Index 0 maps to Level 1, Index 1 maps to Level 2 reaching 500 XP, etc.
 */
export const XP_PER_LEVEL = [
  0,      // L1
  500,    // L2
  1000,   // L3
  1800,   // L4
  2800,   // L5
  4000,   // L6
  5500,   // L7
  7200,   // L8
  9200,   // L9
  11500,  // L10
  14000,  // L11
  17000,  // L12
  20500,  // L13
  24500,  // L14
  29000,  // L15
  34000,  // L16
  40000,  // L17
  47000,  // L18
  55000,  // L19
  65000,  // L20
] as const

/**
 * Clinical titles mapped to levels 1-20 content.
 */
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Medical Student I',
  2: 'Medical Student II',
  3: 'Medical Student III',
  4: 'Clinical Clerk',
  5: 'Junior Resident',
  6: 'Resident',
  7: 'Senior Resident',
  8: 'Clinical Resident',
  9: 'Chief Resident',
  10: 'Junior Registrar',
  11: 'Registrar',
  12: 'Senior Registrar',
  13: 'Consultant Trainee',
  14: 'Junior Consultant',
  15: 'Consultant',
  16: 'Senior Consultant',
  17: 'Clinical Lead',
  18: 'Head of Department',
  19: 'Medical Director',
  20: 'Chief of Medicine',
}

export interface LevelInfo {
  level: number
  title: string
  totalXp: number
  currentLevelXp: number
  nextLevelXp: number
  progressPercent: number
}

/**
 * Computes the user's current level and progression details based on total XP content.
 */
export function computeLevel(totalXp: number): LevelInfo {
  let level = 1
  for (let i = 1; i < XP_PER_LEVEL.length; i++) {
    if (totalXp >= XP_PER_LEVEL[i]!) {
      level = i + 1
    } else {
      break
    }
  }

  const title = LEVEL_TITLES[level] ?? 'Physician'
  
  if (level >= 20) {
    return {
      level: 20,
      title: LEVEL_TITLES[20]!,
      totalXp,
      currentLevelXp: totalXp - XP_PER_LEVEL[19]!,
      nextLevelXp: 0,
      progressPercent: 100,
    }
  }

  const currentLevelMinXp = XP_PER_LEVEL[level - 1]!
  const nextLevelMinXp = XP_PER_LEVEL[level]!
  const currentLevelXp = totalXp - currentLevelMinXp
  const xpNeededForNext = nextLevelMinXp - currentLevelMinXp
  const progressPercent = Math.min(100, Math.floor((currentLevelXp / xpNeededForNext) * 100))

  return {
    level,
    title,
    totalXp,
    currentLevelXp,
    nextLevelXp: nextLevelMinXp,
    progressPercent,
  }
}

/**
 * Standard XP award amounts for various clinical activities content.
 */
export const XP_AWARDS = {
  CASE_COMPLETE_BEGINNER: 180,
  CASE_COMPLETE_INTERMEDIATE: 320,
  CASE_COMPLETE_ADVANCED: 500,
  SCORE_BONUS_90_PLUS: 80,
  SCORE_BONUS_80_PLUS: 40,
  FIRST_CASE_OF_DAY: 50,
  STREAK_7_DAYS: 150,
  STREAK_30_DAYS: 500,
  PERFECT_SCORE: 200,
  DISCUSSION_COMMENT: 10,
  FIRST_CASE_EVER: 100,
} as const

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string
  rarity: BadgeRarity
  xpReward: number
  requirement: string
}

export interface UserBadge {
  badgeId: string
  unlockedAt: Date
  isNew: boolean
}

/**
 * Exactly 10 clinical badge definitions content.
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Successfully completed your first clinical case.',
    icon: '🏆',
    rarity: 'common',
    xpReward: 100,
    requirement: 'Complete 1 case',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintained a clinical streak for 7 consecutive days.',
    icon: '🔥',
    rarity: 'rare',
    xpReward: 150,
    requirement: '7-day streak',
  },
  {
    id: 'cardiologist',
    name: 'Young Cardiologist',
    description: 'Demonstrated proficiency in cardiology cases.',
    icon: '❤️',
    rarity: 'rare',
    xpReward: 200,
    requirement: 'Complete 5 cardiology cases',
  },
  {
    id: 'neuro_master',
    name: 'Neuro Master',
    description: 'Solved complex neurological diagnostic puzzles.',
    icon: '🧠',
    rarity: 'epic',
    xpReward: 300,
    requirement: 'Complete 10 neurology cases with 90%+ accuracy',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Completed an advanced case in under 15 minutes.',
    icon: '⚡',
    rarity: 'rare',
    xpReward: 150,
    requirement: 'Finish advanced case < 15min',
  },
  {
    id: 'diagnostician',
    name: 'The Diagnostician',
    description: 'Reached a cumulative diagnostic accuracy of 95% over 50 cases.',
    icon: '🎯',
    rarity: 'epic',
    xpReward: 400,
    requirement: '95%+ average accuracy across 50 cases',
  },
  {
    id: 'consultant',
    name: 'Chief Consultant',
    description: 'Reached the rank of Consultant and shared knowledge via discussions.',
    icon: '🩺',
    rarity: 'legendary',
    xpReward: 1000,
    requirement: 'Reach Level 15 and post 50 discussion comments',
  },
  {
    id: 'iron_clinician',
    name: 'Iron Clinician',
    description: 'Completed 100 clinical cases with minimal diagnostic errors.',
    icon: '🦾',
    rarity: 'legendary',
    xpReward: 500,
    requirement: 'Complete 100 cases',
  },
  {
    id: 'scholar',
    name: 'Clinical Scholar',
    description: 'Contributed significantly to peer discussions and review.',
    icon: '📚',
    rarity: 'rare',
    xpReward: 200,
    requirement: 'Post 20 discussion comments',
  },
  {
    id: 'perfectionist',
    name: 'The Perfectionist',
    description: 'Achieved a perfect 100% score on a high-difficulty Advanced case.',
    icon: '⭐',
    rarity: 'epic',
    xpReward: 200,
    requirement: 'Get 100% on an Advanced case',
  },
]

export interface StreakStatus {
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date | null
  completedToday: boolean
  last7Days: { date: string; completed: boolean }[]
}

export type LeaderboardScope = 'institution' | 'global' | 'specialty'
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time'

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatarInitials: string
  totalXp: number
  level: number
  streak: number
  casesCompleted: number
  institution: string | null
  isCurrentUser: boolean
}

export interface SpecialtyPerformance {
  specialty: string
  casesAttempted: number
  casesCompleted: number
  averageScore: number
  totalXp: number
}

export interface WeakArea {
  specialty: string
  issue: string
  affectedCases: number
  suggestedFocus: string
}

export interface StudentProgressSummary {
  totalXp: number
  level: LevelInfo
  streak: StreakStatus
  casesCompleted: number
  casesAttempted: number
  overallAverageScore: number
  specialtyPerformance: SpecialtyPerformance[]
  weakAreas: WeakArea[]
  badges: UserBadge[]
  institutionRank: number | null
  weeklyXp: number[]
}
