// hooks/useShutdown.js
import { useEffect, useState } from 'react';

export function useShutdown() {
  const [shutdown, setShutdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/shutdown')
      .then((res) => res.json())
      .then((data) => {
        setShutdown(data.shutdown);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { shutdown, loading };
}