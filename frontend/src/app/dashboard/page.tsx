"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api, { apiEndpoints } from "@/lib/api";
import { Report } from "@/types/api";
import Sidebar from "@/components/ui/SidebarHeroUI";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import HistorySection from "@/components/dashboard/HistorySection";
import { IconRefresh, IconPlus } from "@tabler/icons-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [recentScans, setRecentScans] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
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
          // Last 7 scans for history
          setRecentScans(reports.slice(0, 7));
        }
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.error || "Failed to load dashboard data");
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

  const handleProjectChange = (url: string) => {
    setSelectedProject(url);
    fetchDashboardData(url);
  };

  const handleNewAnalysis = () => {
    router.push("/");
  };

  const handleViewDetail = (reportId: number) => {
    router.push(`/report/${reportId}`);
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Sidebar */}
      <Sidebar
        selectedProject={selectedProject}
        onProjectChange={handleProjectChange}
      />

      {/* Main Content */}
      <div className="">
        <div className="bg-white dark:bg-neutral-800  lg:m-6 rounded-xl shadow-sm ">
          <div className="p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
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
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
                >
                  <IconRefresh
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Full Report</span>
                  <span className="sm:hidden">Report</span>
                </button>
                <button
                  onClick={handleNewAnalysis}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <IconPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Project +</span>
                  <span className="sm:hidden">New +</span>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center min-h-[400px]">
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
                {/* Metrics Grid - Bento Layout */}
                <MetricsGrid
                  report={latestReport}
                  trends={null}
                  history={recentScans}
                />

                {/* History Section */}
                <HistorySection
                  history={recentScans}
                  onViewDetail={handleViewDetail}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
