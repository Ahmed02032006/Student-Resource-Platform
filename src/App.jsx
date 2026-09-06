import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuthThunk } from './store/authSlice';
import { Toaster } from 'react-hot-toast';

import MainLayout from './layout/MainLayout';
import AdminDashboardLayout from './layout/AdminDashboardLayout';
import AuthLayout from './layout/AuthLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import LoginPage from '../src/pages/LoginPage';
import RegisterPage from '../src/pages/RegisterPage';

import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import CourseDetail from './pages/CourseDetail';
import YourGPTPage from './pages/YourGPTPage';
import GpaCalculatorPage from './pages/GpaCalculatorPage';

import AdminDashboard from './pages/admin/AdminDashboardPage';
import AdminApprovalsPage from './pages/admin/AdminApprovalsPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminActivityPage from './pages/admin/AdminActivityPage';

import CRRoute from './routes/CRRoute';
import CRDashboard from './pages/cr/CRDashboard';
import CrLayout from './layout/CrLayout';
import AdminRoute from './routes/AdminRoute';
import StudentRoute from './routes/StudentRoute';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600'
          }
        }}
      />
      <Routes>
        {/* Public Auth Routes - Wrapped in AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<StudentRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/your-gpt" element={<YourGPTPage />} />
              <Route path="/gpa-calculator" element={<GpaCalculatorPage />} />
            </Route>
          </Route>

          <Route element={<AdminRoute />}>
            <Route element={<AdminDashboardLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/approvals" element={<AdminApprovalsPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/activity" element={<AdminActivityPage />} />
            </Route>
          </Route>
        </Route>

        <Route element={<CrLayout />}>
          <Route element={<CRRoute />}>
            <Route path="/cr-dashboard" element={<CRDashboard />} />
          </Route>
        </Route>

        {/* Default Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}