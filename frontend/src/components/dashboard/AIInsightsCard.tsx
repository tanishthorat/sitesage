// components/dashboard/cards/AIInsightsCard.tsx
"use client"

import { useState } from 'react'
import { IconSparkles, IconChevronDown, IconChevronUp, IconBulb, IconTarget } from '@tabler/icons-react'

interface AIInsightsCardProps {
  summary: string | null
  suggestions: string[]
  url: string
}

export default function AIInsightsCard({ summary, suggestions, url }: AIInsightsCardProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Filter out empty strings from suggestions
  const filteredSuggestions = suggestions.filter(s => s && s.trim().length > 0)
  const displayedSuggestions = showAll ? filteredSuggestions : filteredSuggestions.slice(0, 3)
  const hasMore = filteredSuggestions.length > 3

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 backdrop-blur-xl">
      {/* linear Overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-600/5 to-purple-600/5 pointer-events-none" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl blur-md opacity-50" />
            <div className="relative w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <IconSparkles className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              AI-Powered Insights
              <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                BETA
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Generated analysis for {new URL(url).hostname}</p>
          </div>
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="mb-5 p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 bg-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconTarget className="w-4 h-4 text-blue-400" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-200 mb-1.5">Summary</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {filteredSuggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <IconBulb className="w-4 h-4 text-amber-400" strokeWidth={2} />
              <h4 className="text-sm font-semibold text-slate-200">
                Recommendations
              </h4>
              <span className="text-xs text-slate-500">({filteredSuggestions.length})</span>
            </div>

            <div className="space-y-2">
              {displayedSuggestions.length > 0 ? (
                displayedSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="group relative flex items-start gap-3 p-3.5 bg-slate-900/30 hover:bg-slate-900/50 border border-slate-700/40 hover:border-slate-600/60 rounded-xl transition-all duration-200"
                  >
                    {/* Number Badge */}
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-semibold text-indigo-300">
                        {index + 1}
                      </span>
                    </div>
                    
                    {/* Suggestion Text */}
                    <p className="flex-1 text-sm text-slate-300 leading-relaxed pt-0.5">
                      {suggestion}
                    </p>

                    {/* Hover Indicator */}
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-indigo-500/20 pointer-events-none transition-colors" />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconSparkles className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-slate-500">
                    AI analysis will appear here after scanning
                  </p>
                </div>
              )}
            </div>

            {/* Show More/Less Button */}
            {hasMore && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-3 py-2.5 px-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600/70 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-all duration-200"
              >
                {showAll ? (
                  <>
                    <span>Show Less</span>
                    <IconChevronUp className="w-4 h-4" strokeWidth={2} />
                  </>
                ) : (
                  <>
                    <span>Show {filteredSuggestions.length - 3} More</span>
                    <IconChevronDown className="w-4 h-4" strokeWidth={2} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Gradient Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />
    </div>
  )
}
