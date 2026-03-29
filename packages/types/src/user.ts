export type Role = 'student' | 'educator' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  institution?: string
  totalXp: number
  currentStreak: number
  longestStreak: number
  lastActiveDate?: Date
  badges: Array<{ badgeId: string; unlockedAt: Date }>
  createdAt: Date
}

export interface JwtPayload {
  sub: string
  role: Role
  iat: number
  exp: number
}
