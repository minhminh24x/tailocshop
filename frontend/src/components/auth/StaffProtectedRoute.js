// File: frontend/src/components/auth/StaffProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const StaffProtectedRoute = () => {
  const { user } = useAuthStore();
  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isStaffOrAdmin) {
    // Nếu đã login nhưng không phải Staff, đá về trang chủ
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default StaffProtectedRoute;