'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { config } from '@/lib/config'
import { getToken } from '@/lib/auth'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, TrendingUp, Target } from 'lucide-react'

export default function CaseUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.type === 'application/pdf' || 
          selected.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          selected.name.endsWith('.docx')) {
        setFile(selected)
        setError(null)
      } else {
        setError('Please upload a PDF or DOCX file.')
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    setUploading(true)
    setError(null)
    setStatus('Uploading and Extracting Text...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${config.apiUrl}/uploads`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        setStatus('Success! AI extracted the case properly. Redirecting to edit...')
        setTimeout(() => {
          router.push(`/educator/cases/${data.data.id}/edit`)
        }, 1500)
      } else {
        setError(data.error || 'Failed to process document.')
        setUploading(false)
        setStatus('')
      }
    } catch (err) {
      setError('A network error occurred. Please try again.')
      setUploading(false)
      setStatus('')
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="mb-6 inline-flex p-4 rounded-full bg-blue-50">
          <Upload className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Upload Case Document</h1>
        <p className="text-gray-500 mb-8">
          Upload a medical scenario (PDF or DOCX) and our AI will extract a structured simulation case for you.
        </p>

        <div 
          className={`border-2 border-dashed rounded-xl p-12 transition-colors cursor-pointer ${
            file ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200 hover:border-blue-300'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const dropped = e.dataTransfer.files[0]
            if (dropped) setFile(dropped)
          }}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={handleFileChange}
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          {file ? (
            <div className="flex flex-col items-center">
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <span className="font-medium text-gray-900">{file.name}</span>
              <span className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <p className="mb-2">Click to browse or drag and drop</p>
              <p className="text-xs">PDF or DOCX (max 10MB)</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {status && uploading && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-blue-600">{status}</p>
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); handleUpload() }}
          disabled={!file || uploading}
          className="mt-8 w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
        >
          {uploading ? 'Processing with AI...' : 'Create Case from Document'}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center md:items-start md:flex-row gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold">Fast Extraction</h3>
            <p className="text-xs text-gray-500 mt-0.5">Automated parsing of unstructured medical notes.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center md:items-start md:flex-row gap-3">
          <TrendingUp className="h-5 w-5 text-purple-600 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold">Structured Steps</h3>
            <p className="text-xs text-gray-500 mt-0.5">Cases are split into History, Exam, and MDM steps.</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center md:items-start md:flex-row gap-3">
          <Target className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold">Review & Edit</h3>
            <p className="text-xs text-gray-500 mt-0.5">Always review AI output before publishing.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

