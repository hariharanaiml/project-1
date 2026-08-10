import { useState, useMemo, useCallback, useEffect } from 'react';
import { listReports } from '../../../services/reportService';

const DEFAULT_FILTERS = {
  severity: '',
  status: '',
  damageType: '',
  date: '',
  search: '',
};

const uniqueSorted = (values) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

/**
 * useMapReports hook - Loads live reports from the API and exposes filtering,
 * derived statistics, and filter option lists for the interactive map.
 *
 * @returns {Object} Reports state, loading/error, filters, controls, and statistics
 */
export function useMapReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    listReports({ page_size: 100 })
      .then((data) => {
        if (cancelled) return;
        setReports(data || []);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load reports.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Reports that carry valid coordinates and can be plotted on the map. */
  const mapReports = useMemo(
    () => reports.filter((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number'),
    [reports],
  );

  /** Set a single filter value. */
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Clear all filters. */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /** Filtered reports based on current filter state. */
  const filteredReports = useMemo(() => {
    return mapReports.filter((report) => {
      if (filters.severity && report.severity !== filters.severity) return false;
      if (filters.status && report.status !== filters.status) return false;
      if (filters.damageType && report.damageType !== filters.damageType) return false;
      if (filters.date && report.createdAt) {
        const reportDate = String(report.createdAt).slice(0, 10);
        if (reportDate !== filters.date) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          String(report.roadName).toLowerCase().includes(q) ||
          String(report.id).toLowerCase().includes(q) ||
          String(report.damageType).toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [mapReports, filters]);

  /** Derived statistics from all map reports. */
  const statistics = useMemo(() => {
    const total = mapReports.length;
    const critical = mapReports.filter((r) => String(r.severity).toLowerCase() === 'critical').length;
    const resolved = mapReports.filter((r) =>
      ['resolved', 'completed'].includes(String(r.status).toLowerCase()),
    ).length;
    const pending = mapReports.filter((r) =>
      ['pending', 'submitted'].includes(String(r.status).toLowerCase()),
    ).length;
    return { total, critical, resolved, pending };
  }, [mapReports]);

  /** Unique filter option values derived from live report data. */
  const SEVERITY_OPTIONS = useMemo(
    () => uniqueSorted(mapReports.map((r) => r.severity).filter(Boolean)),
    [mapReports],
  );
  const STATUS_OPTIONS = useMemo(
    () => uniqueSorted(mapReports.map((r) => r.status).filter(Boolean)),
    [mapReports],
  );
  const DAMAGE_TYPE_OPTIONS = useMemo(
    () => uniqueSorted(mapReports.map((r) => r.damageType).filter(Boolean)),
    [mapReports],
  );

  return {
    reports: mapReports,
    filteredReports,
    statistics,
    filters,
    setFilter,
    clearFilters,
    loading,
    error,
    SEVERITY_OPTIONS,
    STATUS_OPTIONS,
    DAMAGE_TYPE_OPTIONS,
  };
}
