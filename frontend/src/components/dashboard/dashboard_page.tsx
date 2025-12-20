// app/dashboard/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import MetricsGrid from '@/components/dashboard/MetricsGrid'
import HistorySection from '@/components/dashboard/HistorySection'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DashboardData {
  latestReport: any
  historySummary: any[]
  trends: any
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Please login to view dashboard')
        return
      }

      // Fetch latest report
      const { data: reports, error: reportsError } = await supabase
        .from('seo_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (reportsError) throw reportsError

      // Fetch history summary (last 7 analyses)
      const { data: history, error: historyError } = await supabase
        .from('seo_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7)

      if (historyError) throw historyError

      // Calculate trends
      const trends = calculateTrends(history || [])

      setData({
        latestReport: reports?.[0] || null,
        historySummary: history || [],
        trends
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateTrends = (reports: any[]) => {
    if (reports.length < 2) return null

    const latest = reports[0]
    const previous = reports[1]

    return {
      seo_score: latest.seo_score - previous.seo_score,
      performance: latest.lighthouse_performance - previous.lighthouse_performance,
      accessibility: latest.lighthouse_accessibility - previous.lighthouse_accessibility,
      load_time: previous.load_time - latest.load_time // Inverted (lower is better)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onRefresh={fetchDashboardData} />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <MetricsGrid 
          report={data?.latestReport} 
          trends={data?.trends}
          history={data?.historySummary || []}
        />

        <HistorySection 
          history={data?.historySummary || []}
          onViewDetail={(reportId) => {
            // Navigate to detail view or open modal
            window.location.href = `/report/${reportId}`
          }}
        />
      </main>
    </div>
  )
}
