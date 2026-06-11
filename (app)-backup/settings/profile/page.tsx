'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateProfileSchema } from '@caseflow/types'
import type { UpdateProfileInput, UserProfile } from '@caseflow/types'
import { api } from '@/lib/api-client'
import { useSession } from '@/lib/auth-client'
import { pageVariants, slideUp } from '@/lib/motion'
import { Save, User, Building, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function ProfileSettingsPage() {
  const { data: session } = useSession()
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<UserProfile>('/api/users/me')
      return res.data
    },
  })

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    values: {
      institution: profile?.institution || '',
      specialties: profile?.specialties || [],
    },
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await api.patch('/api/users/me', data)
      if (res.success) {
        setSuccessMsg('Profile updated successfully.')
      } else {
        setErrorMsg(res.error || 'Failed to update profile')
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  return (
    <motion.div 
      className="p-6 sm:p-8 max-w-3xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{session?.user?.name}</h2>
            <p className="text-muted-foreground">{session?.user?.email}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand/10 text-brand">
              {profile?.role || 'STUDENT'}
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          {successMsg && (
            <div className="p-4 bg-success/10 text-success rounded-lg border border-success/20 text-sm font-medium">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-4 bg-danger/10 text-danger rounded-lg border border-danger/20 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" /> Academic Details
            </h3>
            
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-foreground mb-1">
                Institution / Hospital
              </label>
              <input
                id="institution"
                {...form.register('institution')}
                placeholder="e.g. Johns Hopkins University"
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-surface transition-all"
              />
              {form.formState.errors.institution && (
                <p className="text-xs text-danger mt-1">{form.formState.errors.institution.message}</p>
              )}
            </div>
          </div>

          <hr className="border-border" />

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> Clinical Interests
            </h3>
            <p className="text-sm text-muted-foreground">Select up to 3 specialties to customize your recommendations.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['Cardiology', 'Neurology', 'Internal Medicine', 'Emergency Medicine', 'Pediatrics', 'Surgery'].map(s => {
                const isSelected = form.watch('specialties')?.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      const current = form.getValues('specialties') || []
                      if (current.includes(s)) {
                        form.setValue('specialties', current.filter(c => c !== s), { shouldDirty: true })
                      } else if (current.length < 3) {
                        form.setValue('specialties', [...current, s], { shouldDirty: true })
                      }
                    }}
                    className={cn(
                      "px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all",
                      isSelected 
                        ? "bg-brand/10 border-brand/50 text-brand" 
                        : "bg-surface border-border hover:bg-surface-2 text-foreground"
                    )}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand/90 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
