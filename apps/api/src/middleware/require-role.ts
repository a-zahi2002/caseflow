import { createMiddleware } from 'hono/factory'
import { ForbiddenError, UnauthorizedError } from '../lib/errors.js'
import type { Role } from '@caseflow/types'
import type { AppEnv } from '../types.js'

export function requireRole(...roles: Role[]) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const payload = c.get('jwtPayload')

    if (!payload) {
      throw new UnauthorizedError()
    }

    if (!roles.includes(payload.role)) {
      throw new ForbiddenError(
        `This action requires one of the following roles: ${roles.join(', ')}`
      )
    }

    await next()
  })
}
