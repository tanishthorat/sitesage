"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import api, { apiEndpoints } from "@/lib/api";
import { Report, ApiError } from "@/types/api";
import AppNavbar from "@/components/Navbar";

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setError("");
    setLoading(true);

    try {
      // Call the analyze API
      const response = await api.post(apiEndpoints.analyze, { url });
      const report: Report = response.data;

      // Redirect to the public report page
      router.push(`/report/${report.id}`);
    } catch (err: any) {
      console.error('Error analyzing URL:', err);
      const apiError = err.response?.data as ApiError;
      
      if (err.response?.status === 429) {
        const detail = typeof apiError.detail === 'object' ? apiError.detail : null;
        setError(
          detail?.message || 
          'Rate limit exceeded. Please wait before analyzing this URL again.'
        );
      } else {
        const errorMessage = apiError?.error || 
          (typeof apiError?.detail === 'string' ? apiError.detail : 'Failed to analyze URL');
        setError(errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      {/* Navigation */}
      <AppNavbar />

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Analyze Your Website&apos;s
            <span className="block text-indigo-600 dark:text-indigo-400 mt-2">
              SEO Performance
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get instant insights, AI-powered recommendations, and Google
            PageSpeed metrics to improve your website&apos;s search rankings.
          </p>
        </div>

        {/* Analysis Input */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleAnalyze} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
                className="flex-1 px-6 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Button
                type="submit"
                color="primary"
                size="lg"
                isLoading={loading}
                className="px-8 py-4 text-lg shadow-lg w-full sm:w-auto"
              >
                {loading ? 'Analyzing...' : 'Analyze Now'}
              </Button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              SEO Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive SEO scoring and detailed metrics for your website
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              PageSpeed Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Google Lighthouse metrics for performance, accessibility, and best
              practices
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-pink-600 dark:text-pink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Recommendations
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Smart, actionable suggestions powered by AI to boost your SEO
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
