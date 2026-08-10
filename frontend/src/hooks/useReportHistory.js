import { useState, useEffect, useCallback, useMemo } from 'react';
import { listReports } from '../services/reportService';

/**
 * useReportHistory hook - Backend-backed report history.
 * Keeps the same drop-in interface as before while reading from the live API.
 */
export function useReportHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await listReports({ page_size: 100 });
        if (isMounted) {
          setReports(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Unable to load reports');
          setReports([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const addReport = useCallback((report) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const updateReport = useCallback((id, updates) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteReport = useCallback((id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearReports = useCallback(() => {
    setReports([]);
  }, []);

  const getReportById = useCallback((id) => {
    return reports.find((r) => r.id === id) || null;
  }, [reports]);

  const reportCount = useMemo(() => reports.length, [reports]);

  return {
    reports,
    reportCount,
    loading,
    error,
    addReport,
    updateReport,
    deleteReport,
    clearReports,
    getReportById,
  };
}

