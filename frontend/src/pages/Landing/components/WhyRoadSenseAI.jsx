import { motion } from 'framer-motion';
import {
  Eye,
  FileText,
  RefreshCw,
  Zap,
  ArrowDown,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import Container from '../../../components/common/Container';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

const comparisons = [
  {
    icon: Eye,
    badge: 'Detection',
    badgeVariant: 'primary',
    traditional: { label: 'Manual Inspection', icon: Ban },
    modern: { label: 'AI Vision Detection', icon: CheckCircle2 },
    description:
      'Our AI analyzes road images in real-time, identifying cracks, potholes, and surface defects with 95% accuracy — eliminating human error and slow manual surveys.',
    gradient: 'from-primary-500/10 to-primary-500/5',
    borderGlow: 'group-hover:border-primary-500/50',
    iconBg: 'bg-primary-50 dark:bg-primary-950/30',
    iconColor: 'text-primary-500',
  },
  {
    icon: FileText,
    badge: 'Reporting',
    badgeVariant: 'info',
    traditional: { label: 'Paper Reports', icon: Ban },
    modern: { label: 'Digital Smart Reports', icon: CheckCircle2 },
    description:
      'Replace slow, error-prone paper-based reporting with automated digital reports that include location mapping, severity classification, and instant sharing.',
    gradient: 'from-info-500/10 to-info-500/5',
    borderGlow: 'group-hover:border-info-500/50',
    iconBg: 'bg-info-50 dark:bg-info-950/30',
    iconColor: 'text-info-500',
  },
  {
    icon: RefreshCw,
    badge: 'Maintenance',
    badgeVariant: 'warning',
    traditional: { label: 'Reactive Maintenance', icon: Ban },
    modern: { label: 'Predictive Maintenance', icon: CheckCircle2 },
    description:
      'Move from fixing damage after it happens to predicting failures before they occur using AI-powered deterioration models and historical data analysis.',
    gradient: 'from-warning-500/10 to-warning-500/5',
    borderGlow: 'group-hover:border-warning-500/50',
    iconBg: 'bg-warning-50 dark:bg-warning-950/30',
    iconColor: 'text-warning-500',
  },
  {
    icon: Zap,
    badge: 'Decisions',
    badgeVariant: 'success',
    traditional: { label: 'Delayed Decisions', icon: Ban },
    modern: { label: 'Real-Time AI Insights', icon: CheckCircle2 },
    description:
      'Make faster, data-driven decisions with real-time analytics dashboards providing instant visibility into road conditions and repair priorities.',
    gradient: 'from-success-500/10 to-success-500/5',
    borderGlow: 'group-hover:border-success-500/50',
    iconBg: 'bg-success-50 dark:bg-success-950/30',
    iconColor: 'text-success-500',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.15, ease: 'easeOut' },
  }),
};

export default function WhyRoadSenseAI() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-white dark:bg-dark-950">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" aria-hidden="true">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-primary-500 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-success-500 blur-3xl" />
      </div>

      <Container>
        {/* Section header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-dark-100">
            Why RoadSense AI?
          </h2>
          <p className="mt-3 text-secondary-600 dark:text-dark-400 leading-relaxed">
            We replace outdated road inspection methods with AI-powered precision,
            speed, and actionable intelligence.
          </p>
        </motion.div>

        {/* Comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparisons.map((item, i) => {
            const IconComponent = item.icon;
            const TraditionalIcon = item.traditional.icon;
            const ModernIcon = item.modern.icon;
            return (
              <motion.div
                key={item.badge}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card
                  elevation="sm"
                  padding="lg"
                  bordered
                  className={`h-full bg-gradient-to-br ${item.gradient} bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700 ${item.borderGlow} transition-all duration-300 hover:shadow-lg relative overflow-hidden`}
                >
                  {/* Glow overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary-500/10 blur-2xl" />
                  </div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${item.iconBg} ${item.iconColor} group-hover:rotate-[-8deg] transition-transform duration-300`}
                      >
                        <IconComponent size={22} aria-hidden="true" />
                      </div>
                      <Badge variant={item.badgeVariant} size="sm">
                        {item.badge}
                      </Badge>
                    </div>

                    {/* Traditional vs Modern */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-danger-50/50 dark:bg-danger-950/20 border border-danger-100 dark:border-danger-900/30">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-danger-100 dark:bg-danger-900/40 text-danger-600 dark:text-danger-400 shrink-0">
                          <TraditionalIcon size={14} aria-hidden="true" />
                        </div>
                        <span className="text-xs font-medium text-danger-700 dark:text-danger-300">
                          {item.traditional.label}
                        </span>
                      </div>

                      <div className="flex justify-center">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary-100 dark:bg-dark-800">
                          <ArrowDown size={12} className="text-secondary-500 dark:text-dark-400" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-success-50/50 dark:bg-success-950/20 border border-success-100 dark:border-success-900/30">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-success-100 dark:bg-success-900/40 text-success-600 dark:text-success-400 shrink-0">
                          <ModernIcon size={14} aria-hidden="true" />
                        </div>
                        <span className="text-xs font-medium text-success-700 dark:text-success-300">
                          {item.modern.label}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-secondary-500 dark:text-dark-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

