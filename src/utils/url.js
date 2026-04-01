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
