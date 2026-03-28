'use client'

import { useState } from 'react'
import { BadgeDefinition, UserBadge, BADGE_DEFINITIONS } from '@cbl/types'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BadgeGridProps {
  userBadges: UserBadge[]
  limit?: number
}

const rarityStyles = {
  common: {
    border: "border-[#E5E7EB]",
    iconBg: "bg-[#F9FAFB]",
    name: "text-text-primary",
  },
  rare: {
    border: "border-[#99F6E4]",
    iconBg: "bg-[#CCFBF1]",
    name: "text-brand-text",
  },
  epic: {
    border: "border-[#E9D5FF]",
    iconBg: "bg-[#F3E8FF]",
    name: "text-[#7C3AED]",
  },
  legendary: {
    border: "border-[#FDE68A]",
    iconBg: "bg-[#FEF3C7]",
    name: "text-[#92400E]",
  },
}

export function BadgeGrid({ userBadges, limit }: BadgeGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  
  const displayBadges = limit ? BADGE_DEFINITIONS.slice(0, limit) : BADGE_DEFINITIONS

  return (
    <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
      {displayBadges.map((badge) => {
        const userBadge = userBadges.find(ub => ub.badgeId === badge.id)
        const isUnlocked = !!userBadge
        const style = rarityStyles[badge.rarity]

        return (
          <div 
            key={badge.id}
            onMouseEnter={() => isUnlocked && setHoveredId(badge.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="relative"
          >
            {/* Tooltip */}
            {hoveredId === badge.id && (
              <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 min-w-[180px] bg-white border border-brand/20 p-4 rounded-xl shadow-hover z-50 animate-slide-up pointer-events-none">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-text-primary mb-1">
                    {badge.name}
                  </span>
                  <p className="text-[11px] leading-relaxed text-text-secondary italic">
                    {badge.description}
                  </p>
                  <p className="text-[11px] font-bold text-reward-text mt-2 font-mono uppercase tracking-widest">
                    +{badge.xpReward} XP
                  </p>
                </div>
                {/* Carrot */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-brand/20 rotate-45" />
              </div>
            )}

            {/* Badge Card */}
            <div className={cn(
              "p-4 rounded-xl border bg-white flex flex-col items-center justify-center transition-all shadow-sm",
              isUnlocked ? style.border : "opacity-45 grayscale(0.7) border-border-default",
              isUnlocked && "hover:-translate-y-1 hover:shadow-hover hover:border-brand-hover cursor-help"
            )}>
              {/* New Dot */}
              {isUnlocked && userBadge?.isNew && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm" />
              )}

              {/* Icon Circle */}
              <div className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center shadow-inner mb-3",
                isUnlocked ? style.iconBg : "bg-surface-subtle"
              )}>
                {isUnlocked ? (
                  <span className="text-2xl drop-shadow-sm">{badge.icon}</span>
                ) : (
                  <Lock className="w-4 h-4 text-text-tertiary" />
                )}
              </div>

              {/* Name & Rarity */}
              <span className={cn(
                "text-[11px] font-bold leading-tight line-clamp-1 mb-1 tracking-tight text-center uppercase",
                isUnlocked ? style.name : "text-text-tertiary"
              )}>
                {badge.name}
              </span>
              <span className="text-[9px] font-mono font-bold text-text-tertiary uppercase tracking-[0.08em] opacity-80">
                {badge.rarity}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
