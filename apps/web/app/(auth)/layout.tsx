'use client'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: Branding */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-brand via-brand/90 to-accent flex-col p-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] aspect-square bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-20%] w-[80%] aspect-square bg-xp rounded-full blur-[160px]" />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Caseflow</span>
          </div>

          {/* Hero */}
          <div className="mt-auto max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-white/90 uppercase tracking-widest">AI-Powered Simulation</span>
            </div>
            <h2 className="text-5xl font-bold text-white leading-tight tracking-tight mb-6">
              Master Clinical Reasoning in <span className="text-accent">Real-time</span>
            </h2>
            <p className="text-lg text-white/70 leading-relaxed mb-10">
              Immerse yourself in high-fidelity AI patient encounters. Bridge the gap between textbooks and the clinic.
            </p>

            {/* Social Proof */}
            <div className="flex items-center gap-5 p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="flex -space-x-3">
                {['#EF4444', '#8B5CF6', '#3B82F6', '#10B981'].map((color, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl border-3 border-brand flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-white">2,500+ Medical Students</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-warning fill-warning" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-[10px] font-mono text-white/60 ml-1">4.9/5 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-8 sm:p-16 lg:p-20">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Caseflow</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
