/**
 * TypeScript Types for SiteSage API
 */

export interface User {
  id: number;
  email: string;
  firebase_uid: string;
  is_active: boolean;
  created_at: string;
}

export interface Report {
  id: number;
  user_id: number;
  url: string;
  created_at: string;
  title: string | null;
  meta_description: string | null;
  h1_count: number;
  h2_count: number;
  image_count: number;
  missing_alt_count: number;
  word_count: number;
  load_time: number;
  seo_score: number;
  ai_summary: string | null;
  ai_suggestions: string[] | null;
  lighthouse_performance: number | null;
  lighthouse_accessibility: number | null;
  lighthouse_seo: number | null;
  lighthouse_best_practices: number | null;
  robots_txt_exists: boolean;
  sitemap_exists: boolean;
  og_tags_present: boolean;
  schema_present: boolean;
  top_keywords?: string[];
}

export interface HistoryURL {
  url: string;
  report_count: number;
  latest_scan: string;
  latest_seo_score: number;
}

export interface AnalyzeRequest {
  url: string;
}

export interface ApiError {
  error?: string;
  detail?: string | {
    message: string;
    retry_after_seconds?: number;
    existing_report_id?: number;
  };
  type?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded';
  database: 'healthy' | 'unhealthy';
  version: string;
}
