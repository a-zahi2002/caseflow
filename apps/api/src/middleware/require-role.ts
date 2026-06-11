import { createMiddleware } from 'hono/factory'
import { ForbiddenError } from '../lib/errors.js'
import type { Role } from '@caseflow/types'

export function requireRole(...roles: Role[]) {
  return createMiddleware(async (c, next) => {
    const profile = c.get('userProfile') as { role: string } | null

    if (!profile) {
      throw new ForbiddenError('User profile not found')
    }

    if (!roles.includes(profile.role as Role)) {
      throw new ForbiddenError(`This action requires one of: ${roles.join(', ')}`)
    }

    await next()
  })
}
