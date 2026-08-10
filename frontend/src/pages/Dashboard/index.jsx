import { memo } from 'react';
import DashboardLayout from './components/Layout/DashboardLayout';
import WelcomeBanner from './components/Welcome/WelcomeBanner';
import QuickActions from './components/QuickActions/QuickActions';

function Dashboard() {
  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-6 sm:space-y-8">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </DashboardLayout>
  );
}

export default memo(Dashboard);
