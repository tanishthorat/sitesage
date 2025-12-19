'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardBody, Chip } from '@heroui/react';
import api, { apiEndpoints } from '@/lib/api';
import { Report } from '@/types/api';
import AppNavbar from '@/components/Navbar';
import { IconArrowLeft, IconExternalLink, IconChartLine } from '@tabler/icons-react';

function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!url) {
      router.push('/dashboard');
      return;
    }

    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await api.get(apiEndpoints.historyByUrl(url));
        setReports(response.data);
      } catch (err: unknown) {
        console.error('Error fetching reports:', err);
        const errorMessage = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to load reports';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [url, router]);

  const handleViewReport = (reportId: number) => {
    router.push(`/report/${reportId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="light"
            onPress={() => router.push('/dashboard')}
            startContent={<IconArrowLeft size={18} />}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analysis History
          </h1>
          {url && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span>{url}</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <IconExternalLink size={18} />
              </a>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-100">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Reports List */}
        {!loading && !error && reports.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
              </h2>
            </div>

            <div className="space-y-4">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  isPressable
                  onPress={() => handleViewReport(report.id)}
                >
                  <CardBody className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left Side: Date & Score */}
                      <div className="flex items-center gap-6">
                        {/* Date */}
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Analyzed
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {new Date(report.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(report.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* Score */}
                        <div className="border-l pl-6 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            SEO Score
                          </p>
                          <div className="flex items-center gap-3">
                            <span className={`text-3xl font-bold ${getScoreTextColor(report.seo_score)}`}>
                              {report.seo_score}
                            </span>
                            <Chip size="sm" color={getScoreColor(report.seo_score)} variant="flat">
                              {report.seo_score >= 80 ? 'Good' : report.seo_score >= 60 ? 'Fair' : 'Poor'}
                            </Chip>
                          </div>
                        </div>

                        {/* Lighthouse Metrics Preview */}
                        {(report.lighthouse_performance !== null || 
                          report.lighthouse_accessibility !== null ||
                          report.lighthouse_seo !== null ||
                          report.lighthouse_best_practices !== null) && (
                          <div className="border-l pl-6 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              PageSpeed
                            </p>
                            <div className="flex gap-2">
                              {report.lighthouse_performance !== null && (
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Perf</p>
                                  <p className={`text-sm font-bold ${getScoreTextColor(report.lighthouse_performance)}`}>
                                    {Math.round(report.lighthouse_performance)}
                                  </p>
                                </div>
                              )}
                              {report.lighthouse_accessibility !== null && (
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">A11y</p>
                                  <p className={`text-sm font-bold ${getScoreTextColor(report.lighthouse_accessibility)}`}>
                                    {Math.round(report.lighthouse_accessibility)}
                                  </p>
                                </div>
                              )}
                              {report.lighthouse_seo !== null && (
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">SEO</p>
                                  <p className={`text-sm font-bold ${getScoreTextColor(report.lighthouse_seo)}`}>
                                    {Math.round(report.lighthouse_seo)}
                                  </p>
                                </div>
                              )}
                              {report.lighthouse_best_practices !== null && (
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">BP</p>
                                  <p className={`text-sm font-bold ${getScoreTextColor(report.lighthouse_best_practices)}`}>
                                    {Math.round(report.lighthouse_best_practices)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Side: View Button */}
                      <div>
                        <Button
                          color="primary"
                          variant="flat"
                          endContent={<IconChartLine size={18} />}
                        >
                          View Report
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && reports.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Reports Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No analysis history found for this URL
            </p>
            <Button
              color="primary"
              onPress={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <HistoryContent />
    </Suspense>
  );
}
