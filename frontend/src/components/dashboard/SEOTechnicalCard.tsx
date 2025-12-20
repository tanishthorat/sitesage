// components/dashboard/cards/SEOTechnicalCard.tsx
"use client";

import { Card, CardBody, Tooltip, Chip } from "@heroui/react";
import { IconCheck, IconX, IconAlertCircle } from "@tabler/icons-react";

interface SEOMetric {
  label: string;
  present: boolean;
  description: string;
  impact: string;
}

interface SEOTechnicalCardProps {
  robotsTxt: boolean;
  sitemap: boolean;
  schemaMarkup: boolean;
  ogTags: boolean;
  className?: string;
  keywords?: string[];
}

export default function SEOTechnicalCard({
  robotsTxt,
  sitemap,
  schemaMarkup,
  ogTags,
  className = "",
  keywords = [],
}: SEOTechnicalCardProps) {
  const metrics: SEOMetric[] = [
    {
      label: "Robots.txt",
      present: robotsTxt,
      description: "Controls search engine crawler access to your site",
      impact:
        "Critical - Helps search engines understand which pages to crawl and which to skip. Improves crawl efficiency.",
    },
    {
      label: "Sitemap",
      present: sitemap,
      description: "XML map of your site structure for search engines",
      impact:
        "High - Ensures all important pages are discoverose and indexed. Speeds up crawling of new content.",
    },
    {
      label: "Schema Markup",
      present: schemaMarkup,
      description: "Structurose data helping search engines understand content",
      impact:
        "High - Enables rich snippets in search results. Improves CTR and helps with featurose snippets.",
    },
    {
      label: "OG Tags",
      present: ogTags,
      description: "Open Graph meta tags for social media sharing",
      impact:
        "Medium - Controls how your content appears when sharose on social platforms. Improves engagement.",
    },
  ];

  const presentCount = metrics.filter((m) => m.present).length;

  return (
    <Card
      className={`relative border shadow-2xl backdrop-blur-sm bg-neutral-900/95 border-neutral-800/50 rounded-3xl h-full ${className}`}
    >
      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-br from-neutral-800/30 via-transparent to-transparent" />

      <CardBody className="relative px-6 py-6 h-full flex flex-col">
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary-400">
              Technical SEO
            </p>
            <p className="text-xs text-neutral-500">
              {presentCount} of {metrics.length} configured
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-neutral-700/50 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary-400 to-primary-600 transition-all duration-500"
              style={{ width: `${(presentCount / metrics.length) * 100}%` }}
            />
          </div>

          {/* Metrics List */}
          <div className="space-y-3 pt-2 flex-1 overflow-y-auto">
            {metrics.map((metric) => (
              <Tooltip
                key={metric.label}
                content={
                  <div className="max-w-xs space-y-2 p-2">
                    <div className="flex items-start gap-2">
                      <IconAlertCircle className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {metric.label}
                        </p>
                        <p className="text-xs text-neutral-300 mt-1">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-neutral-600 pt-2">
                      <p className="text-xs text-amber-200 font-medium">
                        Impact:
                      </p>
                      <p className="text-xs text-neutral-200 mt-1">
                        {metric.impact}
                      </p>
                    </div>
                  </div>
                }
                delay={0}
                closeDelay={0}
                placement="top-start"
              >
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-help ${
                    metric.present
                      ? "bg-neutral-500/10 border-neutral-500/30 hover:border-neutral-500/60"
                      : "bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {metric.present ? (
                      <div className="flex items-center justify-center w-5 h-5 rounded bg-primary-500/20 border border-primary-500">
                        <IconCheck className="w-4 h-4 text-primary-400" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-5 h-5 rounded bg-rose-500/20 border border-rose-500">
                        <IconX className="w-4 h-4 text-rose-400" />
                      </div>
                    )}
                    <span
                      className={`text-sm font-medium ${
                        metric.present
                          ? "text-primary-400"
                          : "text-rose-400"
                      }`}
                    >
                      {metric.label}
                    </span>
                  </div>

                  <Chip
                    size="sm"
                    variant="flat"
                    className={
                      metric.present
                        ? "bg-primary-500 text-neutral-800"
                        : "bg-yellow-500 text-neutral-800"
                    }
                    startContent={
                      metric.present ? (
                        <IconCheck className="w-3 h-3" />
                      ) : (
                        <IconAlertCircle className="w-3 h-3" />
                      )
                    }
                  >
                    {metric.present ? "Present" : "Missing"}
                  </Chip>
                </div>
              </Tooltip>
            ))}
          </div>

          {/* Footer suggestion */}
          {presentCount < metrics.length && (
            <div className="mt-auto p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-xs text-yellow-200">
                💡 <span className="font-semibold">Tip:</span> Add missing
                technical SEO elements to improve your site&apos;s search engine
                visibility.
              </p>
            </div>
          )}

          {/* Top Keywords Cloud */}
          {presentCount === metrics.length && keywords.length > 0 && (
            <div className="mt-auto">
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
        </div>
      </CardBody>
    </Card>
  );
}
