import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component for route protection and role-based redirects.
 * - requireAuth: defaults to true. If true and not logged in, redirects to /login.
 * - requireAdmin: requires isLoggedIn && isAdmin, redirects to "/" if not admin.
 * - disallowAdmin: if user is admin, redirects to "/admin".
 */
const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  disallowAdmin = false,
}) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (disallowAdmin && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
