import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Crosshair } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import { Input } from '../../../../components/common/Input';
import { Button } from '../../../../components/common/Button';
import SectionHeader from '../Shared/SectionHeader';

/**
 * LocationPicker component - Location fields with "Use Current Location" button.
 * UI only. No geolocation or map integration.
 *
 * @param {Object} props
 * @param {Object} props.values - Form values
 * @param {Object} props.errors - Form errors
 * @param {Object} props.touched - Touched fields
 * @param {function} props.handleChange - Change handler
 * @param {function} props.handleBlur - Blur handler
 * @param {function} props._setFieldValue - Programmatic field setter (reserved for future use)
 */
export default function LocationPicker({ values, errors, touched, handleChange, handleBlur, setFieldValue: _setFieldValue }) {
  /**
   * Handle "Use Current Location" click.
   * UI only placeholder. Will integrate with browser geolocation API later.
   */
  const handleUseCurrentLocation = useCallback(() => {
    // Placeholder: no actual geolocation yet
    // Future: navigator.geolocation.getCurrentPosition(...)
  }, []);

  return (
    <section aria-label="Location section">
      <SectionHeader
        title="Location"
        description="Provide the location of the road damage."
        delay={0.15}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 space-y-4">
            {/* Coordinates row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Latitude"
                placeholder="e.g., 12.9716"
                value={values.latitude}
                onChange={handleChange('latitude')}
                onBlur={handleBlur('latitude')}
                error={touched.latitude && errors.latitude}
                leftIcon={MapPin}
                fullWidth
                aria-label="Latitude coordinate"
              />
              <Input
                label="Longitude"
                placeholder="e.g., 77.5946"
                value={values.longitude}
                onChange={handleChange('longitude')}
                onBlur={handleBlur('longitude')}
                error={touched.longitude && errors.longitude}
                leftIcon={MapPin}
                fullWidth
                aria-label="Longitude coordinate"
              />
            </div>

            {/* Address */}
            <Input
              label="Address"
              placeholder="Enter the address or location description"
              value={values.address}
              onChange={handleChange('address')}
              onBlur={handleBlur('address')}
              error={touched.address && errors.address}
              leftIcon={MapPin}
              fullWidth
              aria-label="Damage location address"
            />

            {/* Use Current Location button */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={Crosshair}
                onClick={handleUseCurrentLocation}
                aria-label="Use current location (coming soon)"
              >
                Use Current Location
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
