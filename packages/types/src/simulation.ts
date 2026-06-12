import { z } from 'zod'

// ─── Evaluation ──────────────────────────────────────────────────────
export const EvaluationInputSchema = z.object({
  studentMessages: z.array(z.string()),
  expectedFindings: z.array(z.string()),
  criticalErrors: z.array(z.string()),
})
export type EvaluationInput = z.infer<typeof EvaluationInputSchema>

export const EvaluationResultSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  missedFindings: z.array(z.string()),
  correctFindings: z.array(z.string()),
  criticalErrorTriggered: z.boolean(),
  stepComplete: z.boolean(),
})
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>

// ─── WebSocket Messages ──────────────────────────────────────────────
export const WSStreamChunkSchema = z.object({
  type: z.literal('stream_chunk'),
  content: z.string(),
})

export const WSStreamEndSchema = z.object({
  type: z.literal('stream_end'),
  tokenCount: z.number(),
  messageId: z.string(),
})

export const WSEvaluationSchema = z.object({
  type: z.literal('evaluation'),
  result: EvaluationResultSchema,
  heartsRemaining: z.number(),
})

export const WSStepAdvanceSchema = z.object({
  type: z.literal('step_advance'),
  newStepOrder: z.number(),
  revealedData: z.any(),
})

export const WSAttemptCompleteSchema = z.object({
  type: z.literal('attempt_complete'),
  finalScore: z.number(),
  xpEarned: z.number(),
})

export const WSAttemptFailedSchema = z.object({
  type: z.literal('attempt_failed'),
  reason: z.string(),
})

export const WSErrorSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
})

export const WSHeartbeatSchema = z.object({
  type: z.literal('heartbeat'),
})

export type WSMessageToClient =
  | z.infer<typeof WSStreamChunkSchema>
  | z.infer<typeof WSStreamEndSchema>
  | z.infer<typeof WSEvaluationSchema>
  | z.infer<typeof WSStepAdvanceSchema>
  | z.infer<typeof WSAttemptCompleteSchema>
  | z.infer<typeof WSAttemptFailedSchema>
  | z.infer<typeof WSErrorSchema>
  | z.infer<typeof WSHeartbeatSchema>

// ─── Client → Server Messages ────────────────────────────────────────
export const WSClientMessageSchema = z.object({
  type: z.literal('message'),
  content: z.string(),
})

export const WSClientPingSchema = z.object({
  type: z.literal('ping'),
})

export const WSClientSyncNotesSchema = z.object({
  type: z.literal('sync_notes'),
  content: z.string(),
})

export const WSClientEndSimulationSchema = z.object({
  type: z.literal('end_simulation'),
})

export type WSMessageToServer =
  | z.infer<typeof WSClientMessageSchema>
  | z.infer<typeof WSClientPingSchema>
  | z.infer<typeof WSClientSyncNotesSchema>
  | z.infer<typeof WSClientEndSimulationSchema>
