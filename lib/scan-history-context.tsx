"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./auth-context"

export type ScanResult = {
  id: string
  url: string
  timestamp: number
  securityStatus: 'safe' | 'warning' | 'dangerous' | 'unknown'
  title?: string
  notes?: string
}

interface ScanHistoryContextType {
  scanHistory: ScanResult[]
  addScan: (scan: Omit<ScanResult, 'id' | 'timestamp'>) => void
  removeScan: (id: string) => void
  clearHistory: () => void
  updateScanNotes: (id: string, notes: string) => void
}

const ScanHistoryContext = createContext<ScanHistoryContextType | undefined>(undefined)

export function ScanHistoryProvider({ children }: { children: ReactNode }) {
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([])
  const { user } = useAuth()

  // Load scan history from localStorage when component mounts or user changes
  useEffect(() => {
    if (user) {
      const storageKey = `scan-history-${user.id}`
      const storedHistory = localStorage.getItem(storageKey)
      if (storedHistory) {
        setScanHistory(JSON.parse(storedHistory))
      }
    } else {
      setScanHistory([])
    }
  }, [user])

  // Save scan history to localStorage whenever it changes
  useEffect(() => {
    if (user && scanHistory.length > 0) {
      const storageKey = `scan-history-${user.id}`
      localStorage.setItem(storageKey, JSON.stringify(scanHistory))
    }
  }, [scanHistory, user])

  const addScan = (scan: Omit<ScanResult, 'id' | 'timestamp'>) => {
    const newScan: ScanResult = {
      ...scan,
      id: Date.now().toString(),
      timestamp: Date.now()
    }

    setScanHistory(prev => [newScan, ...prev])
  }

  const removeScan = (id: string) => {
    setScanHistory(prev => prev.filter(scan => scan.id !== id))
  }

  const clearHistory = () => {
    setScanHistory([])
    if (user) {
      const storageKey = `scan-history-${user.id}`
      localStorage.removeItem(storageKey)
    }
  }

  const updateScanNotes = (id: string, notes: string) => {
    setScanHistory(prev => 
      prev.map(scan => 
        scan.id === id ? { ...scan, notes } : scan
      )
    )
  }

  return (
    <ScanHistoryContext.Provider
      value={{
        scanHistory,
        addScan,
        removeScan,
        clearHistory,
        updateScanNotes
      }}
    >
      {children}
    </ScanHistoryContext.Provider>
  )
}

export function useScanHistory() {
  const context = useContext(ScanHistoryContext)
  if (context === undefined) {
    throw new Error("useScanHistory must be used within a ScanHistoryProvider")
  }
  return context
} 