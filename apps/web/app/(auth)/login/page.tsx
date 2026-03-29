'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { saveAuth, getDashboardPath, getUser } from '@/lib/auth'
import type { AuthResponse } from '@caseflow/types'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (user) {
      router.push(getDashboardPath(user.role))
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      })

      if (!res.success) {
        setError(res.error)
        return
      }

      saveAuth(res.data.token, res.data.user)
      router.push(getDashboardPath(res.data.user.role))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
        <p className="text-gray-500 mt-2">Enter your credentials to access your clinical dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 ml-1">
            <Mail className="w-4 h-4 text-gray-400" />
            Email Address
          </label>
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand group-hover:border-gray-300"
              placeholder="name@institution.edu"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-gray-400" />
              Password
            </label>
            <Link 
              href="/forgot-password" 
              className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand group-hover:border-gray-300"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center ml-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand transition-all"
            />
            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Keep me signed in</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-xl px-4 py-3 animate-shake">
            <p className="text-sm text-red-600 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-brand text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-hover hover:shadow-xl hover:shadow-brand/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in to Dashboard
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--surface-page)] px-4 text-gray-400 font-medium">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
            <Shield className="w-5 h-5 text-brand" />
            Connect via Institution SSO
          </button>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-gray-500 font-medium">
        Don't have an account yet?{' '}
        <Link href="/register" className="text-brand hover:text-brand-hover font-bold decoration-2 underline-offset-4 hover:underline transition-all">
          Create account
        </Link>
      </p>
    </div>
  )
}

