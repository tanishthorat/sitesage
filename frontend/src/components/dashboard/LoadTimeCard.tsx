// components/dashboard/cards/LoadTimeCard.tsx
"use client"

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react'

interface LoadTimeCardProps {
  loadTime: number
  trend?: number
  history?: number[]
}

export default function LoadTimeCard({ loadTime, trend, history = [] }: LoadTimeCardProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    // Prepare data - use history or generate sample data
    const data = history.length > 0 
      ? history.slice(0, 7).reverse() 
      : [0.9, 0.85, 0.82, 0.78, 0.80, 0.76, loadTime]

    const option = {
      grid: {
        left: 0,
        right: 0,
        top: 5,
        bottom: 0,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        show: false,
        data: data.map((_, i) => i)
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: loadTime < 1 ? '#10b981' : loadTime < 2 ? '#f59e0b' : '#ef4444',
            width: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: loadTime < 1 
                    ? 'rgba(16, 185, 129, 0.3)' 
                    : loadTime < 2 
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)'
                },
                {
                  offset: 1,
                  color: loadTime < 1 
                    ? 'rgba(16, 185, 129, 0.05)' 
                    : loadTime < 2 
                    ? 'rgba(245, 158, 11, 0.05)'
                    : 'rgba(239, 68, 68, 0.05)'
                }
              ]
            }
          },
          data: data
        }
      ]
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [loadTime, history])

  const getStatus = () => {
    if (loadTime < 1) return { text: 'Fast', color: 'text-emerald-500' }
    if (loadTime < 2) return { text: 'Average', color: 'text-amber-500' }
    return { text: 'Slow', color: 'text-red-500' }
  }

  const status = getStatus()

  // For load time, negative trend is good (faster)
  const trendColor = !trend ? 'text-gray-500' : trend < 0 ? 'text-emerald-500' : 'text-red-500'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Load Time</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {loadTime?.toFixed(2)}s
          </span>
          {trend !== undefined && trend !== 0 && (
            <span className={`flex items-center text-sm font-medium ${trendColor}`}>
              {trend < 0 ? (
                <IconArrowDown className="w-4 h-4 mr-1" />
              ) : (
                <IconArrowUp className="w-4 h-4 mr-1" />
              )}
              {Math.abs(trend).toFixed(2)}s
            </span>
          )}
        </div>
        <p className={`text-sm font-medium mt-1 ${status.color}`}>
          {status.text}
        </p>
      </div>

      <div ref={chartRef} className="h-20 mt-4" />
    </div>
  )
}
