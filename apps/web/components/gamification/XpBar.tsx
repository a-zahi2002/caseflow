'use client'

import { useEffect, useState } from 'react'
import { computeLevel, LEVEL_TITLES } from '@cbl/types'
import { cn } from '@/lib/utils'

interface XpBarProps {
  totalXp: number
  institutionRank?: number
  institutionTotal?: number
}

export function XpBar({ totalXp, institutionRank, institutionTotal }: XpBarProps) {
  const levelInfo = computeLevel(totalXp)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setAnimatedProgress(levelInfo.progressPercent)
    })
    return () => cancelAnimationFrame(frame)
  }, [levelInfo.progressPercent])

  return (
    <div className="bg-white p-5 rounded-xl border border-border-default shadow-card flex flex-col gap-3">
      {/* Row 1: Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand text-white flex items-center justify-center rounded-lg shadow-sm">
            <span className="text-xl font-bold font-mono leading-none">{levelInfo.level}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-text-primary leading-tight">
              {levelInfo.title}
            </span>
            <span className="text-xs font-mono text-text-secondary">
              {levelInfo.currentLevelXp.toLocaleString()} / {levelInfo.nextLevelXp === 0 ? '---' : levelInfo.nextLevelXp.toLocaleString()} XP
            </span>
          </div>
        </div>

        {institutionRank !== undefined && (
          <div className="text-right flex flex-col items-end">
            <span className="text-[15px] font-bold font-mono text-reward-text leading-none">
              #{institutionRank}
            </span>
            <span className="text-[11px] text-text-tertiary">
              of {institutionTotal ?? '---'}
            </span>
          </div>
        )}
      </div>

      {/* Row 2: Progress Track */}
      <div 
        className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={levelInfo.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div 
          className="h-full bg-brand rounded-full transition-[width] duration-[1200ms] cubic-bezier(0.4,0,0.2,1) relative"
          style={{ width: `${animatedProgress}%` }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-y-0 right-0 w-4 bg-white/50 blur-[4px] animate-xp-shimmer" />
        </div>
      </div>

      {/* Row 3: Range Details */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold font-mono text-text-tertiary uppercase tracking-wider">
          Level {levelInfo.level}
        </span>
        <span className="text-[11px] font-bold font-mono text-text-tertiary uppercase tracking-normal">
          {levelInfo.progressPercent}% to Level {levelInfo.level + 1}
        </span>
        <span className="text-[11px] font-bold font-mono text-text-tertiary uppercase tracking-wider text-right">
          {LEVEL_TITLES[levelInfo.level + 1] ?? 'Max Level'}
        </span>
      </div>
    </div>
  )
}
