import { motion } from 'framer-motion';
import {
  User,
  Code2,
  Server,
  Brain,
  Eye,
  Database,
  BarChart3,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';
import Container from '../../../components/common/Container';
import { Card } from '../../../components/common/Card';

const nodes = [
  {
    icon: User,
    title: 'Citizen',
    description: 'Reports road damage via mobile or web app.',
    gradient: 'from-primary-500/10 to-primary-500/5',
    iconBg: 'bg-primary-50 dark:bg-primary-950/30',
    iconColor: 'text-primary-500',
    borderGlow: 'group-hover:border-primary-500/50',
  },
  {
    icon: Code2,
    title: 'React Frontend',
    description: 'Modern component-based user interface.',
    gradient: 'from-sky-500/10 to-sky-500/5',
    iconBg: 'bg-sky-50 dark:bg-sky-950/30',
    iconColor: 'text-sky-500',
    borderGlow: 'group-hover:border-sky-500/50',
  },
  {
    icon: Server,
    title: 'FastAPI Backend',
    description: 'High-performance Python API handling requests.',
    gradient: 'from-emerald-500/10 to-emerald-500/5',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-500',
    borderGlow: 'group-hover:border-emerald-500/50',
  },
  {
    icon: Brain,
    title: 'YOLOv8 Detection',
    description: 'Real-time object detection for road damage.',
    gradient: 'from-purple-500/10 to-purple-500/5',
    iconBg: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-500',
    borderGlow: 'group-hover:border-purple-500/50',
  },
  {
    icon: Eye,
    title: 'OpenCV Processing',
    description: 'Advanced image preprocessing and analysis.',
    gradient: 'from-amber-500/10 to-amber-500/5',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-500',
    borderGlow: 'group-hover:border-amber-500/50',
  },
  {
    icon: Database,
    title: 'PostgreSQL Database',
    description: 'Reliable storage for reports and geospatial data.',
    gradient: 'from-cyan-500/10 to-cyan-500/5',
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    iconColor: 'text-cyan-500',
    borderGlow: 'group-hover:border-cyan-500/50',
  },
  {
    icon: BarChart3,
    title: 'Analytics Engine',
    description: 'Generates insights from historical road data.',
    gradient: 'from-rose-500/10 to-rose-500/5',
    iconBg: 'bg-rose-50 dark:bg-rose-950/30',
    iconColor: 'text-rose-500',
    borderGlow: 'group-hover:border-rose-500/50',
  },
  {
    icon: LayoutDashboard,
    title: 'Government Dashboard',
    description: 'Authorities receive real-time reports and priorities.',
    gradient: 'from-success-500/10 to-success-500/5',
    iconBg: 'bg-success-50 dark:bg-success-950/30',
    iconColor: 'text-success-500',
    borderGlow: 'group-hover:border-success-500/50',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const nodeVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

function ArrowConnector({ index }) {
  return (
    <motion.div
      className="flex justify-center py-1"
      initial={{ opacity: 0, scaleY: 0 }}
      whileInView={{ opacity: 1, scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.3 + index * 0.12 }}
    >
      <div className="flex flex-col items-center">
        <div className="w-px h-3 bg-gradient-to-b from-secondary-300 to-secondary-400 dark:from-dark-600 dark:to-dark-500" />
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary-100 dark:bg-dark-800 border border-secondary-200 dark:border-dark-700">
          <ChevronDown size={12} className="text-secondary-500 dark:text-dark-400" />
        </div>
        <div className="w-px h-3 bg-gradient-to-t from-secondary-300 to-secondary-400 dark:from-dark-600 dark:to-dark-500" />
      </div>
    </motion.div>
  );
}

export default function ArchitectureSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-secondary-50 dark:bg-dark-900">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" aria-hidden="true">
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-primary-500 blur-3xl" />
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
            System Architecture
          </h2>
          <p className="mt-3 text-secondary-600 dark:text-dark-400 leading-relaxed">
            A modern end-to-end pipeline designed for real-time road damage detection
            and infrastructure analytics.
          </p>
        </motion.div>

        {/* Architecture flow */}
        <motion.div
          className="flex flex-col items-center max-w-lg mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {nodes.map((node, i) => {
            const IconComponent = node.icon;
            return (
              <div key={node.title} className="w-full">
                <motion.div variants={nodeVariants} whileHover={{ scale: 1.02, x: 4 }}>
                  <Card
                    elevation="sm"
                    padding="md"
                    bordered
                    className={`bg-gradient-to-r ${node.gradient} bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700 ${node.borderGlow} transition-all duration-300 hover:shadow-md`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`inline-flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${node.iconBg} ${node.iconColor}`}
                      >
                        <IconComponent size={20} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
                          {node.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400 truncate">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Arrow connector (not after last node) */}
                {i < nodes.length - 1 && <ArrowConnector index={i} />}
              </div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}

