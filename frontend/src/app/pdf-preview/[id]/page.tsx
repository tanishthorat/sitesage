"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Report } from "@/types/api";
import { fetchReportById } from "@/services/reportService";
import type { PDFViewer as PDFViewerType } from '@react-pdf/renderer';

// Client-side only PDF components
let PDFViewer: typeof PDFViewerType | null = null;
let SiteSageReportPDF: React.ComponentType<{ data: Report }> | null = null;

// Dynamically load PDF components only on client side
if (typeof window !== 'undefined') {
  import('@react-pdf/renderer').then((mod) => {
    PDFViewer = mod.PDFViewer;
  });
  import('@/components/dashboard/pdf/SiteSageReportPDF').then((mod) => {
    SiteSageReportPDF = mod.default;
  });
}

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default function PDFPreviewPage({ params }: PreviewPageProps) {
  const router = useRouter();
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);

  // Unwrap params promise
  useEffect(() => {
    params.then((p) => setReportId(p.id));
  }, [params]);

  // Check if PDF components are loaded
  useEffect(() => {
    const checkLoaded = setInterval(() => {
      if (PDFViewer && SiteSageReportPDF) {
        setIsReady(true);
        clearInterval(checkLoaded);
      }
    }, 100);

    return () => clearInterval(checkLoaded);
  }, []);

  // Fetch report data
  useEffect(() => {
    if (!reportId) return;

    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await fetchReportById(reportId, true);

        if (result.error) {
          setError(result.error);
          setReport(null);
          return;
        }

        if (result.data) {
          setReport(result.data);
        }
      } catch (err) {
        console.error("Error loading report:", err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [reportId]);

  if (loading || !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF Preview...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center max-w-md p-8">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Report not found"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!PDFViewer || !SiteSageReportPDF) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading PDF components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-sm z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/report/${reportId}`)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            ← Back to Report
          </button>
          <div className="border-l border-gray-300 pl-4">
            <h1 className="text-lg font-semibold text-gray-900">PDF Live Preview</h1>
            <p className="text-xs text-gray-500">Changes update automatically</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Report ID: {reportId}</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Preview
          </span>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="pt-18 h-full">
        <PDFViewer 
          style={{ 
            width: '100%', 
            height: '100%',
            border: 'none'
          }}
          showToolbar={true}
        >
          <SiteSageReportPDF data={report} />
        </PDFViewer>
      </div>

      {/* Instructions Overlay */}
      <div className="absolute bottom-6 right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          💡 Pro Tip
        </h3>
        <p className="text-sm opacity-90">
          Edit <code className="bg-blue-700 px-1 rounded">SiteSageReportPDF.tsx</code> and save. 
          Changes will appear here automatically!
        </p>
      </div>
    </div>
  );
}
