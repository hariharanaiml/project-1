import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

const sizeMap = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

/**
 * Modal component - Accessible dialog overlay with backdrop, close, and focus trap.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {() => void} props.onClose - Close handler
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'full'} [props.size='md'] - Modal size
 * @param {string} [props.title] - Modal title
 * @param {string} [props.description] - Accessible description
 * @param {boolean} [props.closeOnOverlay=true] - Close when clicking backdrop
 * @param {boolean} [props.showCloseButton=true] - Show close button
 * @param {React.ReactNode} [props.footer] - Modal footer content
 * @param {string} [props.className] - Additional CSS classes for the modal panel
 */
export function Modal({
  isOpen,
  onClose,
  size = 'md',
  title,
  description,
  closeOnOverlay = true,
  showCloseButton = true,
  footer,
  children,
  className = '',
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Trap focus inside modal
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    },
    [onClose]
  );

  // Lock body scroll and manage focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      // Focus the modal after render
      requestAnimationFrame(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      });
    }

    return () => {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Panel */}
      <div
        ref={modalRef}
        className={`
          relative w-full bg-white dark:bg-dark-900 rounded-2xl shadow-2xl
          animate-scale-in
          ${sizeMap[size] || sizeMap.md}
          ${className}
        `.trim()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-0">
          <div className="flex-1 min-w-0">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-secondary-900 dark:text-dark-50"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="modal-description"
                className="mt-1 text-sm text-secondary-500 dark:text-dark-400"
              >
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="ml-4 p-1.5 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 dark:text-dark-400 dark:hover:text-dark-200 dark:hover:bg-dark-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Close modal"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-6 pt-0 flex items-center justify-end gap-3 border-t border-secondary-100 dark:border-dark-800 mt-4 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

