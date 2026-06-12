import { createMiddleware } from 'hono/factory'
import { auth } from '../lib/auth.js'
import { UnauthorizedError } from '../lib/errors.js'
import { prisma } from '@caseflow/db'

interface AuthEnv {
  Variables: {
    user: {
      id: string
      name: string
      email: string
    }
    userProfile: {
      id: string
      role: string
      institution: string | null
      xp: number
      level: number
      currentStreak: number
      banned: boolean
    } | null
  }
}

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const headers = new Headers(c.req.raw.headers)
  const tokenQuery = c.req.query('token')
  if (tokenQuery && !headers.get('Authorization')) {
    headers.set('Authorization', `Bearer ${tokenQuery}`)
  }

  const session = await auth.api.getSession({
    headers,
  })

  if (!session?.user) {
    throw new UnauthorizedError('Authentication required')
  }

  // Set user from better-auth session
  c.set('user', {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  })

  // Load user profile (extended data)
  let profile = await prisma.userProfile.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      institution: true,
      xp: true,
      level: true,
      currentStreak: true,
      banned: true,
    },
  })

  // If profile is missing, automatically initialize it with default STUDENT role
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        id: session.user.id,
        role: 'STUDENT',
      },
      select: {
        id: true,
        role: true,
        institution: true,
        xp: true,
        level: true,
        currentStreak: true,
        banned: true,
      },
    })
  }

  c.set('userProfile', profile)

  if (profile?.banned) {
    throw new UnauthorizedError('Account suspended')
  }

  await next()
})
