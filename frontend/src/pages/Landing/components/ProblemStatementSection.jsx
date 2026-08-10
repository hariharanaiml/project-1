import { motion } from 'framer-motion';
import { Clock, Brain, TrendingUp, MapPin, ArrowRight } from 'lucide-react';
import Container from '../../../components/common/Container';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';

const challengeCards = [
  {
    icon: Clock,
    label: 'Manual Inspections',
    description: 'Slow and labor-intensive.',
    gradient: 'from-danger-500/10 to-danger-500/5',
    borderHover: 'hover:border-danger-500/30',
    iconBg: 'bg-danger-50 dark:bg-danger-950/30',
    iconColor: 'text-danger-500',
  },
  {
    icon: Brain,
    label: 'AI Detection',
    description: 'Automatic damage identification using computer vision.',
    gradient: 'from-primary-500/10 to-primary-500/5',
    borderHover: 'hover:border-primary-500/30',
    iconBg: 'bg-primary-50 dark:bg-primary-950/30',
    iconColor: 'text-primary-500',
  },
  {
    icon: TrendingUp,
    label: 'Predictive Maintenance',
    description: 'Prioritize repairs before roads become hazardous.',
    gradient: 'from-success-500/10 to-success-500/5',
    borderHover: 'hover:border-success-500/30',
    iconBg: 'bg-success-50 dark:bg-success-950/30',
    iconColor: 'text-success-500',
  },
  {
    icon: MapPin,
    label: 'Citizen Reporting',
    description: 'Simple reporting from any location.',
    gradient: 'from-warning-500/10 to-warning-500/5',
    borderHover: 'hover:border-warning-500/30',
    iconBg: 'bg-warning-50 dark:bg-warning-950/30',
    iconColor: 'text-warning-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.3 + i * 0.1, ease: 'easeOut' },
  }),
};

export default function ProblemStatementSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-white dark:bg-dark-950">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary-500 blur-3xl" />
      </div>

      <Container>
        <motion.div
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {/* Left Column: Text */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 dark:bg-dark-800 text-secondary-600 dark:text-dark-300 border border-secondary-200 dark:border-dark-700">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-400" aria-hidden="true" />
              The Problem We Solve
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-dark-100">
              The Challenge
            </h2>

            <p className="text-lg text-secondary-600 dark:text-dark-300 font-medium">
              Road infrastructure maintenance remains largely reactive.
            </p>

            <div className="space-y-4 text-secondary-600 dark:text-dark-400 leading-relaxed">
              <p className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-danger-400 shrink-0" aria-hidden="true" />
                Manual road inspections are slow and expensive.
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-danger-400 shrink-0" aria-hidden="true" />
                Many road issues remain unreported for long periods.
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-danger-400 shrink-0" aria-hidden="true" />
                Maintenance teams struggle to prioritize repairs efficiently.
              </p>
              <p className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-danger-400 shrink-0" aria-hidden="true" />
                Citizens often lack an easy reporting platform.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="md"
                rightIcon={ArrowRight}
                className="border-secondary-300 dark:border-dark-600 text-secondary-700 dark:text-dark-200 hover:bg-secondary-50 dark:hover:bg-dark-800"
              >
                Learn How It Works
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Info Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {challengeCards.map((card, i) => {
              const IconComponent = card.icon;
              return (
                <motion.div
                  key={card.label}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card
                    elevation="sm"
                    padding="md"
                    bordered
                    className={`h-full bg-gradient-to-br ${card.gradient} border-secondary-200 dark:border-dark-700 ${card.borderHover} transition-all duration-300 hover:shadow-md`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor}`}>
                        <IconComponent size={20} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
                          {card.label}
                        </h3>
                        <p className="mt-1 text-xs text-secondary-500 dark:text-dark-400 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

