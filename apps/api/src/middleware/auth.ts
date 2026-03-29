import { createMiddleware } from 'hono/factory'
import jwt from 'jsonwebtoken'
import { config } from '../lib/config.js'
import { UnauthorizedError } from '../lib/errors.js'
import type { JwtPayload } from '@caseflow/types'
import type { AppEnv } from '../types.js'

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  let token = c.req.header('Authorization')?.startsWith('Bearer ') 
    ? c.req.header('Authorization')?.slice(7) 
    : c.req.query('token')

  if (!token) {
    throw new UnauthorizedError('Missing authentication token')
  }

  let payload: JwtPayload
  try {
    payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload
  } catch {
    throw new UnauthorizedError('Invalid or expired token')
  }

  c.set('jwtPayload', payload)
  await next()
})
