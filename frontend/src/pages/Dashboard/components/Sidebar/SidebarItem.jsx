import { NavLink } from 'react-router-dom';
import { useSidebar } from '../../../../context/SidebarContext';

/**
 * SidebarItem component - Individual navigation item with icon, label, active state, and tooltip.
 *
 * @param {Object} props
 * @param {string} props.to - Route path
 * @param {string} props.label - Display label
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {boolean} [props.collapsed] - Whether sidebar is collapsed
 */
export default function SidebarItem({ to, label, icon: Icon, collapsed = false }) {
  const { closeMobile } = useSidebar();

  const baseClasses =
    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-900';

  const activeClasses =
    'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300 shadow-sm';

  const inactiveClasses =
    'text-secondary-600 dark:text-dark-300 hover:bg-secondary-50 dark:hover:bg-dark-800 hover:text-secondary-900 dark:hover:text-dark-100';

  return (
    <li>
      <NavLink
        to={to}
        onClick={closeMobile}
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${collapsed ? 'justify-center px-2' : ''}`
        }
        aria-label={collapsed ? label : undefined}
      >
        <Icon
          size={20}
          className="shrink-0 transition-transform duration-200 group-hover:scale-110"
          aria-hidden="true"
        />
        {!collapsed && <span className="truncate">{label}</span>}
        {collapsed && (
          <span
            className="absolute left-full ml-2 whitespace-nowrap rounded-lg bg-secondary-900 dark:bg-dark-700 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 pointer-events-none z-50"
            role="tooltip"
          >
            {label}
          </span>
        )}
      </NavLink>
    </li>
  );
}

