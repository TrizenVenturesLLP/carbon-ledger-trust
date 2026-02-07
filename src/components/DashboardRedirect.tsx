import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Redirects /dashboard to the correct dashboard based on user role.
 * Use when the user visits /dashboard without a role-specific path.
 */
export function DashboardRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'company') {
    return <Navigate to="/dashboard/company/reports" replace />;
  }
  if (user?.role === 'regulator') {
    return <Navigate to="/dashboard/regulator/reviews" replace />;
  }

  return <Navigate to="/login" replace />;
}
