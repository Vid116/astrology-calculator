/**
 * Unified Auth Utilities
 * Single source of truth for authentication logic across the app
 */

// Timeout for auth operations (prevents hanging)
export const AUTH_TIMEOUT = 5000;

/**
 * Extract access token from browser cookies
 * Handles both regular and base64-encoded Supabase SSR cookies
 */
export function getAccessTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  // Find Supabase auth cookie
  const authCookieKey = Object.keys(cookies).find(k =>
    k.includes('auth-token') || k.startsWith('sb-')
  );

  if (!authCookieKey) return null;

  try {
    let cookieValue = cookies[authCookieKey];

    // Handle base64 encoded cookies (Supabase SSR format)
    if (cookieValue.startsWith('base64-')) {
      cookieValue = atob(cookieValue.replace('base64-', ''));
    }

    const tokenData = JSON.parse(decodeURIComponent(cookieValue));
    return tokenData.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Create a timeout promise for race conditions
 */
export function createTimeout<T>(ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(fallback), ms));
}

/**
 * Wrap an async auth operation with timeout protection
 * Returns fallback value if operation takes too long
 */
export async function withAuthTimeout<T>(
  operation: Promise<T>,
  fallback: T,
  timeout = AUTH_TIMEOUT
): Promise<T> {
  try {
    return await Promise.race([
      operation,
      createTimeout(timeout, fallback),
    ]);
  } catch {
    return fallback;
  }
}

/**
 * Direct API call to update user (bypasses potentially hanging Supabase client)
 */
export async function updateUserPassword(password: string): Promise<{ success: boolean; error?: string }> {
  const accessToken = getAccessTokenFromCookies();

  if (!accessToken) {
    return { success: false, error: 'No valid session found. Please request a new password reset link.' };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error_description || data.message || 'Failed to update password' };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}

/**
 * Force sign out by redirecting to signout route
 * Use this when normal signOut doesn't work due to stale state
 */
export function forceSignOut(): void {
  window.location.href = '/auth/signout';
}

/**
 * Clear all Supabase auth cookies directly from browser
 * Use as fallback when Supabase client signOut hangs
 */
export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return;

  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('sb-') || name.includes('auth-token') || name.includes('supabase')) {
      // Clear cookie by setting it to expire in the past
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
}

/**
 * Force a full page reload to sync auth state
 * Use after auth operations that might cause client/server mismatch
 */
export function syncAuthState(redirectTo = '/'): void {
  window.location.href = redirectTo;
}
