import { useState } from 'react';
import api from '../services/api';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (method, url, data = null, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api({
        method,
        url,
        data,
        ...options
      });
      // Extract data.data if it exists, otherwise full response.data
      return response.data;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const executePost = (url, data, options) => request('POST', url, data, options);
  const executeGet = (url, options) => request('GET', url, null, options);
  const executePut = (url, data, options) => request('PUT', url, data, options);
  const executePatch = (url, data, options) => request('PATCH', url, data, options);
  const executeDelete = (url, options) => request('DELETE', url, null, options);

  return { 
    loading, 
    error, 
    post: executePost, 
    get: executeGet,
    put: executePut, 
    patch: executePatch, 
    del: executeDelete 
  };
};

export default useApi;
