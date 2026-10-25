'use client';

import { useEffect } from 'react';

export default function PresenceHeartbeat() {
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const sendHeartbeat = async () => {
      try {
        await fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        // Silently ignore network errors during heartbeat
      }
    };

    // Initial ping
    sendHeartbeat();

    // Heartbeat every 30 seconds
    intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    }, 30 * 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
