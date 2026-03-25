import React from 'react';
import { useDataFreshness } from '../../hooks/useDataFreshness';

interface FreshnessBadgeProps {
    timestamp: string | null | undefined;
    className?: string;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({ timestamp, className = '' }) => {
    // If undefined is passed, treat as null
    const { status, message } = useDataFreshness(timestamp || null);

    let dotColor = 'bg-red-500';
    let textColor = 'text-red-600 dark:text-red-400';
    let bgColor = 'bg-red-50 dark:bg-red-500/10';

    if (status === 'fresh') {
        dotColor = 'bg-emerald-500';
        textColor = 'text-emerald-700 dark:text-emerald-400';
        bgColor = 'bg-emerald-50 dark:bg-emerald-500/10';
    } else if (status === 'stale') {
        dotColor = 'bg-amber-500';
        textColor = 'text-amber-700 dark:text-amber-400';
        bgColor = 'bg-amber-50 dark:bg-amber-500/10';
    }

    return (
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor} ${className}`}>
            <span className={`w-2 h-2 rounded-full ${dotColor} ${status === 'fresh' ? 'animate-pulse' : ''}`} />
            {message}
        </div>
    );
};
