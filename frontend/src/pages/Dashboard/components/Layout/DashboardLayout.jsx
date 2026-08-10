import Sidebar from '../Sidebar/Sidebar';
import TopHeader from '../Header/TopHeader';
import { useSidebar } from '../../../../context/SidebarContext';

/**
 * DashboardLayout component - Main layout wrapper for the dashboard.
 * Provides sidebar + header structure with responsive behavior.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Main content area
 * @param {string} [props.pageTitle] - Page title for the header
 */
export default function DashboardLayout({ children, pageTitle = 'Dashboard' }) {
  const { sidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-secondary-50 dark:bg-dark-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-16'}`}>
        <TopHeader pageTitle={pageTitle} />
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

