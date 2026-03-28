import { Metadata } from 'next'
import { SimulationChat } from '@/components/simulation/SimulationChat'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'AI Patient Simulation — CBL Platform',
}

const MOCK_CASE = {
  id: 'case-001',
  title: 'Acute Chest Pain — Possible MI',
  specialty: 'Cardiology',
  difficulty: 'intermediate',
  xpReward: 320,
  patientPersona: {
    name: 'Mr. Kamal Perera',
    age: 45,
    sex: 'Male',
    presentingComplaint: 'Chest Pain',
    emoji: '🧑‍🦳',
    initialVitals: [
      { label: 'HR', value: '112', unit: 'bpm', status: 'warning' },
      { label: 'BP', value: '95/60', unit: 'mmHg', status: 'warning' },
      { label: 'SpO₂', value: '98', unit: '%', status: 'normal' },
      { label: 'RR', value: '18', unit: '/min', status: 'normal' },
      { label: 'Temp', value: '37.1', unit: '°C', status: 'normal' },
      { label: 'Pain', value: '8/10', unit: '', status: 'danger' },
    ]
  }
}

const MOCK_ATTEMPT = {
  id: 'attempt-001',
  currentStep: 'examination' as const,
  completedSteps: ['history'],
}

const STEPS = [
  { id: 'history', label: 'History' },
  { id: 'examination', label: 'Examination' },
  { id: 'investigation', label: 'Investigations' },
  { id: 'diagnosis', label: 'Diagnosis' },
  { id: 'management', label: 'Management' },
]

export default function SimulationPage({ params }: { params: { caseId: string } }) {
  const { patientPersona, xpReward } = MOCK_CASE

  return (
    <div className="h-[calc(100vh-60px)] grid grid-cols-[280px_1fr] gap-4 p-4 md:px-6">
      {/* LEFT COLUMN: Patient Info */}
      <aside className="flex flex-col gap-3.5 overflow-y-auto pr-1">
        
        {/* Patient Identity */}
        <div className="bg-white border border-border-default rounded-xl p-[18px] flex flex-col items-center text-center shadow-sm">
          <div className="w-[68px] h-[68px] rounded-full flex items-center justify-center text-[32px] border-2 border-brand-light bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] mb-3 shadow-inner">
            {patientPersona.emoji}
          </div>
          <h2 className="text-[15px] font-bold text-text-primary leading-tight">
            {patientPersona.name}
          </h2>
          <span className="text-[11px] font-bold font-mono text-text-secondary uppercase tracking-widest mt-1">
            {patientPersona.age} {patientPersona.sex} · {patientPersona.presentingComplaint}
          </span>
        </div>

        {/* Vitals */}
        <div className="bg-white border border-border-default rounded-xl p-[14px] shadow-sm">
          <span className="text-[10px] font-bold font-mono text-text-tertiary uppercase tracking-[0.08em] block mb-2.5">
            Initial Vitals
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {patientPersona.initialVitals.map((v) => (
              <div key={v.label} className="bg-surface-subtle border border-border-default rounded-md px-2 py-2 text-center shadow-sm">
                <span className="text-[9px] font-bold font-mono text-text-tertiary uppercase block">
                  {v.label}
                </span>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className={cn(
                    "text-[15px] font-bold font-mono",
                    v.status === 'normal' ? "text-brand" : v.status === 'warning' ? "text-[#D97706]" : "text-[#DC2626]"
                  )}>
                    {v.value}
                  </span>
                  <span className="text-[9px] font-mono text-text-tertiary">{v.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Progress */}
        <div className="bg-white border border-border-default rounded-xl p-[14px] shadow-sm">
          <span className="text-[10px] font-bold font-mono text-text-tertiary uppercase tracking-[0.08em] block mb-2.5">
            Scenario Progress
          </span>
          <div className="flex flex-col gap-1.5">
            {STEPS.map((step, index) => {
              const isDone = MOCK_ATTEMPT.completedSteps.includes(step.id)
              const isActive = MOCK_ATTEMPT.currentStep === step.id
              const isPending = !isDone && !isActive

              return (
                <div 
                  key={step.id} 
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors border",
                    isDone ? "bg-brand-light border-brand/20 text-brand-text" :
                    isActive ? "bg-reward-light border-reward/20 text-reward-text" :
                    "bg-transparent border-transparent text-text-tertiary"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono",
                    isDone ? "bg-brand text-white" :
                    isActive ? "bg-[#FDE68A] text-reward-text" :
                    "bg-surface-subtle text-text-tertiary"
                  )}>
                    {isDone ? '✓' : index + 1}
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold uppercase tracking-widest",
                    isActive && "font-bold"
                  )}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* XP Reward Box */}
        <div className="bg-reward-light border border-[#FDE68A] rounded-xl p-[10px_12px] shadow-sm mt-auto">
          <div className="flex items-center gap-1.5 text-reward-text font-bold font-mono text-[12px] uppercase">
             <span>⚡</span>
             <span>+{xpReward} XP on Completion</span>
          </div>
          <p className="text-[10px] font-bold font-mono text-text-secondary uppercase tracking-tight mt-1">
             +50 XP bonus if score ≥ 85%
          </p>
        </div>
      </aside>

      {/* RIGHT COLUMN: Chat Area */}
      <main className="h-full overflow-hidden">
        <SimulationChat 
          caseId={params.caseId}
          attemptId={MOCK_ATTEMPT.id}
          currentStep={MOCK_ATTEMPT.currentStep}
          patientName={patientPersona.name}
          patientEmoji={patientPersona.emoji}
        />
      </main>
    </div>
  )
}
