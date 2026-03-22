import type { Context } from 'hono'
import type { ApiSuccess, ApiError } from '@caseflow/types'

export function success<T>(c: Context, data: T, status = 200): Response {
  const body: ApiSuccess<T> = { success: true, data }
  return c.json(body, status as 200)
}

export function error(c: Context, message: string, status = 500, code?: string): Response {
  const body: ApiError = { success: false, error: message, ...(code && { code }) }
  return c.json(body, status as 500)
}
