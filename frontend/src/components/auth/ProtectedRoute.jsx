import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '../common/Spinner';
import { useAuth } from '../../context/AuthContext';

/**
 * Gate for authenticated areas of the app.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected page/element
 * @param {boolean} [props.adminOnly=false] - Require the admin role as well
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" label="Checking session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
