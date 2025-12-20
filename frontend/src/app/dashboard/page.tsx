"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { useRouter } from "next/navigation";
import api, { apiEndpoints } from "@/lib/api";
import { Report } from "@/types/api";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import HistorySection from "@/components/dashboard/HistorySection";
import { IconRefresh, IconPlus } from "@tabler/icons-react";
import { Button } from "@heroui/react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { selectedProject, setSelectedProject } = useDashboard();
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [recentScans, setRecentScans] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);

  const fetchDashboardData = async (projectUrl?: string) => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      setError("");

      // Fetch unique URLs to get projects
      const historyResponse = await api.get(apiEndpoints.historyUnique);
      const urls = historyResponse.data;

      if (urls && urls.length > 0) {
        // Use provided projectUrl or default to first URL or currently selected
        const targetUrl = projectUrl || selectedProject || urls[0].url;

        if (!selectedProject) {
          setSelectedProject(targetUrl);
        }

        // Get the URL's full history
        const reportsResponse = await api.get(
          apiEndpoints.historyByUrl(targetUrl)
        );
        const reports = reportsResponse.data;

        if (reports && reports.length > 0) {
          // Latest report is the first one (sorted by date desc)
          setLatestReport(reports[0]);
          setSelectedReport(reports[0]);
          // Last 10 scans for history tabs
          setRecentScans(reports.slice(0, 10));
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } else {
        console.error("Unexpected error:", err);
        setError("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
      hasLoadedRef.current = true;
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    if (!hasLoadedRef.current) {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(selectedProject || undefined);
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    if (selectedProject) {
      fetchDashboardData(selectedProject);
    }
  }, [selectedProject]);

  const handleNewAnalysis = () => {
    router.push("/");
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
  };

  const handleAnalyzeAgain = async () => {
    if (!selectedProject) return;
    
    try {
      setRefreshing(true);
      // Make a new analysis request for the selected project URL
      await api.post(apiEndpoints.analyze, {
        url: selectedProject,
      });
      
      // Refresh the dashboard data to get the new report
      await fetchDashboardData(selectedProject);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error analyzing URL:", err);
        setError(err.message || "Failed to analyze URL");
      } else {
        console.error("Unexpected error:", err);
        setError("Failed to analyze URL");
      }
    } finally {
      setRefreshing(false);
    }
  };

  const getProjectDisplayName = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="pt-16 lg:pt-0">
      <div className="bg-white dark:bg-neutral-800 m-3 lg:m-6 rounded-xl shadow-sm ">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-2 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white">
                SEO Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Project:{" "}
                {selectedProject
                  ? getProjectDisplayName(selectedProject)
                  : "Loading..."}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">|
              {/* for pdf export  */}
              {/* <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
              >
                <IconRefresh
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Full Report</span>
                <span className="sm:hidden">Report</span>
              </Button> */}
              <Button
                onPress={handleNewAnalysis}
                color="primary"
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5  text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <IconPlus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-400">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 dark:border-neutral-700 border-t-primary-600 dark:border-t-primary-400 mb-4"></div>
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                  Loading your dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-400 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Dashboard Content */}
          {!loading && !error && (
            <>
              {/* History Section - Tabs */}
              <HistorySection
                history={recentScans}
                selectedReport={selectedReport}
                onSelectReport={handleSelectReport}
                onAnalyzeAgain={handleAnalyzeAgain}
              />

              {/* Metrics Grid - Bento Layout */}
              <MetricsGrid
                report={selectedReport}
                trends={null}
                history={recentScans}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
