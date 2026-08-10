import { memo } from 'react';
import { Eye, Pencil, FileText } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';

/** Map report status to badge variant. */
const statusVariant = (status = '') => {
  const s = String(status).toLowerCase();
  if (s === 'resolved') return 'success';
  if (s === 'rejected') return 'danger';
  if (s === 'in review') return 'info';
  if (s === 'verified') return 'primary';
  return 'warning'; // pending
};

/** Map report severity to badge variant. */
const severityVariant = (severity = '') => {
  const s = String(severity).toLowerCase();
  if (s === 'critical') return 'danger';
  if (s === 'high') return 'warning';
  if (s === 'medium') return 'info';
  return 'default'; // low
};

const tableHeadClass =
  'px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-dark-400 whitespace-nowrap';
const tableCellClass =
  'px-4 py-3 text-sm text-secondary-700 dark:text-dark-200 whitespace-nowrap';

/**
 * RecentReportsTable - Responsive table of the latest damage reports.
 *
 * @param {Object} props
 * @param {Array<{reportId: string, roadName: string, damageType: string, severity: string, status: string, submittedDate: string}>} props.reports - Report rows
 */
function RecentReportsTable({ reports = [] }) {
  return (
    <Card
      bordered
      padding="none"
      className="h-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl"
      aria-label="Recent reports table"
    >
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
            Recent Reports
          </h3>
        </div>
        <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
          Latest damage report submissions
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-y border-secondary-100 dark:border-dark-800 bg-secondary-50 dark:bg-dark-800/50">
              <th scope="col" className={tableHeadClass}>
                Report ID
              </th>
              <th scope="col" className={tableHeadClass}>
                Road Name
              </th>
              <th scope="col" className={tableHeadClass}>
                Damage Type
              </th>
              <th scope="col" className={tableHeadClass}>
                Severity
              </th>
              <th scope="col" className={tableHeadClass}>
                Status
              </th>
              <th scope="col" className={tableHeadClass}>
                Submitted Date
              </th>
              <th scope="col" className={`${tableHeadClass} text-right`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.reportId}
                className="border-b border-secondary-100 dark:border-dark-800 last:border-b-0 hover:bg-secondary-50 dark:hover:bg-dark-800/50 transition-colors duration-150"
              >
                <td className={`${tableCellClass} font-medium text-primary-600 dark:text-primary-400`}>
                  {report.reportId}
                </td>
                <td className={tableCellClass}>{report.roadName}</td>
                <td className={tableCellClass}>{report.damageType}</td>
                <td className={tableCellClass}>
                  <Badge variant={severityVariant(report.severity)} size="xs">
                    {report.severity}
                  </Badge>
                </td>
                <td className={tableCellClass}>
                  <Badge variant={statusVariant(report.status)} size="xs" dot>
                    {report.status}
                  </Badge>
                </td>
                <td className={`${tableCellClass} text-secondary-500 dark:text-dark-400`}>
                  {report.submittedDate}
                </td>
                <td className={`${tableCellClass} text-right`}>
                  <div className="inline-flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      leftIcon={Eye}
                      aria-label={`View report ${report.reportId}`}
                    >
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      leftIcon={Pencil}
                      aria-label={`Edit report ${report.reportId}`}
                    >
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default memo(RecentReportsTable);

