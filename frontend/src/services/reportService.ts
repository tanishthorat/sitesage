/**
 * Report Service
 * Modular service for fetching report data
 */
import api, { publicApi } from '@/lib/api';
import { apiEndpoints } from '@/lib/api';
import { Report } from '@/types/api';
import { AxiosError } from 'axios';

interface FetchReportResult {
  data: Report | null;
  error: string | null;
}

/**
 * Fetch a single report by ID
 * Uses authenticated API if user is logged in, otherwise uses public API
 */
export async function fetchReportById(
  reportId: string, 
  isAuthenticated: boolean = false
): Promise<FetchReportResult> {
  try {
    // If user is authenticated, use authenticated API directly to avoid 401 errors
    if (isAuthenticated) {
      const response = await api.get<Report>(apiEndpoints.reportById(reportId));
      return {
        data: response.data,
        error: null,
      };
    }
    
    // For unauthenticated users, use public API
    const response = await publicApi.get<Report>(apiEndpoints.reportById(reportId));
    return {
      data: response.data,
      error: null,
    };
  } catch (err) {
    console.error('Error fetching report:', err);
    
    const axiosError = err as AxiosError<{ error?: string; detail?: string }>;
    
    // Handle specific error cases
    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorMessage = axiosError.response.data?.error || axiosError.response.data?.detail;
      
      switch (status) {
        case 401:
          return {
            data: null,
            error: 'Authentication required to access this report',
          };
        case 404:
          return {
            data: null,
            error: 'Report not found',
          };
        case 403:
          return {
            data: null,
            error: 'Access denied to this report',
          };
        case 500:
          return {
            data: null,
            error: errorMessage || 'Server error occurred',
          };
        default:
          return {
            data: null,
            error: errorMessage || 'Failed to load report',
          };
      }
    }
    
    // Network or other errors
    return {
      data: null,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Check if Lighthouse metrics are still pending (being fetched)
 */
export function isLighthousePending(report: Report | null): boolean {
  if (!report) return false;
  return report.lighthouse_status === 'pending';
}

/**
 * Check if report has Lighthouse metrics loaded
 */
export function hasLighthouseMetrics(report: Report | null): boolean {
  if (!report) return false;
  if (report.lighthouse_status === 'completed') return true;
  // fallback to numeric checks for compatibility
  return (
    report.lighthouse_performance !== null ||
    report.lighthouse_accessibility !== null ||
    report.lighthouse_seo !== null ||
    report.lighthouse_best_practices !== null
  );
}

/**
 * Poll for Lighthouse metrics updates
 */
export async function pollLighthouseMetrics(
  reportId: string,
  isAuthenticated: boolean,
  onUpdate: (report: Report) => void,
  onComplete: () => void,
  maxAttempts: number = 24,
  intervalMs: number = 5000
): Promise<() => void> {
  let attempts = 0;
  let cancelled = false;

  const poll = async () => {
    if (cancelled) return;
    
    attempts++;

    try {
      const result = await fetchReportById(reportId, isAuthenticated);
      
      if (cancelled) return;
      
      if (result.data && hasLighthouseMetrics(result.data)) {
        onUpdate(result.data);
        onComplete();
        return;
      }
      
      if (attempts >= maxAttempts) {
        onComplete();
        return;
      }
      
      // Schedule next poll
      setTimeout(poll, intervalMs);
    } catch (err) {
      console.error('Error polling for Lighthouse metrics:', err);
      // Continue polling even on error
      if (!cancelled && attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        onComplete();
      }
    }
  };

  // Start polling
  setTimeout(poll, intervalMs);

  // Return cleanup function
  return () => {
    cancelled = true;
  };
}
