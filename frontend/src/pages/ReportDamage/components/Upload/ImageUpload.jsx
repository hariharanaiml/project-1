import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileImage, AlertCircle } from 'lucide-react';
import { Card } from '../../../../components/common/Card';
import { Button } from '../../../../components/common/Button';
import UploadPreview from './UploadPreview';
import SectionHeader from '../Shared/SectionHeader';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const SUPPORTED_FORMATS = [
  { label: 'JPG', value: 'image/jpeg' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
];

/**
 * ImageUpload component - Drag & drop upload area with preview.
 *
 * @param {Object} props
 * @param {File|null} props.value - Currently selected file
 * @param {function} props.onChange - File change callback (receives File|null)
 * @param {string} [props.error] - Validation error message
 * @param {boolean} [props.touched] - Whether field has been touched
 */
export default function ImageUpload({ value, onChange, error, touched }) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const inputRef = useRef(null);

  // Generate preview URL when file changes
  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [value]);

  /**
   * Validate and process a selected file.
   */
  const processFile = useCallback((file) => {
    setUploadError(null);

    if (!file) {
      onChange(null);
      return;
    }

    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      setUploadError('File is too large. Maximum size is 10 MB.');
      return;
    }

    onChange(file);
  }, [onChange]);

  /**
   * Handle file input change.
   */
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, [processFile]);

  /**
   * Handle drag over.
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  /**
   * Handle drag leave.
   */
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  /**
   * Handle drop.
   */
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  /**
   * Open file browser.
   */
  const handleBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  /**
   * Remove uploaded image.
   */
  const handleRemove = useCallback(() => {
    onChange(null);
    setUploadError(null);
  }, [onChange]);

  const showError = (touched && error) || uploadError;

  return (
    <section aria-label="Image upload section">
      <SectionHeader
        title="Image Upload"
        description="Upload a clear photo of the road damage."
        delay={0.05}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
        <Card padding="lg" bordered hoverable={false}>
          {value ? (
            <UploadPreview
              file={value}
              onRemove={handleRemove}
              onReplace={handleBrowse}
              previewUrl={previewUrl}
            />
          ) : (
            /* Empty state - drag & drop zone */
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload image area. Drag and drop or click to browse."
              aria-describedby="upload-formats upload-maxsize"
              onClick={handleBrowse}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBrowse(); }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center py-12 sm:py-16 px-6
                rounded-xl border-2 border-dashed cursor-pointer
                transition-all duration-200 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                ${dragOver
                  ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-950/30 shadow-lg shadow-primary-500/10'
                  : 'border-secondary-300 dark:border-dark-600 bg-secondary-50/50 dark:bg-dark-800/50 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/30 dark:hover:bg-primary-950/20'
                }
              `}
            >
              {/* Upload icon */}
              <motion.div
                animate={dragOver ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-950 text-primary-500 mb-4"
              >
                <Upload size={28} aria-hidden="true" />
              </motion.div>

              {/* Heading */}
              <p className="text-base font-semibold text-secondary-900 dark:text-dark-100 mb-1">
                {dragOver ? 'Drop your image here' : 'Drag & drop your image here'}
              </p>

              {/* Divider */}
              <div className="flex items-center gap-3 my-3">
                <span className="h-px w-8 bg-secondary-300 dark:bg-dark-600" aria-hidden="true" />
                <span className="text-xs font-medium text-secondary-400 dark:text-dark-500">OR</span>
                <span className="h-px w-8 bg-secondary-300 dark:bg-dark-600" aria-hidden="true" />
              </div>

              {/* Browse button */}
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleBrowse(); }}
                aria-label="Browse files to upload"
              >
                Browse Files
              </Button>

              {/* Formats & size */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-secondary-500 dark:text-dark-400">
                <p id="upload-formats" className="flex items-center gap-1.5">
                  <FileImage size={14} aria-hidden="true" />
                  <span>
                    {SUPPORTED_FORMATS.map((f) => f.label).join(', ')}
                  </span>
                </p>
                <p id="upload-maxsize" className="flex items-center gap-1.5">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>Max 10 MB</span>
                </p>
              </div>
            </div>
          )}

          {/* Validation error */}
          {showError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-danger-500 flex items-center gap-1.5"
              role="alert"
            >
              <AlertCircle size={14} aria-hidden="true" />
              {uploadError || error}
            </motion.p>
          )}
        </Card>
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        onChange={handleFileChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </section>
  );
}
