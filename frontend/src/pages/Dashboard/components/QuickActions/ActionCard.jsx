import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * ActionCard component - Glassmorphism card with gradient border and animated icon.
 *
 * @param {Object} props
 * @param {string} props.to - Route link
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string} props.gradient - Gradient border color class
 * @param {number} [props.index] - Index for stagger animation
 */
export default function ActionCard({ to, title, description, icon: Icon, gradient = 'from-primary-500 to-primary-700', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index, ease: 'easeOut' }}
    >
      <Link
        to={to}
        className="group relative block rounded-2xl p-[1px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-900"
        aria-label={title}
      >
        {/* Gradient border bg */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
          aria-hidden="true"
        />

        {/* Glass card content */}
        <div className="relative h-full rounded-2xl bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl p-5 sm:p-6 transition-all duration-300 group-hover:bg-white/90 dark:group-hover:bg-dark-800/90 group-hover:-translate-y-1 group-hover:shadow-xl">
          {/* Animated icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40">
            <Icon size={24} aria-hidden="true" />
          </div>

          <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-200">
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-secondary-500 dark:text-dark-400 leading-relaxed">
            {description}
          </p>

          {/* Arrow indicator */}
          <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0">
            <span>Get started</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3.5 7H10.5M10.5 7L7 3.5M10.5 7L7 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
