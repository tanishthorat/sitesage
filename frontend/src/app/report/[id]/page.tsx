"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button, Skeleton } from "@heroui/react";
import { Report } from "@/types/api";
import AppNavbar from "@/components/Navbar";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import { IconLock } from "@tabler/icons-react";
import {
  fetchReportById,
  hasLighthouseMetrics,
  pollLighthouseMetrics,
} from "@/services/reportService";
import PDFDownloadButton from "@/components/dashboard/pdf/PDFDownloadButton";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lighthouseLoading, setLighthouseLoading] = useState(false);
  const cleanupPollingRef = useRef<(() => void) | null>(null);
  const hasLoadedRef = useRef(false); // Prevent duplicate loads

  // Unwrap params promise
  useEffect(() => {
    params.then((p) => setReportId(p.id));
  }, [params]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (cleanupPollingRef.current) {
        cleanupPollingRef.current();
        cleanupPollingRef.current = null;
      }
    };
  }, []);

  // Fetch report data
  useEffect(() => {
    if (!reportId) return;
    if (authLoading) return; // Wait for auth to be ready
    if (hasLoadedRef.current) return; // Prevent duplicate loads

    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");
        hasLoadedRef.current = true; // Mark as loaded

        const result = await fetchReportById(reportId, !!user);

        if (result.error) {
          setError(result.error);
          setReport(null);
          return;
        }

        if (result.data) {
          setReport(result.data);

          // Start polling for Lighthouse metrics if not loaded
          if (!hasLighthouseMetrics(result.data)) {
            setLighthouseLoading(true);

            cleanupPollingRef.current = await pollLighthouseMetrics(
              reportId,
              !!user,
              (updatedReport) => {
                setReport(updatedReport);
              },
              () => {
                setLighthouseLoading(false);
                cleanupPollingRef.current = null;
              },
              24, // max attempts
              5000 // 5 seconds interval
            );
          }
        }
      } catch (err) {
        console.error("Unexpected error loading report:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [reportId, authLoading, user]);

  // Handle PDF Export with gating
  const handleExportPdf = () => {
    if (!user) {
      // Guest: Redirect to login with current page as redirect target
      const currentPath = `/report/${reportId}`;
      document.cookie = `redirect-after-login=${currentPath}; path=/; max-age=300; SameSite=Lax`;
      router.push("/login");
      return;
    }
    // PDF download handled by PDFDownloadLink component
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <AppNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-8 w-48 rounded-lg mb-3" />
                <Skeleton className="h-4 w-64 rounded-lg mb-2" />
                <Skeleton className="h-3 w-40 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
          </div>

          {/* Metrics Grid Skeleton */}
          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-3xl" />
              ))}
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Skeleton className="md:col-span-2 h-80 rounded-3xl" />
              <Skeleton className="h-80 rounded-3xl" />
            </div>

            {/* AI Insights Skeleton */}
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <AppNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-100">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                {error?.includes("503") || error?.includes("Service")
                  ? "Service Unavailable"
                  : error?.includes("502") || error?.includes("Connection")
                  ? "Connection Error"
                  : "Report Not Found"}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                {error || "The report you are looking for does not exist or has been deleted."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  color="primary" 
                  onPress={() => window.location.reload()}
                  className="flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </Button>
                <Button 
                  variant="bordered"
                  onPress={() => router.push("/")}
                  className="flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 7v10a1 1 0 001 1h12a1 1 0 001-1V7m-7 10l-2 1m0 0l-7-4" />
                  </svg>
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with URL and Export Button */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                SEO Analysis Report
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 truncate">
                {report.url}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                Analyzed on{" "}
                {new Date(report.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="shrink-0 flex gap-3">
              {/* only for development */}
              {/* {user && (
                <Button
                  color="default"
                  size="lg"
                  onPress={() => router.push(`/pdf-preview/${reportId}`)}
                  className="w-full sm:w-auto"
                >
                  👁️ Preview PDF
                </Button>
              )} */}
              {user ? (
                <PDFDownloadButton report={report} />
              ) : (
                <Button
                  color="default"
                  size="lg"
                  onPress={handleExportPdf}
                  startContent={<IconLock size={20} />}
                  className="w-full sm:w-auto"
                >
                  Login to Export PDF
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid - Main Content */}
        <MetricsGrid
          report={report}
          trends={null}
          history={[report]}
          loading={loading}
          lighthouseLoading={lighthouseLoading}
        />
      </main>
    </div>
  );
}
