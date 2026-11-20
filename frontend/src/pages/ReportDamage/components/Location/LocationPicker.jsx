import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Crosshair, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import { Input } from '../../../../components/common/Input';
import { Button } from '../../../../components/common/Button';
import SectionHeader from '../Shared/SectionHeader';

/** Number of decimal places kept for captured GPS coordinates. */
const GPS_PRECISION = 6;

/**
 * Read the device position via the browser Geolocation API.
 * Permission is requested only when this is called (i.e. when the user
 * clicks "Use Current Location").
 *
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords || {};
        if (
          typeof latitude !== 'number' ||
          typeof longitude !== 'number' ||
          Number.isNaN(latitude) ||
          Number.isNaN(longitude)
        ) {
          reject(new Error('Could not determine your current location.'));
          return;
        }
        resolve({ latitude, longitude });
      },
      (error) => {
        // Map GeolocationPositionError codes to friendly messages.
        const code = error && error.code;
        if (code === 1) {
          reject(new Error('Location access was denied. You can continue without GPS.'));
        } else if (code === 2) {
          reject(new Error('Your current location is unavailable right now.'));
        } else if (code === 3) {
          reject(new Error('Getting your location timed out. Please try again.'));
        } else {
          reject(new Error(error?.message || 'Could not get your current location.'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  });
}

/**
 * LocationPicker component - Location fields with a working
 * "Use Current Location" button backed by the browser Geolocation API.
 *
 * Location is optional: if permission is denied the user can continue
 * without GPS and still submit the inspection.
 *
 * @param {Object} props
 * @param {Object} props.values - Form values
 * @param {Object} props.errors - Form errors
 * @param {Object} props.touched - Touched fields
 * @param {function} props.handleChange - Change handler
 * @param {function} props.handleBlur - Blur handler
 * @param {function} props.setFieldValue - Programmatic field setter
 */
export default function LocationPicker({ values, errors, touched, handleChange, handleBlur, setFieldValue }) {
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);

  /**
   * Handle "Use Current Location" click.
   * Requests the device position once, then fills latitude/longitude.
   */
  const handleUseCurrentLocation = useCallback(async () => {
    if (locating) return;
    setLocating(true);
    setLocationNotice(null);
    try {
      const { latitude, longitude } = await getCurrentPosition();
      setFieldValue('latitude', latitude.toFixed(GPS_PRECISION));
      setFieldValue('longitude', longitude.toFixed(GPS_PRECISION));
      setLocationNotice({
        tone: 'success',
        message: `Location captured: ${latitude.toFixed(GPS_PRECISION)}, ${longitude.toFixed(GPS_PRECISION)}`,
      });
    } catch (err) {
      setLocationNotice({ tone: 'warning', message: err?.message || 'Could not get your current location.' });
    } finally {
      setLocating(false);
    }
  }, [locating, setFieldValue]);

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

            {/* Use Current Location button + notice */}
            <div className="pt-2 space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={locating ? undefined : Crosshair}
                onClick={handleUseCurrentLocation}
                disabled={locating}
                loading={locating}
                aria-label="Use current location"
              >
                {locating ? 'Getting your location...' : 'Use Current Location'}
              </Button>

              {locationNotice && (
                <p
                  role="status"
                  className={`flex items-start gap-1.5 text-xs ${locationNotice.tone === 'success'
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-warning-600 dark:text-warning-400'
                    }`}
                >
                  {locationNotice.tone === 'success' ? (
                    <MapPin size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <AlertCircle size={13} className="shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <span>{locationNotice.message}</span>
                </p>
              )}

              {!locationNotice && !locating && (
                <p className="flex items-center gap-1.5 text-xs text-secondary-400 dark:text-dark-500">
                  <Loader2 size={12} className="hidden" aria-hidden="true" />
                  <span>Optional — inspections without GPS still work.</span>
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}