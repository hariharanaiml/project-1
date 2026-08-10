import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import SectionHeader from '../Shared/SectionHeader';

/** Default timeline steps */
const DEFAULT_STEPS = [
  { id: 'uploaded', title: 'Image Uploaded', status: 'completed' },
  { id: 'verified', title: 'Upload Verified', status: 'completed' },
  { id: 'detection', title: 'AI Detection', status: 'pending' },
  { id: 'classification', title: 'Damage Classification', status: 'pending' },
  { id: 'severity', title: 'Severity Prediction', status: 'pending' },
  { id: 'ready', title: 'Report Ready', status: 'pending' },
];

/** Step status icons */
const STEP_ICONS = {
  completed: CheckCircle2,
  active: Loader2,
  pending: Circle,
};

/** Step status colors */
const STEP_COLORS = {
  completed: 'text-success-500',
  active: 'text-primary-500',
  pending: 'text-secondary-300 dark:text-dark-600',
};

/** Step connector colors */
const CONNECTOR_COLORS = {
  completed: 'bg-success-500',
  active: 'bg-primary-400',
  pending: 'bg-secondary-200 dark:bg-dark-700',
};

/**
 * DetectionTimeline component - Vertical progress timeline for AI detection steps.
 *
 * @param {Object} props
 * @param {Array<{ id: string, title: string, status: 'completed'|'active'|'pending' }>} [props.steps] - Timeline steps
 * @param {string} [props.activeStep] - Currently active step ID
 */
export default function DetectionTimeline({ steps: externalSteps, activeStep }) {
  const steps = useMemo(() => {
    if (externalSteps) return externalSteps;
    if (activeStep) {
      let foundActive = false;
      return DEFAULT_STEPS.map((step) => {
        if (step.id === activeStep) {
          foundActive = true;
          return { ...step, status: 'active' };
        }
        if (!foundActive) return { ...step, status: 'completed' };
        return { ...step, status: 'pending' };
      });
    }
    return DEFAULT_STEPS;
  }, [externalSteps, activeStep]);

  return (
    <section aria-label="Detection progress timeline">
      <SectionHeader
        title="Detection Progress"
        description="Real-time status of the AI analysis pipeline."
        delay={0.15}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10">
            <div className="space-y-0" role="list" aria-label="Detection steps">
              {steps.map((step, index) => {
                const Icon = STEP_ICONS[step.status] || Circle;
                const iconColor = STEP_COLORS[step.status] || STEP_COLORS.pending;
                const connectorColor = CONNECTOR_COLORS[step.status] || CONNECTOR_COLORS.pending;
                const isLast = index === steps.length - 1;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.08, ease: 'easeOut' }}
                    className="relative flex gap-4"
                    role="listitem"
                    aria-label={`${step.title}: ${step.status}`}
                  >
                    {/* Icon column */}
                    <div className="flex flex-col items-center shrink-0">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={step.status}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.6, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-dark-900 ${iconColor}`}
                        >
                          <Icon
                            size={18}
                            className={step.status === 'active' ? 'animate-spin' : ''}
                            aria-hidden="true"
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* Connector line */}
                      {!isLast && (
                        <div
                          className={`w-0.5 h-8 ${connectorColor} transition-colors duration-300`}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-8 min-w-0">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={step.status}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`text-sm font-medium ${
                            step.status === 'completed'
                              ? 'text-secondary-600 dark:text-dark-300 line-through decoration-success-500/30'
                              : step.status === 'active'
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-secondary-400 dark:text-dark-500'
                          }`}
                        >
                          {step.title}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
