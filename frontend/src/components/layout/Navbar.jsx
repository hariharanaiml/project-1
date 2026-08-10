import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/report', label: 'Report' },
  { to: '/interactive-map', label: 'Map' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/ai-analysis', label: 'AI Analysis' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const isLanding = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navBackground = isLanding && !scrolled
    ? 'bg-transparent'
    : 'bg-white/95 dark:bg-dark-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-dark-900/80 border-b border-secondary-200 dark:border-dark-800';

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLanding && !scrolled ? '' : 'shadow-xs'
      } ${navBackground}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold text-secondary-900 dark:text-dark-100">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white text-sm font-bold">
            R
          </span>
          <span className="text-base">RoadSense AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex md:items-center md:gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-secondary-600 dark:text-dark-300 hover:text-secondary-900 dark:hover:text-dark-100 hover:bg-secondary-50 dark:hover:bg-dark-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NavLink
                to={isAdmin ? '/admin' : '/dashboard/profile'}
                className="text-sm font-medium text-secondary-600 dark:text-dark-300 hover:text-secondary-900 dark:hover:text-dark-100 transition-colors duration-200"
              >
                {user?.full_name || 'My Account'}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-secondary-300 dark:border-dark-700 px-4 py-2 text-sm font-medium text-secondary-600 dark:text-dark-300 hover:bg-secondary-50 dark:hover:bg-dark-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <LogOut size={15} aria-hidden="true" />
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-sm font-medium text-secondary-600 dark:text-dark-300 hover:text-secondary-900 dark:hover:text-dark-100 transition-colors duration-200"
              >
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Get Started
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-secondary-600 dark:text-dark-300 hover:bg-secondary-100 dark:hover:bg-dark-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-white dark:bg-dark-900 border-b border-secondary-200 dark:border-dark-800"
          >
            <nav className="px-4 py-4 space-y-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-secondary-600 dark:text-dark-300 hover:text-secondary-900 dark:hover:text-dark-100 hover:bg-secondary-50 dark:hover:bg-dark-800'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="border-t border-secondary-200 dark:border-dark-800 pt-3 mt-3 space-y-2">
                {isAuthenticated ? (
                  <>
                    <NavLink
                      to={isAdmin ? '/admin' : '/dashboard/profile'}
                      className="block px-3 py-2.5 text-sm font-medium text-secondary-600 dark:text-dark-300 hover:text-secondary-900 dark:hover:text-dark-100 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-800 transition-colors duration-200"
                    >
                      {user?.full_name || 'My Account'}
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-3 py-2.5 text-sm font-medium text-center text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors duration-200"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="block px-3 py-2.5 text-sm font-medium text-secondary-600 dark:text-dark-300 hover:text-secondary-900 dark:hover:text-dark-100 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-800 transition-colors duration-200"
                    >
                      Log in
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="block px-3 py-2.5 text-sm font-medium text-center text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors duration-200"
                    >
                      Get Started
                    </NavLink>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

