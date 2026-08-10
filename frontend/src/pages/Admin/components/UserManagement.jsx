import { memo, useState, useMemo, useCallback } from 'react';
import { Search, Users } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Avatar } from '../../../components/common/Avatar';
import { Input } from '../../../components/common/Input';

/** Map user role to badge variant. */
const roleVariant = (role = '') => {
  const r = String(role).toLowerCase();
  if (r === 'admin') return 'danger';
  if (r === 'moderator') return 'warning';
  if (r === 'analyst') return 'info';
  return 'default'; // user
};

/** Map user status to badge variant + label. */
const statusVariant = (status = '') => {
  const s = String(status).toLowerCase();
  return s === 'active' ? 'success' : 'default';
};

/**
 * UserManagement - Recent platform users with search (UI only) and role/status badges.
 *
 * @param {Object} props
 * @param {Array<{id: number, name: string, email: string, role: string, status: string, joined: string}>} props.users - Recent users
 */
function UserManagement({ users = [] }) {
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => {
      const haystack = `${user.name} ${user.email} ${user.role}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [users, query]);

  const handleSearchChange = useCallback((event) => {
    setQuery(event.target.value);
  }, []);

  return (
    <Card
      bordered
      padding="none"
      className="h-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl"
      aria-label="User management"
    >
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-dark-100">
            User Management
          </h3>
        </div>
        <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400">
          Recently registered users
        </p>

        <div className="mt-3">
          <Input
            type="search"
            placeholder="Search users..."
            value={query}
            onChange={handleSearchChange}
            leftIcon={Search}
            fullWidth
            aria-label="Search users"
          />
        </div>
      </div>

      <ul
        className="px-4 sm:px-5 pb-4 space-y-3 max-h-[360px] overflow-y-auto"
        role="list"
        aria-label="Recent users list"
      >
        {filteredUsers.length === 0 && (
          <li className="py-6 text-center">
            <p className="text-sm text-secondary-500 dark:text-dark-400">
              No users match "{query}"
            </p>
          </li>
        )}
        {filteredUsers.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 rounded-lg border border-secondary-100 dark:border-dark-800 p-2.5 bg-secondary-50/60 dark:bg-dark-800/40"
          >
            <Avatar name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-secondary-900 dark:text-dark-100 truncate">
                  {user.name}
                </p>
                <Badge variant={roleVariant(user.role)} size="xs">
                  {user.role}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-secondary-500 dark:text-dark-400 truncate">
                {user.email}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={statusVariant(user.status)} size="xs" dot>
                  {user.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-2xs text-secondary-400 dark:text-dark-500">
                  Joined {user.joined}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default memo(UserManagement);

