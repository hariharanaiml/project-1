import { motion } from 'framer-motion';
import { Activity, ShieldCheck, FileText, Zap } from 'lucide-react';
import Container from '../../../components/common/Container';
import { Card } from '../../../components/common/Card';
import { useCountUp } from '../../../hooks/useCountUp';

const stats = [
  {
    icon: Activity,
    value: 12500,
    suffix: '+',
    label: 'Road Images Processed',
    gradient: 'from-primary-500/10 to-primary-500/5',
    iconBg: 'bg-primary-50 dark:bg-primary-950/30',
    iconColor: 'text-primary-500',
    borderGlow: 'hover:border-primary-500/50',
  },
  {
    icon: ShieldCheck,
    value: 95,
    suffix: '%',
    label: 'Detection Accuracy',
    gradient: 'from-success-500/10 to-success-500/5',
    iconBg: 'bg-success-50 dark:bg-success-950/30',
    iconColor: 'text-success-500',
    borderGlow: 'hover:border-success-500/50',
  },
  {
    icon: FileText,
    value: 4800,
    suffix: '+',
    label: 'Reports Generated',
    gradient: 'from-warning-500/10 to-warning-500/5',
    iconBg: 'bg-warning-50 dark:bg-warning-950/30',
    iconColor: 'text-warning-500',
    borderGlow: 'hover:border-warning-500/50',
  },
  {
    icon: Zap,
    value: 3,
    prefix: '< ',
    suffix: 's',
    label: 'Average Processing Time',
    gradient: 'from-info-500/10 to-info-500/5',
    iconBg: 'bg-info-50 dark:bg-info-950/30',
    iconColor: 'text-info-500',
    borderGlow: 'hover:border-info-500/50',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.15, ease: 'easeOut' },
  }),
};

function StatCard({ icon: Icon, value, suffix, prefix, label, gradient, iconBg, iconColor, borderGlow, index }) {
  const { count, ref } = useCountUp(value, 2200, index * 200);

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <Card
        elevation="sm"
        padding="lg"
        bordered
        className={`h-full bg-gradient-to-br ${gradient} bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700 ${borderGlow} transition-all duration-300 hover:shadow-lg text-center`}
      >
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${iconBg} ${iconColor} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} aria-hidden="true" />
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-dark-100 tabular-nums">
          {prefix}{count.toLocaleString()}{suffix}
        </div>
        <p className="mt-2 text-sm text-secondary-500 dark:text-dark-400">
          {label}
        </p>
      </Card>
    </motion.div>
  );
}

export default function StatisticsSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-white dark:bg-dark-950">
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
            Platform Performance
          </h2>
          <p className="mt-3 text-secondary-600 dark:text-dark-400 leading-relaxed">
            Real metrics from our AI-powered infrastructure monitoring platform.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}

