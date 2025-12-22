// components/dashboard/cards/LighthouseChart.tsx
"use client"

import { useEffect, useRef, ReactNode, useState } from 'react'
import * as echarts from 'echarts'
import { Card, CardBody, Progress, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Skeleton } from '@heroui/react'
import { IconChevronDown } from '@tabler/icons-react'

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
  robotsTxt?: boolean
  sitemap?: boolean
  ogTags?: boolean
  schema?: boolean
  keywords?: string[]
  label?: string
  subtitle?: string
  className?: string
  chartHeight?: string
  cardPadding?: string
  cardBackground?: string
  cardBorder?: string
  cardRadius?: string
  labelSize?: string
  subtitleSize?: string
  labelColor?: string
  subtitleColor?: string
  footer?: ReactNode
  showGradientOverlay?: boolean
  loading?: boolean
}

const lighthouseMetrics = [
  { label: 'Performance', key: 'performance', color: '#8b5cf6' },
  { label: 'Accessibility', key: 'accessibility', color: '#10b981' },
  { label: 'SEO', key: 'seo', color: '#3b82f6' },
  { label: 'Best Practices', key: 'bestPractices', color: '#f59e0b' }
]

export default function LighthouseChart({
  performance,
  accessibility,
  seo,
  bestPractices,
  history,
  keywords = [],
  label = "Lighthouse Metrics",
  subtitle = "Performance Analysis",
  className = "",
  chartHeight = "h-64",
  cardPadding = "px-6 py-6",
  cardBackground = "bg-neutral-900/95",
  cardBorder = "border-neutral-800/50",
  cardRadius = "rounded-3xl",
  labelSize = "text-2xl",
  subtitleSize = "text-xs",
  labelColor = "text-primary-400",
  subtitleColor = "text-neutral-500",
  footer,
  showGradientOverlay = true,
  loading = false,
}: LighthouseChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)
  const [filterMode, setFilterMode] = useState<'latest' | 'all'>('all')

  // defensive defaults in case parent passes null/undefined
  const safeHistory = Array.isArray(history) ? history : []
  const hasAnyScore = [performance, accessibility, seo, bestPractices].some(
    (v) => v !== null && v !== undefined
  )
  // consider history 'present' only if at least one entry contains a numeric lighthouse value
  const historyHasValues = safeHistory.some((h) =>
    [h.lighthouse_performance, h.lighthouse_accessibility, h.lighthouse_seo, h.lighthouse_best_practices].some(
      (v) => v !== null && v !== undefined
    )
  )
  const showEmptyState = !loading && !hasAnyScore && !historyHasValues

  const scores = {
    performance,
    accessibility,
    seo,
    bestPractices
  }

  useEffect(() => {
    if (!chartRef.current) return

    // If there's no data to show, ensure any existing chart is disposed and skip init
    if (showEmptyState) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose()
        chartInstanceRef.current = null
      }
      return
    }

    const instance = echarts.init(chartRef.current, undefined, {
      renderer: 'canvas'
    })
    chartInstanceRef.current = instance

    // Determine how many data points to show based on filter mode
    const dataPoints = filterMode === 'latest' ? 1 : 7
    const historyData = safeHistory.slice(0, dataPoints).reverse()

    // Prepare historical data for bars
    const dates = historyData.map((item) => {
      const date = new Date(item.created_at)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      return `${dateStr}\n${timeStr}`
    })

    const perfData = historyData.map(h => (h.lighthouse_performance != null ? h.lighthouse_performance : null))
    const accessData = historyData.map(h => (h.lighthouse_accessibility != null ? h.lighthouse_accessibility : null))
    const seoData = historyData.map(h => (h.lighthouse_seo != null ? h.lighthouse_seo : null))
    const bpData = historyData.map(h => (h.lighthouse_best_practices != null ? h.lighthouse_best_practices : null))

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: '#444',
        textStyle: {
          color: '#fff'
        }
      },
      legend: {
        data: ['Performance', 'Accessibility', 'SEO', 'Best Practices'],
        bottom: 0,
        textStyle: {
          color: '#9ca3af',
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
        data: dates.length > 0 ? dates : ['Current'],
        axisLine: {
          lineStyle: {
            color: '#444'
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#9ca3af',
          fontSize: 10,
          interval: 0,
          lineHeight: 16
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
            color: '#374151',
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
          type: 'bar',
          data: perfData.length > 0 ? perfData : [performance],
          itemStyle: {
            color: '#8b5cf6'
          },
          borderRadius: [4, 4, 0, 0]
        },
        {
          name: 'Accessibility',
          type: 'bar',
          data: accessData.length > 0 ? accessData : [accessibility],
          itemStyle: {
            color: '#10b981'
          },
          borderRadius: [4, 4, 0, 0]
        },
        {
          name: 'SEO',
          type: 'bar',
          data: seoData.length > 0 ? seoData : [seo],
          itemStyle: {
            color: '#3b82f6'
          },
          borderRadius: [4, 4, 0, 0]
        },
        {
          name: 'Best Practices',
          type: 'bar',
          data: bpData.length > 0 ? bpData : [bestPractices],
          itemStyle: {
            color: '#f59e0b'
          },
          borderRadius: [4, 4, 0, 0]
        }
      ]
    }

    instance.setOption(option)

    const handleResize = () => instance?.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      instance?.dispose()
      chartInstanceRef.current = null
    }
  }, [performance, accessibility, seo, bestPractices, history, filterMode])

  return (
    <Card
      className={`relative border shadow-2xl backdrop-blur-sm ${cardBackground} ${cardBorder} ${cardRadius} ${className}`}
    >
      {/* Gradient overlay */}
      {showGradientOverlay && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-br from-neutral-800/30 via-transparent to-transparent" />
      )}

      <CardBody className={`relative ${cardPadding}`}>
        <div className="space-y-4">
          {/* Header with Dropdown - always show label even while loading */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className={`font-bold ${labelSize} ${labelColor}`}>{label}</p>
              {loading ? (
                <Skeleton className="h-3 w-24 rounded" />
              ) : (
                <p className={`${subtitleSize} ${subtitleColor}`}>{subtitle}</p>
              )}
            </div>

            {/* Right side: show skeleton while loading, otherwise the dropdown */}
            {loading ? (
              <Skeleton className="h-8 w-20 rounded" />
            ) : (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    className="bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 text-neutral-300"
                    size="sm"
                  >
                    <IconChevronDown size={18} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Filter metrics"
                  selectedKeys={[filterMode]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string
                    setFilterMode(selected as 'latest' | 'all')
                  }}
                  className="bg-neutral-900 border border-neutral-800"
                >
                  <DropdownItem
                    key="latest"
                    className={`${filterMode === 'latest' ? 'bg-neutral-800' : ''} text-neutral-300 hover:bg-neutral-800`}
                  >
                    Latest Metric Only
                  </DropdownItem>
                  <DropdownItem
                    key="all"
                    className={`${filterMode === 'all' ? 'bg-neutral-800' : ''} text-neutral-300 hover:bg-neutral-800`}
                  >
                    View History (7 Days)
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>

          {/* Chart & Scores (with empty-state handling) */}
          {loading ? (
            <div className="relative mx-auto w-full">
              <Skeleton className={`w-full ${chartHeight} rounded-lg`} />
            </div>
          ) : showEmptyState ? (
            <div className={`w-full ${chartHeight} rounded-lg border border-dashed border-neutral-800/40 p-6 flex flex-col items-center justify-center text-center gap-2`}>
              <p className="text-sm font-medium text-neutral-200">No Lighthouse data available</p>
              <p className="text-xs text-neutral-500">Run an analysis to populate performance, accessibility, SEO, and best practices scores.</p>
            </div>
          ) : (
            <>
              <div className="relative mx-auto w-full">
                <div ref={chartRef} className={`w-full ${chartHeight}`} />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {lighthouseMetrics.map((metric) => {
                  const value = scores[metric.key as keyof typeof scores]
                  return (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold" style={{ color: metric.color }}>
                          {value !== null && value !== undefined ? Math.round(value) : '—'}
                        </span>
                        <span className="text-xs text-neutral-400">/100</span>
                      </div>
                      <p className="text-xs text-neutral-300">{metric.label}</p>
                      {value !== null && value !== undefined && (
                        <Progress
                          value={value}
                          className="h-1.5"
                          color={metric.color === '#8b5cf6' ? 'secondary' : metric.color === '#10b981' ? 'success' : metric.color === '#3b82f6' ? 'primary' : 'warning'}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Top Keywords Cloud */}
          {!loading && keywords.length > 0 && (
            <div className="pt-4 border-t border-neutral-800/50">
              <p className="text-xs text-neutral-500 mb-2">Top Keywords</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => {
                  // Calculate font size based on position (descending order)
                  const maxSize = 16;
                  const minSize = 10;
                  const ratio = (keywords.length - index) / keywords.length;
                  const fontSize = minSize + (maxSize - minSize) * ratio;
                  
                  return (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-md bg-neutral-500/15 border border-neutral-500/30 text-neutral-300 font-medium whitespace-nowrap"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {keyword}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Footer */}
          {!loading && footer && <div className="mt-4">{footer}</div>}
        </div>
      </CardBody>
    </Card>
  )
}
