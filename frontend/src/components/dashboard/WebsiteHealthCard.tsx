// components/dashboard/cards/WebsiteHealthCard.tsx
"use client"

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react'

interface WebsiteHealthCardProps {
  score: number
  performance: number
  trend?: number
}

export default function WebsiteHealthCard({ score, performance, trend }: WebsiteHealthCardProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  // Calculate overall health (weighted average)
  const healthScore = Math.round((score * 0.6) + (performance * 0.4))

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
          radius: '120%',
          center: ['50%', '75%'],
          splitNumber: 10,
          progress: {
            show: true,
            width: 14,
            roundCap: true
          },
          pointer: {
            show: false
          },
          axisLine: {
            lineStyle: {
              width: 14,
              color: [
                [healthScore / 100, '#10b981'],
                [1, '#e5e7eb']
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
            formatter: '{value}%',
            fontSize: 48,
            fontWeight: 'bold',
            offsetCenter: [0, '-20%'],
            color: '#111827'
          },
          title: {
            fontSize: 11,
            color: '#6b7280',
            offsetCenter: [0, '15%']
          },
          data: [
            {
              value: healthScore,
              name: 'HEALTHY'
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
  }, [healthScore])

  const getHealthStatus = () => {
    if (healthScore >= 90) return { text: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50' }
    if (healthScore >= 70) return { text: 'Good', color: 'text-green-600', bg: 'bg-green-50' }
    if (healthScore >= 50) return { text: 'Fair', color: 'text-amber-600', bg: 'bg-amber-50' }
    return { text: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const status = getHealthStatus()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Website Health</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div ref={chartRef} className="h-48" />

      <div className="mt-4 text-center">
        {trend !== undefined && trend !== 0 && (
          <div className={`inline-flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend > 0 ? (
              <IconArrowUp className="w-4 h-4" />
            ) : (
              <IconArrowDown className="w-4 h-4" />
            )}
            <span>{Math.abs(trend).toFixed(1)} points vs last scan</span>
          </div>
        )}
      </div>

      <div className={`mt-4 p-3 ${status.bg} rounded-lg text-center`}>
        <span className={`text-sm font-semibold ${status.color}`}>
          {status.text}
        </span>
      </div>
    </div>
  )
}
