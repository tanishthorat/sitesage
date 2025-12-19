/**
 * API Client with Firebase Authentication
 * 
 * SECURITY: This client now uses the BFF (Backend-for-Frontend) proxy pattern.
 * All requests go through /api/proxy/... which adds the internal API key server-side.
 * The browser never sees the internal API key.
 */
import axios from 'axios';
import { auth } from './firebase';

// Create axios instance pointing to our Next.js proxy (not directly to backend)
const api = axios.create({
  baseURL: '/api', // Route through Next.js BFF proxy
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
  analyze: 'analyze',
  
  // Reports
  reports: 'reports',
  reportById: (id: number) => `reports/${id}`,
  
  // History
  historyUnique: 'history/unique',
  historyByUrl: (url: string) => `history/${encodeURIComponent(url)}`,
  
  // Health
  health: 'health',
};
