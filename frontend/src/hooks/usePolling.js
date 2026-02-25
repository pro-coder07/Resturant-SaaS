import { useEffect, useState } from 'react';

export const usePolling = (apiFunction, interval = 5000, shouldPoll = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shouldPoll) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiFunction();
        setData(response.data?.data || response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [apiFunction, interval, shouldPoll]);

  return { data, loading, error };
};
