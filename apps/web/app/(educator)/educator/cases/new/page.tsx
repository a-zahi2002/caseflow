'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, ChevronLeft, Plus, Trash2, Save, Tags, User as UserIcon, ListChecks } from 'lucide-react'
import type { CaseFormInput } from '@caseflow/types'

const stepTypes = ['history', 'examination', 'investigation', 'diagnosis', 'management'] as const

const formSchema = z.object({
  title: z.string().min(5, 'Title is too short'),
  specialty: z.string().min(2, 'Specialty is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  patientPersona: z.object({
    age: z.coerce.number().min(0, 'Age must be positive').max(120),
    sex: z.enum(['male', 'female', 'other']),
    presentingComplaint: z.string().min(10, 'Complaint should be more detailed'),
    background: z.string().min(10, 'Medical history is required'),
  }),
  tags: z.array(z.string()),
  timeLimit: z.number().optional(),
  steps: z.array(z.object({
    order: z.number(),
    type: z.enum(stepTypes),
    content: z.string().min(10, 'Step content is required'),
    expectedFindings: z.object({
      keyPoints: z.array(z.string()).min(1, 'At least one key finding is required'),
      redFlags: z.array(z.string()),
    }),
  })).min(1, 'At least one step is required'),
})

export default function NewCasePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'details' | 'persona' | 'steps'>('details')
  const [submitting, setSubmitting] = useState(false)

  const { register, control, handleSubmit, formState: { errors }, trigger, setValue, watch } = useForm<CaseFormInput>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      difficulty: 'intermediate',
      patientPersona: { sex: 'male', age: 45 },
      steps: [{ order: 1, type: 'history', content: '', expectedFindings: { keyPoints: [''], redFlags: [] } }],
      tags: [],
    },
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'steps',
  })

  const onSubmit = async (data: CaseFormInput) => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }
    setSubmitting(true)

    // Ensure tags are an array (if comma separated input was used)
    const res = await apiClient.post<any>('/cases', data, token)
    if (res.success) {
      router.push('/educator/cases')
    } else {
      setSubmitting(false)
      alert(res.error || 'Failed to create case')
    }
  }

  const nextTab = async () => {
    let fieldsToValidate: any[] = []
    if (activeTab === 'details') fieldsToValidate = ['title', 'specialty', 'difficulty']
    if (activeTab === 'persona') fieldsToValidate = ['patientPersona']
    
    const valid = await trigger(fieldsToValidate)
    if (valid) {
      if (activeTab === 'details') setActiveTab('persona')
      else if (activeTab === 'persona') setActiveTab('steps')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Clinical Case</h1>
          <p className="text-gray-500 mt-1">Author a new simulation for medical students.</p>
        </div>
        <button 
          type="button"
          onClick={() => router.back()}
          className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Progress Navigation */}
      <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <TabButton 
          active={activeTab === 'details'} 
          onClick={() => setActiveTab('details')} 
          label="Basic Details" 
          icon={<Tags className="h-4 w-4" />}
          done={!!watch('title') && !!watch('specialty')}
        />
        <TabButton 
          active={activeTab === 'persona'} 
          onClick={() => setActiveTab('persona')} 
          label="Patient Persona" 
          icon={<UserIcon className="h-4 w-4" />}
          done={!!watch('patientPersona.presentingComplaint')}
        />
        <TabButton 
          active={activeTab === 'steps'} 
          onClick={() => setActiveTab('steps')} 
          label="Simulation Steps" 
          icon={<ListChecks className="h-4 w-4" />}
          done={fields.length > 0}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        {/* Step 1: Details */}
        {activeTab === 'details' && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Tags className="h-5 w-5" /></span>
              Case Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Case Title</label>
                <input 
                  {...register('title')} 
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.title ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                  placeholder="e.g., Acute Myocardial Infarction Simulation" 
                />
                {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Specialty</label>
                <input 
                  {...register('specialty')} 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g., Internal Medicine" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Difficulty Level</label>
                <select 
                  {...register('difficulty')} 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="beginner">Beginner — Medical Students</option>
                  <option value="intermediate">Intermediate — Residents</option>
                  <option value="advanced">Advanced — Specialists</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tags (Comma separated)</label>
                <input 
                  onChange={(e) => setValue('tags', e.target.value.split(',').map(t => t.trim()))}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="ER, Cardiac, Emergency" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Persona */}
        {activeTab === 'persona' && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-lg"><UserIcon className="h-5 w-5" /></span>
              Patient Persona
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Age</label>
                <input 
                  type="number" 
                  {...register('patientPersona.age')} 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Sex</label>
                <select 
                  {...register('patientPersona.sex')} 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Presenting Complaint</label>
              <textarea 
                {...register('patientPersona.presentingComplaint')} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none" 
                placeholder="What brought the patient to the clinic?" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Background Medical History</label>
              <textarea 
                {...register('patientPersona.background')} 
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-40 resize-none" 
                placeholder="PMHx, DHx, SHx, Allergies..." 
              />
            </div>
          </div>
        )}

        {/* Step 3: Simulation Steps */}
        {activeTab === 'steps' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative group animate-in slide-in-from-right-4 duration-300">
                <button 
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg">{index + 1}</span>
                    <h3 className="text-lg font-bold text-gray-900">Case Step</h3>
                </div>

                <div className="grid gap-8 md:grid-cols-3 mb-8">
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Step Type</label>
                    <select 
                      {...register(`steps.${index}.type` as const)} 
                      className="w-full p-2 border border-gray-100 bg-gray-50 rounded-lg font-medium outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                    >
                      {stepTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expected Findings (Comma separated)</label>
                    <input 
                      placeholder="Finding 1, Finding 2..."
                      className="w-full p-2 border border-gray-100 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setValue(`steps.${index}.expectedFindings.keyPoints`, e.target.value.split(',').map(v => v.trim()))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700">Step Content & Instructions</label>
                  <textarea 
                    {...register(`steps.${index}.content` as const)} 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-40 resize-none bg-white" 
                    placeholder="Describe what occurs in this step. What should the student see or do?"
                  />
                  {errors.steps?.[index]?.content && <p className="text-xs text-red-500">{errors.steps[index]?.content?.message}</p>}
                </div>
              </div>
            ))}
            
            <button
               type="button"
               onClick={() => append({ order: fields.length + 1, type: 'history' as any, content: '', expectedFindings: { keyPoints: [''], redFlags: [] } })}
               className="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3 group"
            >
               <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
               <span className="font-semibold text-lg">Add Next Step to Case</span>
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
           {activeTab !== 'details' ? (
                <button 
                  type="button" 
                  onClick={() => {
                      if (activeTab === 'steps') setActiveTab('persona')
                      else setActiveTab('details')
                  }} 
                  className="px-6 py-2 flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Go Back
                </button>
           ) : <div />}

           {activeTab !== 'steps' ? (
               <button 
                  type="button" 
                  onClick={nextTab}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                >
                   Save & Continue <ChevronRight className="h-4 w-4" />
               </button>
           ) : (
               <button 
                 type="submit" 
                 disabled={submitting}
                 className="px-10 py-3 bg-green-600 text-white rounded-xl flex items-center gap-2 font-black shadow-xl shadow-green-600/25 hover:bg-green-700 disabled:bg-gray-200 disabled:shadow-none transition-all active:scale-95"
               >
                 <Save className="h-5 w-5" /> {submitting ? 'Finalizing Case...' : 'Publish Case Draft'}
               </button>
           )}
        </div>
      </form>
    </div>
  )
}

function TabButton({ active, onClick, label, icon, done }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode, done: boolean }) {
    return (
        <button
          type="button"
          onClick={onClick}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all relative ${
            active ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {icon}
          {label}
          {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />}
          {done && !active && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full" />}
        </button>
    )
}

