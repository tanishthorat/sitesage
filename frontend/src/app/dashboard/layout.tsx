// components/dashboard/DashboardLayout.tsx
"use client"

import Sidebar from '@/components/ui/SidebarHeroUI'
import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  selectedProject: string | null
  onProjectChange: (url: string) => void
}

export default function DashboardLayout({ 
  children, 
  selectedProject, 
  onProjectChange 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar 
        selectedProject={selectedProject}
        onProjectChange={onProjectChange}
      />

      {/* Main content with responsive margins */}
      <main className="lg:ml-64 min-h-screen">
        {/* Mobile: padding top for fixed header, Desktop: no extra padding */}
        <div className="">
          {children}
        </div>
      </main>
    </div>
  )
}
