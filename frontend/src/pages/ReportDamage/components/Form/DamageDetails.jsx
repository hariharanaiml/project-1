import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Route } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import { Input } from '../../../../components/common/Input';
import { TextArea } from '../../../../components/common/TextArea';
import { Select } from '../../../../components/common/Select';
import { Divider } from '../../../../components/common/Divider';
import SectionHeader from '../Shared/SectionHeader';

const ROAD_TYPE_OPTIONS = [
  { value: 'highway', label: 'Highway' },
  { value: 'city_road', label: 'City Road' },
  { value: 'village_road', label: 'Village Road' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'other', label: 'Other' },
];

const SEVERITY_OPTIONS = [
  { value: 'auto_detect', label: 'Auto Detect' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

/**
 * DamageDetails component - Form fields for road damage information.
 *
 * @param {Object} props
 * @param {Object} props.values - Form values
 * @param {Object} props.errors - Form errors
 * @param {Object} props.touched - Touched fields
 * @param {function} props.handleChange - Change handler
 * @param {function} props.handleBlur - Blur handler
 */
export default function DamageDetails({ values, errors, touched, handleChange, handleBlur }) {
  const descriptionCharCount = useMemo(() => {
    return (values.description || '').length;
  }, [values.description]);

  return (
    <section aria-label="Damage details section">
      <SectionHeader
        title="Damage Details"
        description="Provide information about the road damage."
        delay={0.2}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 space-y-5">
            {/* Road Name */}
            <Input
              label="Road Name"
              placeholder="Enter the road name or number"
              value={values.roadName}
              onChange={handleChange('roadName')}
              onBlur={handleBlur('roadName')}
              error={touched.roadName && errors.roadName}
              leftIcon={Route}
              fullWidth
              aria-label="Road name"
              required
            />

            {/* Damage Description */}
            <div>
              <TextArea
                label="Damage Description"
                placeholder="Describe the damage in detail (minimum 20 characters)..."
                rows={4}
                value={values.description}
                onChange={handleChange('description')}
                onBlur={handleBlur('description')}
                error={touched.description && errors.description}
                fullWidth
                aria-label="Damage description"
                required
              />
              <p className="mt-1 text-xs text-secondary-400 dark:text-dark-500 text-right" aria-live="polite">
                {descriptionCharCount} / 20 min
              </p>
            </div>

            <Divider />

            {/* Road Type */}
            <Select
              label="Road Type"
              placeholder="Select road type"
              options={ROAD_TYPE_OPTIONS}
              value={values.roadType}
              onChange={handleChange('roadType')}
              onBlur={handleBlur('roadType')}
              error={touched.roadType && errors.roadType}
              fullWidth
              aria-label="Road type"
              required
            />

            {/* Severity */}
            <Select
              label="Severity"
              options={SEVERITY_OPTIONS}
              value={values.severity}
              onChange={handleChange('severity')}
              onBlur={handleBlur('severity')}
              error={touched.severity && errors.severity}
              fullWidth
              aria-label="Damage severity"
              helperText="AI will auto-detect severity. Manual override is optional."
            />
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
