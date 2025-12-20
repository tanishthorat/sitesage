// components/dashboard/HistorySection.tsx
"use client"

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Report } from '@/types/api'
import { useRef, useState, useEffect } from 'react'

interface HistorySectionProps {
  history: Report[]
  selectedReport: Report | null
  onSelectReport: (report: Report) => void
}

export default function HistorySection({ history, selectedReport, onSelectReport }: HistorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const formatTabDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    
    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    
    // Otherwise show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  }

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [history])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (!history || history.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      {/* Tabs Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r from-white dark:from-neutral-800 to-transparent w-12 flex items-center justify-start pl-2"
          >
            <div className="bg-white dark:bg-neutral-700 rounded-full p-1 shadow-md">
              <IconChevronLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </div>
          </button>
        )}

        {/* Scrollable Tabs */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {history.map((report) => {
            const isSelected = selectedReport?.id === report.id
            return (
              <button
                key={report.id}
                onClick={() => onSelectReport(report)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-neutral-700 text-white shadow-md'
                    : 'bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                }`}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-semibold">{formatTabDate(report.created_at)}</span>
                  <span className={`text-xs ${isSelected ? 'text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {formatTime(report.created_at)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-white dark:from-neutral-800 to-transparent w-12 flex items-center justify-end pr-2"
          >
            <div className="bg-white dark:bg-neutral-700 rounded-full p-1 shadow-md">
              <IconChevronRight className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
         