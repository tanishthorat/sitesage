"use client"

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import api, { apiEndpoints } from '@/lib/api'

interface Project {
  url: string;
  count: number;
  latest_scan_date: string;
}

interface DashboardContextType {
  selectedProject: string | null
  setSelectedProject: (url: string | null) => void
  projects: Project[]
  isLoadingProjects: boolean
  refreshProjects: () => Promise<void>
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
  const { user } = useAuth()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [hasFetchedProjects, setHasFetchedProjects] = useState(false)

  const refreshProjects = useCallback(async () => {
    if (!user || isLoadingProjects) return

    try {
      setIsLoadingProjects(true)
      const response = await api.get(apiEndpoints.historyUnique)
      setProjects(response.data)
      setHasFetchedProjects(true)
    } catch (err) {
      console.error('Error fetching projects:', err)
    } finally {
      setIsLoadingProjects(false)
    }
  }, [user, isLoadingProjects])

  // Fetch projects once when user is available
  useEffect(() => {
    if (user && !hasFetchedProjects && !isLoadingProjects) {
      refreshProjects()
    }
  }, [user, hasFetchedProjects, isLoadingProjects, refreshProjects])

  return (
    <DashboardContext.Provider value={{ 
      selectedProject, 
      setSelectedProject,
      projects,
      isLoadingProjects,
      refreshProjects
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

