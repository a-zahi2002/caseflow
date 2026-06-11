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
