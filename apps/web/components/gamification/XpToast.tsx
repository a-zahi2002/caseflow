'use client'

import { useEffect, useState } from 'react'
import { X, Zap, Trophy, TrendingUp, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'xp' | 'badge' | 'levelup' | 'streak'

export interface ToastPayload {
  id: string
  variant: ToastVariant
  title: string
  subtitle?: string
  icon?: string
}

interface XpToastProps {
  toast: ToastPayload
  onDismiss: (id: string) => void
}

const variantStyles = {
  xp: {
    border: "border-border-brand",
    iconBg: "bg-brand-light",
    titleColor: "text-brand-text",
    defaultIcon: <Zap className="w-5 h-5 text-reward-text fill-current" />,
  },
  badge: {
    border: "border-[#E9D5FF]",
    iconBg: "bg-[#F3E8FF]",
    titleColor: "text-[#7C3AED]",
    defaultIcon: <Trophy className="w-5 h-5 text-[#7C3AED]" />,
  },
  levelup: {
    border: "border-[#FDE68A]",
    iconBg: "bg-[#FEF3C7]",
    titleColor: "text-[#92400E]",
    defaultIcon: <TrendingUp className="w-5 h-5 text-[#92400E]" />,
  },
  streak: {
    border: "border-[#FED7AA]",
    iconBg: "bg-warning-light",
    titleColor: "text-[#B45309]",
    defaultIcon: <Flame className="w-5 h-5 text-[#B45309] fill-current" />,
  },
}

export function XpToast({ toast, onDismiss }: XpToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const style = variantStyles[toast.variant]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div 
      className={cn(
        "w-[300px] bg-white border rounded-xl p-4 shadow-hover flex items-center gap-3 transition-all duration-300 pointer-events-auto",
        style.border,
        isExiting ? "opacity-0 translate-x-6" : "animate-toast-enter"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm",
        style.iconBg
      )}>
        {toast.icon ? (
          <span className="text-xl">{toast.icon}</span>
        ) : (
          style.defaultIcon
        )}
      </div>

      {/* Middle Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <span className={cn(
          "text-[13px] font-bold leading-tight truncate",
          style.titleColor
        )}>
          {toast.title}
        </span>
        {toast.subtitle && (
          <span className="text-[11px] font-medium text-text-secondary truncate mt-0.5">
            {toast.subtitle}
          </span>
        )}
      </div>

      {/* Close Button */}
      <button 
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => onDismiss(toast.id), 250)
        }}
        className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-subtle rounded-lg transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

interface XpToastStackProps {
  toasts: ToastPayload[]
  onDismiss: (id: string) => void
}

export function XpToastStack({ toasts, onDismiss }: XpToastStackProps) {
  return (
    <div className="fixed top-20 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <XpToast 
          key={toast.id} 
          toast={toast} 
          onDismiss={onDismiss} 
        />
      ))}
    </div>
  )
}
