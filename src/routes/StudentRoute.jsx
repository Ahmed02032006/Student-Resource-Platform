import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function StudentRoute() {
    const { user } = useSelector((state) => state.auth);

    if (user?.role === 'cr') return <Navigate to="/cr-dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

    return <Outlet />;
}