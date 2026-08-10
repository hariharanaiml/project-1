import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { Avatar } from '../../../components/common/Avatar';
import { Badge } from '../../../components/common/Badge';

/**
 * ProfileHeader - User avatar, name, role, location, and join date hero card.
 *
 * @param {Object} props
 * @param {Object} props.profile - User profile object
 */
export default function ProfileHeader({ profile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-900 dark:from-primary-800 dark:via-primary-900 dark:to-dark-950 p-6 sm:p-8"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <Avatar name={profile.name} size="2xl" status={profile.status} />

        {/* Name + meta */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <Badge variant="primary" size="sm" pill>
              {profile.role}
            </Badge>
          </div>
          <p className="mt-1 text-primary-100 text-sm">{profile.bio}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} aria-hidden="true" />
              {profile.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} aria-hidden="true" />
              Joined {profile.joinedDate}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

