// components/dashboard/cards/LighthouseChart.tsx
"use client"

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react'

interface HistoryItem {
  created_at: string
  lighthouse_performance: number | null
  lighthouse_accessibility: number | null
  lighthouse_seo: number | null
  lighthouse_best_practices: number | null
}

interface LighthouseChartProps {
  performance: number | null
  accessibility: number | null
  seo: number | null
  bestPractices: number | null
  history: HistoryItem[]
  robotsTxt: boolean
  sitemap: boolean
  ogTags: boolean
  schema: boolean
}

export default function LighthouseChart({
  performance,
  accessibility,
  seo,
  bestPractices,
  history,
  robotsTxt,
  sitemap,
  ogTags,
  schema
}: LighthouseChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const chart = echarts.init(chartRef.current)

    // Prepare historical data
    const dates = history.slice(0, 7).reverse().map((item, i) => {
      const date = new Date(item.created_at)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const perfData = history.slice(0, 7).reverse().map(h => h.lighthouse_performance)
    const accessData = history.slice(0, 7).reverse().map(h => h.lighthouse_accessibility)
    const seoData = history.slice(0, 7).reverse().map(h => h.lighthouse_seo)
    const bpData = history.slice(0, 7).reverse().map(h => h.lighthouse_best_practices)

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['Performance', 'Accessibility', 'SEO', 'Best Practices'],
        bottom: 0,
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates.length > 0 ? dates : ['Now'],
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 11
        }
      },
      series: [
        {
          name: 'Performance',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#8b5cf6',
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
                { offset: 0, color: 'rgba(139, 92, 246, 0.2)' },
                { offset: 1, color: 'rgba(139, 92, 246, 0.02)' }
              ]
            }
          },
          itemStyle: {
            color: '#8b5cf6'
          },
          data: perfData.length > 0 ? perfData : [performance]
        },
        {
          name: 'Accessibility',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#10b981',
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
                { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }
              ]
            }
          },
          itemStyle: {
            color: '#10b981'
          },
          data: accessData.length > 0 ? accessData : [accessibility]
        },
        {
          name: 'SEO',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#3b82f6',
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
                { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.02)' }
              ]
            }
          },
          itemStyle: {
            color: '#3b82f6'
          },
          data: seoData.length > 0 ? seoData : [seo]
        },
        {
          name: 'Best Practices',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#f59e0b',
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
                { offset: 0, color: 'rgba(245, 158, 11, 0.2)' },
                { offset: 1, color: 'rgba(245, 158, 11, 0.02)' }
              ]
            }
          },
          itemStyle: {
            color: '#f59e0b'
          },
          data: bpData.length > 0 ? bpData : [bestPractices]
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
  }, [performance, accessibility, seo, bestPractices, history])

  const technicalChecks = [
    { label: 'Robots.txt', value: robotsTxt },
    { label: 'Sitemap', value: sitemap },
    { label: 'OG Tags', value: ogTags },
    { label: 'Schema', value: schema }
  ]

  const lighthouseScores = [
    { label: 'Performance', value: performance, color: '#8b5cf6' },
    { label: 'Accessibility', value: accessibility, color: '#10b981' },
    { label: 'SEO', value: seo, color: '#3b82f6' },
    { label: 'Best Practices', value: bestPractices, color: '#f59e0b' }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Lighthouse Performance</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">📍 Technical SEO Metrics Over Time</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div ref={chartRef} className="h-64 mb-6" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {lighthouseScores.map((item) => (
          <div key={item.label} className="text-center">
            <div 
              className="text-3xl font-bold mb-1"
              style={{ color: item.color }}
            >
              {item.value !== null ? Math.round(item.value) : '—'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3">Technical Checks</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {technicalChecks.map((check) => (
            <div 
              key={check.label}
              className="flex items-center gap-2 text-sm"
            >
              {check.value ? (
                <IconCircleCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <IconCircleX className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <span className="text-gray-700 dark:text-gray-300 text-xs">{check.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
