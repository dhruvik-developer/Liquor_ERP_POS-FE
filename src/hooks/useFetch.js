import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  // `loading` = true only on the very first fetch (drives skeleton loaders)
  const [loading, setLoading] = useState(false);
  // `isFetching` = true on every fetch including manual refetches (drives subtle spinners)
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // Track render count for debugging
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Guard to prevent double-fetching on mount (StrictMode).
  // Manual refetch() calls reset this guard so they are never blocked.
  const hasFetched = useRef(false);
  const hasLoadedOnce = useRef(false);
  // Reset hasFetched if the URL or options change
  const lastCallKey = useRef('');

  // Stringify options once to keep useCallback deps stable (avoids inline object identity issues)
  const stringifiedOptions = JSON.stringify(options);
  const currentCallKey = `${url}|${stringifiedOptions}`;

  const fetchData = useCallback(async (isManual = false) => {
    if (!url) return;

    // Manual refetch() always bypasses the StrictMode dedup guard so it is
    // never silently skipped after a successful POST.
    if (isManual) {
      hasFetched.current = false;
    }

    console.log(`[useFetch]: Initiating fetch for ${url} (Render #${renderCount.current}${isManual ? ', Manual/Refetch' : ''})`);

    setIsFetching(true);
    // Only show the full skeleton on the very first load, not on subsequent refetches
    if (!hasLoadedOnce.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const config = JSON.parse(stringifiedOptions);
      const response = await api.get(url, config);
      const result = response.data?.data !== undefined ? response.data.data : response.data;
      setData(result);
      hasLoadedOnce.current = true;
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [url, stringifiedOptions]);

  useEffect(() => {
    // If the key (URL + options) has not changed since the last effect run, skip (StrictMode guard)
    if (hasFetched.current && lastCallKey.current === currentCallKey) {
      console.log(`[useFetch]: Skipping duplicate fetch for ${url} (StrictMode Guard)`);
      return;
    }

    hasFetched.current = true;
    lastCallKey.current = currentCallKey;
    fetchData();

    // Cleanup: we intentionally do NOT reset hasFetched here — resetting on
    // unmount would break the StrictMode guard (mount → unmount → remount cycle).
    return () => {};
  }, [fetchData, currentCallKey]);

  return {
    data,
    loading,
    isFetching,
    error,
    refetch: () => fetchData(true),
  };
};

export default useFetch;
