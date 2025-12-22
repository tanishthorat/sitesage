// components/dashboard/cards/GaugeCard.tsx
"use client";

import { useEffect, useRef, ReactNode, useMemo } from "react";
import * as echarts from "echarts/core";
import { GaugeChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { TooltipComponent } from "echarts/components";
import { Card, CardBody, Skeleton } from "@heroui/react";

// Register only required ECharts components for optimal bundle size
echarts.use([GaugeChart, CanvasRenderer, TooltipComponent]);

export interface GaugeConfig {
  /** Gradient colors for progress bar [start, middle, end] */
  progressColors?: [string, string, string];
  /** Track (background) color */
  trackColor?: string;
  /** Progress bar width */
  progressWidth?: number;
  /** Score text color */
  scoreColor?: string;
  /** Score font size */
  scoreFontSize?: number;
  /** Show axis labels (0, 100) */
  showAxisLabels?: boolean;
  /** Axis label color */
  axisLabelColor?: string;
  /** Axis label font size */
  axisLabelFontSize?: number;
}

export interface GaugeCardProps {
  /** Card title displayed at the top */
  title?: string;
  /** Primary label below title */
  label?: string;
  /** Secondary label (subtitle) */
  subtitle?: string;
  /** SEO score value (0-100) */
  score: number;
  /** Optional className for custom styling */
  className?: string;
  /** Show percentage sign after score */
  showPercentage?: boolean;
  /** Chart height (Tailwind class like 'h-48', 'h-32', etc.) */
  chartHeight?: string;
  /** Card padding (Tailwind class like 'p-6', 'p-4', etc.) */
  cardPadding?: string;
  /** Card background color (Tailwind class) */
  cardBackground?: string;
  /** Card border color (Tailwind class) */
  cardBorder?: string;
  /** Card border radius (Tailwind class) */
  cardRadius?: string;
  /** Label text size (Tailwind class) */
  labelSize?: string;
  /** Subtitle text size (Tailwind class) */
  subtitleSize?: string;
  /** Label text color (Tailwind class) */
  labelColor?: string;
  /** Subtitle text color (Tailwind class) */
  subtitleColor?: string;
  /** Custom gauge configuration */
  gaugeConfig?: GaugeConfig;
  /** Additional footer content */
  footer?: ReactNode;
  /** Show gradient overlay */
  showGradientOverlay?: boolean;
  /** Show loading skeleton */
  loading?: boolean;
}

export default function GaugeCard({
  label = "SEO Score",
  subtitle = "Latest Result",
  score,
  className = "",
  showPercentage = false,
  chartHeight = "h-48",
  cardPadding = "px-6 py-6",
  cardBackground = "bg-neutral-900/95",
  cardBorder = "border-neutral-800/50",
  cardRadius = "rounded-3xl",
  labelSize = "text-2xl",
  subtitleSize = "text-xs",
  labelColor = "text-primary-400",
  subtitleColor = "text-neutral-500",
  gaugeConfig,
  footer,
  showGradientOverlay = true,  loading = false,}: GaugeCardProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  // Memoize config to prevent recreation on every render
  const config = useMemo(() => {
    const defaultGaugeConfig: GaugeConfig = {
      progressColors: ["#87ce5b", "#60BE25", "#51a11f"],
      trackColor: "#1e293b",
      progressWidth: 24,
      scoreColor: "#60BE25",
      scoreFontSize: 48,
      showAxisLabels: true,
      axisLabelColor: "#9ca3af",
      axisLabelFontSize: 14,
    };
    return { ...defaultGaugeConfig, ...gaugeConfig };
  }, [gaugeConfig]);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize chart instance
    const instance = echarts.init(chartRef.current, undefined, {
      renderer: "canvas",
    });
    chartInstanceRef.current = instance;

    // Clamp score to valid range
    const clampedScore = Math.max(0, Math.min(100, score));

    const option: echarts.EChartsCoreOption = {
      tooltip: { show: false },
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: "100%",
          center: ["50%", "70%"],
          pointer: { show: false },
          progress: {
            show: true,
            roundCap: true,
            width: config.progressWidth,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: config.progressColors![0] },
                { offset: 0.5, color: config.progressColors![1] },
                { offset: 1, color: config.progressColors![2] },
              ]),
            },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: config.progressWidth,
              color: [[1, config.trackColor!]],
            },
          },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            show: config.showAxisLabels,
            distance: -55,
            color: config.axisLabelColor,
            fontSize: config.axisLabelFontSize,
            fontWeight: 500,
            formatter: (value: number) => {
              if (value === 0) return "0";
              if (value === 100) return "100";
              return "";
            },
          },
          detail: {
            show: true,
            valueAnimation: true,
            formatter: (value: number) => {
              const roundedValue = Math.round(value);
              return showPercentage ? `${roundedValue}%` : `${roundedValue}`;
            },
            fontSize: config.scoreFontSize,
            fontWeight: 700,
            color: config.scoreColor,
            offsetCenter: [0, "-15%"],
          },
          title: { show: false },
          data: [{ value: clampedScore }],
        },
      ],
    };

    instance.setOption(option);

    // Handle window resize
    const handleResize = () => {
      instance?.resize();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      instance?.dispose();
      chartInstanceRef.current = null;
    };
  }, [score, showPercentage, config]);

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

          {/* Gauge Chart Container */}
          <div className="relative mx-auto w-full">
            {loading ? (
              <Skeleton className={`w-full ${chartHeight} rounded-lg`} />
            ) : (
              <div ref={chartRef} className={`w-full ${chartHeight}`} />
            )}
          </div>

          {/* Optional Footer */}
          {!loading && footer && <div className="mt-4">{footer}</div>}
        </div>
      </CardBody>
    </Card>
  );
}
