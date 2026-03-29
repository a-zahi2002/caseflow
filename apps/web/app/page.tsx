'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getDashboardPath } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    try {
      const user = getUser()
      if (user) {
        router.push(getDashboardPath(user.role))
      } else {
        router.push('/login')
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent" />
        <p className="text-sm font-medium text-gray-500">Loading Caseflow...</p>
      </div>
    </div>
  )
}
