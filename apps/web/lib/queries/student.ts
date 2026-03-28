import { StudentProgressSummary, LeaderboardEntry, computeLevel } from '@cbl/types'

const MOCK_PROGRESS_DATA = {
  totalXp: 3240,
  casesCompleted: 47,
  casesAttempted: 52,
  overallAverageScore: 78,
  institutionRank: 4,
  weeklyXp: [180, 320, 240, 480],
  specialtyPerformance: [
    { specialty: 'Cardiology', averageScore: 84, casesCompleted: 12, casesAttempted: 14, totalXp: 960 },
    { specialty: 'Respiratory', averageScore: 78, casesCompleted: 9, casesAttempted: 10, totalXp: 720 },
    { specialty: 'Emergency', averageScore: 72, casesCompleted: 8, casesAttempted: 9, totalXp: 640 },
    { specialty: 'Neurology', averageScore: 65, casesCompleted: 11, casesAttempted: 14, totalXp: 880 },
    { specialty: 'GI', averageScore: 58, casesCompleted: 7, casesAttempted: 8, totalXp: 400 },
  ],
  weakAreas: [
    { 
      specialty: 'Neurology', 
      issue: 'Clinical Localisation',
      affectedCases: 4, 
      suggestedFocus: 'Focus on cranial nerve examination in neurology cases' 
    },
    { 
      specialty: 'Pharmacology', 
      issue: 'Drug Dosing',
      affectedCases: 3, 
      suggestedFocus: 'Review sepsis antibiotic protocol and dosing' 
    },
  ],
  badges: [
    { badgeId: 'first_blood', unlockedAt: new Date(), isNew: false },
    { badgeId: 'week_warrior', unlockedAt: new Date(), isNew: true },
    { badgeId: 'cardiologist', unlockedAt: new Date(), isNew: false },
    { badgeId: 'neuro_master', unlockedAt: new Date(), isNew: false },
  ],
  streak: {
    currentStreak: 7,
    longestStreak: 14,
    lastActiveDate: new Date(),
    completedToday: true,
    last7Days: [
      { date: '2026-03-22', completed: true },
      { date: '2026-03-23', completed: true },
      { date: '2026-03-24', completed: true },
      { date: '2026-03-25', completed: true },
      { date: '2026-03-26', completed: true },
      { date: '2026-03-27', completed: true },
      { date: '2026-03-28', completed: true },
    ]
  }
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'u1', name: 'Rashmi Perera', avatarInitials: 'RP', totalXp: 5820, level: 15, streak: 30, casesCompleted: 89, institution: 'University of Colombo', isCurrentUser: false },
  { rank: 2, userId: 'u2', name: 'Nimal Silva', avatarInitials: 'NS', totalXp: 4990, level: 13, streak: 14, casesCompleted: 76, institution: 'University of Colombo', isCurrentUser: false },
  { rank: 3, userId: 'u3', name: 'Priya Fernando', avatarInitials: 'PF', totalXp: 4310, level: 12, streak: 21, casesCompleted: 68, institution: 'University of Colombo', isCurrentUser: false },
  { rank: 4, userId: 'u4', name: 'Ashan Karunaratne', avatarInitials: 'AK', totalXp: 3240, level: 12, streak: 7, casesCompleted: 47, institution: 'University of Colombo', isCurrentUser: true },
  { rank: 5, userId: 'u5', name: 'Kasun Wijesinghe', avatarInitials: 'KW', totalXp: 2980, level: 10, streak: 5, casesCompleted: 41, institution: 'University of Colombo', isCurrentUser: false },
  { rank: 6, userId: 'u6', name: 'Shalini Mendis', avatarInitials: 'SM', totalXp: 2650, level: 9, streak: 3, casesCompleted: 36, institution: 'University of Colombo', isCurrentUser: false },
]

export async function getStudentProgress(): Promise<StudentProgressSummary> {
  // Simulate network delay content
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    ...MOCK_PROGRESS_DATA,
    level: computeLevel(MOCK_PROGRESS_DATA.totalXp),
    institutionRank: 4,
    overallAverageScore: 78,
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return MOCK_LEADERBOARD
}
