/**
 * Get headers in a cross-environment way
 * Fixed for Next.js 16.0.0 (Turbopack) - headers() is now synchronous
 */
export async function getHeaders() {
  try {
    if (typeof window === 'undefined') {
      const { headers } = await import('next/headers');
      // In Next.js 16, headers() is synchronous, not async
      return headers();
    }
    return undefined;
  } catch (e) {
    console.error('Error getting headers:', e);
    return undefined;
  }
}
