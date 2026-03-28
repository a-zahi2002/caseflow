'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { getToken } from '@/lib/auth'
import type { Case } from '@caseflow/types'

const SPECIALTIES = [
  'Cardiology', 'Respiratory', 'Gastroenterology', 'Neurology',
  'Endocrinology', 'Infectious Disease', 'Renal', 'Haematology',
  'Musculoskeletal', 'Psychiatry', 'Obstetrics', 'Paediatrics',
  'Emergency Medicine', 'Surgery',
]

const STEP_TYPES = [
  { value: 'history', label: 'History Taking' },
  { value: 'examination', label: 'Examination' },
  { value: 'investigation', label: 'Investigations' },
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'management', label: 'Management' },
] as const

interface StepDraft {
  type: typeof STEP_TYPES[number]['value']
  content: string
  keyPoints: string
  redFlags: string
}

export default function CreateCasePage() {
  const router = useRouter()

  // Case fields
  const [title, setTitle] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [timeLimit, setTimeLimit] = useState('')
  const [tags, setTags] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male')
  const [complaint, setComplaint] = useState('')
  const [background, setBackground] = useState('')

  // Steps
  const [steps, setSteps] = useState<StepDraft[]>([
    { type: 'history', content: '', keyPoints: '', redFlags: '' },
  ])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { type: 'examination', content: '', keyPoints: '', redFlags: '' },
    ])
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  function updateStep(index: number, field: keyof StepDraft, value: string) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const token = getToken()
    if (!token) { router.push('/login'); return }

    try {
      // Step 1 — create the case
      const caseRes = await apiClient.post<Case>('/cases', {
        title: title.trim(),
        specialty,
        difficulty,
        timeLimit: timeLimit ? Number(timeLimit) : undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        patientPersona: {
          age: Number(age),
          sex,
          presentingComplaint: complaint.trim(),
          background: background.trim(),
        },
      }, token)

      if (!caseRes.success) {
        setError(caseRes.error)
        setSaving(false)
        return
      }

      const caseId = caseRes.data.id

      // Step 2 — add each step sequentially
      for (const step of steps) {
        const stepRes = await apiClient.post(
          `/cases/${caseId}/steps`,
          {
            type: step.type,
            content: step.content.trim(),
            expectedFindings: {
              keyPoints: step.keyPoints
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
              redFlags: step.redFlags
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            },
          },
          token
        )

        if (!stepRes.success) {
          setError(`Failed to save step: ${stepRes.error}`)
          setSaving(false)
          return
        }
      }

      router.push('/educator/cases')
    } catch {
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/educator/cases')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Create Case</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Case details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Case Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Acute Pulmonary Embolism"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select specialty</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Limit (minutes)
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  min={5}
                  max={120}
                  placeholder="e.g. 30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                  <span className="text-gray-400 font-normal ml-1">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. chest pain, emergency"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patient persona */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Patient Persona
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  min={0}
                  max={120}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as typeof sex)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presenting Complaint
              </label>
              <input
                type="text"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                required
                placeholder="e.g. sudden onset breathlessness and pleuritic chest pain"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                required
                rows={3}
                placeholder="e.g. 45 year old woman, 3 weeks post hip replacement surgery, on LMWH prophylaxis"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Case Steps — {steps.length}
            </h2>
            <button
              type="button"
              onClick={addStep}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add step
            </button>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500">
                    Step {index + 1}
                  </span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                    <select
                      value={step.type}
                      onChange={(e) => updateStep(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {STEP_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Instruction
                    </label>
                    <input
                      type="text"
                      value={step.content}
                      onChange={(e) => updateStep(index, 'content', e.target.value)}
                      required
                      placeholder="e.g. Take a focused history from the patient"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Expected findings
                      <span className="text-gray-400 font-normal ml-1">(one per line)</span>
                    </label>
                    <textarea
                      value={step.keyPoints}
                      onChange={(e) => updateStep(index, 'keyPoints', e.target.value)}
                      required
                      rows={3}
                      placeholder="Onset and duration of pain&#10;Character and radiation&#10;Associated symptoms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Red flags
                      <span className="text-gray-400 font-normal ml-1">(one per line, optional)</span>
                    </label>
                    <textarea
                      value={step.redFlags}
                      onChange={(e) => updateStep(index, 'redFlags', e.target.value)}
                      rows={2}
                      placeholder="Haemoptysis&#10;Reduced consciousness"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/educator/cases')}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  )
}
