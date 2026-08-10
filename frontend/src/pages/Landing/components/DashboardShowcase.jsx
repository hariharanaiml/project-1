import { motion } from 'framer-motion';
import {
  MapPin,
  AlertTriangle,
  Bell,
  Brain,
  Map,
  FileText,
  Wrench,
  Gauge,
} from 'lucide-react';
import Container from '../../../components/common/Container';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';

/* ── Mock Data ── */

const recentReports = [
  { id: '#RD-2024-0421', location: 'MG Road, Bangalore', severity: 'High', status: 'Pending', time: '2 min ago' },
  { id: '#RD-2024-0420', location: 'NH-48, Pune', severity: 'Critical', status: 'In Progress', time: '15 min ago' },
  { id: '#RD-2024-0419', location: 'Sector 18, Noida', severity: 'Medium', status: 'Resolved', time: '1 hr ago' },
  { id: '#RD-2024-0418', location: 'Marine Drive, Mumbai', severity: 'Low', status: 'Resolved', time: '3 hr ago' },
];

const aiDetections = [
  { label: 'Pothole', confidence: 97, color: 'danger' },
  { label: 'Crack', confidence: 92, color: 'warning' },
  { label: 'Edge Failure', confidence: 88, color: 'info' },
  { label: 'Surface Defect', confidence: 85, color: 'primary' },
];

const notifications = [
  { text: 'Critical damage detected on NH-48', time: '2 min ago', variant: 'danger' },
  { text: 'New report from Sector 18, Noida', time: '1 hr ago', variant: 'info' },
  { text: 'Repair completed on MG Road', time: '3 hr ago', variant: 'success' },
];

const severityData = [
  { label: 'Critical', value: 12, color: 'bg-danger-500' },
  { label: 'High', value: 28, color: 'bg-warning-500' },
  { label: 'Medium', value: 45, color: 'bg-primary-500' },
  { label: 'Low', value: 62, color: 'bg-success-500' },
];

const total = severityData.reduce((sum, d) => sum + d.value, 0);

/* ── Sub-components ── */

function MiniMapPlaceholder() {
  return (
    <div className="relative h-40 sm:h-48 rounded-lg bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-dark-800 dark:to-dark-700 overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="grid grid-cols-6 h-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-r border-secondary-300 dark:border-dark-600" />
          ))}
        </div>
        <div className="grid grid-rows-4 absolute inset-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-b border-secondary-300 dark:border-dark-600" />
          ))}
        </div>
      </div>
      {/* Map pins */}
      <div className="absolute top-1/4 left-1/4" aria-label="Damage location pin">
        <div className="w-3 h-3 rounded-full bg-danger-500 animate-pulse-soft shadow-lg shadow-danger-500/50" />
      </div>
      <div className="absolute top-1/2 left-1/2" aria-label="Damage location pin">
        <div className="w-3 h-3 rounded-full bg-warning-500 animate-pulse-soft shadow-lg shadow-warning-500/50" />
      </div>
      <div className="absolute bottom-1/3 right-1/4" aria-label="Damage location pin">
        <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse-soft shadow-lg shadow-primary-500/50" />
      </div>
      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-900/10 dark:bg-white/10 backdrop-blur-sm">
          <Map size={16} className="text-secondary-500 dark:text-dark-400" />
        </div>
      </div>
      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/40 to-transparent">
        <p className="text-xs font-medium text-white/90">Live Map — 147 Active Reports</p>
      </div>
    </div>
  );
}

function SeverityChart() {
  return (
    <div className="space-y-2.5">
      {severityData.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs font-medium text-secondary-600 dark:text-dark-400 w-16 shrink-0">
            {item.label}
          </span>
          <div className="flex-1 h-2.5 rounded-full bg-secondary-100 dark:bg-dark-800 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${item.color}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.value / total) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-semibold text-secondary-700 dark:text-dark-300 w-8 text-right tabular-nums">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function RoadHealthScore() {
  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
        {/* Background ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
            className="text-secondary-100 dark:text-dark-800" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - 0.78) }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="text-success-500"
          />
        </svg>
        <span className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-dark-100">78</span>
      </div>
      <p className="mt-1 text-xs font-medium text-success-600 dark:text-success-400">Good Health</p>
    </div>
  );
}

function DetectionConfidenceCard({ label, confidence, color }) {
  const colorMap = {
    danger: 'bg-danger-500',
    warning: 'bg-warning-500',
    info: 'bg-info-500',
    primary: 'bg-primary-500',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 dark:bg-dark-800/50 border border-secondary-100 dark:border-dark-700">
      <span className="text-sm font-medium text-secondary-700 dark:text-dark-200">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-secondary-200 dark:bg-dark-700 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${colorMap[color]}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${confidence}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs font-semibold text-secondary-600 dark:text-dark-400 tabular-nums w-8 text-right">
          {confidence}%
        </span>
      </div>
    </div>
  );
}

/* ── Main Component ── */

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function DashboardShowcase() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-secondary-50 dark:bg-dark-900">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-500 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-success-500 blur-3xl" />
      </div>

      <Container>
        {/* Section header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-dark-100">
            AI Dashboard Showcase
          </h2>
          <p className="mt-3 text-secondary-600 dark:text-dark-400 leading-relaxed">
            A real-time operational dashboard for monitoring road infrastructure health
            and managing damage reports.
          </p>
        </motion.div>

        {/* Dashboard grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mini Map + Road Health Score row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card elevation="sm" padding="md" bordered className="sm:col-span-2 bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 flex items-center gap-2">
                    <MapPin size={14} className="text-primary-500" aria-hidden="true" />
                    Live Map Overview
                  </h3>
                  <Badge variant="primary" size="sm">Live</Badge>
                </div>
                <MiniMapPlaceholder />
              </Card>

              <Card elevation="sm" padding="md" bordered className="bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 flex items-center gap-2">
                    <Gauge size={14} className="text-success-500" aria-hidden="true" />
                    Road Health
                  </h3>
                </div>
                <RoadHealthScore />
              </Card>
            </motion.div>

            {/* Recent Reports Table */}
            <motion.div variants={itemVariants}>
              <Card elevation="sm" padding="md" bordered className="bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 flex items-center gap-2">
                    <FileText size={14} className="text-primary-500" aria-hidden="true" />
                    Recent Reports
                  </h3>
                  <Badge variant="primary" size="sm">{recentReports.length} Total</Badge>
                </div>
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm" role="table" aria-label="Recent damage reports">
                    <thead>
                      <tr className="text-left text-xs font-medium text-secondary-500 dark:text-dark-400 uppercase tracking-wider">
                        <th className="pb-2 px-2">ID</th>
                        <th className="pb-2 px-2">Location</th>
                        <th className="pb-2 px-2">Severity</th>
                        <th className="pb-2 px-2">Status</th>
                        <th className="pb-2 px-2 hidden sm:table-cell">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100 dark:divide-dark-800">
                      {recentReports.map((report) => {
                        const severityColor =
                          report.severity === 'Critical' ? 'danger' :
                          report.severity === 'High' ? 'warning' :
                          report.severity === 'Medium' ? 'primary' : 'success';
                        const statusColor =
                          report.status === 'Resolved' ? 'success' :
                          report.status === 'In Progress' ? 'warning' : 'danger';
                        return (
                          <tr key={report.id} className="hover:bg-secondary-50 dark:hover:bg-dark-800/50 transition-colors">
                            <td className="py-2.5 px-2 font-medium text-secondary-900 dark:text-dark-100 text-xs">{report.id}</td>
                            <td className="py-2.5 px-2 text-secondary-600 dark:text-dark-400 text-xs">{report.location}</td>
                            <td className="py-2.5 px-2">
                              <Badge variant={severityColor} size="xs">{report.severity}</Badge>
                            </td>
                            <td className="py-2.5 px-2">
                              <Badge variant={statusColor} size="xs">{report.status}</Badge>
                            </td>
                            <td className="py-2.5 px-2 text-secondary-500 dark:text-dark-500 text-xs hidden sm:table-cell">{report.time}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-6">
            {/* AI Detection Cards */}
            <motion.div variants={itemVariants}>
              <Card elevation="sm" padding="md" bordered className="bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 flex items-center gap-2">
                    <Brain size={14} className="text-purple-500" aria-hidden="true" />
                    AI Detection Confidence
                  </h3>
                  <Badge variant="primary" size="xs">YOLOv8</Badge>
                </div>
                <div className="space-y-2">
                  {aiDetections.map((item) => (
                    <DetectionConfidenceCard key={item.label} {...item} />
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Severity Distribution */}
            <motion.div variants={itemVariants}>
              <Card elevation="sm" padding="md" bordered className="bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-warning-500" aria-hidden="true" />
                    Severity Distribution
                  </h3>
                </div>
                <SeverityChart />
              </Card>
            </motion.div>

            {/* Repair Priority */}
            <motion.div variants={itemVariants}>
              <Card elevation="sm" padding="md" bordered className="bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 flex items-center gap-2">
                    <Wrench size={14} className="text-amber-500" aria-hidden="true" />
                    Repair Priority
                  </h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'NH-48, Pune — Critical', priority: 'Critical', color: 'danger' },
                    { label: 'MG Road, Bangalore — High', priority: 'High', color: 'warning' },
                    { label: 'Sector 18, Noida — Medium', priority: 'Medium', color: 'primary' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary-50 dark:bg-dark-800/50 border border-secondary-100 dark:border-dark-700">
                      <span className="text-xs font-medium text-secondary-700 dark:text-dark-200 truncate mr-2">
                        {item.label}
                      </span>
                      <Badge variant={item.color} size="xs">{item.priority}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Notifications */}
            <motion.div variants={itemVariants}>
              <Card elevation="sm" padding="md" bordered className="bg-white dark:bg-dark-900 border-secondary-200 dark:border-dark-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100 flex items-center gap-2">
                    <Bell size={14} className="text-primary-500" aria-hidden="true" />
                    Notifications
                  </h3>
                  <Badge variant="danger" size="xs">3 New</Badge>
                </div>
                <div className="space-y-2">
                  {notifications.map((notif) => {
                    const dotColor =
                      notif.variant === 'danger' ? 'bg-danger-500' :
                      notif.variant === 'info' ? 'bg-info-500' : 'bg-success-500';
                    return (
                      <div key={notif.text} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary-50 dark:bg-dark-800/50 border border-secondary-100 dark:border-dark-700">
                        <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${dotColor}`} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-xs text-secondary-700 dark:text-dark-200">{notif.text}</p>
                          <p className="text-2xs text-secondary-400 dark:text-dark-500 mt-0.5">{notif.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

