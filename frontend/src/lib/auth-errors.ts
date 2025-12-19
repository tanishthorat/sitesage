/**
 * Utility to convert Firebase Auth error codes to user-friendly messages
 */

export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorMessage = error.message.toLowerCase();
  const errorCode = errorMessage.match(/auth\/[\w-]+/)?.[0] || errorMessage;

  // Map Firebase error codes to user-friendly messages
  const errorMap: Record<string, string> = {
    // Login errors
    'auth/invalid-login-credentials': 'Invalid email or password. Please check your credentials and try again.',
    'invalid_login_credentials': 'Invalid email or password. Please check your credentials and try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    
    // Sign up errors
    'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    
    // Password reset errors
    'auth/invalid-action-code': 'This password reset link is invalid or has expired. Please request a new one.',
    'auth/expired-action-code': 'This password reset link has expired. Please request a new one.',
    
    // Google Sign In errors
    'auth/popup-closed-by-user': 'Sign in was cancelled. Please try again.',
    'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.',
    'auth/cancelled-popup-request': 'Sign in was cancelled. Please try again.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials.',
    
    // Network errors
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
    
    // General errors
    'auth/internal-error': 'An internal error occurred. Please try again later.',
    'auth/invalid-api-key': 'Configuration error. Please contact support.',
    'auth/app-deleted': 'Configuration error. Please contact support.',
  };

  // Check for exact match
  for (const [code, message] of Object.entries(errorMap)) {
    if (errorMessage.includes(code)) {
      return message;
    }
  }

  // Return original error message if no mapping found, but clean it up
  return error.message.replace(/^Firebase: Error \(auth\/[\w-]+\)\.$/, 'Authentication error. Please try again.');
}
