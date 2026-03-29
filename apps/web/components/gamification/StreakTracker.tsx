'use client'

import { StreakStatus } from '@caseflow/types'
import { cn } from '@/lib/utils'

interface StreakTrackerProps {
  streak: StreakStatus
  compact?: boolean
}

export function StreakTracker({ streak, compact = false }: StreakTrackerProps) {
  const todayDate = new Date().toISOString().slice(0, 10)
  const isPlural = streak.currentStreak !== 1

  const dotElements = streak.last7Days.map((day) => {
    const isToday = day.date === todayDate
    const isDone = day.completed
    const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })

    const dotStyle = isToday && isDone 
      ? "bg-brand-light border-brand-hover text-brand-text animate-pulse-brand"
      : isToday && !isDone
        ? "bg-reward-light border-[#FDE68A] text-[#92400E] animate-pulse-reward"
        : isDone
          ? "bg-brand-light border-[#99F6E4] text-brand-text"
          : "bg-surface-subtle border-border-default text-text-tertiary"

    return (
      <div 
        key={day.date}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all shadow-sm",
          dotStyle
        )}
        title={`${day.date}: ${day.completed ? 'Completed' : 'Pending'}`}
      >
        {dayLabel}
      </div>
    )
  })

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {dotElements}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🔥</span>
          <span className="text-[15px] font-bold text-[#B45309]">
            {streak.currentStreak} day{isPlural ? 's' : ''}
          </span>
        </div>
        <div className="font-mono text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
          Personal Best: {streak.longestStreak} days
        </div>
      </div>

      {/* 7 Dots Row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {dotElements}
      </div>

      {/* Optional CTA */}
      {!streak.completedToday && (
        <p className="mt-1 flex items-center gap-2 font-mono text-[11px] font-bold text-reward-text uppercase tracking-tight">
          <span className="animate-pulse">⚡️</span>
          Complete a case today to keep your streak!
        </p>
      )}
    </div>
  )
}

