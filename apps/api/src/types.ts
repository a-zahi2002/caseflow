export interface AppEnv {
  Variables: {
    user: {
      id: string
      name: string
      email: string
    }
    userProfile: {
      id: string
      role: string
      institution: string | null
      xp: number
      level: number
      currentStreak: number
      banned: boolean
    } | null
  }
}
