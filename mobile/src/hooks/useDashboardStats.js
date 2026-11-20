/**
 * useDashboardStats — loads real dashboard statistics + recent inspections
 * from the existing backend endpoints, with loading/error/refetch states.
 */
import { useCallback, useEffect, useState } from 'react';
import { getDashboardStats, getInspectionHistory } from '../services/inspectionService';

export function useDashboardStats(recentLimit = 5) {
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [statsData, recentData] = await Promise.all([
                getDashboardStats(),
                getInspectionHistory(recentLimit),
            ]);
            setStats(statsData);
            setRecent(recentData);
        } catch (err) {
            setError(err?.message || 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }, [recentLimit]);

    useEffect(() => {
        load();
    }, [load]);

    return { stats, recent, loading, error, refetch: load };
}