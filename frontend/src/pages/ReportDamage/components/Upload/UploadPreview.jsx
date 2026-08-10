import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, FileImage, Maximize2 } from 'lucide-react';
import { Button } from '../../../../components/common/Button';

/**
 * Get image resolution from a File object.
 * @param {File} file
 * @returns {Promise<{width: number, height: number}>}
 */
function getImageResolution(file) {
  return new Promise((resolve) => {
    if (!file || !file.type?.startsWith('image/')) {
      resolve({ width: 0, height: 0 });
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

/**
 * UploadPreview component - Enhanced image preview with metadata and actions.
 *
 * @param {Object} props
 * @param {File} props.file - The selected image file
 * @param {function} props.onRemove - Remove image callback
 * @param {function} props.onReplace - Replace image callback
 * @param {string} [props.previewUrl] - Object URL for preview
 */
export default function UploadPreview({ file, onRemove, onReplace, previewUrl }) {
  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (file) {
      getImageResolution(file).then(setResolution);
    }
  }, [file]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadTimestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative group rounded-xl overflow-hidden border border-secondary-200 dark:border-dark-700 bg-white dark:bg-dark-800"
      role="region"
      aria-label="Image preview"
    >
      {/* Image thumbnail */}
      <div className="relative aspect-video sm:aspect-[16/9] bg-secondary-100 dark:bg-dark-800">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          </div>
        )}
        <img
          src={previewUrl}
          alt="Uploaded road damage preview"
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
          <span className="text-xs text-white/80 flex items-center gap-1.5">
            <Maximize2 size={12} aria-hidden="true" />
            {resolution.width > 0 && resolution.height > 0
              ? `${resolution.width} × ${resolution.height} px`
              : 'Resolution unavailable'}
          </span>
        </div>
      </div>

      {/* File info bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-dark-900 border-t border-secondary-100 dark:border-dark-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileImage size={16} className="shrink-0 text-primary-500" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-secondary-900 dark:text-dark-100 truncate">
              {file.name}
            </p>
            <p className="text-xs text-secondary-500 dark:text-dark-400">
              {formatFileSize(file.size)} &middot; {uploadTimestamp}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Replace button */}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            leftIcon={RefreshCw}
            onClick={onReplace}
            aria-label="Replace uploaded image"
          >
            Replace
          </Button>

          {/* Remove button */}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            leftIcon={X}
            onClick={onRemove}
            className="text-danger-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
            aria-label="Remove uploaded image"
          >
            Remove
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
