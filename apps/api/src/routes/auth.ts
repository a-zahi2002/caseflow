import { Hono } from 'hono'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@caseflow/db'
import { config } from '../lib/config.js'
import { success, error } from '../lib/response.js'
import { authMiddleware } from '../middleware/auth.js'
import { NotFoundError } from '../lib/errors.js'
import type { AppEnv } from '../types.js'
import type { AuthResponse, User } from '@caseflow/types'

export const authRouter = new Hono<AppEnv>()

// Input validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(72),
  institution: z.string().max(200).trim().optional(),
})

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
})

// Helper — sign a JWT for a user
function createToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Helper — remove passwordHash before sending user to client
function sanitizeUser(user: {
  id: string
  name: string
  email: string
  role: string
  institution: string | null
  totalXp: number
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date | null
  badges: any // Prisma returns Json
  createdAt: Date
}): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as User['role'],
    createdAt: user.createdAt,
    totalXp: user.totalXp,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    badges: user.badges as User['badges'],
    ...(user.institution != null && { institution: user.institution }),
    ...(user.lastActiveDate != null && { lastActiveDate: user.lastActiveDate }),
  }
}

// POST /auth/register
authRouter.post('/register', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 422, 'VALIDATION_ERROR')
  }

  const { name, email, password, institution } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return error(c, 'An account with this email already exists', 409, 'EMAIL_TAKEN')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { name, email, passwordHash, institution: institution ?? null },
  })

  const token = createToken(user.id, user.role)
  const response: AuthResponse = { token, user: sanitizeUser(user) }

  return success(c, response, 201)
})

// POST /auth/login
authRouter.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return error(c, parsed.error.errors[0]?.message ?? 'Invalid input', 422, 'VALIDATION_ERROR')
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })

  // Always run bcrypt compare to prevent user enumeration via timing attacks
  const dummyHash = '$2a$12$dummyhashfortimingattackprevention000000000000000000000'
  const passwordMatch = await bcrypt.compare(password, user?.passwordHash ?? dummyHash)

  if (!user || !passwordMatch) {
    return error(c, 'Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }

  const token = createToken(user.id, user.role)
  const response: AuthResponse = { token, user: sanitizeUser(user) }

  return success(c, response, 200)
})

// GET /auth/me — requires valid JWT
authRouter.get('/me', authMiddleware, async (c) => {
  const payload = c.get('jwtPayload')

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      institution: true,
      totalXp: true,
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
      badges: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw new NotFoundError('User')
  }

  return success(c, sanitizeUser(user))
})
