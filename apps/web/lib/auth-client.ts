import { createAuthClient } from 'better-auth/react'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001'

const authClient = createAuthClient({
  baseURL: API_URL,
  basePath: '/api/auth',
  credentials: 'include',
})

const { signIn, signUp, signOut, useSession: useSessionRaw } = authClient
export { signIn, signUp, signOut }
export const useSession = useSessionRaw as any
