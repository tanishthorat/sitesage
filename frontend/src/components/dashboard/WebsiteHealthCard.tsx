// components/dashboard/cards/WebsiteHealthCard.tsx
"use client";

import GaugeCard from "./GaugeCard";
import { IconArrowUp, IconArrowDown } from "@tabler/icons-react";

interface WebsiteHealthCardProps {
  score: number;
  performance: number | null;
  trend?: number;
}

export default function WebsiteHealthCard({
  score,
  performance,
  trend,
}: WebsiteHealthCardProps) {
  // Calculate overall health (weighted average)
  const healthScore = performance !== null 
    ? Math.round(score * 0.6 + performance * 0.4)
    : score;

  const getHealthStatus = () => {
    if (healthScore >= 90)
      return {
        text: "Excellent",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
      };
    if (healthScore >= 70)
      return {
        text: "Good",
        color: "text-primary-600 dark:text-primary-400",
        bg: "bg-primary-50 dark:bg-primary-900/20",
      };
    if (healthScore >= 50)
      return {
        text: "Fair",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/20",
      };
    return {
      text: "Needs Work",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
    };
  };

  const status = getHealthStatus();

  // Custom footer with trend and status
  const footer = (
    <>
      {trend !== undefined && trend !== 0 && (
        <div
          className={`flex items-center justify-center gap-1 text-sm font-medium ${
            trend > 0 ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {trend > 0 ? (
            <IconArrowUp className="w-4 h-4" />
          ) : (
            <IconArrowDown className="w-4 h-4" />
          )}
          <span>{Math.abs(trend).toFixed(1)} points vs last scan</span>
        </div>
      )}

      <div className={`mt-3 p-3 ${status.bg} rounded-lg text-center`}>
        <span className={`text-sm font-semibold ${status.color}`}>
          {status.text}
        </span>
      </div>
    </>
  );

  return (
    <GaugeCard
      label="Website Health"
      subtitle="Overall Status"
      score={healthScore}
      showPercentage={true}
      gaugeConfig={{
        progressWidth: 14,
        scoreFontSize: 48,
        showAxisLabels: false,
      }}
      footer={footer}
    />
  );
}
