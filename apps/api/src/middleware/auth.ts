import { createMiddleware } from 'hono/factory'
import { verify } from 'jsonwebtoken'
import { config } from '../lib/config.js'
import { UnauthorizedError } from '../lib/errors.js'
import type { JwtPayload } from '@caseflow/types'
import type { AppEnv } from '../types.js'

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header')
  }

  const token = authHeader.slice(7)

  let payload: JwtPayload
  try {
    payload = verify(token, config.JWT_SECRET) as JwtPayload
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }

  c.set('jwtPayload', payload)
  await next()
})
