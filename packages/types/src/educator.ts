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

export interface CaseFormInput {
  title: string;
  description?: string;
  specialty: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes?: number;
  tags: string[];
  learningObjectives?: string[];
  patientPersona: {
    name?: string;
    age: number;
    sex: 'male' | 'female' | 'other';
    presentingComplaint: string;
    background: string;
  };
  steps: Array<{
    order: number;
    type: 'history' | 'examination' | 'investigation' | 'diagnosis' | 'management';
    content: string;
    expectedFindings: {
      keyPoints: string[];
      redFlags?: string[];
    };
    id?: string;
  }>;
}
