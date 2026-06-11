'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { RegisterStep1Schema, RegisterStep2Schema, RegisterStep3Schema, SPECIALTIES } from '@caseflow/types'
import type { RegisterStep1, RegisterStep2, RegisterStep3, User } from '@caseflow/types'
import { signUp } from '@/lib/auth-client'
import { saveAuth, getDashboardPath } from '@/lib/auth'
import { api } from '@/lib/api-client'
import { ArrowRight, ArrowLeft, Check, Eye, EyeOff, GraduationCap, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Step data accumulation
  const [step1Data, setStep1Data] = useState<RegisterStep1 | null>(null)
  const [step2Data, setStep2Data] = useState<RegisterStep2 | null>(null)

  const step1Form = useForm<RegisterStep1>({
    resolver: zodResolver(RegisterStep1Schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const step2Form = useForm<RegisterStep2>({
    resolver: zodResolver(RegisterStep2Schema),
    defaultValues: { role: 'STUDENT', inviteCode: '' },
  })

  const step3Form = useForm<RegisterStep3>({
    resolver: zodResolver(RegisterStep3Schema),
    defaultValues: { specialties: [] },
  })

  const selectedRole = step2Form.watch('role')
  const selectedSpecialties = step3Form.watch('specialties')

  async function handleStep1(data: RegisterStep1) {
    setStep1Data(data)
    setStep(2)
  }

  async function handleStep2(data: RegisterStep2) {
    setStep2Data(data)
    if (data.role === 'EDUCATOR') {
      await completeRegistration(step1Data!, data, { specialties: [] })
    } else {
      setStep(3)
    }
  }

  async function handleStep3(data: RegisterStep3) {
    await completeRegistration(step1Data!, step2Data!, data)
  }

  async function completeRegistration(s1: RegisterStep1, s2: RegisterStep2, s3: RegisterStep3) {
    setLoading(true)
    setError(null)
    try {
      const result = await signUp.email({
        name: s1.name,
        email: s1.email,
        password: s1.password,
      })

      if (result.error) {
        setError(result.error.message ?? 'Registration failed')
        return
      }

      // Create UserProfile with role + specialties
      const patchRes = await api.patch('/api/users/me', {
        institution: undefined,
        specialties: s3.specialties,
        role: s2.role,
        inviteCode: s2.inviteCode || undefined,
      })

      if (!patchRes.success) {
        setError(patchRes.error ?? 'Failed to update user profile')
        return
      }

      // Fetch completed user profile
      const profileRes = await api.get<User>('/users/me')
      if (!profileRes.success || !profileRes.data) {
        setError('Failed to load user profile after registration')
        return
      }

      // Save auth details to local storage
      const token = result.data.token ?? ''
      saveAuth(token, profileRes.data)

      // Redirect to the appropriate dashboard
      router.push(getDashboardPath(profileRes.data.role))
    } catch (err: any) {
      setError(err.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  function toggleSpecialty(s: string) {
    const current = step3Form.getValues('specialties')
    if (current.includes(s)) {
      step3Form.setValue('specialties', current.filter(x => x !== s))
    } else if (current.length < 3) {
      step3Form.setValue('specialties', [...current, s])
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
          Create account
        </h1>
        <p className="mt-2 text-muted-foreground">
          Join the next generation of clinical learners
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
              step >= s ? 'bg-brand text-white shadow-md shadow-brand/30' : 'bg-surface-2 text-muted-foreground',
              step > s && 'bg-success text-white',
            )}>
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={cn('w-8 h-0.5 rounded-full', step > s ? 'bg-success' : 'bg-border')} />}
          </div>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-lg bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger mb-5"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Credentials */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={step1Form.handleSubmit(handleStep1)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full name</label>
              <input
                id="name"
                placeholder="Dr. Jane Smith"
                className="flex h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                {...step1Form.register('name')}
              />
              {step1Form.formState.errors.name && <p className="text-xs text-danger">{step1Form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-sm font-medium">Email</label>
              <input
                id="reg-email"
                type="email"
                placeholder="jane@medical.edu"
                className="flex h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                {...step1Form.register('email')}
              />
              {step1Form.formState.errors.email && <p className="text-xs text-danger">{step1Form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="flex h-11 w-full rounded-lg border border-border bg-surface px-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  {...step1Form.register('password')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {step1Form.formState.errors.password && <p className="text-xs text-danger">{step1Form.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="flex h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                {...step1Form.register('confirmPassword')}
              />
              {step1Form.formState.errors.confirmPassword && <p className="text-xs text-danger">{step1Form.formState.errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand/90 active:scale-[0.98] shadow-lg shadow-brand/20 transition-all">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </motion.form>
        )}

        {/* Step 2: Role */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={step2Form.handleSubmit(handleStep2)}
            className="space-y-5"
          >
            <p className="text-sm text-muted-foreground mb-4">How will you use Caseflow?</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'STUDENT' as const, label: 'Student', desc: 'Practice clinical cases', icon: GraduationCap },
                { value: 'EDUCATOR' as const, label: 'Educator', desc: 'Author & manage cases', icon: Stethoscope },
              ].map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => step2Form.setValue('role', value)}
                  className={cn(
                    'flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all',
                    selectedRole === value
                      ? 'border-brand bg-brand/5 shadow-md shadow-brand/10'
                      : 'border-border hover:border-brand/30',
                  )}
                >
                  <Icon className={cn('h-8 w-8', selectedRole === value ? 'text-brand' : 'text-muted-foreground')} />
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedRole === 'EDUCATOR' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <label htmlFor="invite-code" className="text-sm font-medium">Educator invite code</label>
                <input
                  id="invite-code"
                  placeholder="Enter invite code"
                  className="flex h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  {...step2Form.register('inviteCode')}
                />
              </motion.div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-2 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="submit" disabled={loading} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand/90 active:scale-[0.98] shadow-lg shadow-brand/20 transition-all disabled:opacity-60">
                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </motion.form>
        )}

        {/* Step 3: Specialties (Student only) */}
        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={step3Form.handleSubmit(handleStep3)}
            className="space-y-5"
          >
            <p className="text-sm text-muted-foreground mb-1">Select up to 3 specialty interests <span className="text-xs">(optional)</span></p>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all text-left',
                    selectedSpecialties.includes(s)
                      ? 'border-brand bg-brand/5 text-brand font-medium'
                      : 'border-border hover:border-brand/30 text-foreground',
                  )}
                >
                  <div className={cn(
                    'h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all',
                    selectedSpecialties.includes(s) ? 'border-brand bg-brand' : 'border-border',
                  )}>
                    {selectedSpecialties.includes(s) && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-2 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="submit" disabled={loading} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-brand text-white font-semibold text-sm hover:bg-brand/90 active:scale-[0.98] shadow-lg shadow-brand/20 transition-all disabled:opacity-60">
                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand hover:text-brand/80 transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
