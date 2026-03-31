'use client'

import { cn } from '@/lib/utils'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Left Side: Branding & Experience */}
      <div className="hidden lg:flex relative bg-primary-container flex-col p-16 overflow-hidden">
        {/* High-fidelity Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/auth-bg.png" 
            alt="Clinical Training environment"
            className="w-full h-full object-cover opacity-50 contrast-[1.05] saturate-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/80 via-primary-container/40 to-transparent"></div>
        </div>

        {/* Animated Background Elements (Softened) */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] aspect-square bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-20%] w-[80%] aspect-square bg-secondary/10 rounded-full blur-[160px] animate-bounce-subtle"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
            </div>
            <span className="text-3xl font-heading font-black tracking-tighter text-primary">Caseflow</span>
          </div>

          <div className="mt-auto max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-6 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest">Next-Gen Simulation</span>
            </div>
            <h2 className="text-5xl font-heading font-black text-on-surface leading-tight tracking-tight mb-8">
              Master Clinical <br/> Decisions in <span className="text-primary underline decoration-primary/20 underline-offset-8">Real-time</span>.
            </h2>
            <p className="text-lg font-sans font-medium text-on-surface-variant mb-12 opacity-80 leading-relaxed">
              Immerse yourself in high-fidelity AI patient encounters designed to bridge the gap between theory and practice.
            </p>
            
            <div className="flex items-center gap-6 p-6 bg-surface/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-primary/5">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-2xl border-4 border-surface bg-primary-container/30 overflow-hidden flex items-center justify-center text-primary font-heading font-bold shadow-sm">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <p className="text-sm font-heading font-black text-on-surface tracking-tight leading-tight">Join 2,500+ Medical Scholars</p>
                <div className="flex items-center gap-2 mt-1.5 opacity-70">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[14px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-[10px] font-mono font-black text-on-surface-variant uppercase tracking-tighter">Clinical Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-surface relative">
        <div className="w-full max-w-md relative z-10">
          <div className="flex lg:hidden items-center gap-3 mb-12 justify-center">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
            <span className="text-2xl font-heading font-black text-on-surface tracking-tighter">Caseflow</span>
          </div>
          {children}
        </div>
        
        {/* Subtle Decorative Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -z-10 blur-3xl opacity-50"></div>
      </div>
    </div>
  )
}


