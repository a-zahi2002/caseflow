'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { LoginSchema, type LoginInput, type User } from '@caseflow/types'
import { signIn } from '@/lib/auth-client'
import { saveAuth, getDashboardPath } from '@/lib/auth'
import { api } from '@/lib/api-client'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    setError(null)
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        setError(result.error.message ?? 'Invalid credentials')
        return
      }

      // Fetch user profile to get full details (role, streak, xp, etc.)
      const profileRes = await api.get<User>('/users/me')
      if (!profileRes.success || !profileRes.data) {
        setError('Failed to load user profile')
        return
      }

      // Save auth details to local storage
      const token = result.data.token
      saveAuth(token, profileRes.data)

      // Redirect to the appropriate dashboard
      router.push(getDashboardPath(profileRes.data.role))
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-surface-container-lowest glass p-8 md:p-10 rounded-[2rem] shadow-2xl border border-outline-variant/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="mb-10 relative z-10 text-center">
        <div className="w-16 h-16 bg-primary-container/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-on-surface mb-2">
          Welcome Back
        </h1>
        <p className="text-on-surface-variant font-medium">
          Sign in to continue your clinical journey
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl bg-error-container/50 border border-error/20 px-4 py-3 text-sm font-medium text-error flex items-center gap-3 shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </motion.div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-bold text-on-surface uppercase tracking-widest text-[10px]">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="doctor@medical.edu"
            className={cn(
              'flex h-12 w-full rounded-xl border border-outline-variant/50 bg-surface/50 px-4 py-2 text-sm transition-all duration-300 shadow-sm',
              'placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-surface-container-lowest',
              form.formState.errors.email && 'border-error focus:ring-error',
            )}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-error font-medium mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-bold text-on-surface uppercase tracking-widest text-[10px]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-primary hover:text-primary-container transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={cn(
                'flex h-12 w-full rounded-xl border border-outline-variant/50 bg-surface/50 px-4 py-2 pr-12 text-sm transition-all duration-300 shadow-sm',
                'placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-surface-container-lowest',
                form.formState.errors.password && 'border-error focus:ring-error',
              )}
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-error font-medium mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'flex h-12 w-full mt-2 items-center justify-center gap-3 rounded-xl bg-primary text-on-primary font-heading font-black text-sm uppercase tracking-widest transition-all duration-300',
            'hover:bg-primary-container hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100',
            'border border-primary-container/20'
          )}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-on-primary/30 border-t-on-primary" />
          ) : (
            <>
              Access Portal
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center relative z-10">
        <p className="text-sm font-medium text-on-surface-variant">
          New to Caseflow?{' '}
          <Link href="/register" className="font-bold text-primary hover:text-primary-container transition-colors ml-1">
            Create an account
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
