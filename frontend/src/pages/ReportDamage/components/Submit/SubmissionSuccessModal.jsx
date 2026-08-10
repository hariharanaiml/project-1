import { motion } from 'framer-motion';
import { CheckCircle2, FileText, Calendar, Tag, ShieldAlert, FolderOpen, LayoutDashboard } from 'lucide-react';
import { Modal } from '../../../../components/common/Modal';
import { Button } from '../../../../components/common/Button';

/** Format an ISO timestamp for display. */
const formatDate = (iso) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * SubmissionSuccessModal component - Confirmation shown after a report is submitted.
 * UI only. No backend calls.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {() => void} props.onClose - Close handler
 * @param {Object|null} props.report - The submitted report object
 * @param {() => void} props.onViewReports - Navigate to report history
 * @param {() => void} props.onBackToDashboard - Navigate back to dashboard
 */
export default function SubmissionSuccessModal({
  isOpen,
  onClose,
  report,
  onViewReports,
  onBackToDashboard,
}) {
  if (!report) return null;

  const details = [
    { key: 'id', label: 'Report ID', icon: FileText, value: report.id },
    { key: 'date', label: 'Date', icon: Calendar, value: formatDate(report.createdAt) },
    { key: 'damageType', label: 'Damage Type', icon: Tag, value: report.damageType || 'N/A' },
    { key: 'severity', label: 'Severity', icon: ShieldAlert, value: report.severity || 'N/A' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Report Submitted"
      description="Your damage report has been submitted successfully."
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center text-center"
      >
        {/* Animated success check */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-success-100 dark:bg-success-950 text-success-600 dark:text-success-400 mb-4"
          aria-hidden="true"
        >
          <CheckCircle2 size={32} />
        </motion.div>

        <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-100">
          Report Submitted Successfully
        </h3>
        <p className="mt-1 text-sm text-secondary-500 dark:text-dark-400">
          Your report has been saved to your local report history.
        </p>

        {/* Temporary report number */}
        <div className="mt-4 px-4 py-2.5 rounded-lg bg-secondary-50 dark:bg-dark-800 border border-secondary-200 dark:border-dark-700">
          <p className="text-2xs uppercase tracking-wider text-secondary-500 dark:text-dark-400">Report Number</p>
          <p className="font-mono text-base font-semibold text-primary-600 dark:text-primary-400 tabular-nums">
            {report.id}
          </p>
        </div>

        {/* Detail rows */}
        <div className="mt-5 w-full space-y-2">
          {details.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary-50 dark:bg-dark-800"
              >
                <Icon size={16} className="shrink-0 text-secondary-400 dark:text-dark-500" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-2xs text-secondary-500 dark:text-dark-400">{item.label}</p>
                  <p className="text-sm font-medium text-secondary-900 dark:text-dark-100 truncate">
                    {item.value || 'N/A'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:flex-1">
            <Button type="button" variant="primary" size="lg" fullWidth leftIcon={FolderOpen} onClick={onViewReports}>
              View Reports
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:flex-1">
            <Button type="button" variant="outline" size="lg" fullWidth leftIcon={LayoutDashboard} onClick={onBackToDashboard}>
              Back to Dashboard
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </Modal>
  );
}

