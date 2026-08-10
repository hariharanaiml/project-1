import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Share2, Printer, Share } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import SectionHeading from './SectionHeading';

/** Icon map for export actions (UI only). */
const ICONS = {
  file: FileText,
  download: Download,
  share: Share2,
  printer: Printer,
};

/**
 * ExportActions - Export/share/print buttons (UI only, no real exports).
 *
 * @param {Object} props
 * @param {Array<{id: string, label: string, description: string, icon: string}>} props.actions - Action definitions
 */
export default function ExportActions({ actions = [] }) {
  const handleClick = useCallback((label) => {
    // UI-only placeholder. No real export logic (future milestone).
    return label;
  }, []);

  return (
    <section aria-label="Export actions">
      <SectionHeading
        title="Export & Share"
        description="Download or share this AI analysis report."
        icon={Share}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card
          bordered
          padding="lg"
          className="relative overflow-hidden bg-white/70 dark:bg-dark-900/70 backdrop-blur-xl"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-success-500/10 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((action, index) => {
              const Icon = ICONS[action.icon] || FileText;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.06 }}
                  className="p-3 rounded-xl bg-secondary-50/80 dark:bg-dark-800/60 border border-secondary-100 dark:border-dark-700 flex flex-col items-start gap-3"
                >
                  <span
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400"
                    aria-hidden="true"
                  >
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-secondary-900 dark:text-dark-100">{action.label}</p>
                    <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">{action.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={Icon}
                    onClick={() => handleClick(action.label)}
                    aria-label={`${action.label} (UI only)`}
                  >
                    {action.label}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

