'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, Chip } from '@heroui/react';
import api, { apiEndpoints } from '@/lib/api';
import { HistoryURL } from '@/types/api';
import AppNavbar from '@/components/Navbar';
import { IconChartLine, IconClock, IconExternalLink } from '@tabler/icons-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryURL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get(apiEndpoints.historyUnique);
        setHistory(response.data);
      } catch (err: any) {
        console.error('Error fetching history:', err);
        setError(err.response?.data?.error || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  const handleViewReport = (url: string) => {
    // Navigate to history for this URL to see all reports
    router.push(`/dashboard/history?url=${encodeURIComponent(url)}`);
  };

  const handleNewAnalysis = () => {
    router.push('/');
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your SEO analysis history
          </p>
        </div>

        {/* New Analysis Button */}
        <div className="mb-8">
          <Button
            color="primary"
            size="lg"
            onPress={handleNewAnalysis}
            startContent={<IconChartLine size={20} />}
          >
            New SEO Analysis
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your history...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Analysis History Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start analyzing websites to see your history here
            </p>
            <Button
              color="primary"
              onPress={handleNewAnalysis}
            >
              Analyze Your First Website
            </Button>
          </div>
        )}

        {/* History Grid */}
        {!loading && !error && history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Analysis History
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {history.length} {history.length === 1 ? 'website' : 'websites'} analyzed
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <Card
                  key={item.url}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  isPressable
                  onPress={() => handleViewReport(item.url)}
                >
                  <CardBody className="p-6">
                    {/* URL */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                          {item.url.replace(/^https?:\/\/(www\.)?/, '')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.url}
                        </p>
                      </div>
                      <IconExternalLink size={18} className="text-gray-400 ml-2 flex-shrink-0" />
                    </div>

                    {/* SEO Score */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Latest Score
                        </span>
                        <span className={`text-2xl font-bold ${getScoreTextColor(item.latest_seo_score)}`}>
                          {item.latest_seo_score}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            item.latest_seo_score >= 80 ? 'bg-green-600' :
                            item.latest_seo_score >= 60 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${item.latest_seo_score}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <IconClock size={14} className="mr-1" />
                        {new Date(item.latest_scan).toLocaleDateString()}
                      </div>
                      <Chip size="sm" variant="flat" color={getScoreColor(item.latest_seo_score)}>
                        {item.report_count} {item.report_count === 1 ? 'scan' : 'scans'}
                      </Chip>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
