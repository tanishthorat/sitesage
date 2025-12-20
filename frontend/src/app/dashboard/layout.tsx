// components/dashboard/DashboardLayout.tsx
"use client"

import Sidebar from '@/components/ui/SidebarHeroUI'
import { ReactNode, useState, createContext, useContext } from 'react'

interface DashboardContextType {
  selectedProject: string | null
  setSelectedProject: (url: string | null) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const useDashboard = () => {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardLayout')
  }
  return context
}

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const handleProjectChange = (url: string) => {
    setSelectedProject(url)
  }

  return (
    <DashboardContext.Provider value={{ selectedProject, setSelectedProject }}>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Sidebar 
          selectedProject={selectedProject}
          onProjectChange={handleProjectChange}
        />

        {/* Main content with responsive margins */}
        <main className="lg:ml-64 min-h-screen">
          <div className="">
            {children}
          </div>
        </main>
      </div>
    </DashboardContext.Provider>
  )
}
