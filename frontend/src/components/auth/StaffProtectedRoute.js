// File: frontend/src/components/auth/StaffProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const StaffProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaffOrAdmin) {
    // Nếu đã login nhưng không phải Staff, đá về trang chủ
    return <Navigate to="/" replace />;
  }
  
  // TODO: Thêm logic kiểm tra mustChangePassword ở đây
  
  return <Outlet />;
};

export default StaffProtectedRoute;