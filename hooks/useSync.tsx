
import { useEffect, useState, useCallback } from 'react';

const nexusChannel = new BroadcastChannel('mednexus_sync_grid');

export const useSync = () => {
  const [lastEvent, setLastEvent] = useState<{ type: string; payload: any; timestamp: number } | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      setLastEvent({
        type: event.data.type,
        payload: event.data.payload,
        timestamp: Date.now()
      });
    };

    nexusChannel.addEventListener('message', handleMessage);
    return () => nexusChannel.removeEventListener('message', handleMessage);
  }, []);

  const emit = useCallback((type: string, payload: any) => {
    const data = { type, payload, timestamp: Date.now() };
    nexusChannel.postMessage(data);
    // Also trigger locally for the same tab
    setLastEvent(data);
  }, []);

  return { emit, lastEvent, isOnline };
};
