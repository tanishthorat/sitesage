/**
 * API Client with Firebase Authentication
 */
import axios from 'axios';
import { auth } from './firebase';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Firebase ID token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get Firebase token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - refresh token
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken(true); // Force refresh
          error.config.headers.Authorization = `Bearer ${token}`;
          return api.request(error.config);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // Redirect to login if refresh fails
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API Endpoints
export const apiEndpoints = {
  // Analysis
  analyze: '/api/v1/analyze',
  
  // Reports
  reports: '/api/v1/reports',
  reportById: (id: number) => `/api/v1/reports/${id}`,
  
  // History
  historyUnique: '/api/v1/history/unique',
  historyByUrl: (url: string) => `/api/v1/history/${encodeURIComponent(url)}`,
  
  // Health
  health: '/health',
};
