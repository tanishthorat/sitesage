"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api, { apiEndpoints } from "@/lib/api";
import { Report } from "@/types/api";
import AppNavbar from "@/components/Navbar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import HistorySection from "@/components/dashboard/HistorySection";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const [recentScans, setRecentScans] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasLoadedRef = useRef(false);

  const fetchDashboardData = async () => {
    if (!user || authLoading) return;
    if (hasLoadedRef.current) return;

    try {
      setLoading(true);
      setError("");
      hasLoadedRef.current = true;

      // Fetch unique URLs to get the latest report
      const historyResponse = await api.get(apiEndpoints.historyUnique);
      const urls = historyResponse.data;

      if (urls && urls.length > 0) {
        // Get the first URL's full history
        const firstUrl = urls[0].url;
        const reportsResponse = await api.get(
          apiEndpoints.historyByUrl(firstUrl)
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
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    fetchDashboardData();
  }, [user, authLoading, router]);

  const handleRefresh = () => {
    hasLoadedRef.current = false;
    fetchDashboardData();
  };

  const handleNewAnalysis = () => {
    router.push("/");
  };

  const handleViewDetail = (reportId: number) => {
    router.push(`/report/${reportId}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader onRefresh={handleRefresh} />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-100">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
              <p className="text-neutral-600 dark:text-neutral-400">
                Loading your dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
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
      </main>
    </div>
  );
}
