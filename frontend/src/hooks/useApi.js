import { useState, useCallback, useEffect, useRef } from 'react';

export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiFunctionRef = useRef(apiFunction);

  useEffect(() => {
    apiFunctionRef.current = apiFunction;
  }, [apiFunction]);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        console.log('🌐 API request:', apiFunctionRef.current.toString());
        const response = await apiFunctionRef.current(...args);
        const result = response.data?.data || response;
        console.log('✅ API response:', result);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        console.error('❌ API error:', errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (apiFunctionRef.current) {
      console.log('🚀 useApi: Initial load triggered');
      execute();
    }
  }, [execute]);

  // Refetch function that properly refreshes data
  const refetch = useCallback(async () => {
    try {
      console.log('🔄 useApi: Refetch triggered');
      setError(null);
      const response = await apiFunctionRef.current();
      const result = response.data?.data || response;
      console.log('📊 Refetch result:', result);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error('❌ Refetch error:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, []);

  return { data, loading, error, execute, refetch };
};
