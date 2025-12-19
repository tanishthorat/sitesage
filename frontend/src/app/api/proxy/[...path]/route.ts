/**
 * BFF (Backend-for-Frontend) Proxy Route
 * 
 * This Next.js API route acts as a secure proxy between the browser and the FastAPI backend.
 * It ensures that only our Next.js frontend can call the backend by adding the internal API key.
 * 
 * Flow:
 * 1. Browser makes request to /api/proxy/... (without internal key)
 * 2. This route reads INTERNAL_API_KEY from server-side environment
 * 3. Forwards request to FastAPI WITH the internal key header
 * 4. Returns the backend response to the browser
 * 
 * Security Benefits:
 * - Internal API key is never exposed to the browser
 * - Backend rejects all requests without valid internal key
 * - Only our Next.js app can proxy requests
 */

import { NextRequest, NextResponse } from 'next/server';

// Get backend URL from environment (server-side only)
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

/**
 * Handle all HTTP methods (GET, POST, PUT, DELETE, etc.)
 */
async function handleProxyRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Validate internal API key is configured
    if (!INTERNAL_API_KEY) {
      console.error('INTERNAL_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Construct the backend URL
    const path = params.path.join('/');
    const backendUrl = `${BACKEND_URL}/${path}`;
    
    // Get the request body if present
    let body: unknown = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.json();
      } catch {
        // No JSON body or parsing failed
        body = undefined;
      }
    }

    // Forward headers from the original request (except host)
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-INTERNAL-API-KEY': INTERNAL_API_KEY, // Add internal API key
    };

    // Forward Authorization header if present (Firebase JWT)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Make request to FastAPI backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      // Don't follow redirects automatically
      redirect: 'manual',
    });

    // Get response body
    const data = await response.text();
    let jsonData: unknown;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }

    // Return the backend response to the browser
    return NextResponse.json(jsonData, {
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to backend service',
        details: errorMessage 
      },
      { status: 502 } // Bad Gateway
    );
  }
}

// Export handlers for all HTTP methods
export const GET = handleProxyRequest;
export const POST = handleProxyRequest;
export const PUT = handleProxyRequest;
export const DELETE = handleProxyRequest;
export const PATCH = handleProxyRequest;
export const OPTIONS = handleProxyRequest;
