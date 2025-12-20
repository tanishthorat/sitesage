"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface DashboardContextType {
  selectedProject: string | null
  setSelectedProject: (url: string | null) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}

interface DashboardProviderProps {
  children: ReactNode
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  return (
    <DashboardContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </DashboardContext.Provider>
  )
}
