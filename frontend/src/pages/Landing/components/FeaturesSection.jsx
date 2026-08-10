import { motion } from 'framer-motion';
import {
  ScanSearch,
  ShieldCheck,
  MapPinned,
  BarChart3,
  BellRing,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';
import Container from '../../../components/common/Container';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';

const features = [
  {
    icon: ScanSearch,
    title: 'AI Road Damage Detection',
    description:
      'Detect potholes, cracks, edge failures and surface defects using advanced computer vision.',
    badge: 'AI',
    badgeVariant: 'primary',
    gradient: 'from-primary-500/10 via-primary-500/5 to-transparent',
    borderGlow: 'group-hover:border-primary-500/50',
    iconBg: 'bg-primary-50 dark:bg-primary-950/30',
    iconColor: 'text-primary-500',
  },
  {
    icon: ShieldCheck,
    title: 'Severity Classification',
    description:
      'Automatically classify damage severity into Low, Medium, High and Critical.',
    badge: 'Safety',
    badgeVariant: 'success',
    gradient: 'from-success-500/10 via-success-500/5 to-transparent',
    borderGlow: 'group-hover:border-success-500/50',
    iconBg: 'bg-success-50 dark:bg-success-950/30',
    iconColor: 'text-success-500',
  },
  {
    icon: MapPinned,
    title: 'Interactive Smart Maps',
    description:
      'Visualize every reported road issue on an interactive geospatial map.',
    badge: 'GIS',
    badgeVariant: 'warning',
    gradient: 'from-warning-500/10 via-warning-500/5 to-transparent',
    borderGlow: 'group-hover:border-warning-500/50',
    iconBg: 'bg-warning-50 dark:bg-warning-950/30',
    iconColor: 'text-warning-500',
  },
  {
    icon: BarChart3,
    title: 'Infrastructure Analytics',
    description:
      'Generate actionable insights using dashboards and historical road condition data.',
    badge: 'Analytics',
    badgeVariant: 'info',
    gradient: 'from-info-500/10 via-info-500/5 to-transparent',
    borderGlow: 'group-hover:border-info-500/50',
    iconBg: 'bg-info-50 dark:bg-info-950/30',
    iconColor: 'text-info-500',
  },
  {
    icon: BellRing,
    title: 'Smart Notifications',
    description:
      'Notify engineers immediately whenever critical road damage is detected.',
    badge: 'Alerts',
    badgeVariant: 'danger',
    gradient: 'from-danger-500/10 via-danger-500/5 to-transparent',
    borderGlow: 'group-hover:border-danger-500/50',
    iconBg: 'bg-danger-50 dark:bg-danger-950/30',
    iconColor: 'text-danger-500',
  },
  {
    icon: BrainCircuit,
    title: 'Predictive Maintenance',
    description:
      'Predict future road deterioration using AI-powered maintenance recommendations.',
    badge: 'Prediction',
    badgeVariant: 'primary',
    gradient: 'from-primary-500/10 via-primary-500/5 to-transparent',
    borderGlow: 'group-hover:border-primary-500/50',
    iconBg: 'bg-primary-50 dark:bg-primary-950/30',
    iconColor: 'text-primary-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function FeaturesSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-white dark:bg-dark-950">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary-500 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary-500 blur-3xl" />
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
            Powerful AI Features
          </h2>
          <p className="mt-3 text-secondary-600 dark:text-dark-400 leading-relaxed">
            Everything required to detect, monitor, analyze, and manage road infrastructure
            in one intelligent platform.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group"
              >
                <Card
                  elevation="sm"
                  padding="lg"
                  bordered
                  className={`relative h-full bg-gradient-to-br ${feature.gradient} bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700 ${feature.borderGlow} transition-all duration-300 hover:shadow-lg overflow-hidden`}
                >
                  {/* Gradient glow overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary-500/10 blur-2xl" />
                  </div>

                  <div className="relative z-10 flex flex-col gap-4">
                    {/* Icon + Badge row */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${feature.iconBg} ${feature.iconColor} group-hover:rotate-[-8deg] transition-transform duration-300`}
                      >
                        <IconComponent size={22} aria-hidden="true" />
                      </div>
                      <Badge variant={feature.badgeVariant} size="sm">
                        {feature.badge}
                      </Badge>
                    </div>

                    {/* Title + Description */}
                    <div>
                      <h3 className="text-base font-semibold text-secondary-900 dark:text-dark-100">
                        {feature.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-secondary-500 dark:text-dark-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Learn More button */}
                    <div className="mt-auto pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={ArrowRight}
                        className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 p-0 h-auto font-medium"
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}

