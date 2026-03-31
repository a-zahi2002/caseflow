'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { saveAuth, getDashboardPath, getUser } from '@/lib/auth'
import type { AuthResponse } from '@caseflow/types'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield, Activity, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

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
      setError('Internal server error during authentication. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-lg border border-primary/10 mb-6 group cursor-default">
           <Activity size={12} className="text-primary animate-pulse" />
           <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest leading-none">Security Portal</span>
        </div>
        <h1 className="text-4xl font-heading font-black text-on-surface tracking-tighter leading-tight mb-2 italic">
          Clinical Access
        </h1>
        <p className="text-on-surface-variant font-sans font-medium text-lg opacity-70 leading-relaxed">
          Unlock your medical training dashboard and resume your case progress.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-black text-outline uppercase tracking-widest px-1 ml-1 flex items-center gap-1.5 opacity-60">
            <Mail className="w-3 h-3" />
            Registry Email
          </label>
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary group-hover:border-outline-variant outline-none"
              placeholder="name@university.edu"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-focus-within:ring-primary/20 pointer-events-none transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 ml-1 mb-1">
            <label className="text-[10px] font-mono font-black text-outline uppercase tracking-widest flex items-center gap-1.5 opacity-60">
              <Lock className="w-3 h-3" />
              Access Key
            </label>
            <Link 
              href="/forgot-password" 
              className="text-[10px] font-mono font-black text-primary hover:text-secondary-fixed transition-colors uppercase tracking-widest"
            >
              Recover Pin?
            </Link>
          </div>
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary group-hover:border-outline-variant outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-outline hover:text-primary transition-colors focus:ring-2 focus:ring-primary/30 rounded-lg outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-focus-within:ring-primary/20 pointer-events-none transition-all" />
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative flex items-center h-5">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer h-5 w-5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-primary focus:ring-primary focus:ring-offset-0 transition-all checked:bg-primary"
              />
              <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white scale-0 peer-checked:scale-75 transition-transform pointer-events-none text-[20px]">check</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">Remember identity</span>
          </label>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100/50 rounded-2xl px-5 py-4 animate-shake shadow-sm shadow-rose-200/20">
            <p className="text-xs text-rose-600 font-bold flex items-center gap-3">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 px-6 bg-primary text-on-primary text-sm font-heading font-black rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-4 group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="tracking-widest uppercase text-xs">Verifying...</span>
            </>
          ) : (
            <>
              <span className="tracking-widest uppercase text-xs">Enter Dashboard</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-12 pt-12 border-t border-outline-variant/20">
        <div className="flex flex-col gap-4">
          <button className="w-full flex items-center justify-center gap-4 px-6 py-4 border border-outline-variant/30 rounded-2xl text-xs font-heading font-black uppercase tracking-widest text-on-surface-variant bg-surface-container-lowest hover:bg-surface-variant/20 hover:border-outline-variant transition-all duration-300 shadow-sm relative overflow-hidden group">
            <Shield className="w-5 h-5 text-primary" />
            <span>Institutional SSO</span>
            <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
          
          <button className="w-full flex items-center justify-center gap-4 px-6 py-4 border border-outline-variant/30 rounded-2xl text-xs font-heading font-black uppercase tracking-widest text-on-surface-variant bg-surface-container-lowest hover:bg-surface-variant/20 hover:border-outline-variant transition-all duration-300 shadow-sm relative overflow-hidden group">
            <UserIcon className="w-5 h-5 text-secondary" />
            <span>Clinician ID Connect</span>
            <div className="absolute inset-0 bg-secondary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-sm text-on-surface-variant font-medium opacity-60">
          First clinical encounter?{' '}
          <Link href="/register" className="text-primary hover:text-secondary font-black decoration-2 underline-offset-4 hover:underline transition-all">
            Join the Registry
          </Link>
        </p>
      </footer>
    </div>
  )
}


