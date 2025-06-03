// src/components/auth/ProtectedRoute.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const [authChecking, setAuthChecking] = useState(true);
  const location = useLocation();

  // Double check auth status on protected routes to prevent redirect loops
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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
