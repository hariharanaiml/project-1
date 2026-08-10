import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cpu } from 'lucide-react';
import { Badge } from '../../../../components/common/Badge';

/**
 * WelcomeBanner component - Greeting card with date, role, road health status, and AI badge.
 */
function WelcomeBanner() {
  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-900 dark:from-primary-800 dark:via-primary-900 dark:to-dark-950 p-6 sm:p-8 lg:p-10"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/20 rounded-full" aria-hidden="true" />
      <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-white/15 rounded-full" aria-hidden="true" />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-2xl sm:text-3xl font-bold text-white"
              >
                Welcome back!
              </motion.h1>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm"
              >
                <Sparkles size={12} aria-hidden="true" />
                Citizen
              </motion.span>
            </div>
            <p className="text-primary-100 text-sm sm:text-base max-w-xl">
              Monitor road conditions, submit reports, and track AI-powered maintenance insights.
            </p>
          </div>
        </div>

        {/* Info row */}
        <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Current date */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white/90 text-sm">
            <span className="text-white/60 text-xs font-medium">📅</span>
            <span>{currentDate}</span>
          </div>

          {/* User role */}
          <Badge variant="primary" size="md" pill>
            👤 Citizen User
          </Badge>

          {/* Road health status */}
          <Badge variant="success" size="md" pill dot>
            Road Health: Good
          </Badge>

          {/* AI badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-primary-400/20 to-purple-400/20 backdrop-blur-sm border border-primary-300/30 text-white text-xs font-medium">
            <Cpu size={14} aria-hidden="true" />
            AI Active
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(WelcomeBanner);

