// components/dashboard/cards/ContentMetricsCard.tsx
"use client";

import {
  IconFileText,
  IconH1,
  IconH2,
  IconPhoto,
  IconChevronDown,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Accordion, AccordionItem, Chip, ScrollShadow, Skeleton } from "@heroui/react";
import {
  getWordCountReview,
  getH1Review,
  getH2Review,
  getImagesReview,
  getStatusChipProps,
} from "@/constants/contentMetricsReviews";

export interface ContentMetricsCardProps {
  /** Total word count */
  wordCount: number;
  /** H1 heading count */
  h1Count: number;
  /** H2 heading count */
  h2Count: number;
  /** Total image count */
  imageCount: number;
  /** Missing alt tags count */
  missingAltCount: number;
  /** Optional time period label */
  period?: string;
  /** Optional className for custom styling */
  className?: string;
  /** Optional trend data for each metric */
  trends?: {
    words?: number;
    h1?: number;
    h2?: number;
    images?: number;
  };
  /** Optional click handler for metric items */
  onMetricClick?: (metricId: string) => void;
  /** Show loading skeleton */
  loading?: boolean;
}

/**
 * ContentMetricsCard - Displays SEO content metrics with reviews and recommendations
 */
export default function ContentMetricsCard({
  wordCount,
  h1Count,
  h2Count,
  imageCount,
  missingAltCount,
  period = "This month",
  className = "",
  trends,
  loading = false,
}: ContentMetricsCardProps) {
  const getTrendIcon = (trend?: number) => {
    if (!trend) return null;
    if (trend > 0)
      return <IconTrendingUp size={14} className="text-emerald-500" />;
    if (trend < 0)
      return <IconTrendingDown size={14} className="text-red-500" />;
    return <IconMinus size={14} className="text-neutral-500" />;
  };

  const getTrendText = (trend?: number) => {
    if (!trend) return null;
    const sign = trend > 0 ? "+" : "";
    return `${sign}${trend}%`;
  };

  const getMissingAltReview = (count: number) => {
    if (count === 0) {
      return {
        icon: IconFileText,
        status: "excellent" as const,
        title: "All images have alt text",
        message: "Excellent! All your images have descriptive alt tags, which helps with SEO and accessibility.",
        bgColor: "bg-emerald-500/10",
        color: "text-emerald-400",
      };
    } else if (count <= 3) {
      return {
        icon: IconAlertTriangle,
        status: "fair" as const,
        title: `${count} image${count > 1 ? "s" : ""} missing alt text`,
        message: "Add descriptive alt tags to improve SEO and accessibility for users with screen readers.",
        bgColor: "bg-amber-500/10",
        color: "text-amber-400",
      };
    } else {
      return {
        icon: IconAlertTriangle,
        status: "poor" as const,
        title: `${count} images missing alt text`,
        message: "This significantly impacts your SEO and accessibility. Prioritize adding alt tags to all images.",
        bgColor: "bg-red-500/10",
        color: "text-red-400",
      };
    }
  };

  const metrics = [
    {
      id: "words",
      label: "Word Count",
      value: wordCount,
      icon: IconFileText,
      bgColor: "bg-primary-500/10",
      iconColor: "text-primary-500",
      trend: trends?.words,
      review: getWordCountReview(wordCount),
    },
    {
      id: "h1",
      label: "H1 Tags",
      value: h1Count,
      icon: IconH1,
      bgColor: "bg-secondary-500/10",
      iconColor: "text-secondary-500",
      trend: trends?.h1,
      review: getH1Review(h1Count),
    },
    {
      id: "h2",
      label: "H2 Tags",
      value: h2Count,
      icon: IconH2,
      bgColor: "bg-warning-500/10",
      iconColor: "text-warning-500",
      trend: trends?.h2,
      review: getH2Review(h2Count),
    },
    {
      id: "images",
      label: "Images",
      value: imageCount,
      icon: IconPhoto,
      bgColor: "bg-info-500/10",
      iconColor: "text-info-500",
      trend: trends?.images,
      review: getImagesReview(imageCount),
    },
    {
      id: "missingAlt",
      label: "Missing Alt Tags",
      value: missingAltCount,
      icon: IconAlertTriangle,
      bgColor: missingAltCount === 0 ? "bg-emerald-500/10" : missingAltCount <= 3 ? "bg-amber-500/10" : "bg-red-500/10",
      iconColor: missingAltCount === 0 ? "text-emerald-500" : missingAltCount <= 3 ? "text-amber-500" : "text-red-500",
      trend: undefined,
      review: getMissingAltReview(missingAltCount),
    },
  ];

  return (
    <div
      className={`relative flex flex-col rounded-3xl border border-neutral-800/50 bg-neutral-900/95 px-6 py-6 shadow-2xl backdrop-blur-sm ${className}`}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-neutral-800/30 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          {loading ? (
            <>
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-primary-400">
                Content Metrics
              </h3>

              {/* Period Dropdown */}
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-neutral-300"
              >
                {period}
              </button>
            </>
          )}
        </div>

        {/* Metrics List with Accordion */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : (
        <ScrollShadow visibility="none" hideScrollBar className="max-h-68">
          <Accordion
            variant="splitted"
            className="px-0"
            itemClasses={{
              base: "bg-neutral-800/30 border border-neutral-700/50",
              title: "text-neutral-200 text-sm font-medium",
              trigger: "py-3 px-3",
              content: "px-3 pb-3 pt-1",
            }}
          >
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const ReviewIcon = metric.review.icon;
              const chipProps = getStatusChipProps(metric.review.status);

              return (
                <AccordionItem
                  key={metric.id}
                  aria-label={metric.label}
                  title={
                    <div className="flex items-center gap-3 w-full">
                      {/* Icon */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${metric.bgColor}`}
                      >
                        <Icon size={18} className={metric.iconColor} />
                      </div>

                      {/* Label & Value */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium text-neutral-200">
                          {metric.label}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-neutral-500">
                            {metric.value.toLocaleString()}
                          </span>
                          {metric.trend !== undefined && (
                            <div className="flex items-center gap-1">
                              {getTrendIcon(metric.trend)}
                              <span
                                className={`text-xs ${
                                  metric.trend > 0
                                    ? "text-emerald-500"
                                    : metric.trend < 0
                                    ? "text-red-500"
                                    : "text-neutral-500"
                                }`}
                              >
                                {getTrendText(metric.trend)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Chip */}
                      <Chip
                        size="sm"
                        color={chipProps.color}
                        variant={chipProps.variant}
                        className="capitalize"
                      >
                        {metric.review.status}
                      </Chip>
                    </div>
                  }
                >
                  {/* Review Content */}
                  <div className={`rounded-lg p-3 ${metric.review.bgColor}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex shrink-0 mt-0.5">
                        <ReviewIcon size={20} className={metric.review.color} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4
                          className={`text-sm font-semibold ${metric.review.color}`}
                        >
                          {metric.review.title}
                        </h4>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {metric.review.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollShadow>
        )}
      </div>
    </div>
  );
}
