import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  User,
  Settings,
  LogOut,
  FileText,
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeProvider';
import { useSidebar } from '../../../../context/SidebarContext';
import { Avatar } from '../../../../components/common/Avatar';

/**
 * TopHeader component - Dashboard header with search, notifications, theme toggle, profile.
 */
function TopHeader({ pageTitle = 'Dashboard' }) {
  const { theme, toggleTheme } = useTheme();
  const { toggleMobile } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = useCallback((e, setter) => {
    if (e.key === 'Escape') setter(false);
  }, []);

  const notifications = [
    { id: 1, text: 'New damage report in Sector 7', variant: 'danger', time: '2m ago' },
    { id: 2, text: 'AI analysis completed for Zone A', variant: 'info', time: '15m ago' },
    { id: 3, text: 'Road maintenance scheduled', variant: 'success', time: '1h ago' },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-secondary-200 dark:border-dark-800">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Mobile hamburger + Page title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={toggleMobile}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-secondary-600 dark:text-dark-300 hover:bg-secondary-100 dark:hover:bg-dark-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Open sidebar menu"
          >
            <Menu size={22} aria-hidden="true" />
          </button>

          {/* Page title */}
          <h1 className="text-lg font-semibold text-secondary-900 dark:text-dark-100 truncate">
            {pageTitle}
          </h1>
        </div>

        {/* Right: Search, notifications, theme, profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-dark-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search..."
              className="w-40 lg:w-56 h-9 pl-9 pr-3 text-sm rounded-lg bg-secondary-100 dark:bg-dark-800 text-secondary-900 dark:text-dark-100 placeholder-secondary-400 dark:placeholder-dark-400 border border-secondary-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              aria-label="Search dashboard"
            />
          </div>

          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg text-secondary-600 dark:text-dark-300 hover:bg-secondary-100 dark:hover:bg-dark-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={searchOpen ? 'Close search' : 'Open search'}
          >
            <Search size={20} aria-hidden="true" />
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center p-2 rounded-lg text-secondary-600 dark:text-dark-300 hover:bg-secondary-100 dark:hover:bg-dark-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => { setNotifOpen((prev) => !prev); setProfileOpen(false); }}
              onKeyDown={(e) => handleKeyDown(e, setNotifOpen)}
              className="relative inline-flex items-center justify-center p-2 rounded-lg text-secondary-600 dark:text-dark-300 hover:bg-secondary-100 dark:hover:bg-dark-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              aria-haspopup="true"
            >
              <Bell size={20} aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-dark-900" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-white dark:bg-dark-900 shadow-xl border border-secondary-200 dark:border-dark-700 overflow-hidden origin-top-right z-50"
                  role="menu"
                  aria-label="Notifications"
                >
                  <div className="p-3 border-b border-secondary-100 dark:border-dark-800">
                    <p className="text-sm font-semibold text-secondary-900 dark:text-dark-100">Notifications</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-secondary-50 dark:hover:bg-dark-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                        role="menuitem"
                      >
                        <p className="text-sm text-secondary-700 dark:text-dark-200">{notif.text}</p>
                        <p className="mt-0.5 text-xs text-secondary-400 dark:text-dark-400">{notif.time}</p>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-secondary-100 dark:border-dark-800">
                    <Link
                      to="/dashboard/notifications"
                      className="block text-center text-sm font-medium text-primary-600 dark:text-primary-400 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200"
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => { setProfileOpen((prev) => !prev); setNotifOpen(false); }}
              onKeyDown={(e) => handleKeyDown(e, setProfileOpen)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-secondary-100 dark:hover:bg-dark-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="User profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <Avatar name="John Doe" size="sm" status="online" />
              <span className="hidden sm:block text-sm font-medium text-secondary-700 dark:text-dark-200">
                John Doe
              </span>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-dark-900 shadow-xl border border-secondary-200 dark:border-dark-700 overflow-hidden origin-top-right z-50"
                  role="menu"
                  aria-label="User menu"
                >
                  <div className="px-4 py-3 border-b border-secondary-100 dark:border-dark-800">
                    <p className="text-sm font-semibold text-secondary-900 dark:text-dark-100">John Doe</p>
                    <p className="text-xs text-secondary-500 dark:text-dark-400">john.doe@example.com</p>
                  </div>
                  <div className="py-1">
                    {[
                      { to: '/dashboard/profile', label: 'Profile', icon: User },
                      { to: '/dashboard/reports', label: 'My Reports', icon: FileText },
                      { to: '/dashboard/settings', label: 'Settings', icon: Settings },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 dark:text-dark-200 hover:bg-secondary-50 dark:hover:bg-dark-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                      >
                        <item.icon size={16} className="text-secondary-400 dark:text-dark-400" aria-hidden="true" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-secondary-100 dark:border-dark-800 py-1">
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-danger-500"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LogOut size={16} aria-hidden="true" />
                      Logout
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile search bar (shown when searchOpen is true) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden overflow-hidden border-t border-secondary-200 dark:border-dark-800"
          >
            <div className="px-4 py-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 dark:text-dark-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search dashboard..."
                  className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-secondary-100 dark:bg-dark-800 text-secondary-900 dark:text-dark-100 placeholder-secondary-400 dark:placeholder-dark-400 border border-secondary-200 dark:border-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  aria-label="Search dashboard"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default memo(TopHeader);

