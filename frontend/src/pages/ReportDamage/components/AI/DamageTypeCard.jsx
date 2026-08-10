import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../../../components/common/Card';
import { Badge } from '../../../../components/common/Badge';
import SectionHeader from '../Shared/SectionHeader';

/** Default damage types if none provided */
const DEFAULT_DAMAGE_TYPES = [
  { id: 'pothole', name: 'Pothole', badgeColor: 'danger', description: 'Depression or hole in road surface', icon: null },
  { id: 'longitudinal_crack', name: 'Longitudinal Crack', badgeColor: 'warning', description: 'Crack parallel to road direction', icon: null },
  { id: 'transverse_crack', name: 'Transverse Crack', badgeColor: 'warning', description: 'Crack perpendicular to road direction', icon: null },
  { id: 'alligator_crack', name: 'Alligator Crack', badgeColor: 'danger', description: 'Interconnected crack pattern resembling alligator skin', icon: null },
  { id: 'edge_failure', name: 'Edge Failure', badgeColor: 'primary', description: 'Breakdown at road edges or shoulders', icon: null },
  { id: 'surface_wear', name: 'Surface Wear', badgeColor: 'info', description: 'General surface deterioration and raveling', icon: null },
  { id: 'unknown', name: 'Unknown', badgeColor: 'default', description: 'Damage type not yet classified', icon: null },
];

/** Map badge color names to Badge variant */
const BADGE_VARIANT_MAP = {
  danger: 'danger',
  warning: 'warning',
  primary: 'primary',
  info: 'info',
  default: 'default',
};

/**
 * DamageTypeCard component - Damage type selection with color-coded badges.
 *
 * @param {Object} props
 * @param {Array<{ id: string, name: string, badgeColor: string, description: string }>} [props.types] - Available damage types
 * @param {string} props.value - Currently selected damage type ID
 * @param {function} props.onChange - Selection callback (receives type id)
 */
export default function DamageTypeCard({ types, value, onChange }) {
  const damageTypes = useMemo(() => types || DEFAULT_DAMAGE_TYPES, [types]);

  return (
    <section aria-label="Damage type selection">
      <SectionHeader
        title="Detected Damage Type"
        description="Select the type of road damage detected."
        delay={0.05}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 dark:from-primary-500/10 dark:to-secondary-500/10 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {damageTypes.map((type, index) => {
                const isSelected = value === type.id;
                const variant = BADGE_VARIANT_MAP[type.badgeColor] || 'default';

                return (
                  <motion.button
                    key={type.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05, ease: 'easeOut' }}
                    onClick={() => onChange(type.id)}
                    className={`
                      relative flex items-start gap-3 p-3.5 rounded-xl text-left
                      transition-all duration-150 ease-out
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                      ${isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/40 border-2 border-primary-300 dark:border-primary-700 shadow-sm'
                        : 'bg-secondary-50/50 dark:bg-dark-800/50 border-2 border-transparent hover:bg-secondary-100 dark:hover:bg-dark-800 hover:border-secondary-300 dark:hover:border-dark-600'
                      }
                    `}
                    aria-pressed={isSelected}
                    aria-label={`Damage type: ${type.name}. ${type.description}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      <Badge variant={variant} size="sm" pill>
                        {type.name}
                      </Badge>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-secondary-500 dark:text-dark-400 line-clamp-2">
                        {type.description || 'No description available'}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}
