'use client'

import Image from 'next/image'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side: Branding & Image */}
      <div className="hidden lg:flex relative bg-[#063333] flex-col p-12 overflow-hidden shadow-2xl">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/login-bg.png"
            alt="Medical Education"
            fill
            className="object-cover opacity-50 transition-transform duration-[10s] hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/80 via-[#063333]/90 to-[#021F1F]/95 mix-blend-multiply" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-brand/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <GraduationCap className="w-6 h-6 text-brand-light" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Caseflow</span>
          </div>

          <div className="mt-auto max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Master Clinical Cases with the Next Generation of AI Patient Simulations
            </h2>
            <div className="flex gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-sm" />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">Join 1,000+ medical professionals</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-reward" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <p className="text-xs text-white/60">on your journey to clinical excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-[var(--surface-page)]">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <GraduationCap className="w-8 h-8 text-brand" />
            <span className="text-xl font-bold text-gray-900 leading-none">Caseflow</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

