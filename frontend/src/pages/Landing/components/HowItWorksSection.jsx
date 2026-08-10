import { motion } from 'framer-motion';
import {
  Camera,
  Cpu,
  TriangleAlert,
  Database,
  LayoutDashboard,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';
import Container from '../../../components/common/Container';
import { Card } from '../../../components/common/Card';

const steps = [
  {
    step: 1,
    icon: Camera,
    title: 'Citizen Report',
    description: 'Capture or upload an image of road damage.',
    gradient: 'from-primary-500 to-primary-400',
    iconBg: 'bg-primary-50 dark:bg-primary-950/30',
    iconColor: 'text-primary-500',
  },
  {
    step: 2,
    icon: Cpu,
    title: 'AI Processing',
    description: 'YOLOv8 analyzes the image and detects road damage.',
    gradient: 'from-purple-500 to-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-500',
  },
  {
    step: 3,
    icon: TriangleAlert,
    title: 'Severity Analysis',
    description: 'Damage is categorized into severity levels.',
    gradient: 'from-warning-500 to-warning-400',
    iconBg: 'bg-warning-50 dark:bg-warning-950/30',
    iconColor: 'text-warning-500',
  },
  {
    step: 4,
    icon: Database,
    title: 'Data Storage',
    description: 'Results are securely stored and linked with geographic information.',
    gradient: 'from-cyan-500 to-cyan-400',
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    iconColor: 'text-cyan-500',
  },
  {
    step: 5,
    icon: LayoutDashboard,
    title: 'Government Dashboard',
    description: 'Authorities receive repair priorities and analytics instantly.',
    gradient: 'from-success-500 to-success-400',
    iconBg: 'bg-success-50 dark:bg-success-950/30',
    iconColor: 'text-success-500',
  },
];

// Desktop connector arrow (horizontal)
function HorizontalArrow() {
  return (
    <div className="hidden lg:flex items-center shrink-0" aria-hidden="true">
      <motion.div
        className="flex items-center"
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="w-10 h-px bg-gradient-to-r from-secondary-300 to-secondary-400 dark:from-dark-600 dark:to-dark-500" />
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary-100 dark:bg-dark-800 border border-secondary-200 dark:border-dark-700">
          <ArrowRight size={14} className="text-secondary-500 dark:text-dark-400" />
        </div>
        <div className="w-10 h-px bg-gradient-to-l from-secondary-300 to-secondary-400 dark:from-dark-600 dark:to-dark-500" />
      </motion.div>
    </div>
  );
}

// Mobile connector arrow (vertical)
function VerticalArrow() {
  return (
    <div className="flex lg:hidden items-center justify-center py-2" aria-hidden="true">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: -5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-px h-6 bg-gradient-to-b from-secondary-300 to-secondary-400 dark:from-dark-600 dark:to-dark-500" />
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary-100 dark:bg-dark-800 border border-secondary-200 dark:border-dark-700">
          <ArrowDown size={12} className="text-secondary-500 dark:text-dark-400" />
        </div>
        <div className="w-px h-6 bg-gradient-to-t from-secondary-300 to-secondary-400 dark:from-dark-600 dark:to-dark-500" />
      </motion.div>
    </div>
  );
}

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: 'easeOut' },
  }),
};

export default function HowItWorksSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-secondary-50 dark:bg-dark-900">
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
            How RoadSense AI Works
          </h2>
          <p className="mt-3 text-secondary-600 dark:text-dark-400 leading-relaxed">
            A complete AI-powered workflow from reporting to decision-making.
          </p>
        </motion.div>

        {/* Workflow - Desktop horizontal, Mobile vertical */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-0 lg:gap-0">
          {steps.map((step, i) => {
            const IconComponent = step.icon;
            return (
              <div key={step.step} className="flex flex-col lg:flex-row items-center lg:items-stretch">
                {/* Step card */}
                <motion.div
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="w-full lg:w-48 xl:w-56"
                >
                  <Card
                    elevation="sm"
                    padding="md"
                    bordered
                    className="relative bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700 hover:shadow-md transition-all duration-300 overflow-hidden group"
                  >
                    {/* Step number badge */}
                    <div
                      className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-sm`}
                    >
                      <span className="text-xs font-bold text-white">{step.step}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${step.iconBg} ${step.iconColor} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent size={20} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-xs text-secondary-500 dark:text-dark-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Connector arrow (not after the last step) */}
                {i < steps.length - 1 && (
                  <>
                    <HorizontalArrow />
                    <VerticalArrow />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

