import { useMemo, memo } from 'react';
import { Camera, Map, Brain, ClipboardList } from 'lucide-react';
import ActionCard from './ActionCard';

const actions = [
  {
    to: '/report',
    title: 'Report Road Damage',
    description: 'Submit a new damage report with photos and location data for AI analysis.',
    icon: Camera,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
  },
  {
    to: '/interactive-map',
    title: 'Open Interactive Map',
    description: 'Explore real-time road conditions and reported damage locations near you.',
    icon: Map,
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    to: '/ai-analysis',
    title: 'View AI Analysis',
    description: 'Access AI-powered insights and predictive maintenance recommendations.',
    icon: Brain,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
  },
  {
    to: '/dashboard/reports',
    title: 'Track My Reports',
    description: 'Monitor the status and progress of all your submitted road damage reports.',
    icon: ClipboardList,
    gradient: 'from-sky-500 via-blue-500 to-indigo-500',
  },
];

/**
 * QuickActions component - Grid of premium action cards for common citizen tasks.
 */
function QuickActions() {
  const actionCards = useMemo(() => actions, []);

  return (
    <section aria-label="Quick actions">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {actionCards.map((action, index) => (
          <ActionCard
            key={action.to}
            to={action.to}
            title={action.title}
            description={action.description}
            icon={action.icon}
            gradient={action.gradient}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

export default memo(QuickActions);

