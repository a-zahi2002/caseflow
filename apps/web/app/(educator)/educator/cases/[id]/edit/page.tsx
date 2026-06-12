'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, ChevronLeft, Plus, Trash2, Save, Tags, User as UserIcon, ListChecks, Loader2 } from 'lucide-react'
import type { CaseFormInput } from '@caseflow/types'

const stepTypes = ['history', 'examination', 'investigation', 'diagnosis', 'management'] as const

const formSchema = z.object({
  title: z.string().min(5, 'Title is too short'),
  specialty: z.string().min(2, 'Specialty is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  patientPersona: z.object({
    age: z.coerce.number().min(0).max(120),
    sex: z.enum(['male', 'female', 'other']),
    presentingComplaint: z.string().min(10),
    background: z.string().min(10),
  }),
  tags: z.array(z.string()),
  steps: z.array(z.object({
    id: z.string().optional(),
    order: z.number(),
    type: z.enum(stepTypes),
    content: z.string().min(10),
    expectedFindings: z.object({
      keyPoints: z.array(z.string()).min(1),
      redFlags: z.array(z.string()),
    }),
  })).min(1),
})

export default function EditCasePage() {
  const router = useRouter()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<'details' | 'persona' | 'steps'>('details')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const { register, control, handleSubmit, formState: { errors }, setValue, watch, trigger, reset } = useForm<CaseFormInput>({
    resolver: zodResolver(formSchema) as any,
    mode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'steps',
  })

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    apiClient.get<any>(`/cases/${id}`, token).then((res) => {
      if (res.success) {
        reset({
          title: res.data.title,
          specialty: res.data.specialty,
          difficulty: res.data.difficulty?.toLowerCase(),
          patientPersona: {
            age: res.data.patientAge,
            sex: res.data.patientGender?.toLowerCase(),
            presentingComplaint: res.data.chiefComplaint,
            background: res.data.patientBackground,
          },
          tags: res.data.tags || [],
          steps: res.data.steps || [],
        })
      }
      setLoading(false)
    })
  }, [id, reset, router])

  const onSubmit = async (data: CaseFormInput) => {
    const token = getToken()
    if (!token) return
    setSubmitting(true)

    const payload = {
      ...data,
      difficulty: data.difficulty.toUpperCase(),
    }

    const res = await apiClient.patch<any>(`/cases/${id}`, payload, token)
    if (res.success) {
      router.push('/educator/cases')
    } else {
      setSubmitting(false)
      alert(res.error || 'Failed to update case')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading case data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Case</h1>
          <p className="text-gray-500 mt-1">Refine and update your clinical scenario.</p>
        </div>
        <button onClick={() => router.back()} className="text-sm font-medium text-gray-500 hover:text-gray-800">Cancel</button>
      </div>

      <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} label="Basic Details" icon={<Tags className="h-4 w-4" />} />
        <TabButton active={activeTab === 'persona'} onClick={() => setActiveTab('persona')} label="Patient Persona" icon={<UserIcon className="h-4 w-4" />} />
        <TabButton active={activeTab === 'steps'} onClick={() => setActiveTab('steps')} label="Simulation Steps" icon={<ListChecks className="h-4 w-4" />} />
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        {activeTab === 'details' && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Tags className="h-5 w-5" /></span>
              Case Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Case Title</label>
                <input {...register('title')} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Specialty</label>
                <input {...register('specialty')} className="w-full p-3 border border-gray-200 rounded-xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Difficulty</label>
                <select {...register('difficulty')} className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Tags (Comma separated)</label>
                  <input 
                    defaultValue={watch('tags')?.join(', ')}
                    onChange={(e) => setValue('tags', e.target.value.split(',').map(t => t.trim()))}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                  />
              </div>
            </div>
          </div>
        )}

        {/* Similar Persona and Steps Sections to New Case... */}
        {activeTab === 'persona' && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8 animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-lg"><UserIcon className="h-5 w-5" /></span>
              Patient Persona
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Age</label>
                <input type="number" {...register('patientPersona.age')} className="w-full p-3 border border-gray-200 rounded-xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Sex</label>
                <select {...register('patientPersona.sex')} className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Presenting Complaint</label>
              <textarea {...register('patientPersona.presentingComplaint')} className="w-full p-3 border border-gray-200 rounded-xl h-32 resize-none outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Medical Background</label>
              <textarea {...register('patientPersona.background')} className="w-full p-3 border border-gray-200 rounded-xl h-40 resize-none outline-none" />
            </div>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative group animate-in slide-in-from-right-4 duration-300">
                <button type="button" onClick={() => remove(index)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4 mb-8">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">{index + 1}</span>
                    <h3 className="text-lg font-bold">Case Step</h3>
                </div>
                <div className="grid gap-8 md:grid-cols-3 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Type</label>
                    <select {...register(`steps.${index}.type` as const)} className="w-full p-2 border border-gray-100 bg-gray-50 rounded-lg capitalize">
                      {stepTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Key Findings (Comma sep)</label>
                    <input 
                      defaultValue={watch(`steps.${index}.expectedFindings.keyPoints`)?.join(', ')}
                      placeholder="Finding 1, Finding 2..."
                      className="w-full p-2 border border-gray-100 bg-gray-50 rounded-lg outline-none"
                      onChange={(e) => setValue(`steps.${index}.expectedFindings.keyPoints`, e.target.value.split(',').map(v => v.trim()))}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700">Step Content</label>
                  <textarea {...register(`steps.${index}.content` as const)} className="w-full p-4 border border-gray-200 rounded-xl h-40 resize-none" />
                </div>
              </div>
            ))}
            <button
               type="button"
               onClick={() => append({ order: fields.length + 1, type: 'history' as any, content: '', expectedFindings: { keyPoints: [''], redFlags: [] } })}
               className="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3"
            >
               <Plus className="h-6 w-6" />
               <span className="font-semibold text-lg">Add Another Step</span>
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
           {activeTab !== 'details' ? (
                <button type="button" onClick={() => {
                    if (activeTab === 'steps') setActiveTab('persona')
                    else setActiveTab('details')
                }} className="px-6 py-2 flex items-center gap-2 text-sm font-bold text-gray-600">
                    <ChevronLeft className="h-4 w-4" /> Go Back
                </button>
           ) : <div />}

           {activeTab !== 'steps' ? (
               <button type="button" onClick={() => {
                  if (activeTab === 'details') setActiveTab('persona')
                  else if (activeTab === 'persona') setActiveTab('steps')
               }} className="px-8 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20">
                   Next Section <ChevronRight className="h-4 w-4" />
               </button>
           ) : (
               <button 
                 type="submit" 
                 disabled={submitting}
                 className="px-10 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 font-black shadow-xl shadow-blue-600/25 disabled:bg-gray-200"
               >
                 <Save className="h-5 w-5" /> {submitting ? 'Updating...' : 'Update Case'}
               </button>
           )}
        </div>
      </form>
    </div>
  )
}

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
    return (
        <button type="button" onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all relative ${
            active ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'
        }`}>
          {icon} {label}
          {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />}
        </button>
    )
}
