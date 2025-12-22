/**
 * API Client with Firebase Authentication
 * 
 * SECURITY: This client now uses the BFF (Backend-for-Frontend) proxy pattern.
 * All requests go through /api/proxy/... which adds the internal API key server-side.
 * The browser never sees the internal API key.
 */
import axios from 'axios';
import { auth } from './firebase';

// Simple cache for GET requests
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30000; // 30 seconds cache

// Create axios instance pointing to our Next.js proxy (not directly to backend)
const api = axios.create({
  baseURL: '/api', // Route through Next.js BFF proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a public API instance that doesn't require authentication
export const publicApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Firebase ID token
api.interceptors.request.use(
  async (config) => {
    // Check cache for GET requests
    if (config.method === 'get' && config.url) {
      const cacheKey = config.url;
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        // Return cached response
        return Promise.reject({
          __CACHED__: true,
          data: cached.data,
          config,
        });
      }
    }

    // Only try to get auth token in browser
    if (typeof window !== 'undefined' && auth) {
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          console.error('Failed to get Firebase token:', error);
        }
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
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.config.url) {
      const cacheKey = response.config.url;
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  async (error) => {
    // Handle cached response
    if (error.__CACHED__) {
      return Promise.resolve({
        data: error.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      });
    }

    if (error.response?.status === 401) {
      // Token expired or invalid - refresh token
      // Only try to refresh in browser with auth available
      if (typeof window !== 'undefined' && auth) {
        const user = auth.currentUser;
        if (user) {
          try {
            const token = await user.getIdToken(true); // Force refresh
            error.config.headers.Authorization = `Bearer ${token}`;
            return api.request(error.config);
          } catch {
            // Silently fail - let the calling code handle 401
            // Don't redirect to login automatically for API calls
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper function to clear cache (useful after mutations)
export const clearApiCache = () => {
  cache.clear();
};

// API Endpoints
export const apiEndpoints = {
  // Analysis
  analyze: 'analyze',
  
  // Reports
  reports: 'reports',
  reportById: (id: number | string) => `reports/${id}`,
  
  // History
  historyUnique: 'history/unique',
  historyByUrl: (url: string) => `history/by-url?url=${encodeURIComponent(url)}`,
  
  // Health
  health: 'health',
};
