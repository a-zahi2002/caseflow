'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { saveAuth, getDashboardPath, getUser } from '@/lib/auth'
import type { AuthResponse } from '@caseflow/types'
import { User, Mail, Lock, GraduationCap, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [institution, setInstitution] = useState('')
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
      const res = await apiClient.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
        ...(institution && { institution }),
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
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h1>
        <p className="text-gray-500 mt-2">Join the next generation of medical education.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 ml-1">
            <User className="w-4 h-4 text-gray-400" />
            Full Name
          </label>
          <div className="relative group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand group-hover:border-gray-300"
              placeholder="Dr. Jane Smith"
            />
          </div>
        </div>

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
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 ml-1">
            <Lock className="w-4 h-4 text-gray-400" />
            Password
          </label>
          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand group-hover:border-gray-300"
              placeholder="••••••••"
            />
          </div>
          <p className="text-[10px] text-gray-400 ml-1">Must be at least 8 characters with a mix of symbols.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 ml-1">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            Institution 
            <span className="text-gray-400 font-normal text-xs ml-auto">Optional</span>
          </label>
          <div className="relative group">
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand group-hover:border-gray-300"
              placeholder="e.g. Johns Hopkins Medical School"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {error}
            </p>
          </div>
        )}

        <div className="space-y-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-brand text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-hover hover:shadow-xl hover:shadow-brand/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Professional Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          
          <div className="flex items-start gap-2 px-1">
            <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              By creating an account, you agree to our <span className="text-brand font-medium">Terms of Service</span> and <span className="text-brand font-medium">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </form>

      <p className="mt-10 text-center text-sm text-gray-500 font-medium">
        Already have an account?{' '}
        <Link href="/login" className="text-brand hover:text-brand-hover font-bold decoration-2 underline-offset-4 hover:underline transition-all">
          Sign in here
        </Link>
      </p>
    </div>
  )
}

