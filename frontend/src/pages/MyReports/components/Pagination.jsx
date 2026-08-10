import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/common/Button';

/**
 * Pagination - Prev/next + page number controls for the reports table.
 *
 * @param {Object} props
 * @param {number} props.currentPage - Active page (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {(page: number) => void} props.onPageChange - Page change handler
 * @param {number} props.totalItems - Total filtered item count
 * @param {number} props.pageSize - Items per page
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pageNumbers.push(i);
  }

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4"
      aria-label="Pagination"
    >
      <p className="text-xs text-secondary-500 dark:text-dark-400">
        Showing{' '}
        <span className="font-medium text-secondary-700 dark:text-dark-200">{startItem}</span>
        {'\u2013'}
        <span className="font-medium text-secondary-700 dark:text-dark-200">{endItem}</span> of{' '}
        <span className="font-medium text-secondary-700 dark:text-dark-200">{totalItems}</span>{' '}
        reports
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={ChevronLeft}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          Previous
        </Button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Page ${page}`}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              page === currentPage
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-secondary-600 dark:text-dark-300 hover:bg-secondary-100 dark:hover:bg-dark-800'
            }`}
          >
            {page}
          </button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          rightIcon={ChevronRight}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}

