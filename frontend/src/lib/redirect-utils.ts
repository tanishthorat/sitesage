/**
 * Utility to safely get redirect URL from cookies
 * Validates that the redirect is internal to prevent open redirect vulnerabilities
 */

export function getRedirectUrl(cookies: string): string {
  const defaultRedirect = '/dashboard';
  
  try {
    // Parse cookies string
    const cookieMatch = cookies.match(/redirect-after-login=([^;]+)/);
    if (!cookieMatch) {
      return defaultRedirect;
    }

    const redirectPath = decodeURIComponent(cookieMatch[1]);

    // Security validation: Only allow internal redirects
    // Must start with / and not contain protocol (http://, https://, //)
    if (!redirectPath.startsWith('/') || redirectPath.startsWith('//')) {
      console.warn('⚠️ Blocked potentially unsafe redirect:', redirectPath);
      return defaultRedirect;
    }

    // Prevent redirecting back to auth pages
    if (
      redirectPath.startsWith('/login') ||
      redirectPath.startsWith('/signup') ||
      redirectPath.startsWith('/forgot-password')
    ) {
      return defaultRedirect;
    }

    return redirectPath;
  } catch (error) {
    console.error('Error parsing redirect cookie:', error);
    return defaultRedirect;
  }
}

/**
 * Clear the redirect cookie after using it
 */
export function clearRedirectCookie(): void {
  document.cookie = 'redirect-after-login=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}
