export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type CaseStatus = 'draft' | 'review' | 'published'
export type StepType = 'history' | 'examination' | 'investigation' | 'diagnosis' | 'management'

export interface PatientPersona {
  age: number
  sex: 'male' | 'female' | 'other'
  presentingComplaint: string
  background: string
}

export interface ExpectedFindings {
  keyPoints: string[]
  redFlags?: string[] | undefined
}

export interface CaseStep {
  id: string
  caseId: string
  order: number
  type: StepType
  content: string
  expectedFindings: ExpectedFindings
}

export interface Case {
  id: string
  authorId: string
  title: string
  specialty: string
  difficulty: Difficulty
  status: CaseStatus
  patientPersona: PatientPersona
  tags: string[]
  timeLimit?: number | undefined
  sourceDocumentUrl?: string | undefined
  createdAt: Date
  updatedAt: Date
  steps?: CaseStep[] | undefined
}
