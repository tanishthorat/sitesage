// components/dashboard/DashboardHeader.tsx
"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { IconRefresh, IconPlus } from '@tabler/icons-react'

interface DashboardHeaderProps {
  onRefresh: () => void
}

export default function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setTimeout(() => setRefreshing(false), 500)
  }

  const handleNewAnalysis = () => {
    router.push('/')
  }

  return (
    <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 rounded-lg mb-6">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">SEO Dashboard</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
            >
              <IconRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={handleNewAnalysis}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <IconPlus className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
