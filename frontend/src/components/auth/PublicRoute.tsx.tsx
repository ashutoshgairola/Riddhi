// src/components/auth/PublicRoute.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const [authChecking, setAuthChecking] = useState(true);
  const location = useLocation();

  // Double check auth status on public routes to prevent redirect loops
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setAuthChecking(false);
    };

    verifyAuth();
  }, [checkAuth]);

  // Show loading spinner while checking authentication
  if (loading || authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to the dashboard or the page they were trying to access
  if (isAuthenticated) {
    // Check if there's a 'from' location in the state (where they were trying to go)
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Render children if not authenticated
  return <>{children}</>;
};

export default PublicRoute;
