import { z } from 'zod'

// ─── Enums ───────────────────────────────────────────────────────────
export const DifficultySchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
export type Difficulty = z.infer<typeof DifficultySchema>

export const CaseStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
export type CaseStatus = z.infer<typeof CaseStatusSchema>

export const PatientPersonaSchema = z.object({
  name: z.string(),
  age: z.number().int(),
  sex: z.string(),
  presentingComplaint: z.string(),
  background: z.string(),
})
export type PatientPersona = z.infer<typeof PatientPersonaSchema>

// ─── Revealed Data (per step) ────────────────────────────────────────
export const RevealedDataSchema = z.object({
  vitals: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  labs: z.record(z.string(), z.object({
    value: z.union([z.string(), z.number()]),
    unit: z.string().optional(),
    referenceRange: z.string().optional(),
    abnormal: z.boolean().optional(),
  })).optional(),
  imaging: z.string().optional(),
})
export type RevealedData = z.infer<typeof RevealedDataSchema>

// ─── Case Step ───────────────────────────────────────────────────────
export const CaseStepSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  order: z.number().int(),
  name: z.string(),
  expectedFindings: z.array(z.string()),
  criticalErrors: z.array(z.string()),
  revealedData: RevealedDataSchema.default({}),
  scoringWeight: z.number().default(1.0),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
})
export type CaseStep = z.infer<typeof CaseStepSchema>

// ─── Case ────────────────────────────────────────────────────────────
export const CaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  specialty: z.string(),
  difficulty: DifficultySchema,
  estimatedMinutes: z.number().int().default(30),
  tags: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).default([]),
  status: CaseStatusSchema,
  thumbnailColor: z.string().nullable().optional(),
  thumbnailIcon: z.string().nullable().optional(),
  authorId: z.string(),
  prerequisiteCaseIds: z.array(z.string()).default([]),
  totalAttempts: z.number().int().default(0),
  avgScore: z.number().default(0),
  patientName: z.string(),
  patientAge: z.number().int(),
  patientGender: z.string(),
  chiefComplaint: z.string(),
  patientBackground: z.string(),
  personalityTraits: z.array(z.string()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  steps: z.array(CaseStepSchema).optional(),
})
export type Case = z.infer<typeof CaseSchema>

// ─── Case Create/Update ─────────────────────────────────────────────
export const CreateCaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').optional().default(''),
  specialty: z.string().min(1, 'Specialty is required'),
  difficulty: DifficultySchema,
  estimatedMinutes: z.number().int().min(5).max(120).optional().default(30),
  tags: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).default([]),
  patientPersona: z.object({
    name: z.string().default('Jane Doe'),
    age: z.number().int().min(1).max(120),
    sex: z.string().min(1),
    presentingComplaint: z.string().min(1),
    background: z.string().min(1),
  }),
  personalityTraits: z.array(z.string()).default([]),
  prerequisiteCaseIds: z.array(z.string()).default([]),
})
export type CreateCaseInput = z.infer<typeof CreateCaseSchema>

export const UpdateCaseSchema = CreateCaseSchema.partial()
export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>

// ─── Case Step Create ────────────────────────────────────────────────
export const CreateCaseStepSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().min(0),
  expectedFindings: z.array(z.string()).min(1, 'At least one expected finding is required'),
  criticalErrors: z.array(z.string()).default([]),
  revealedData: RevealedDataSchema.default({}),
  scoringWeight: z.number().min(0.1).max(2.0).default(1.0),
})
export type CreateCaseStepInput = z.infer<typeof CreateCaseStepSchema>

// ─── Case Filter ─────────────────────────────────────────────────────
export const CaseFilterSchema = z.object({
  specialty: z.string().optional(),
  difficulty: DifficultySchema.optional(),
  q: z.string().optional(),
  filter: z.enum(['all', 'bookmarked', 'completed', 'in_progress']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})
export type CaseFilter = z.infer<typeof CaseFilterSchema>

// ─── Case List Item (for card display) ───────────────────────────────
export const CaseListItemSchema = CaseSchema.extend({
  author: z.object({
    id: z.string(),
    name: z.string().optional(),
  }).optional(),
  completionStatus: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  isBookmarked: z.boolean().optional(),
})
export type CaseListItem = z.infer<typeof CaseListItemSchema>
