/**
 * Shared constants used across packages.
 */

// ─── Specialty Colors (for case thumbnails) ──────────────────────────
export const SPECIALTY_COLORS: Record<string, string> = {
  Cardiology: '#EF4444',
  Neurology: '#8B5CF6',
  Respiratory: '#3B82F6',
  Gastroenterology: '#F59E0B',
  'Infectious Disease': '#10B981',
  Nephrology: '#06B6D4',
  Endocrinology: '#EC4899',
  Haematology: '#F97316',
  'General Medicine': '#6366F1',
  'Emergency Medicine': '#DC2626',
  Dermatology: '#D946EF',
  Psychiatry: '#14B8A6',
}

// ─── Specialty List ──────────────────────────────────────────────────
export const SPECIALTIES = [
  'Cardiology',
  'Neurology',
  'Respiratory',
  'Gastroenterology',
  'Infectious Disease',
  'Nephrology',
  'Endocrinology',
  'Haematology',
] as const

export type Specialty = (typeof SPECIALTIES)[number]

// ─── Personality Traits (for patient persona) ────────────────────────
export const PERSONALITY_TRAITS = [
  'Anxious',
  'Stoic',
  'Verbose',
  'Evasive',
  'Cooperative',
] as const

export type PersonalityTrait = (typeof PERSONALITY_TRAITS)[number]

// ─── Difficulty Labels ───────────────────────────────────────────────
export const DIFFICULTY_CONFIG = {
  BEGINNER: { label: 'Beginner', color: '#16A34A', bg: '#DCFCE7' },
  INTERMEDIATE: { label: 'Intermediate', color: '#D97706', bg: '#FEF3C7' },
  ADVANCED: { label: 'Advanced', color: '#DC2626', bg: '#FEE2E2' },
} as const
