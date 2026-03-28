'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ToastPayload, XpToastStack } from './XpToast'

export interface XpToastContextValue {
  showToast: (payload: Omit<ToastPayload, 'id'>) => void
}

export const XpToastContext = createContext<XpToastContextValue | undefined>(undefined)

export function useXpToast(): XpToastContextValue {
  const context = useContext(XpToastContext)
  if (!context) {
    throw new Error('useXpToast must be used within an XpToastProvider')
  }
  return context
}

export function XpToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastPayload[]>([])

  const showToast = (payload: Omit<ToastPayload, 'id'>) => {
    const id = crypto.randomUUID()
    const newToast: ToastPayload = { ...payload, id }
    setToasts((prev) => [newToast, ...prev])
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <XpToastContext.Provider value={{ showToast }}>
      {children}
      <XpToastStack toasts={toasts} onDismiss={dismissToast} />
    </XpToastContext.Provider>
  )
}
