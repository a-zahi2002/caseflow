import { z } from 'zod'

// ─── Enums ───────────────────────────────────────────────────────────
export const AttemptStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED', 'FAILED'])
export type AttemptStatus = z.infer<typeof AttemptStatusSchema>

// ─── Attempt ─────────────────────────────────────────────────────────
export const AttemptSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  caseId: z.string(),
  status: AttemptStatusSchema,
  currentStepOrder: z.number().int().default(0),
  heartsRemaining: z.number().int().default(3),
  score: z.number().default(0),
  xpEarned: z.number().int().default(0),
  notes: z.string().nullable().optional(),
  startedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type Attempt = z.infer<typeof AttemptSchema>

// ─── SimMessage ──────────────────────────────────────────────────────
export const SimMessageSchema = z.object({
  id: z.string(),
  attemptId: z.string(),
  role: z.enum(['student', 'patient', 'system']),
  content: z.string(),
  stepOrder: z.number().int().default(0),
  tokenCount: z.number().int().nullable().optional(),
  createdAt: z.coerce.date(),
})
export type SimMessage = z.infer<typeof SimMessageSchema>

// ─── Attempt Evaluation ──────────────────────────────────────────────
export const AttemptEvaluationSchema = z.object({
  id: z.string(),
  attemptId: z.string(),
  overallScore: z.number(),
  overallFeedback: z.string(),
  stepEvaluations: z.any(), // EvaluationResult[] stored as JSON
  missedFindings: z.array(z.string()),
  correctFindings: z.array(z.string()),
  criticalErrorCount: z.number().int().default(0),
  createdAt: z.coerce.date(),
})
export type AttemptEvaluation = z.infer<typeof AttemptEvaluationSchema>

// ─── Start Simulation ────────────────────────────────────────────────
export const StartSimulationSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
})
export type StartSimulationInput = z.infer<typeof StartSimulationSchema>
