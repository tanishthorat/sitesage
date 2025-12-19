'use client';

import { useState, FormEvent } from 'react';
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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setReport(null);
    setLoading(true);

    try {
      const response = await api.post(apiEndpoints.analyze, { url });
      setReport(response.data);
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
              {(report.lighthouse_performance !== null ||
                report.lighthouse_accessibility !== null ||
                report.lighthouse_seo !== null ||
                report.lighthouse_best_practices !== null) && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Lighthouse Metrics
                  </h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    {report.lighthouse_performance !== null && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Performance</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {Math.round(report.lighthouse_performance)}
                        </p>
                      </div>
                    )}
                    {report.lighthouse_accessibility !== null && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accessibility</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {Math.round(report.lighthouse_accessibility)}
                        </p>
                      </div>
                    )}
                    {report.lighthouse_seo !== null && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">SEO</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {Math.round(report.lighthouse_seo)}
                        </p>
                      </div>
                    )}
                    {report.lighthouse_best_practices !== null && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Practices</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {Math.round(report.lighthouse_best_practices)}
                        </p>
                      </div>
                    )}
                  </div>
                  {(report.lighthouse_performance === null &&
                    report.lighthouse_accessibility === null &&
                    report.lighthouse_seo === null &&
                    report.lighthouse_best_practices === null) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      Lighthouse metrics are being fetched in the background. Refresh in 30-60 seconds.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
