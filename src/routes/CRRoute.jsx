import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import PageLoading from '../components/PageLoading';

export default function CRRoute() {
  const { isAuthenticated, user, isInitializing } = useSelector((state) => state.auth);

  if (isInitializing) return <PageLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'cr' && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}