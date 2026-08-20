/**
 * Helper to resolve room image URLs.
 * Handles external URLs (e.g. Unsplash/CDN), relative backend upload paths (/uploads/...),
 * blob preview URLs, data URIs, and cross-origin development/production environments.
 *
 * @param {string} url - The raw image URL or relative storage path.
 * @returns {string} Fully resolved accessible image URL.
 */
export const getFullImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  const cleanUrl = url.trim();
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('data:') ||
    cleanUrl.startsWith('blob:')
  ) {
    return cleanUrl;
  }

  const normalizedPath = cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;

  // If VITE_API_URL contains a host/origin, prepend it for cross-origin setups
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    try {
      const parsed = new URL(apiUrl);
      return `${parsed.origin}${normalizedPath}`;
    } catch {
      // Fallback to relative path
    }
  }

  return normalizedPath;
};
