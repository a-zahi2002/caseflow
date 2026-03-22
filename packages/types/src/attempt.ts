export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned'
export type MessageRole = 'student' | 'patient'

export interface SimMessage {
  id: string
  attemptId: string
  role: MessageRole
  content: string
  createdAt: Date
}

export interface StepFeedback {
  stepId: string
  stepType: string
  score: number
  feedback: string
  missedFindings: string[]
}

export interface EvalResult {
  overallScore: number
  stepFeedback: StepFeedback[]
  topLearningPoints: string[]
  suggestedCaseIds: string[]
}

export interface Attempt {
  id: string
  userId: string
  caseId: string
  status: AttemptStatus
  score?: number
  evalResult?: EvalResult
  completedAt?: Date
  createdAt: Date
  messages?: SimMessage[]
}
