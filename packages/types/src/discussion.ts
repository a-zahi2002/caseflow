import { z } from 'zod'

// ─── Discussion Post ─────────────────────────────────────────────────
export const DiscussionPostSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  authorId: z.string(),
  parentId: z.string().nullable().optional(),
  content: z.string(),
  isOfficial: z.boolean().default(false),
  upvotes: z.number().int().default(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: z.object({
    id: z.string(),
    name: z.string().optional(),
    avatarUrl: z.string().nullable().optional(),
    role: z.string().optional(),
  }).optional(),
  replies: z.array(z.lazy((): z.ZodType => DiscussionPostSchema)).optional(),
})
export type DiscussionPost = z.infer<typeof DiscussionPostSchema>
export interface DiscussionMessage {
  id: string
  caseId: string
  userId: string
  userName: string
  userRole: string
  content: string
  parentId: string | null
  createdAt: string
  replies?: DiscussionMessage[]
}

export const CreateDiscussionPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(10000),
  parentId: z.string().optional(),
})
export type CreateDiscussionPostInput = z.infer<typeof CreateDiscussionPostSchema>

// ─── Notification ────────────────────────────────────────────────────
export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['badge_earned', 'reply', 'mention', 'official_answer']),
  title: z.string(),
  body: z.string(),
  isRead: z.boolean().default(false),
  linkUrl: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
})
export type Notification = z.infer<typeof NotificationSchema>
