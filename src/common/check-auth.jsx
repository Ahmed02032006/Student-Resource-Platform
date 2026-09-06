import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  if (!isAuthenticated && !(location.pathname.includes('/login') || location.pathname.includes('/register'))) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && (location.pathname.includes('/login') || location.pathname.includes('/register'))) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'cr') {
      return <Navigate to="/cr-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}