import { z } from 'zod'

// ─── API Response Envelope ───────────────────────────────────────────
export type ApiResponse<T> =
  | { success: true; data: T; meta?: Record<string, unknown> }
  | { success: false; error: string; code: string }

// ─── Pagination Meta ─────────────────────────────────────────────────
export const PaginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
})
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>
