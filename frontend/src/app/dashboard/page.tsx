"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/contexts/DashboardContext";
import { useRouter } from "next/navigation";
import api, { apiEndpoints } from "@/lib/api";
import { Report } from "@/types/api";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import HistorySection from "@/components/dashboard/HistorySection";
import { IconRefresh, IconPlus, IconSparkles, IconSearch } from "@tabler/icons-react";
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
  const [isEmpty, setIsEmpty] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) {
      const error = err as Error & { response?: { status: number }; code?: string };
      
      // Handle 503 Service Unavailable
      if (error.response?.status === 503) {
        return "Service temporarily unavailable. Please try again in a few moments.";
      }
      
      // Handle 502 Bad Gateway
      if (error.response?.status === 502) {
        return "Connection error. Please check your internet and try again.";
      }
      
      // Handle 500 Server Error
      if (error.response?.status === 500) {
        return "Server error. Our team has been notified. Please try again later.";
      }
      
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        return "Session expired. Please log in again.";
      }
      
      // Handle 404 Not Found
      if (error.response?.status === 404) {
        return "No projects found. Create a new project to get started.";
      }
      
      // Handle timeout
      if (error.code === "ECONNABORTED") {
        return "Request timeout. Please check your connection and try again.";
      }
      
      // Network error
      if (error.message === "Network Error") {
        return "Network error. Please check your internet connection.";
      }
      
      return error.message || "Failed to load dashboard data";
    }
    return "Failed to load dashboard data";
  };

  const fetchDashboardData = async (projectUrl?: string) => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      setError("");
      setIsEmpty(false);

      // Fetch unique URLs to get projects
      try {
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
            setIsEmpty(false);
          }
        } else {
          // No projects found - this is not an error, it's an empty state
          setIsEmpty(true);
          setLatestReport(null);
          setSelectedReport(null);
          setRecentScans([]);
        }
      } catch (err: unknown) {
        const errorObj = err as Error & { response?: { status: number } };
        
        // Check if it's a 404 (no projects) vs actual error
        if (errorObj.response?.status === 404) {
          setIsEmpty(true);
          setError("");
        } else {
          const errorMsg = getErrorMessage(err);
          console.error("Error fetching dashboard data:", err);
          setError(errorMsg);
        }
        
        // Set empty state for fallback
        setLatestReport(null);
        setSelectedReport(null);
        setRecentScans([]);
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
      setError("");
      
      // Make a new analysis request for the selected project URL
      await api.post(apiEndpoints.analyze, {
        url: selectedProject,
      });
      
      // Refresh the dashboard data to get the new report
      await fetchDashboardData(selectedProject);
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      console.error("Error analyzing URL:", err);
      setError(errorMsg);
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
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
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
          {error && !loading && !isEmpty && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Unable to Load Dashboard
                  </h3>
                  <p className="text-amber-800 dark:text-amber-300 text-sm mb-4">
                    {error}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onPress={handleRefresh}
                      disabled={refreshing}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <IconRefresh className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                      Try Again
                    </Button>
                    <Button
                      onPress={handleNewAnalysis}
                      className="px-4 py-2 border border-amber-300 dark:border-amber-700 bg-transparent hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <IconPlus className="w-4 h-4" />
                      New Project
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State - No Projects */}
          {isEmpty && !loading && !error && (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center max-w-md px-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 border-2 border-primary-500/30 mb-6">
                  <IconSparkles className="w-10 h-10 text-primary-500" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                  Welcome to Your SEO Dashboard
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                  You haven&apos;t analyzed any websites yet. Start your SEO journey by analyzing your first URL to get comprehensive insights and recommendations.
                </p>
                <Button
                  onPress={handleNewAnalysis}
                  color="primary"
                  size="lg"
                  className="px-8 py-3 text-white rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
                  startContent={<IconSearch className="w-5 h-5" />}
                >
                  Analyze Your First Website
                </Button>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-700/50">
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1">
                      Deep Analysis
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Get detailed SEO metrics and performance scores
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-700/50">
                    <div className="text-2xl mb-2">🤖</div>
                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1">
                      AI Insights
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Receive AI-powered recommendations
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-700/50">
                    <div className="text-2xl mb-2">📈</div>
                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1">
                      Track Progress
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Monitor improvements over time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          {!loading && !error && !isEmpty && (
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
