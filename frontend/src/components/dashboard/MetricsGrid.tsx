// components/dashboard/MetricsGrid.tsx
"use client";

import LoadTimeCard from "./LoadTimeCard";
import ContentMetricsCard from "./ContentMetricsCard";
import LighthouseChart from "./LighthouseChart";
import WebsiteHealthCard from "./WebsiteHealthCard";
import OptimizationIdeasCard from "./OptimizationIdeasCard";
import AIInsightsCard from "./AIInsightsCard";
import { Report } from "@/types/api";
import GaugeCard from "./GaugeCard";

interface TrendsData {
  performance?: number
  accessibility?: number
  seo?: number
  bestPractices?: number
  load_time?: number
}

interface MetricsGridProps {
  report: Report | null;
  trends: TrendsData | null;
  history: Report[];
}

export default function MetricsGrid({
  report,
  trends,
  history,
}: MetricsGridProps) {
  if (!report) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Reports Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Start by analyzing your first website
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Analyze Your First Website
        </button>
      </div>
    );
  }

  // Check if current report is the latest one
  const isLatestReport = history.length > 0 && history[0].id === report.id;

  return (
    <div className="space-y-6">
      {/* Bento Grid Layout - Row 1: Three cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <GaugeCard
          label="SEO Score"
          subtitle={isLatestReport ? "Latest Result" : "Previous Result"}
          score={report.seo_score}
        />

        <LoadTimeCard
          loadTime={report.load_time}
          trend={trends?.load_time}
          history={history
            .map((h) => h.load_time)
            .filter(Boolean)
            .slice(0, 7)}
        />

        <ContentMetricsCard
          wordCount={report.word_count}
          h1Count={report.h1_count}
          h2Count={report.h2_count}
          imageCount={report.image_count}
        />
      </div>

      {/* Row 2: Large Lighthouse chart (2 cols) + Website Health card (1 col) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Large card spanning 2 columns on desktop */}
        <div className="md:col-span-2">
          <LighthouseChart
            performance={report.lighthouse_performance}
            accessibility={report.lighthouse_accessibility}
            seo={report.lighthouse_seo}
            bestPractices={report.lighthouse_best_practices}
            history={history.slice(0, 7)}
            robotsTxt={report.robots_txt_exists}
            sitemap={report.sitemap_exists}
            ogTags={report.og_tags_present}
            schema={report.schema_present}
          />
        </div>

        {/* Website Health Card */}
        <div>
          <WebsiteHealthCard
            score={report.seo_score}
            performance={report.lighthouse_performance}
            trend={trends?.seo}
          />
        </div>
      </div>

      {/* Row 3: Optimization Ideas Card */}
      <div className="grid grid-cols-1">
        <OptimizationIdeasCard suggestions={report.ai_suggestions || []} />
      </div>

      {/* Row 4: Full-width AI Insights */}
      <div className="grid grid-cols-1">
        <AIInsightsCard
          summary={report.ai_summary}
          suggestions={report.ai_suggestions || []}
          url={report.url}
        />
      </div>
    </div>
  );
}
