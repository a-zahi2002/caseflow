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
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
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
  const profile = await prisma.userProfile.findUnique({
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

  c.set('userProfile', profile)

  if (profile?.banned) {
    throw new UnauthorizedError('Account suspended')
  }

  await next()
})
