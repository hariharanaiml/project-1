import { motion } from 'framer-motion';
import { CheckCircle2, Circle, History } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import SectionHeading from './SectionHeading';

/** Step status icon mapping. */
const STEP_ICONS = {
  completed: CheckCircle2,
  active: Circle,
  pending: Circle,
};

/** Step status color mapping. */
const STEP_COLORS = {
  completed: 'text-success-500',
  active: 'text-primary-500',
  pending: 'text-secondary-300 dark:text-dark-600',
};

/** Connector color mapping. */
const CONNECTOR_COLORS = {
  completed: 'bg-success-400',
  active: 'bg-primary-400',
  pending: 'bg-secondary-200 dark:bg-dark-700',
};

/**
 * AnalysisTimeline - Vertical timeline of the AI analysis pipeline.
 *
 * @param {Object} props
 * @param {Array<{id: string, title: string, description: string, timestamp: string, status: 'completed'|'active'|'pending'}>} props.steps - Timeline steps
 */
export default function AnalysisTimeline({ steps = [] }) {
  return (
    <section aria-label="Analysis timeline">
      <SectionHeading
        title="Analysis Timeline"
        description="Step-by-step progression of the AI analysis pipeline."
        icon={History}
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

          <div className="relative z-10">
            <ol role="list" aria-label="AI analysis pipeline steps" className="space-y-0">
              {steps.map((step, index) => {
                const Icon = STEP_ICONS[step.status] || Circle;
                const iconColor = STEP_COLORS[step.status] || STEP_COLORS.pending;
                const connectorColor = CONNECTOR_COLORS[step.status] || CONNECTOR_COLORS.pending;
                const isLast = index === steps.length - 1;

                return (
                  <motion.li
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
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 ${iconColor}`}
                      >
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      {!isLast && (
                        <span
                          className={`w-0.5 h-10 ${connectorColor}`}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Step content */}
                    <div className="pb-8 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${
                            step.status === 'completed'
                              ? 'text-secondary-900 dark:text-dark-100'
                              : step.status === 'active'
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-secondary-400 dark:text-dark-500'
                          }`}
                        >
                          {step.title}
                        </p>
                        <span className="text-2xs text-secondary-400 dark:text-dark-500 tabular-nums shrink-0">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
                        {step.description}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

