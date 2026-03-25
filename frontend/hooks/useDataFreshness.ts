import { useMemo, useState, useEffect } from 'react';

export type FreshnessStatus = 'fresh' | 'stale' | 'critical';

export interface FreshnessInfo {
    status: FreshnessStatus;
    message: string;
}

export function useDataFreshness(timestamp: string | null): FreshnessInfo {
    // Keep a state that forces re-render every minute so the 'relative time' updates automatically
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 60000); // update every minute
        return () => clearInterval(interval);
    }, []);

    return useMemo(() => {
        if (!timestamp) {
            return {
                status: 'critical',
                message: 'Data may be outdated'
            };
        }

        const updatedTime = new Date(timestamp).getTime();
        const diffMs = now - updatedTime;
        const diffMinutes = Math.floor(diffMs / 60000);

        if (diffMinutes < 15) {
            return {
                status: 'fresh',
                message: diffMinutes <= 1 ? 'Updated just now' : `Updated ${diffMinutes} min ago`
            };
        } else if (diffMinutes <= 60) {
            return {
                status: 'stale',
                message: `Updated ${diffMinutes} min ago`
            };
        } else {
            return {
                status: 'critical',
                message: 'Data may be outdated'
            };
        }
    }, [timestamp, now]);
}
