// components/dashboard/cards/SEOScoreCard.tsx
"use client"

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react'

interface SEOScoreCardProps {
  score: number
  trend?: number
}

export default function SEOScoreCard({ score, trend }: SEOScoreCardProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    const option = {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: '90%',
          center: ['50%', '70%'],
          splitNumber: 10,
          progress: {
            show: true,
            width: 10,
            roundCap: true
          },
          pointer: {
            show: false
          },
          axisLine: {
            lineStyle: {
              width: 10,
              color: [
                [0.3, '#ef4444'],
                [0.7, '#f59e0b'],
                [1, '#10b981']
              ]
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            show: false
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}',
            fontSize: 40,
            fontWeight: 'bold',
            offsetCenter: [0, '-10%'],
            color: '#111827'
          },
          title: {
            fontSize: 12,
            color: '#6b7280',
            offsetCenter: [0, '35%']
          },
          data: [
            {
              value: score || 0,
              name: 'SEO SCORE'
            }
          ]
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
  }, [score])

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500'
    return trend > 0 ? 'text-emerald-500' : 'text-red-500'
  }

  const getTrendText = () => {
    if (!trend) return 'No change'
    const absValue = Math.abs(trend).toFixed(1)
    return trend > 0 ? `+${absValue}` : `-${absValue}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">SEO Score</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{score || 0}</span>
          {trend !== undefined && trend !== 0 && (
            <span className={`flex items-center text-sm font-medium ${getTrendColor()}`}>
              {trend > 0 ? (
                <IconArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <IconArrowDown className="w-4 h-4 mr-1" />
              )}
              {getTrendText()}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall Health</p>
      </div>

      <div ref={chartRef} className="h-40 mt-4" />
    </div>
  )
}
