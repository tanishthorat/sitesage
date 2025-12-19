'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import api, { apiEndpoints } from '@/lib/api';
import { Report } from '@/types/api';
import AppNavbar from '@/components/Navbar';
import { IconDownload, IconLock } from '@tabler/icons-react';

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lighthouseLoading, setLighthouseLoading] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Unwrap params promise
  useEffect(() => {
    params.then((p) => setReportId(p.id));
  }, [params]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Check if Lighthouse metrics are loaded
  const hasLighthouseMetrics = (report: Report | null): boolean => {
    if (!report) return false;
    return report.lighthouse_performance !== null ||
           report.lighthouse_accessibility !== null ||
           report.lighthouse_seo !== null ||
           report.lighthouse_best_practices !== null;
  };

  // Poll for Lighthouse updates
  const startPollingLighthouse = useCallback((id: string) => {
    setLighthouseLoading(true);

    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll every 5 seconds for up to 2 minutes (24 attempts)
    let attempts = 0;
    const maxAttempts = 24;

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;

      try {
        const response = await api.get(`${apiEndpoints.reports}/${id}`);
        const updatedReport = response.data;

        // Check if Lighthouse metrics are now available
        if (hasLighthouseMetrics(updatedReport)) {
          setReport(updatedReport);
          setLighthouseLoading(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (attempts >= maxAttempts) {
          // Stop polling after max attempts
          setLighthouseLoading(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Error polling for Lighthouse metrics:', err);
        // Continue polling even on error
      }
    }, 5000); // Poll every 5 seconds
  }, []);

  // Fetch report data
  useEffect(() => {
    if (!reportId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(`${apiEndpoints.reports}/${reportId}`);
        setReport(response.data);

        // Start polling for Lighthouse metrics if they're not already loaded
        if (!hasLighthouseMetrics(response.data)) {
          startPollingLighthouse(reportId);
        }
      } catch (err: unknown) {
        console.error('Error fetching report:', err);
        const errorMessage = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to load report';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, startPollingLighthouse]);

  // Handle PDF Export with gating
  const handleExportPdf = () => {
    if (!user) {
      // Guest: Redirect to login with current page as redirect target
      const currentPath = `/report/${reportId}`;
      document.cookie = `redirect-after-login=${currentPath}; path=/; max-age=300; SameSite=Lax`;
      router.push('/login');
      return;
    }

    // User: Trigger PDF download
    if (reportId) {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/pdf`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <AppNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-100">
            <div className="text-center">
              <div className="text-red-600 dark:text-red-400 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Report Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'The report you are looking for does not exist or has been deleted.'}
              </p>
              <Button
                color="primary"
                onPress={() => router.push('/')}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with URL and Export Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                SEO Analysis Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400 truncate">
                {report.url}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Analyzed on {new Date(report.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="shrink-0">
              <Button
                color={user ? 'secondary' : 'default'}
                size="lg"
                onPress={handleExportPdf}
                startContent={user ? <IconDownload size={20} /> : <IconLock size={20} />}
                className="w-full sm:w-auto"
              >
                {user ? 'Export PDF Report' : 'Login to Export PDF'}
              </Button>
            </div>
          </div>
        </div>

        {/* SEO Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Overall SEO Score
            </h2>
            <span className={`text-4xl font-bold ${
              report.seo_score >= 80 ? 'text-green-600 dark:text-green-400' :
              report.seo_score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>
              {report.seo_score}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                report.seo_score >= 80 ? 'bg-green-600' :
                report.seo_score >= 60 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{ width: `${report.seo_score}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">H1 Tags</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {report.h1_count}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">H2 Tags</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {report.h2_count}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Images</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {report.image_count}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Missing Alt Tags</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {report.missing_alt_count}
            </p>
          </div>
        </div>

        {/* AI Summary */}
        {report.ai_summary && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              AI-Powered Summary
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {report.ai_summary}
            </p>
          </div>
        )}

        {/* AI Suggestions */}
        {report.ai_suggestions && report.ai_suggestions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recommended Improvements
            </h3>
            <ul className="space-y-3">
              {report.ai_suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
                >
                  <span className="text-indigo-600 dark:text-indigo-400 mr-3 mt-1 shrink-0">
                    {index + 1}.
                  </span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lighthouse Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Google PageSpeed Insights
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Powered by Lighthouse
              </p>
            </div>
            {lighthouseLoading && (
              <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400">
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </div>
            )}
          </div>

          {hasLighthouseMetrics(report) ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.lighthouse_performance !== null && (
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Performance</p>
                  <p className={`text-5xl font-bold ${
                    report.lighthouse_performance >= 90 ? 'text-green-600 dark:text-green-400' :
                    report.lighthouse_performance >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.round(report.lighthouse_performance)}
                  </p>
                </div>
              )}
              {report.lighthouse_accessibility !== null && (
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Accessibility</p>
                  <p className={`text-5xl font-bold ${
                    report.lighthouse_accessibility >= 90 ? 'text-green-600 dark:text-green-400' :
                    report.lighthouse_accessibility >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.round(report.lighthouse_accessibility)}
                  </p>
                </div>
              )}
              {report.lighthouse_seo !== null && (
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">SEO</p>
                  <p className={`text-5xl font-bold ${
                    report.lighthouse_seo >= 90 ? 'text-green-600 dark:text-green-400' :
                    report.lighthouse_seo >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.round(report.lighthouse_seo)}
                  </p>
                </div>
              )}
              {report.lighthouse_best_practices !== null && (
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Best Practices</p>
                  <p className={`text-5xl font-bold ${
                    report.lighthouse_best_practices >= 90 ? 'text-green-600 dark:text-green-400' :
                    report.lighthouse_best_practices >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {Math.round(report.lighthouse_best_practices)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center p-6 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mx-auto mb-4"></div>
                  <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          )}

          {!hasLighthouseMetrics(report) && !lighthouseLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
              PageSpeed analysis timed out. The metrics may take longer for some websites.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
