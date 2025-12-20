// components/dashboard/HistorySection.tsx
"use client"

import { IconClock, IconChartLine, IconGlobe } from '@tabler/icons-react'
import { Report } from '@/types/api'

interface HistorySectionProps {
  history: Report[]
  onViewDetail: (reportId: number) => void
}

export default function HistorySection({ history, onViewDetail }: HistorySectionProps) {
  if (!history || history.length === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    if (score >= 70) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
  }

  const getLighthouseColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Analysis History</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last {history.length} {history.length === 1 ? 'scan' : 'scans'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((report) => (
          <button
            key={report.id}
            onClick={() => onViewDetail(report.id)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-lg transition-all text-left group"
          >
            {/* Date and Time */}
            <div className="flex items-center gap-2 mb-4">
              <IconClock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(report.created_at)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {formatTime(report.created_at)}
              </span>
            </div>

            {/* URL */}
            <div className="flex items-center gap-2 mb-4">
              <IconGlobe className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-white truncate">
                {report.url.replace(/^https?:\/\/(www\.)?/, '')}
              </span>
            </div>

            {/* SEO Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">SEO Score</span>
                <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(report.seo_score)}`}>
                  {report.seo_score}
                </span>
              </div>
            </div>

            {/* Lighthouse Metrics Mini Preview */}
            {(report.lighthouse_performance !== null || 
              report.lighthouse_accessibility !== null ||
              report.lighthouse_seo !== null ||
              report.lighthouse_best_practices !== null) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between gap-3">
                  {report.lighthouse_performance !== null && (
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Perf</div>
                      <div className={`h-2 rounded-full ${getLighthouseColor(report.lighthouse_performance)}`}
                           style={{ width: `${report.lighthouse_performance}%` }} />
                    </div>
                  )}
                  {report.lighthouse_accessibility !== null && (
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">A11y</div>
                      <div className={`h-2 rounded-full ${getLighthouseColor(report.lighthouse_accessibility)}`}
                           style={{ width: `${report.lighthouse_accessibility}%` }} />
                    </div>
                  )}
                  {report.lighthouse_seo !== null && (
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">SEO</div>
                      <div className={`h-2 rounded-full ${getLighthouseColor(report.lighthouse_seo)}`}
                           style={{ width: `${report.lighthouse_seo}%` }} />
                    </div>
                  )}
                  {report.lighthouse_best_practices !== null && (
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">BP</div>
                      <div className={`h-2 rounded-full ${getLighthouseColor(report.lighthouse_best_practices)}`}
                           style={{ width: `${report.lighthouse_best_practices}%` }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View Report Button Indicator */}
            <div className="mt-4 flex items-center justify-end gap-2 text-indigo-600 dark:text-indigo-400 group-hover:gap-3 transition-all">
              <span className="text-sm font-medium">View Report</span>
              <IconChartLine className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
         