// components/dashboard/HistorySection.tsx
"use client";

import { IconRefresh } from "@tabler/icons-react";
import { Report } from "@/types/api";
import { useRef, useState, useEffect } from "react";
import { Button, Tabs, Tab, ScrollShadow, Tooltip } from "@heroui/react";

interface HistorySectionProps {
  history: Report[];
  selectedReport: Report | null;
  onSelectReport: (report: Report) => void;
  onAnalyzeAgain?: () => void | Promise<void>;
}

export default function HistorySection({
  history,
  selectedReport,
  onSelectReport,
  onAnalyzeAgain,
}: HistorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const formatTabDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Otherwise show date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAnalyzeAgain = async () => {
    if (onAnalyzeAgain && !isAnalyzing) {
      setIsAnalyzing(true);
      try {
        await onAnalyzeAgain();
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Tabs Container */}
      <div className="relative flex items-center gap-2">
        {/* Analyze Again Button */}
        {onAnalyzeAgain && (
          <Tooltip content={isAnalyzing ? "Analyzing..." : "Analyze Again"}>
            <Button
              isIconOnly
              onPress={handleAnalyzeAgain}
              isLoading={isAnalyzing}
              disabled={isAnalyzing}
              size="lg"
              title={isAnalyzing ? "Analyzing..." : "Analyze Again"}
            >
              <IconRefresh
                size={18}
                className={isAnalyzing ? "animate-spin" : ""}
              />
            </Button>
          </Tooltip>
        )}

        {/* History Tabs */}
        <ScrollShadow
          className="flex-1 w-full [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          hideScrollBar
        >
          <Tabs
            aria-label="History tabs"
            selectedKey={String(
              history.findIndex((h) => h.id === selectedReport?.id) || 0
            )}
            onSelectionChange={(key) => {
              const index = Number(key);
              if (history[index]) onSelectReport(history[index]);
            }}
            classNames={{
              base: "w-fit",
              tabList: "gap-2 p-0 bg-transparent",
              tab: "px-4 py-2.5 h-auto data-[selected=true]:bg-primary-500/20 data-[selected=true]:border data-[selected=true]:border-primary-500/60 data-[selected=true]:text-primary-300 data-[selected=true]:shadow-lg data-[selected=true]:shadow-primary-500/20 bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg font-medium text-sm whitespace-nowrap",
              cursor: "hidden",
              tabContent:
                "group-data-[selected=true]:text-primary-300 text-current",
            }}
          >
            {history.map((report, index) => (
              <Tab
                key={index}
                title={
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-semibold">
                      {formatTabDate(report.created_at)}
                    </span>
                    <span className="text-xs">
                      {formatTime(report.created_at)}
                    </span>
                  </div>
                }
              />
            ))}
          </Tabs>
        </ScrollShadow>
      </div>
    </div>
  );
}
