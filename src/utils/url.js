/**
 * Normalizes a URL by enforcing a single trailing slash on the path portion
 * while preserving query parameters and ignoring external URLs.
 * 
 * @param {string} url - The URL to normalize
 * @returns {string} - The normalized URL
 */
export function normalizeUrl(url) {
  if (!url) return url;

  // Do not modify external URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Separate path from query params
  const [path, ...queryParts] = url.split('?');
  const query = queryParts.length ? '?' + queryParts.join('?') : '';

  // Remove existing trailing slashes, then enforce exactly one trailing slash
  let normalizedPath = path.replace(/\/+$/, '');
  
  if (normalizedPath && !normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }

  if (!normalizedPath) {
    normalizedPath = '/';
  } else if (normalizedPath !== '/') {
    normalizedPath = `${normalizedPath}/`;
  }

  return normalizedPath + query;
}

/**
 * Resolves relative media paths returned by backend into an absolute URL.
 * Example: "/media/products/a.png" -> "http://localhost:8000/media/products/a.png"
 *
 * @param {string} imageUrl
 * @returns {string}
 */
export function resolveMediaUrl(imageUrl) {
  if (!imageUrl) return ''

  const value = String(imageUrl).trim()
  if (!value) return ''

  // Base64 data URLs and absolute URLs are already directly consumable by <img src>.
  if (
    value.startsWith('data:') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('blob:')
  ) {
    return value
  }

  const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const apiBase = String(rawBaseUrl).replace(/\/+$/, '')
  if (!apiBase) return value

  // Convert ".../api" style base to site root for media files.
  const siteBase = apiBase.replace(/\/api$/i, '')
  const normalizedPath = value.startsWith('/') ? value : `/${value}`
  return `${siteBase}${normalizedPath}`
}

/**
 * Returns the active app section root for a pathname.
 *
 * @param {string} pathname
 * @returns {string}
 */
export function getRouteBaseFromPath(pathname) {
  return String(pathname || '').startsWith('/admin') ? '/admin' : '/pos'
}
