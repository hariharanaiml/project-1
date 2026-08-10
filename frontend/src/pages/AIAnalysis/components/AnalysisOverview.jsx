import { motion } from 'framer-motion';
import { Fingerprint, Timer, Cpu, BrainCircuit } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import SectionHeading from './SectionHeading';
import { useCountUp } from '../../../hooks/useCountUp';

/**
 * AnalysisOverview - Glassmorphism card summarizing the AI analysis.
 *
 * @param {Object} props
 * @param {string} [props.analysisId] - Analysis identifier
 * @param {string} [props.processingTime] - Processing time text
 * @param {string} [props.modelVersion] - AI model version
 * @param {number} [props.confidence=0] - Confidence percentage
 * @param {string} [props.detectionStatus] - Detection status text
 * @param {string} [props.analyzedAt] - Analyzed timestamp text
 */
export default function AnalysisOverview({
  analysisId = '',
  processingTime = '',
  modelVersion = '',
  confidence = 0,
  detectionStatus = '',
  analyzedAt = '',
}) {
  const { count, ref } = useCountUp(confidence, 1200, 250);

  const rows = [
    { icon: Fingerprint, label: 'Analysis ID', value: analysisId },
    { icon: Timer, label: 'Processing Time', value: processingTime },
    { icon: Cpu, label: 'AI Model Version', value: modelVersion },
  ];

  return (
    <section aria-label="Analysis overview" aria-live="polite">
      <SectionHeading
        title="Analysis Overview"
        description="Summary of the AI-powered damage analysis."
        icon={BrainCircuit}
        action={<Badge variant="info" dot pill>Simulated</Badge>}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Stat tiles */}
              {rows.map((row, index) => {
                const Icon = row.icon;
                return (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.06 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-secondary-50/80 dark:bg-dark-800/60 border border-secondary-100 dark:border-dark-700"
                  >
                    <span
                      className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 shrink-0"
                      aria-hidden="true"
                    >
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-2xs text-secondary-500 dark:text-dark-400 uppercase tracking-wider">
                        {row.label}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-secondary-900 dark:text-dark-100 truncate">
                        {row.value || 'N/A'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Confidence tile */}
              <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.28 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-secondary-50/80 dark:bg-dark-800/60 border border-secondary-100 dark:border-dark-700"
              >
                <span
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-success-100 dark:bg-success-900/40 text-success-600 dark:text-success-400 shrink-0"
                  aria-hidden="true"
                >
                  <BrainCircuit size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-2xs text-secondary-500 dark:text-dark-400 uppercase tracking-wider">
                    Confidence
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-secondary-900 dark:text-dark-100 tabular-nums">
                    {count}%
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Footer meta row */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-secondary-100 dark:border-dark-800">
              <p className="text-xs text-secondary-500 dark:text-dark-400">
                Analyzed on <span className="font-medium text-secondary-700 dark:text-dark-200">{analyzedAt}</span>
              </p>
              <Badge variant="success" dot pill>
                {detectionStatus || 'Completed'}
              </Badge>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

