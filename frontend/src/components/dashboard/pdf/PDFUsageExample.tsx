/**
 * PDF Usage Examples and Integration Guide
 * =========================================
 * 
 * This file demonstrates various ways to use the SiteSageReportPDF component
 */

import React from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import SiteSageReportPDF from './SiteSageReportPDF';
import { Report } from '@/types/api';

interface BasicDownloadExampleProps {
  reportData: Report;
}

interface StyledButtonExampleProps {
  reportData: Report;
}

interface PDFPreviewExampleProps {
  reportData: Report;
}

interface AuthGatedDownloadProps {
  reportData: Report;
  user: { id: number; email: string } | null;
}

interface MultipleReportsExampleProps {
  reports: Report[];
}

interface SafePDFDownloadProps {
  reportData: Report;
}

interface APIIntegrationExampleProps {
  reportId: string;
}

// ============================================
// Example 1: Basic Download Link
// ============================================
export function BasicDownloadExample({ reportData }: BasicDownloadExampleProps) {
  return (
    <PDFDownloadLink
      document={<SiteSageReportPDF data={reportData} />}
      fileName="sitesage-report.pdf"
    >
      {({ loading }: { loading: boolean }) => (loading ? 'Generating PDF...' : 'Download Report')}
    </PDFDownloadLink>
  );
}

// ============================================
// Example 2: Styled Button with Loading State
// ============================================
export function StyledButtonExample({ reportData }: StyledButtonExampleProps) {
  return (
    <PDFDownloadLink
      document={<SiteSageReportPDF data={reportData} />}
      fileName={`report-${reportData.url}-${new Date().toISOString().split('T')[0]}.pdf`}
    >
      {({ loading }: { loading: boolean }) => (
        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Generating PDF...
            </>
          ) : (
            <>
              📥 Download PDF Report
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}

// ============================================
// Example 3: Preview PDF in Browser
// ============================================
export function PDFPreviewExample({ reportData }: PDFPreviewExampleProps) {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <PDFViewer style={{ width: '100%', height: '100%' }}>
        <SiteSageReportPDF data={reportData} />
      </PDFViewer>
    </div>
  );
}

// ============================================
// Example 4: Conditional Rendering (Auth Required)
// ============================================
export function AuthGatedDownload({ reportData, user }: AuthGatedDownloadProps) {
  if (!user) {
    return (
      <button
        onClick={() => window.location.href = '/login'}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg"
      >
        🔒 Login to Download PDF
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<SiteSageReportPDF data={reportData} />}
      fileName="sitesage-report.pdf"
    >
      {({ loading }: { loading: boolean }) => (
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
          {loading ? 'Generating...' : '✓ Download PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}

// ============================================
// Example 5: Multiple Reports Download
// ============================================
export function MultipleReportsExample({ reports }: MultipleReportsExampleProps) {
  return (
    <div className="space-y-2">
      {reports.map((report, index) => (
        <PDFDownloadLink
          key={report.id}
          document={<SiteSageReportPDF data={report} />}
          fileName={`report-${report.id}.pdf`}
        >
          {({ loading }: { loading: boolean }) => (
            <div className="p-3 border rounded hover:bg-gray-50">
              {loading ? (
                <span>Generating report {index + 1}...</span>
              ) : (
                <span>Download Report for {report.url}</span>
              )}
            </div>
          )}
        </PDFDownloadLink>
      ))}
    </div>
  );
}

// ============================================
// Example 6: Error Handling
// ============================================
export function SafePDFDownload({ reportData }: SafePDFDownloadProps) {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    return (
      <div className="text-red-600">
        Error generating PDF: {error.message}
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  // Validate report data
  if (!reportData || !reportData.url) {
    return <div className="text-gray-500">Report data not available</div>;
  }

  return (
    <PDFDownloadLink
      document={<SiteSageReportPDF data={reportData} />}
      fileName="report.pdf"
    >
      {({ loading, error: pdfError }: { loading: boolean; error: Error | null }) => {
        if (pdfError) {
          setError(pdfError);
          return null;
        }
        return loading ? 'Generating...' : 'Download PDF';
      }}
    </PDFDownloadLink>
  );
}

// ============================================
// Example Report Data Structure
// ============================================
export const exampleReportData: Report = {
  id: 123,
  user_id: 1,
  url: 'https://example.com',
  created_at: '2025-12-22T10:30:00Z',
  title: 'Example Website - Best Products',
  meta_description: 'Quality products at affordable prices',
  h1_count: 1,
  h2_count: 5,
  image_count: 10,
  missing_alt_count: 2,
  word_count: 850,
  load_time: 1.25,
  seo_score: 85,
  ai_summary: 'This website has a strong SEO foundation with good content structure...',
  ai_suggestions: [
    'Add Schema Markup: Implement Product schema to enhance search results',
    'Optimize Images: Reduce image sizes to improve load time',
    'Improve Headings: Add more descriptive H2 headings for better structure',
  ],
  lighthouse_performance: 78,
  lighthouse_accessibility: 92,
  lighthouse_seo: 88,
  lighthouse_best_practices: 85,
  robots_txt_exists: true,
  sitemap_exists: true,
  og_tags_present: true,
  schema_present: false,
  top_keywords: ['products', 'quality', 'affordable', 'shop', 'online'],
};

// ============================================
// Integration with API
// ============================================
export function APIIntegrationExample({ reportId }: APIIntegrationExampleProps) {
  const [report, setReport] = React.useState<Report | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    fetch(`/api/reports/${reportId}`)
      .then(res => res.json())
      .then((data: Report) => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching report:', err);
        setLoading(false);
      });
  }, [reportId]);

  if (loading) {
    return <div>Loading report data...</div>;
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  return (
    <PDFDownloadLink
      document={<SiteSageReportPDF data={report} />}
      fileName={`report-${reportId}.pdf`}
    >
      {({ loading }: { loading: boolean }) => (
        <button disabled={loading}>
          {loading ? 'Generating PDF...' : 'Download Report'}
        </button>
      )}
    </PDFDownloadLink>
  );
}

// ============================================
// Usage Tips
// ============================================
/**
 * IMPORTANT NOTES:
 * 
 * 1. Always use dynamic imports in Next.js to avoid SSR issues:
 *    const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), { ssr: false });
 * 
 * 2. The component accepts a 'data' prop with the Report type structure
 * 
 * 3. File naming best practices:
 *    - Include date: `report-${date}.pdf`
 *    - Include URL: `report-${url}-${date}.pdf`
 *    - Sanitize filename: Replace special chars with dashes
 * 
 * 4. Loading states are important for user experience
 * 
 * 5. Always validate report data before passing to PDF component
 * 
 * 6. Use error boundaries to catch PDF generation errors
 * 
 * 7. Consider file size - large reports may take time to generate
 */
