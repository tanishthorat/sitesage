'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import api, { apiEndpoints } from '@/lib/api';
import { Report, ApiError } from '@/types/api';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [lighthouseLoading, setLighthouseLoading] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

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
  const startPollingLighthouse = (reportId: number) => {
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
        const response = await api.get(`${apiEndpoints.reports}/${reportId}`);
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
  };

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setReport(null);
    setLoading(true);
    setLighthouseLoading(false);

    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    try {
      const response = await api.post(apiEndpoints.analyze, { url });
      const newReport = response.data;
      setReport(newReport);

      // Start polling for Lighthouse metrics if they're not already loaded
      if (!hasLighthouseMetrics(newReport)) {
        startPollingLighthouse(newReport.id);
      }
    } catch (err: any) {
      const apiError = err.response?.data as ApiError;
      if (err.response?.status === 429) {
        const detail = typeof apiError.detail === 'object' ? apiError.detail : null;
        setError(
          detail?.message || 
          'Rate limit exceeded. Please wait before analyzing this URL again.'
        );
      } else {
        setError(apiError?.error || apiError?.detail || 'Failed to analyze URL');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              SiteSage Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Analysis Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Analyze Website SEO
            </h2>
            
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Website URL
                </label>
                <input
                  id="url"
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Analyze URL'}
              </button>
            </form>
          </div>

          {/* Results */}
          {report && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Analysis Results
              </h2>

              {/* SEO Score */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    SEO Score
                  </h3>
                  <span className={`text-3xl font-bold ${
                    report.seo_score >= 80 ? 'text-green-600' :
                    report.seo_score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {report.seo_score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      report.seo_score >= 80 ? 'bg-green-600' :
                      report.seo_score >= 60 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${report.seo_score}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">H1 Tags</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {report.h1_count}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">H2 Tags</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {report.h2_count}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Images</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {report.image_count}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Missing Alt Tags</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {report.missing_alt_count}
                  </p>
                </div>
              </div>

              {/* AI Summary */}
              {report.ai_summary && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    AI Summary
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {report.ai_summary}
                  </p>
                </div>
              )}

              {/* AI Suggestions */}
              {report.ai_suggestions && report.ai_suggestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {report.ai_suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="flex items-start text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lighthouse Metrics */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Lighthouse Metrics (Google PageSpeed)
                  </h3>
                  {lighthouseLoading && (
                    <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400">
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  )}
                </div>

                {hasLighthouseMetrics(report) ? (
                  <div className="grid md:grid-cols-4 gap-4">
                    {report.lighthouse_performance !== null && (
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Performance</p>
                        <p className={`text-4xl font-bold ${
                          report.lighthouse_performance >= 90 ? 'text-green-600 dark:text-green-400' :
                          report.lighthouse_performance >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {Math.round(report.lighthouse_performance)}
                        </p>
                      </div>
                    )}
                    {report.lighthouse_accessibility !== null && (
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Accessibility</p>
                        <p className={`text-4xl font-bold ${
                          report.lighthouse_accessibility >= 90 ? 'text-green-600 dark:text-green-400' :
                          report.lighthouse_accessibility >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {Math.round(report.lighthouse_accessibility)}
                        </p>
                      </div>
                    )}
                    {report.lighthouse_seo !== null && (
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">SEO</p>
                        <p className={`text-4xl font-bold ${
                          report.lighthouse_seo >= 90 ? 'text-green-600 dark:text-green-400' :
                          report.lighthouse_seo >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {Math.round(report.lighthouse_seo)}
                        </p>
                      </div>
                    )}
                    {report.lighthouse_best_practices !== null && (
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Best Practices</p>
                        <p className={`text-4xl font-bold ${
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
                  <div className="grid md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mx-auto mb-3"></div>
                        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto"></div>
                      </div>
                    ))}
                  </div>
                )}

                {!hasLighthouseMetrics(report) && !lighthouseLoading && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                    Lighthouse analysis timed out. The metrics may take longer for some websites.
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
