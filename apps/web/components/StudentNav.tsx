'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StudentNavProps {
  userName: string
  userInitials: string
  totalXp: number
  streak: number
  currentPath?: string
}

interface NavTabProps {
  href: string
  label: string
  isActive: boolean
  disabled?: boolean
}

function NavTab({ href, label, isActive, disabled }: NavTabProps) {
  if (disabled) {
    return (
      <span className="px-4 py-2 text-sm font-medium text-text-tertiary cursor-not-allowed">
        {label}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-md transition-all duration-180 ease-in-out whitespace-nowrap",
        isActive
          ? "bg-brand-light text-brand-text font-semibold"
          : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
      )}
    >
      {label}
    </Link>
  )
}

export function StudentNav({ userName, userInitials, totalXp, streak }: StudentNavProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Cases', href: '/cases' },
    { label: 'Simulation', href: '#', disabled: true },
    { label: 'Progress', href: '/progress' },
  ]

  return (
    <nav 
      aria-label="Main navigation"
      className="sticky top-0 z-50 w-full h-[60px] bg-white border-b border-border-default px-6 flex items-center justify-between"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-base font-bold text-brand font-sans">CBL</span>
        <span className="text-base text-text-tertiary">/</span>
        <span className="text-base font-normal text-text-secondary font-sans font-medium">SBL</span>
      </div>

      {/* Center: Desktop Tabs */}
      <div className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <NavTab
            key={item.label}
            href={item.href}
            label={item.label}
            isActive={pathname === item.href}
            disabled={item.disabled}
          />
        ))}
      </div>

      {/* Right: User HUD */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 hidden sm:flex">
          {/* XP Pill */}
          <div 
            aria-label={`Total XP: ${totalXp}`}
            className="flex items-center gap-1.5 bg-reward-light border border-[#FDE68A] rounded-full px-3 py-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-reward-text fill-current" />
            <span className="text-[13px] font-bold font-mono text-reward-text tracking-tight">
              {totalXp.toLocaleString()}
            </span>
          </div>

          {/* Streak Indicator */}
          {streak > 0 && (
            <div 
              aria-label={`${streak}-day streak`}
              className="flex items-center gap-1.5 px-2.5 py-1"
            >
              <span className="text-sm">🔥</span>
              <span className="text-[13px] font-semibold text-[#92400E]">
                {streak} days
              </span>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <button 
            className="relative w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-[12px] font-bold shadow-sm transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--brand), #0284C7)' }}
          >
            {userInitials}
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </button>
          
          <div className="hidden lg:flex items-center gap-1 cursor-pointer group">
             <span className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">{userName}</span>
             <ChevronDown className="w-3 h-3 text-text-tertiary group-hover:text-brand transition-colors" />
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-1.5 text-text-secondary hover:bg-surface-subtle rounded-lg transition-colors"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-[60px] left-0 w-full bg-white border-b border-border-default p-4 flex flex-col gap-2 md:hidden animate-slide-up shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "w-full px-4 py-3 rounded-lg text-sm font-semibold transition-colors",
                pathname === item.href
                  ? "bg-brand-light text-brand-text"
                  : item.disabled 
                    ? "text-text-tertiary cursor-not-allowed"
                    : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
          
          <div className="sm:hidden flex flex-col gap-4 mt-4 pt-4 border-t border-border-default">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Global Rank</span>
                <span className="text-xs font-bold text-brand">#42</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Total XP</span>
                <span className="text-xs font-bold text-reward-text font-mono">{totalXp.toLocaleString()}</span>
             </div>
          </div>
        </div>
      )}
    </nav>
  )
}

