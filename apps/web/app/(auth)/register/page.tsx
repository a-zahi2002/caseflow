'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { RegisterStep1Schema, RegisterStep2Schema, RegisterStep3Schema, SPECIALTIES } from '@caseflow/types'
import type { RegisterStep1, RegisterStep2, RegisterStep3, User } from '@caseflow/types'
import { signIn, signUp } from '@/lib/auth-client'
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

      // Automatically sign in the user in the background to fetch token
      const signInResult = await signIn.email({
        email: s1.email,
        password: s1.password,
      })

      if (signInResult.error) {
        setError(signInResult.error.message ?? 'Sign in after registration failed')
        return
      }

      const token = signInResult.data.token

      // Create UserProfile with role + specialties
      const patchRes = await api.patch('/users/me', {
        institution: undefined,
        specialties: s3.specialties,
        role: s2.role,
        inviteCode: s2.inviteCode || undefined,
      }, token)

      if (!patchRes.success) {
        setError(patchRes.error ?? 'Failed to update user profile')
        return
      }

      // Fetch completed user profile
      const profileRes = await api.get<User>('/users/me', token)
      if (!profileRes.success || !profileRes.data) {
        setError('Failed to load user profile after registration')
        return
      }

      // Save auth details to local storage
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
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-surface-container-lowest glass p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-outline-variant/20 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -ml-20 -mt-20 pointer-events-none z-0"></div>
      
      <div className="mb-8 relative z-10 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight text-on-surface mb-2">
          Create Account
        </h1>
        <p className="text-on-surface-variant font-medium">
          Join the next generation of clinical learners
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-10 relative z-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-heading font-black transition-all duration-300',
              step === s ? 'bg-primary text-on-primary shadow-lg shadow-primary/30 scale-110' : 
              step > s ? 'bg-tertiary text-on-tertiary shadow-md' : 'bg-surface-container text-on-surface-variant',
              'border border-outline-variant/10'
            )}>
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 3 && <div className={cn(
              'w-8 h-1 rounded-full transition-colors duration-500', 
              step > s ? 'bg-tertiary' : 'bg-surface-container'
            )} />}
          </div>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl bg-error-container/50 border border-error/20 px-4 py-3 text-sm font-medium text-error flex items-center gap-3 shadow-sm mb-6 relative z-10"
        >
          <span className="material-symbols-outlined text-lg">error</span>
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
            transition={{ duration: 0.3 }}
            onSubmit={step1Form.handleSubmit(handleStep1)}
            className="space-y-5 relative z-10"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Full Name</label>
              <input
                id="name"
                placeholder="Dr. Jane Smith"
                className={cn(
                  "flex h-12 w-full rounded-xl border border-outline-variant/50 bg-surface/50 px-4 text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest",
                  step1Form.formState.errors.name && "border-error focus:ring-error"
                )}
                {...step1Form.register('name')}
              />
              {step1Form.formState.errors.name && <p className="text-xs text-error font-medium mt-1">{step1Form.formState.errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Email Address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="jane@medical.edu"
                className={cn(
                  "flex h-12 w-full rounded-xl border border-outline-variant/50 bg-surface/50 px-4 text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest",
                  step1Form.formState.errors.email && "border-error focus:ring-error"
                )}
                {...step1Form.register('email')}
              />
              {step1Form.formState.errors.email && <p className="text-xs text-error font-medium mt-1">{step1Form.formState.errors.email.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="reg-password" className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars"
                    className={cn(
                      "flex h-12 w-full rounded-xl border border-outline-variant/50 bg-surface/50 px-4 pr-11 text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest",
                      step1Form.formState.errors.password && "border-error focus:ring-error"
                    )}
                    {...step1Form.register('password')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {step1Form.formState.errors.password && <p className="text-xs text-error font-medium mt-1">{step1Form.formState.errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "flex h-12 w-full rounded-xl border border-outline-variant/50 bg-surface/50 px-4 text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest",
                    step1Form.formState.errors.confirmPassword && "border-error focus:ring-error"
                  )}
                  {...step1Form.register('confirmPassword')}
                />
                {step1Form.formState.errors.confirmPassword && <p className="text-xs text-error font-medium mt-1">{step1Form.formState.errors.confirmPassword.message}</p>}
              </div>
            </div>
            
            <button type="submit" className="flex h-12 w-full mt-4 items-center justify-center gap-3 rounded-xl bg-primary text-on-primary font-heading font-black text-sm uppercase tracking-widest hover:bg-primary-container hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all duration-300">
              Continue Setup <ArrowRight className="h-4 w-4" />
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
            transition={{ duration: 0.3 }}
            onSubmit={step2Form.handleSubmit(handleStep2)}
            className="space-y-6 relative z-10"
          >
            <p className="text-sm font-medium text-on-surface-variant text-center mb-6">How will you use Caseflow?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { value: 'STUDENT' as const, label: 'Student Resident', desc: 'Practice and learn from clinical cases', icon: 'school' },
                { value: 'EDUCATOR' as const, label: 'Clinical Educator', desc: 'Author and manage student cohorts', icon: 'stethoscope' },
              ].map(({ value, label, desc, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => step2Form.setValue('role', value)}
                  className={cn(
                    'flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all duration-300 relative overflow-hidden group',
                    selectedRole === value
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-outline-variant/30 hover:border-primary/50 bg-surface/50 hover:bg-surface-container-lowest',
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300",
                    selectedRole === value ? 'bg-primary text-on-primary shadow-inner' : 'bg-surface-container text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary'
                  )}>
                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                  <div>
                    <p className={cn("font-heading font-black text-base", selectedRole === value ? "text-primary" : "text-on-surface")}>{label}</p>
                    <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedRole === 'EDUCATOR' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 mt-4">
                <label htmlFor="invite-code" className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Educator Invitation Code</label>
                <input
                  id="invite-code"
                  placeholder="Enter secure invite code"
                  className="flex h-12 w-full rounded-xl border border-outline-variant/50 bg-surface/50 px-4 text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest"
                  {...step2Form.register('inviteCode')}
                />
              </motion.div>
            )}

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setStep(1)} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant/50 text-on-surface font-heading font-black text-sm uppercase tracking-widest hover:bg-surface-container transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="submit" disabled={loading} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-on-primary font-heading font-black text-sm uppercase tracking-widest hover:bg-primary-container hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70">
                {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
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
            transition={{ duration: 0.3 }}
            onSubmit={step3Form.handleSubmit(handleStep3)}
            className="space-y-6 relative z-10"
          >
            <div className="text-center mb-6">
              <p className="font-heading font-black text-on-surface text-lg">Select Clinical Interests</p>
              <p className="text-sm font-medium text-on-surface-variant mt-1">Choose up to 3 specialties to personalize your training.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all text-left group',
                    selectedSpecialties.includes(s)
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-outline-variant/30 bg-surface/50 hover:border-primary/40 hover:bg-surface-container-lowest text-on-surface',
                  )}
                >
                  <div className={cn(
                    'h-5 w-5 rounded-md flex items-center justify-center transition-all flex-shrink-0',
                    selectedSpecialties.includes(s) ? 'bg-primary text-on-primary' : 'border-2 border-outline-variant/40 group-hover:border-primary/50',
                  )}>
                    {selectedSpecialties.includes(s) && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                  </div>
                  <span className={cn("font-medium truncate", selectedSpecialties.includes(s) && "font-bold")}>{s}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
              <button type="button" onClick={() => setStep(2)} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant/50 text-on-surface font-heading font-black text-sm uppercase tracking-widest hover:bg-surface-container transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="submit" disabled={loading} className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-primary text-on-primary font-heading font-black text-sm uppercase tracking-widest hover:bg-primary-container hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-70 shadow-md">
                {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <>Complete Setup <span className="material-symbols-outlined text-sm">rocket_launch</span></>}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center relative z-10">
        <p className="text-sm font-medium text-on-surface-variant">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary hover:text-primary-container transition-colors ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
