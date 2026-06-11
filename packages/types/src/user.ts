import { z } from 'zod'

// ─── Enums ───────────────────────────────────────────────────────────
export const RoleSchema = z.enum(['STUDENT', 'EDUCATOR', 'ADMIN'])
export type Role = z.infer<typeof RoleSchema>

// ─── User Profile ────────────────────────────────────────────────────
export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable().optional(),
  role: RoleSchema,
  institution: z.string().nullable().optional(),
  yearOfStudy: z.number().int().nullable().optional(),
  specialties: z.array(z.string()).default([]),
  avatarUrl: z.string().nullable().optional(),
  currentStreak: z.number().int().default(0),
  longestStreak: z.number().int().default(0),
  lastActiveDate: z.coerce.date().nullable().optional(),
  xp: z.number().int().default(0),
  level: z.number().int().default(1),
  banned: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
})
export type UserProfile = z.infer<typeof UserProfileSchema>

// ─── Registration ────────────────────────────────────────────────────
export const RegisterStep1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const RegisterStep2Schema = z.object({
  role: z.enum(['STUDENT', 'EDUCATOR']),
  inviteCode: z.string().optional(),
})

export const RegisterStep3Schema = z.object({
  specialties: z.array(z.string()).max(3, 'Select up to 3 specialties'),
})

export type RegisterStep1 = z.infer<typeof RegisterStep1Schema>
export type RegisterStep2 = z.infer<typeof RegisterStep2Schema>
export type RegisterStep3 = z.infer<typeof RegisterStep3Schema>

// ─── Login ───────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
})
export type LoginInput = z.infer<typeof LoginSchema>

// ─── Profile Update ──────────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  institution: z.string().max(200).trim().optional(),
  yearOfStudy: z.number().int().min(1).max(10).optional(),
  specialties: z.array(z.string()).max(3).optional(),
  role: z.enum(['STUDENT', 'EDUCATOR', 'ADMIN']).optional(),
  inviteCode: z.string().optional(),
})
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>

export interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'EDUCATOR' | 'ADMIN' | 'student' | 'educator' | 'admin'
  createdAt: Date
  totalXp?: number
  currentStreak?: number
  longestStreak?: number
  badges?: any
  institution?: string | null
  lastActiveDate?: Date | null
}

