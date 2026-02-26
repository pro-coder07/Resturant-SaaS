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
        
        // Add timeout to prevent hanging indefinitely
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        let response;
        try {
          response = await apiFunctionRef.current(...args, { signal: controller.signal });
        } finally {
          clearTimeout(timeoutId);
        }
        
        const result = response.data?.data || response;
        console.log('✅ API response:', result);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = 
          err.name === 'AbortError' 
            ? 'API request timeout - server may be offline'
            : err.response?.data?.message || err.message;
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
      execute().catch(() => {
        // Silently catch errors - error state is already set
      });
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
