import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for handling authentication redirects and route protection
 * 
 * This middleware runs on the Edge and handles:
 * 1. Redirecting authenticated users away from auth pages (login/signup/forgot-password)
 * 2. Protecting private routes (dashboard, settings, profile) from unauthenticated users
 * 3. Allowing public access to /report/[id] routes (guests and users can view reports)
 * 4. Preventing flash of unauthenticated content
 */
export function middleware(request: NextRequest) {
  // Check for Firebase auth session cookie
  // Firebase uses multiple cookies, check for the main session token
  const hasAuthToken = 
    request.cookies.has('__session') || // Firebase custom session cookie
    request.cookies.has('firebase-auth-token') || // Custom auth token
    // Check for Firebase ID token in cookies if available
    Array.from(request.cookies.getAll()).some(cookie => 
      cookie.name.includes('firebase') || cookie.name.includes('auth')
    );

  const { pathname } = request.nextUrl;

  // Define auth pages that logged-in users shouldn't access
  const isAuthPage = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password');

  // Define protected routes that require authentication
  // Note: /report/[id] is intentionally NOT protected - it's public for guests and users
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/profile');

  // Redirect authenticated users away from auth pages
  if (isAuthPage && hasAuthToken) {
    console.log('✅ Redirecting authenticated user from auth page to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login from protected routes
  if (isProtectedRoute && !hasAuthToken) {
    console.log('🔒 Redirecting unauthenticated user to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // Store the intended destination in a secure cookie
    // This is more secure than URL parameters which can be manipulated
    response.cookies.set('redirect-after-login', pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5, // 5 minutes
      path: '/',
    });
    
    return response;
  }

  // Allow the request to continue
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 * This prevents unnecessary middleware execution on static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
