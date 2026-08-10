import { NavLink } from 'react-router-dom';

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/report', label: 'Report Damage', icon: '📝' },
  { to: '/interactive-map', label: 'Map View', icon: '🗺️' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/ai-analysis', label: 'AI Analysis', icon: '🤖' },
  { to: '/admin', label: 'Admin', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col gap-y-5 border-r border-secondary-200 bg-white px-6 pt-20 pb-4 h-full">
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                    }`
                  }
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

