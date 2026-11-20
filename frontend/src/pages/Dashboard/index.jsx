import { memo, useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import DashboardLayout from './components/Layout/DashboardLayout';
import WelcomeBanner from './components/Welcome/WelcomeBanner';
import QuickActions from './components/QuickActions/QuickActions';
import InspectionStats from './components/InspectionStats/InspectionStats';
import DamageBreakdown from './components/DamageBreakdown/DamageBreakdown';
import RecentInspections from './components/RecentInspections/RecentInspections';
import RoadDamageMap from './components/RoadDamageMap/RoadDamageMap';
import {
  getDashboardStats,
  getDamageBreakdown,
  getRecentInspections,
} from '../../services/dashboardService';
import { Alert } from '../../components/common/Alert';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResult, breakdownResult, inspectionsResult] = await Promise.all([
        getDashboardStats(),
        getDamageBreakdown(),
        getRecentInspections(10),
      ]);
      setStats(statsResult);
      setBreakdown(breakdownResult);
      setInspections(inspectionsResult);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Quick Actions */}
        <QuickActions />

        {/* Dashboard analytics */}
        <section aria-label="Inspection analytics">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-dark-100">
                Inspection Analytics
              </h2>
              <p className="text-xs text-secondary-500 dark:text-dark-400">
                Based on real AI inspection data
              </p>
            </div>
            {!loading && !error && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={RefreshCw}
                onClick={loadDashboard}
                aria-label="Refresh dashboard analytics"
              >
                Refresh
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="danger" title="Failed to load dashboard analytics" className="mb-4">
              {error}
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={RefreshCw}
                  onClick={loadDashboard}
                >
                  Retry
                </Button>
              </div>
            </Alert>
          )}

          {loading && (
            <Card bordered className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 size={28} className="animate-spin text-primary-500" aria-hidden="true" />
              <p className="text-sm font-medium text-secondary-600 dark:text-dark-300">
                Loading inspection analytics...
              </p>
            </Card>
          )}

          {!loading && !error && (
            <div className="space-y-6 sm:space-y-8">
              {/* Stats cards */}
              <InspectionStats stats={stats} />

              {/* Damage breakdown + recent inspections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                <DamageBreakdown data={breakdown} />
                <RecentInspections inspections={inspections} />
              </div>

              {/* Road damage map */}
              <RoadDamageMap />
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default memo(Dashboard);