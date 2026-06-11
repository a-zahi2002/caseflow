'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateCaseSchema, SPECIALTIES, DIFFICULTY_CONFIG } from '@caseflow/types'
import type { CreateCaseInput } from '@caseflow/types'
import { api } from '@/lib/api-client'
import { motion } from 'framer-motion'
import { pageVariants, slideUp } from '@/lib/motion'
import { Save, ArrowLeft, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function NewCasePage() {
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState('')

  const form = useForm<CreateCaseInput>({
    resolver: zodResolver(CreateCaseSchema),
    defaultValues: {
      title: '',
      description: '',
      specialty: SPECIALTIES[0],
      difficulty: 'BEGINNER',
      patientName: '',
      patientAge: 45,
      patientGender: 'Male',
      chiefComplaint: '',
      patientBackground: '',
      personalityTraits: [],
      prerequisiteCaseIds: [],
    },
  })

  const onSubmit = async (data: CreateCaseInput) => {
    try {
      const res = await api.post<{ id: string }>('/api/cases', data)
      if (res.success) {
        router.push(`/educator/cases/${res.data.id}`)
      } else {
        setErrorMsg(res.error || 'Failed to create case')
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  return (
    <motion.div 
      className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Link href="/educator/cases" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Cases
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create New Case</h1>
        <p className="text-muted-foreground mt-1">Start by defining the basic patient details and clinical context.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-danger/10 text-danger rounded-lg border border-danger/20 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold border-b border-border pb-4">General Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Case Title</label>
              <input
                {...form.register('title')}
                placeholder="e.g. Acute Chest Pain in a 55yo Male"
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand focus:outline-none"
              />
              {form.formState.errors.title && <p className="text-xs text-danger mt-1">{form.formState.errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description / Short Vignette</label>
              <textarea
                {...form.register('description')}
                rows={3}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand focus:outline-none resize-y"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Specialty</label>
                <select
                  {...form.register('specialty')}
                  className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select
                  {...form.register('difficulty')}
                  className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand focus:outline-none"
                >
                  {Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={slideUp} className="bg-surface border border-border rounded-xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold border-b border-border pb-4">Patient Profile (AI Persona)</h2>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Patient Name</label>
              <input
                {...form.register('patientName')}
                placeholder="John Doe"
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                {...form.register('patientAge', { valueAsNumber: true })}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                {...form.register('patientGender')}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Chief Complaint</label>
            <input
              {...form.register('chiefComplaint')}
              placeholder="e.g. 'My chest feels really tight'"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Background / Medical History (System Prompt context)</label>
            <textarea
              {...form.register('patientBackground')}
              rows={4}
              placeholder="Include past medical history, medications, allergies, and social history that the AI should know."
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand focus:outline-none resize-y"
            />
          </div>
        </motion.div>

        <div className="flex justify-end gap-4">
          <Link 
            href="/educator/cases"
            className="px-6 py-2.5 border border-border rounded-lg font-medium hover:bg-surface-2 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand/90 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {form.formState.isSubmitting ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" />
                Save & Continue to Steps
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
