import { motion } from 'framer-motion';
import {
  Code2,
  Server,
  Brain,
  Eye,
  Map,
  Database,
  Cpu,
} from 'lucide-react';
import Container from '../../../components/common/Container';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

const technologies = [
  {
    icon: Code2,
    name: 'React',
    category: 'Frontend',
    description: 'Modern component-based UI',
    iconColor: 'text-sky-500',
    bgColor: 'bg-sky-50 dark:bg-sky-950/30',
    badgeVariant: 'info',
  },
  {
    icon: Server,
    name: 'FastAPI',
    category: 'Backend',
    description: 'High-performance Python API',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    badgeVariant: 'success',
  },
  {
    icon: Brain,
    name: 'YOLOv8',
    category: 'AI',
    description: 'Real-time object detection',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    badgeVariant: 'warning',
  },
  {
    icon: Eye,
    name: 'OpenCV',
    category: 'Vision',
    description: 'Advanced image processing',
    iconColor: 'text-primary-500',
    bgColor: 'bg-primary-50 dark:bg-primary-950/30',
    badgeVariant: 'primary',
  },
  {
    icon: Map,
    name: 'Leaflet',
    category: 'Maps',
    description: 'Interactive GIS visualization',
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    badgeVariant: 'warning',
  },
  {
    icon: Database,
    name: 'PostgreSQL',
    category: 'Database',
    description: 'Reliable relational storage',
    iconColor: 'text-cyan-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    badgeVariant: 'info',
  },
  {
    icon: Cpu,
    name: 'PyTorch',
    category: 'Deep Learning',
    description: 'Model training and inference',
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    badgeVariant: 'danger',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' },
  }),
};

export default function TechMarquee() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-secondary-50 dark:bg-dark-900">
      <Container>
        {/* Section header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-dark-100">
            Built With Modern AI Technologies
          </h2>
          <p className="mt-3 text-secondary-600 dark:text-dark-400 leading-relaxed">
            RoadSense AI combines modern frontend, backend, computer vision, mapping, and machine learning technologies.
          </p>
        </motion.div>

        {/* Technology cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {technologies.map((tech, i) => {
            const IconComponent = tech.icon;
            return (
              <motion.div
                key={tech.name}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group"
              >
                <Card
                  elevation="sm"
                  padding="md"
                  bordered
                  className="h-full bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700 hover:shadow-md transition-all duration-300 group-hover:border-primary-300 dark:group-hover:border-primary-700"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${tech.bgColor} ${tech.iconColor}`}>
                        <IconComponent size={20} aria-hidden="true" />
                      </div>
                      <Badge variant={tech.badgeVariant} size="sm">
                        {tech.category}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 dark:text-dark-100 text-sm">
                        {tech.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
                        {tech.description}
                      </p>
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

