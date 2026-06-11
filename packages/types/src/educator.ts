import type { Case, CaseStep } from './case';

export interface EducatorAnalytics {
  totalCases: number;
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  casesBySpecialty: Record<string, number>;
  caseStats: CaseStat[];
}

export interface CaseStat {
  id: string;
  title: string;
  specialty: string;
  attemptCount: number;
  averageScore: number;
  completionRate: number;
  mostMissedStep?: {
    type: string;
    missedCount: number;
  };
}

export interface CompletionTrend {
  date: string;
  rate: number;
}

export interface CaseFormInput extends Omit<Case, 'id' | 'authorId' | 'status' | 'createdAt' | 'updatedAt' | 'steps'> {
  steps: Array<Omit<CaseStep, 'id' | 'caseId'> & { id?: string | undefined }>;
}
