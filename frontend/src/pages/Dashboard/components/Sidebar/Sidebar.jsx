import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Camera,
  Map,
  BarChart3,
  Brain,
  FileText,
  Bell,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useSidebar } from '../../../../context/SidebarContext';
import { useAuth } from '../../../../context/AuthContext';
import SidebarItem from './SidebarItem';

const navSections = [
  {
    id: 'main',
    label: 'Main Menu',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/report', label: 'Report Damage', icon: Camera },
      { to: '/interactive-map', label: 'Interactive Map', icon: Map },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/ai-analysis', label: 'AI Analysis', icon: Brain },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { to: '/dashboard/reports', label: 'My Reports', icon: FileText },
      { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/profile', label: 'Profile', icon: User },
      { to: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const logoutItem = { to: '/login', label: 'Logout', icon: LogOut };

export default function Sidebar() {
  const navigate = useNavigate();
  const { sidebarOpen, mobileOpen, toggleSidebar, closeMobile } = useSidebar();
  const { isAdmin, logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
    closeMobile();
    navigate('/login');
  }, [closeMobile, navigate, logout]);

  // Role-aware navigation: admin-only items render only for admins.
  const sections = useMemo(() => {
    const base = [...navSections];
    if (isAdmin) {
      base.push({
        id: 'admin',
        label: 'Administration',
        items: [{ to: '/admin', label: 'Admin Panel', icon: ShieldCheck }],
      });
    }
    return base;
  }, [isAdmin]);

  // Memoize the sidebar content to prevent unnecessary re-renders
  const sidebarContent = useMemo(() => (
    <div className="flex h-full flex-col">
      {/* Logo area */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-secondary-200 dark:border-dark-800">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white text-sm font-bold">
              R
            </span>
            <span className="text-sm font-semibold text-secondary-900 dark:text-dark-100">RoadSense AI</span>
          </div>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden lg:inline-flex items-center justify-center p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-dark-200 hover:bg-secondary-100 dark:hover:bg-dark-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronLeft
            size={18}
            className={`transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`}
            aria-hidden="true"
          />
        </button>
        {/* Close button for mobile */}
        <button
          type="button"
          onClick={closeMobile}
          className="lg:hidden inline-flex items-center justify-center p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-dark-200 hover:bg-secondary-100 dark:hover:bg-dark-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Close sidebar"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Dashboard navigation">
        {sections.map((section) => (
          <div key={section.id}>
            {sidebarOpen && (
              <p className="px-3 mb-2 text-2xs font-semibold uppercase tracking-wider text-secondary-400 dark:text-dark-400">
                {section.label}
              </p>
            )}
            <ul role="list" className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  collapsed={!sidebarOpen}
                />
              ))}
            </ul>
          </div>
        ))}

        {/* Logout */}
        <div className="pt-4 border-t border-secondary-200 dark:border-dark-800">
          <ul role="list" className="space-y-1">
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 text-secondary-600 dark:text-dark-300 hover:bg-secondary-50 dark:hover:bg-dark-800 hover:text-secondary-900 dark:hover:text-dark-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-900 ${
                  sidebarOpen ? '' : 'justify-center px-2'
                }`}
              >
                <LogOut
                  size={20}
                  className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                />
                {sidebarOpen && <span className="truncate">{logoutItem.label}</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  ), [sidebarOpen, closeMobile, toggleSidebar, handleLogout, sections]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col bg-white dark:bg-dark-900 border-r border-secondary-200 dark:border-dark-800 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:w-64' : 'lg:w-16'
        }`}
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-900 shadow-2xl lg:hidden"
              aria-label="Mobile sidebar navigation"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
