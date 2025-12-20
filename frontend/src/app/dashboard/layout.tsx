// components/dashboard/DashboardLayout.tsx
"use client"

import Sidebar from '@/components/ui/SidebarHeroUI'
import { ReactNode } from 'react'
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext'

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  )
}
