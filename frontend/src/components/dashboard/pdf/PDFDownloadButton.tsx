'use client';

import React from 'react';
import { Button } from '@heroui/react';
import { IconDownload } from '@tabler/icons-react';
import { Report } from '@/types/api';
import type { PDFDownloadLink as PDFDownloadLinkType } from '@react-pdf/renderer';

// Client-side only PDF components
let PDFDownloadLink: typeof PDFDownloadLinkType | null = null;
let SiteSageReportPDF: React.ComponentType<{ data: Report }> | null = null;

// Dynamically load PDF components only on client side
if (typeof window !== 'undefined') {
  import('@react-pdf/renderer').then((mod) => {
    PDFDownloadLink = mod.PDFDownloadLink;
  });
  import('./SiteSageReportPDF').then((mod) => {
    SiteSageReportPDF = mod.default;
  });
}

interface PDFDownloadButtonProps {
  report: Report;
}

export default function PDFDownloadButton({ report }: PDFDownloadButtonProps) {
  const [isReady, setIsReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Wait for components to load
    const checkLoaded = setInterval(() => {
      if (PDFDownloadLink && SiteSageReportPDF) {
        setIsReady(true);
        clearInterval(checkLoaded);
      }
    }, 100);

    return () => clearInterval(checkLoaded);
  }, []);

  if (!isReady || !PDFDownloadLink || !SiteSageReportPDF) {
    return (
      <Button
        color="secondary"
        size="lg"
        startContent={<IconDownload size={20} />}
        className="w-full sm:w-auto"
        isDisabled
      >
        Loading PDF...
      </Button>
    );
  }

  const fileName = `sitesage-report-${report.url.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<SiteSageReportPDF data={report} />}
      fileName={fileName}
    >
      {({ loading }: { loading: boolean }) => (
        <Button
          color="secondary"
          size="lg"
          startContent={<IconDownload size={20} />}
          className="w-full sm:w-auto"
          isLoading={loading}
          isDisabled={loading}
        >
          {loading ? 'Generating PDF...' : 'Export PDF Report'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
