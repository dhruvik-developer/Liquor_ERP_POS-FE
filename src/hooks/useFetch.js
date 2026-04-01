import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Track render count for debugging
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  // Guard to prevent double-fetching on mount (StrictMode)
  const hasFetched = useRef(false);
  // Reset hasFetched if the URL or options change
  const lastCallKey = useRef('');

  // To prevent infinite loops if options are passed inline
  const stringifiedOptions = JSON.stringify(options);
  const currentCallKey = `${url}|${stringifiedOptions}`;

  const fetchData = useCallback(async (isManual = false) => {
    if (!url) return;
    
    console.log(`[useFetch]: Initiating fetch for ${url} (Render #${renderCount.current}${isManual ? ', Manual' : ''})`);
    
    setLoading(true);
    setError(null);
    try {
      const config = JSON.parse(stringifiedOptions);
      const response = await api.get(url, config);
      
      const result = response.data?.data !== undefined ? response.data.data : response.data;
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, stringifiedOptions]);

  useEffect(() => {
    // If the key (URL + options) has changed since the last effect run, we allow a fresh fetch
    if (hasFetched.current && lastCallKey.current === currentCallKey) {
      console.log(`[useFetch]: Skipping duplicate fetch for ${url} (StrictMode Guard)`);
      return;
    }

    hasFetched.current = true;
    lastCallKey.current = currentCallKey;
    fetchData();
    
    return () => {
      // We don't reset hasFetched.current to false here because that would 
      // defeat the purpose of the StrictMode guard (which unmounts then remounts).
    };
  }, [fetchData, currentCallKey]);

  return { data, loading, error, refetch: () => fetchData(true) };
};

export default useFetch;
