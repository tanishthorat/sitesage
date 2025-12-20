// components/dashboard/cards/ContentMetricsCard.tsx
"use client"

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface ContentMetricsCardProps {
  wordCount: number
  h1Count: number
  h2Count: number
  imageCount: number
  missingAlt: number
}

export default function ContentMetricsCard({ 
  wordCount, 
  h1Count, 
  h2Count, 
  imageCount, 
  missingAlt 
}: ContentMetricsCardProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  const getWordCountStatus = () => {
    if (wordCount < 300) return { text: 'Low', color: 'text-red-500', icon: '▼' }
    if (wordCount < 1000) return { text: 'Good', color: 'text-amber-500', icon: '─' }
    return { text: 'Excellent', color: 'text-emerald-500', icon: '▲' }
  }

  const status = getWordCountStatus()

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    // Generate trend data (mock for now - can be real data from history)
    const trendColor = wordCount < 300 ? '#ef4444' : wordCount < 1000 ? '#f59e0b' : '#10b981'
    const data = [150, 180, 200, 220, 250, wordCount]

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
            color: trendColor,
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
                { offset: 0, color: `${trendColor}30` },
                { offset: 1, color: `${trendColor}05` }
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
  }, [wordCount])

  const metrics = [
    { label: 'H1 Tags', value: h1Count, ideal: 1 },
    { label: 'H2 Tags', value: h2Count, ideal: '3+' },
    { label: 'Images', value: imageCount, ideal: '5+' },
    { label: 'Missing Alt', value: missingAlt, ideal: 0 }
  ]

  const getMetricColor = (label: string, value: number) => {
    if (label === 'H1 Tags') return value === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
    if (label === 'Missing Alt') return value === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
    return value > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Content Metrics</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div className="mb-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{wordCount || 0}</span>
          <span className={`flex items-center text-sm font-medium ${status.color}`}>
            {status.icon} {status.text}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Words</p>
      </div>

      <div ref={chartRef} className="h-16 mt-4 mb-6" />

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className={`text-2xl font-bold ${getMetricColor(metric.label, metric.value)}`}>
              {metric.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.label}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Ideal: {metric.ideal}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
