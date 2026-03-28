export interface StudentProgressMetrics {
  totalAttempts: number
  totalCompleted: number
  overallAvgScore: number
  completionRate: number
  specialtyBreakdown: {
    specialty: string
    avgScore: number
    attempts: number
  }[]
}

export interface ScoreTrendPoint {
  date: string
  score: number
  caseTitle: string
}

export interface StudentProgressData {
  metrics: StudentProgressMetrics
  recentAttempts: {
    id: string
    caseTitle: string
    specialty: string
    score: number | null
    status: 'in_progress' | 'completed' | 'abandoned'
    date: string
  }[]
  weakAreas: {
    specialty: string
    avgScore: number
    attempts: number
  }[]
  trend: ScoreTrendPoint[]
}
