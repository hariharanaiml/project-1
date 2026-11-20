import { Link } from 'react-router-dom';
import Container from '../common/Container';

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/report', label: 'Report Damage' },
      { to: '/interactive-map', label: 'Map View' },
      { to: '/analytics', label: 'Analytics' },
    ],
  },
  {
    title: 'AI',
    links: [
      { to: '/ai-analysis', label: 'AI Analysis' },
      { to: '/admin', label: 'Admin Panel' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/login', label: 'Log in' },
      { to: '/register', label: 'Sign up' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 text-gray-100">
      <Container>
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
            <div className="col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-2 font-semibold text-gray-100">
                <span className="text-xl">🚗</span>
                <span>RoadSense AI</span>
              </Link>
              <p className="mt-3 text-sm text-gray-400">
                Enterprise‑grade AI‑powered infrastructure intelligence platform.
              </p>
            </div>
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-gray-100">{group.title}</h3>
                <ul role="list" className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-sm text-gray-400 hover:text-gray-200 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-center text-xs text-gray-600">
              © {new Date().getFullYear()} RoadSense AI. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
