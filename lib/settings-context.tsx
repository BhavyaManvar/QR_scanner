"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./auth-context"

export interface UserSettings {
  scanPrivacy: 'save-all' | 'save-safe-only' | 'save-none'
  defaultScanMode: 'camera' | 'upload'
  notificationsEnabled: boolean
  autoAnalyze: boolean
  language: string
}

const DEFAULT_SETTINGS: UserSettings = {
  scanPrivacy: 'save-all',
  defaultScanMode: 'camera',
  notificationsEnabled: true,
  autoAnalyze: true,
  language: 'en'
}

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const { user } = useAuth()

  // Load settings from localStorage when component mounts or user changes
  useEffect(() => {
    if (user) {
      const storageKey = `settings-${user.id}`
      const storedSettings = localStorage.getItem(storageKey)
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      } else {
        setSettings(DEFAULT_SETTINGS)
      }
    } else {
      setSettings(DEFAULT_SETTINGS)
    }
  }, [user])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (user) {
      const storageKey = `settings-${user.id}`
      localStorage.setItem(storageKey, JSON.stringify(settings))
    }
  }, [settings, user])

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates
    }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
} 