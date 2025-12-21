// components/dashboard/cards/LoadTimeCard.tsx
"use client"

import { useEffect, useRef, ReactNode, useMemo } from 'react'
import * as echarts from 'echarts'
import { Card, CardBody, Skeleton } from '@heroui/react'
import { IconArrowUp, IconArrowDown, IconCheck, IconAlertTriangle, IconX } from '@tabler/icons-react'

interface LoadTimeCardProps {
  loadTime: number
  trend?: number
  history?: number[]
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

export default function LoadTimeCard({
  loadTime,
  trend,
  history = [],
  label = "Page Load Time",
  subtitle = "Latest Result",
  className = "",
  chartHeight = "h-48",
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
}: LoadTimeCardProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)

  // Memoize status color to prevent unnecessary re-renders
  const statusColor = useMemo(() => {
    if (loadTime < 1) return { text: 'text-emerald-400', value: '#10b981' }
    if (loadTime < 2) return { text: 'text-amber-400', value: '#f59e0b' }
    return { text: 'text-red-400', value: '#ef4444' }
  }, [loadTime])

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    return history.length > 0
      ? history.slice(0, 7).reverse()
      : [0.9, 0.85, 0.82, 0.78, 0.80, 0.76, loadTime]
  }, [history, loadTime])

  useEffect(() => {
    // Don't render chart while loading or if no ref
    if (loading || !chartRef.current) return

    // Dispose existing instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.dispose()
      chartInstanceRef.current = null
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!chartRef.current) return

      try {
        const instance = echarts.init(chartRef.current, undefined, {
          renderer: 'canvas'
        })
        chartInstanceRef.current = instance

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
            data: chartData.map((_, i) => i)
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
                color: statusColor.value,
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
                      color: statusColor.value + '40'
                    },
                    {
                      offset: 1,
                      color: statusColor.value + '08'
                    }
                  ]
                }
              },
              data: chartData
            }
          ]
        }

        instance.setOption(option)

        // Resize handler
        const handleResize = () => {
          if (chartInstanceRef.current) {
            chartInstanceRef.current.resize()
          }
        }
        window.addEventListener('resize', handleResize)

        // Store cleanup function
        return () => {
          window.removeEventListener('resize', handleResize)
        }
      } catch (error) {
        console.error('Error initializing LoadTimeCard chart:', error)
      }
    }, 50)

    return () => {
      clearTimeout(timeoutId)
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.dispose()
        } catch (error) {
          console.error('Error disposing chart:', error)
        }
        chartInstanceRef.current = null
      }
    }
  }, [chartData, statusColor, loading])

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
          {/* Header */}
          <div className="space-y-1">
            {loading ? (
              <>
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </>
            ) : (
              <>
                <p className={`font-bold ${labelSize} ${labelColor}`}>{label}</p>
                <p className={`${subtitleSize} ${subtitleColor}`}>{subtitle}</p>
              </>
            )}
          </div>

          {/* Load Time Value and Trend */}
          {loading ? (
            <>
              <Skeleton className="h-12 w-24 rounded" />
              <Skeleton className="h-8 w-40 rounded" />
              <Skeleton className={`w-full ${chartHeight} rounded-lg`} />
            </>
          ) : (
            <>
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-bold ${statusColor.text}`}>
                {loadTime?.toFixed(2)}s
              </span>
              {trend !== undefined && trend !== 0 && (
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    trend < 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {trend < 0 ? (
                    <IconArrowDown className="w-4 h-4" />
                  ) : (
                    <IconArrowUp className="w-4 h-4" />
                  )}
                  <span>{Math.abs(trend).toFixed(2)}s</span>
                </div>
              )}
            </div>

            {/* Status text */}
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
              {loadTime < 1 ? (
                <>
                  <IconCheck className="w-5 h-5 text-emerald-400" />
                  <span>Fast - Excellent performance</span>
                </>
              ) : loadTime < 2 ? (
                <>
                  <IconAlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Average - Could be optimized</span>
                </>
              ) : (
                <>
                  <IconX className="w-5 h-5 text-red-400" />
                  <span>Slow - Needs optimization</span>
                </>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="relative mx-auto w-full">
            <div ref={chartRef} className={`w-full ${chartHeight}`} />
          </div>

          {/* Optional Footer */}
          {!loading && footer && <div className="mt-4">{footer}</div>}
            </>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

