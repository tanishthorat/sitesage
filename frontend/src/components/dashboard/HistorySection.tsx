// components/dashboard/HistorySection.tsx
"use client"

import { IconRefresh } from '@tabler/icons-react'
import { Report } from '@/types/api'
import { useRef, useState, useEffect } from 'react'
import { Button, Tabs, Tab, ScrollShadow } from '@heroui/react'

interface HistorySectionProps {
  history: Report[]
  selectedReport: Report | null
  onSelectReport: (report: Report) => void
  onAnalyzeAgain?: () => void | Promise<void>
}

export default function HistorySection({ history, selectedReport, onSelectReport, onAnalyzeAgain }: HistorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

  const handleAnalyzeAgain = async () => {
    if (onAnalyzeAgain && !isAnalyzing) {
      setIsAnalyzing(true)
      try {
        await onAnalyzeAgain()
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  if (!history || history.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      {/* Tabs Container */}
      <div className="relative flex items-center gap-2">
        {/* Analyze Again Button */}
        {onAnalyzeAgain && (
          <Button
            isIconOnly
            onPress={handleAnalyzeAgain}
            isLoading={isAnalyzing}
            disabled={isAnalyzing}
            className="shrink-0 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/40 hover:border-primary-500/60 text-primary-400 rounded-lg"
            size="lg"
            title={isAnalyzing ? 'Analyzing...' : 'Analyze Again'}
          >
            <IconRefresh size={18} className={isAnalyzing ? 'animate-spin' : ''} />
          </Button>
        )}

        {/* History Tabs */}
        <ScrollShadow className="flex-1 w-full [&::-webkit-scrollbar]:hidden [scrollbar-width:none]" hideScrollBar>
          <Tabs
            aria-label="History tabs"
            selectedKey={String(history.findIndex(h => h.id === selectedReport?.id) || 0)}
            onSelectionChange={(key) => {
              const index = Number(key)
              if (history[index]) onSelectReport(history[index])
            }}
            classNames={{
              base: 'w-fit',
              tabList: 'gap-2 p-0 bg-transparent',
              tab: 'px-4 py-2.5 h-auto data-[selected=true]:bg-primary-500/20 data-[selected=true]:border data-[selected=true]:border-primary-500/60 data-[selected=true]:text-primary-300 data-[selected=true]:shadow-lg data-[selected=true]:shadow-primary-500/20 bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg font-medium text-sm whitespace-nowrap',
              cursor: 'hidden',
              tabContent: 'group-data-[selected=true]:text-primary-300 text-current',
            }}
          >
            {history.map((report, index) => (
              <Tab
                key={index}
                title={
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-semibold">{formatTabDate(report.created_at)}</span>
                    <span className="text-xs">{formatTime(report.created_at)}</span>
                  </div>
                }
              />
            ))}
          </Tabs>
        </ScrollShadow>
      </div>
    </div>
  )
}
         