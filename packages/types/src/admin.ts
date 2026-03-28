export type UserStatus = 'active' | 'suspended'

export interface UserManagementData {
  id: string
  name: string
  email: string
  role: 'student' | 'educator' | 'admin'
  institution: string | null
  status: UserStatus
  createdAt: string
}

export interface ModerationQueueItem {
  id: string
  title: string
  specialty: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  authorName: string
  submittedAt: string
}

export interface PlatformSettingsData {
  institutionName: string
  allowedSpecialties: string[]
  discussionsEnabled: boolean
  communitySubmissionsEnabled: boolean
}

export interface UpdateUserRoleInput {
  role: 'student' | 'educator' | 'admin'
}
