import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import { Button } from '../../../../components/common/Button';
import { Badge } from '../../../../components/common/Badge';
import SectionHeader from '../Shared/SectionHeader';

/**
 * CameraCapture component - Placeholder card for live camera capture.
 * UI only. No actual camera functionality.
 */
export default function CameraCapture() {
  return (
    <section aria-label="Camera capture section">
      <SectionHeader
        title="Camera Capture"
        description="Capture road damage directly from your device camera."
        action={<Badge variant="warning" size="xs" pill>Coming Soon</Badge>}
        delay={0.1}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          {/* Glassmorphism background effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          {/* Gradient border overlay */}
          <div className="absolute inset-0 rounded-xl p-[1px] pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/20 via-transparent to-secondary-500/20" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center py-8 sm:py-10">
            {/* Camera icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
              className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-950 dark:to-secondary-950 text-primary-500 mb-4"
            >
              <Camera size={28} aria-hidden="true" />
            </motion.div>

            {/* Heading */}
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-100 mb-2">
              Capture Live Image
            </h3>

            {/* Description */}
            <p className="text-sm text-secondary-500 dark:text-dark-400 max-w-sm mb-6">
              Capture road damage directly from your mobile or laptop camera.
            </p>

            {/* Button */}
            <Button
              type="button"
              variant="primary"
              size="md"
              leftIcon={Camera}
              aria-label="Open camera (coming soon)"
            >
              Open Camera
            </Button>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
