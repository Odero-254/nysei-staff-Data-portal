// src/hooks/useSmtpStatus.js
import { useEffect, useState } from 'react';

export function useSmtpStatus() {
  const [status, setStatus] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/smtp-config');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setStatus({ loading: false, error: null, data });
      } catch (err) {
        if (!cancelled) setStatus({ loading: false, error: err.message, data: null });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return status;
}