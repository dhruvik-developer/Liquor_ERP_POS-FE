import { useState, useCallback } from 'react';
import api from '../services/api';

const useApi = () => {
  // Separate loading/error tracking for mutations (POST/PUT/PATCH/DELETE) vs reads (GET)
  // This prevents the POST spinner from killing GET data and vice-versa.
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState(null);

  const [getLoading, setGetLoading] = useState(false);
  const [getError, setGetError] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // Generic request — only used internally; callers use the named helpers below
  // ─────────────────────────────────────────────────────────────────────────────
  const request = useCallback(async (method, url, data = null, options = {}) => {
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());

    if (isMutation) {
      setPostLoading(true);
      setPostError(null);
    } else {
      setGetLoading(true);
      setGetError(null);
    }

    try {
      const response = await api({ method, url, data, ...options });
      return response.data;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message || 'An error occurred';
      if (isMutation) {
        setPostError(errorMessage);
      } else {
        setGetError(errorMessage);
      }
      throw err;
    } finally {
      if (isMutation) {
        setPostLoading(false);
      } else {
        setGetLoading(false);
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Base CRUD helpers
  // ─────────────────────────────────────────────────────────────────────────────
  const executePost   = useCallback((url, data, options)       => request('POST',   url, data, options), [request]);
  const executeGet    = useCallback((url, options)             => request('GET',    url, null, options), [request]);
  const executePut    = useCallback((url, data, options)       => request('PUT',    url, data, options), [request]);
  const executePatch  = useCallback((url, data, options)       => request('PATCH',  url, data, options), [request]);
  const executeDelete = useCallback((url, options)             => request('DELETE', url, null, options), [request]);

  // ─────────────────────────────────────────────────────────────────────────────
  // POST → refetch helpers
  //
  // Usage:
  //   const { postThenRefetch, postLoading, postError } = useApi();
  //   await postThenRefetch('/items/', payload, refetchItems);
  //
  // `refetchFn` can be:
  //   - The `refetch()` returned by useFetch
  //   - Any of the module-level refetch* exports (refetchBrands, refetchSizes …)
  //   - A custom async function that re-loads state
  //
  // `optimisticUpdate` (optional): called immediately before the POST so the UI
  //   feels instant. On failure it is rolled back via `rollback`.
  // ─────────────────────────────────────────────────────────────────────────────
  const postThenRefetch = useCallback(async (
    postUrl,
    data,
    refetchFn,
    { options, optimisticUpdate, rollback } = {},
  ) => {
    // Optimistic update — run before awaiting the network (best-effort UX)
    optimisticUpdate?.();

    try {
      const result = await executePost(postUrl, data, options);
      // POST succeeded → now re-fetch so every consumer of this data refreshes
      if (refetchFn) await refetchFn();
      return result;
    } catch (err) {
      // Roll back the optimistic update if the POST failed
      rollback?.();
      throw err;
    }
  }, [executePost]);

  const putThenRefetch = useCallback(async (
    putUrl,
    data,
    refetchFn,
    { options, optimisticUpdate, rollback } = {},
  ) => {
    optimisticUpdate?.();
    try {
      const result = await executePut(putUrl, data, options);
      if (refetchFn) await refetchFn();
      return result;
    } catch (err) {
      rollback?.();
      throw err;
    }
  }, [executePut]);

  const patchThenRefetch = useCallback(async (
    patchUrl,
    data,
    refetchFn,
    { options, optimisticUpdate, rollback } = {},
  ) => {
    optimisticUpdate?.();
    try {
      const result = await executePatch(patchUrl, data, options);
      if (refetchFn) await refetchFn();
      return result;
    } catch (err) {
      rollback?.();
      throw err;
    }
  }, [executePatch]);

  return {
    // Mutation state
    postLoading,
    postError,

    // Read state
    getLoading,
    getError,

    // Backward-compatible aliases (existing code using `loading` / `error` keeps working)
    loading: postLoading || getLoading,
    error: postError || getError,

    // Base helpers
    post:   executePost,
    get:    executeGet,
    put:    executePut,
    patch:  executePatch,
    del:    executeDelete,

    // Chain helpers — the primary way to do POST/PUT/PATCH → GET
    postThenRefetch,
    putThenRefetch,
    patchThenRefetch,
  };
};

export default useApi;
