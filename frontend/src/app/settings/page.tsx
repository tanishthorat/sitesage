"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import { IconArrowLeft } from '@tabler/icons-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar selectedProject={null} onProjectChange={() => {}} />
      
      <main className="flex-1 ml-60">
        <div className="bg-white dark:bg-gray-800 m-5 rounded-xl shadow-sm min-h-[calc(100vh-40px)]">
          <div className="p-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
            >
              <IconArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Manage your account settings and preferences
            </p>

            <div className="space-y-6">
              {/* Account Information */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={user?.uid || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Additional settings coming soon...
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
