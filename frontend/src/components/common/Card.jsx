/**
 * Card component - Reusable container with elevation, padding, and optional header/footer sections.
 *
 * @param {Object} props
 * @param {'none'|'xs'|'sm'|'md'|'lg'} [props.elevation='sm'] - Shadow elevation
 * @param {'none'|'sm'|'md'|'lg'|'xl'} [props.padding='md'] - Inner padding
 * @param {boolean} [props.bordered=false] - Show border instead of shadow
 * @param {boolean} [props.hoverable=false] - Hover interaction effect
 * @param {React.ReactNode} [props.header] - Optional card header content
 * @param {React.ReactNode} [props.footer] - Optional card footer content
 * @param {string} [props.className] - Additional CSS classes
 */
export function Card({
  elevation = 'sm',
  padding = 'md',
  bordered = false,
  hoverable = false,
  header,
  footer,
  children,
  className = '',
  ...rest
}) {
  const shadowMap = {
    none: '',
    xs: 'shadow-xs',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const paddingMap = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
    xl: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`
        bg-white dark:bg-dark-900 rounded-xl
        ${bordered ? 'border border-secondary-200 dark:border-dark-700' : shadowMap[elevation] || shadowMap.sm}
        ${hoverable ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `.trim()}
      {...rest}
    >
      {header && (
        <div className={`border-b border-secondary-100 dark:border-dark-800 ${paddingMap[padding] || paddingMap.md}`}>
          {header}
        </div>
      )}
      <div className={header && !footer ? paddingMap[padding] || paddingMap.md : !header && !footer ? paddingMap[padding] || paddingMap.md : header ? '' : paddingMap[padding] || paddingMap.md}>
        {children}
      </div>
      {footer && (
        <div className={`border-t border-secondary-100 dark:border-dark-800 ${paddingMap[padding] || paddingMap.md}`}>
          {footer}
        </div>
      )}
    </div>
  );
}

