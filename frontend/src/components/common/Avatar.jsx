import { useState } from 'react';

const sizeMap = {
  xs: 'h-6 w-6 text-2xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-14 w-14 text-lg',
  '2xl': 'h-16 w-16 text-xl',
};

const statusSizeMap = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
  xl: 'h-3.5 w-3.5',
  '2xl': 'h-4 w-4',
};

const statusColorMap = {
  online: 'bg-success-500',
  offline: 'bg-secondary-400 dark:bg-dark-500',
  busy: 'bg-danger-500',
  away: 'bg-warning-500',
};

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function getColorFromName(name) {
  const colors = [
    'bg-primary-500',
    'bg-secondary-500',
    'bg-success-500',
    'bg-warning-500',
    'bg-danger-500',
    'bg-info-500',
    'bg-primary-700',
    'bg-secondary-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Avatar component - User avatar with image, initials fallback, and status indicator.
 *
 * @param {Object} props
 * @param {string} [props.src] - Image source URL
 * @param {string} [props.alt] - Alt text for the image
 * @param {string} [props.name] - User name (used for initials fallback and color)
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'} [props.size='md'] - Avatar size
 * @param {'online'|'offline'|'busy'|'away'} [props.status] - Status indicator dot
 * @param {string} [props.className] - Additional CSS classes
 */
export function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  status,
  className = '',
}) {
  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? getColorFromName(name) : 'bg-secondary-400 dark:bg-dark-600';
  const [imageError, setImageError] = useState(false);

  const showImage = src && !imageError;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`
          relative overflow-hidden rounded-full
          flex items-center justify-center
          font-medium text-white
          ${sizeMap[size] || sizeMap.md}
          ${!showImage ? bgColor : ''}
        `.trim()}
        role="img"
        aria-label={alt || name || 'User avatar'}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-dark-900
            ${statusSizeMap[size] || statusSizeMap.md}
            ${statusColorMap[status] || statusColorMap.online}
          `.trim()}
          role="img"
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

