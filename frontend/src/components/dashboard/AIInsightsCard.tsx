// components/dashboard/cards/AIInsightsCard.tsx
"use client"

import { useState } from 'react'
import { IconSparkles, IconChevronDown, IconChevronUp, IconInfoCircle } from '@tabler/icons-react'

interface AIInsightsCardProps {
  summary: string | null
  suggestions: string[]
  url: string
}

export default function AIInsightsCard({ summary, suggestions, url }: AIInsightsCardProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconSparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI-Powered Insights</h3>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {expanded ? (
              <IconChevronUp className="w-5 h-5" />
            ) : (
              <IconChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {expanded && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-purple-100 dark:border-purple-800">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Summary</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {summary || 'AI analysis will appear here after scanning your website.'}
              </p>
            </div>

            {suggestions && suggestions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">
                  Actionable Recommendations
                </h4>
                <ul className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-xs font-semibold flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
                        {suggestion}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <IconInfoCircle className="w-4 h-4" />
              <span>Generated using AI for {url}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
