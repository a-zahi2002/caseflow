import type { User } from '@caseflow/types'

const TOKEN_KEY = 'caseflow_token'
const USER_KEY = 'caseflow_user'

export function saveAuth(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getDashboardPath(role: User['role']): string {
  switch (role) {
    case 'educator': return '/educator/dashboard'
    case 'admin': return '/admin/dashboard'
    default: return '/dashboard'
  }
}
