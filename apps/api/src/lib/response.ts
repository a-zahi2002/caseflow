import type { Context } from 'hono'
import type { ApiResponse } from '@caseflow/types'

export function success<T>(c: Context, data: T, status: number = 200, meta?: Record<string, unknown>) {
  const body: ApiResponse<T> = { success: true, data, ...(meta && { meta }) }
  return c.json(body, status as any)
}

export function error(c: Context, message: string, status: number = 500, code: string = 'INTERNAL_ERROR') {
  const body: ApiResponse<never> = { success: false, error: message, code }
  return c.json(body, status as any)
}
