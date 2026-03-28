'use client'

import { useXpToast } from './XpToastProvider'

export function useXpAward() {
  const { showToast } = useXpToast()

  return {
    awardXp: (amount: number, reason: string) => showToast({
      variant: 'xp',
      title: `+${amount} XP`,
      subtitle: reason,
    }),

    unlockBadge: (badgeName: string, icon: string) => showToast({
      variant: 'badge',
      title: `Badge unlocked: ${badgeName}`,
      icon,
    }),

    levelUp: (newLevel: number, title: string) => showToast({
      variant: 'levelup',
      title: `Level Up! Now Level ${newLevel}`,
      subtitle: title,
      icon: '🎉',
    }),

    streakMilestone: (days: number) => showToast({
      variant: 'streak',
      title: `${days}-day streak!`,
      subtitle: `Keep going — you're on fire`,
      icon: '🔥',
    }),
  }
}
