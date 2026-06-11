import { z } from 'zod'

// ─── Admin Types ─────────────────────────────────────────────────────
export const AuditLogSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  metadata: z.any().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
})
export type AuditLog = z.infer<typeof AuditLogSchema>

export const AdminAnalyticsSchema = z.object({
  dau: z.number(),
  mau: z.number(),
  totalAttempts: z.number(),
  avgScore: z.number(),
  topCases: z.array(z.object({
    id: z.string(),
    title: z.string(),
    attemptCount: z.number(),
  })),
  topStudents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    xp: z.number(),
    level: z.number(),
  })),
  dailyActiveUsers: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })),
  newRegistrations: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })),
  scoreDistribution: z.array(z.object({
    bucket: z.string(),
    count: z.number(),
  })),
})
export type AdminAnalytics = z.infer<typeof AdminAnalyticsSchema>

export const AdminUserUpdateSchema = z.object({
  role: z.enum(['STUDENT', 'EDUCATOR', 'ADMIN']).optional(),
})
export type AdminUserUpdate = z.infer<typeof AdminUserUpdateSchema>

// ─── Moderation Queue ────────────────────────────────────────────────
export const ModerationQueueItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  difficulty: z.string(), // e.g. BEGINNER, INTERMEDIATE, ADVANCED
  specialty: z.string(),
  authorName: z.string(),
  submittedAt: z.coerce.date(),
})
export type ModerationQueueItem = z.infer<typeof ModerationQueueItemSchema>

// ─── Platform Settings ───────────────────────────────────────────────
export const PlatformSettingsDataSchema = z.object({
  institutionName: z.string(),
  allowedSpecialties: z.array(z.string()),
  discussionsEnabled: z.boolean(),
  communitySubmissionsEnabled: z.boolean(),
})
export type PlatformSettingsData = z.infer<typeof PlatformSettingsDataSchema>

// ─── User Management ─────────────────────────────────────────────────
export const UserManagementDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  institution: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.coerce.date(),
})
export type UserManagementData = z.infer<typeof UserManagementDataSchema>

