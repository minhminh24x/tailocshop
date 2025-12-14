import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthLoading } = useAuthStore();
  const location = useLocation();

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  if (!user) {
    // [SỬA] Redirect về /admin/login thay vì /login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // [QUAN TRỌNG]: Phải trả về children để AdminLayout được hiển thị
  return children;
};

export default AdminProtectedRoute;