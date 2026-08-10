import { Link } from 'react-router-dom';
import { Shield, Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';
import Container from '../../../components/common/Container';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/report', label: 'Report Damage' },
  { to: '/interactive-map', label: 'Map View' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/ai-analysis', label: 'AI Analysis' },
];

const techStack = [
  { label: 'React + Vite', href: '#' },
  { label: 'FastAPI (Python)', href: '#' },
  { label: 'YOLOv8 (AI Model)', href: '#' },
  { label: 'OpenCV', href: '#' },
  { label: 'PostgreSQL + PostGIS', href: '#' },
  { label: 'Tailwind CSS', href: '#' },
];

const resources = [
  { label: 'Documentation', href: '#', icon: ExternalLink },
  { label: 'GitHub Repository', href: '#', icon: Github },
  { label: 'API Reference', href: '#', icon: ExternalLink },
  { label: 'Contact Support', href: '#', icon: Mail },
];

const socialLinks = [
  { label: 'GitHub', icon: Github, href: '#' },
  { label: 'Twitter', icon: Twitter, href: '#' },
  { label: 'LinkedIn', icon: Linkedin, href: '#' },
];

export default function LandingFooter() {
  return (
    <footer className="relative bg-secondary-950 dark:bg-dark-950 border-t border-secondary-800/50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/[0.02] to-transparent pointer-events-none" aria-hidden="true" />

      <Container>
        <div className="relative py-16 lg:py-20">
          {/* Top grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors duration-200">
                  <Shield size={20} className="text-primary-400" aria-hidden="true" />
                </div>
                <span className="text-lg font-bold text-white">RoadSense AI</span>
              </Link>
              <p className="mt-4 text-sm text-secondary-400 leading-relaxed max-w-sm">
                AI-powered smart infrastructure monitoring platform for detecting,
                analyzing, and managing road damage using computer vision and
                predictive analytics.
              </p>

              {/* Social icons */}
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map((social) => {
                  const SocialIcon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary-800 hover:bg-secondary-700 text-secondary-400 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      <SocialIcon size={16} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
              <ul role="list" className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-secondary-400 hover:text-primary-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technology Stack */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Technology Stack</h3>
              <ul role="list" className="space-y-2.5">
                {techStack.map((tech) => (
                  <li key={tech.label}>
                    <a
                      href={tech.href}
                      className="text-sm text-secondary-400 hover:text-primary-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                    >
                      {tech.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
              <ul role="list" className="space-y-2.5">
                {resources.map((resource) => {
                  const ResourceIcon = resource.icon;
                  return (
                    <li key={resource.label}>
                      <a
                        href={resource.href}
                        className="inline-flex items-center gap-2 text-sm text-secondary-400 hover:text-primary-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                      >
                        <ResourceIcon size={14} aria-hidden="true" />
                        {resource.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-secondary-800/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-secondary-500">
                &copy; {new Date().getFullYear()} RoadSense AI. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link
                  to="#"
                  className="text-xs text-secondary-500 hover:text-primary-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  Privacy Policy
                </Link>
                <span className="text-secondary-700 text-xs" aria-hidden="true">|</span>
                <Link
                  to="#"
                  className="text-xs text-secondary-500 hover:text-primary-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

