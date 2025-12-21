// components/dashboard/DashboardLayout.tsx
"use client"

import Sidebar from '@/components/ui/SidebarHeroUI'
import { ReactNode } from 'react'
import { useDashboard } from '@/contexts/DashboardContext'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { selectedProject, setSelectedProject } = useDashboard()

  const handleProjectChange = (url: string) => {
    setSelectedProject(url)
  }

  return (
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
  )
}
