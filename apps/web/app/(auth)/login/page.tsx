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
import { Eye, EyeOff, ArrowRight, Stethoscope } from 'lucide-react'
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
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-muted-foreground">
          Sign in to continue your clinical journey
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@medical.edu"
            className={cn(
              'flex h-11 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm transition-colors',
              'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
              form.formState.errors.email && 'border-danger focus:ring-danger',
            )}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand hover:text-brand/80 transition-colors"
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
                'flex h-11 w-full rounded-lg border border-border bg-surface px-4 py-2 pr-11 text-sm transition-colors',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
                form.formState.errors.password && 'border-danger focus:ring-danger',
              )}
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-white font-semibold text-sm transition-all',
            'hover:bg-brand/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
            'shadow-lg shadow-brand/20',
          )}
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold text-brand hover:text-brand/80 transition-colors">
          Create account
        </Link>
      </p>
    </motion.div>
  )
}
