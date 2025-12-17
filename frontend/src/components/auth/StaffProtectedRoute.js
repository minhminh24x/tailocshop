// File: frontend/src/components/auth/StaffProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

// [FIX] Nhận children prop để render StaffLayout đúng cách
const StaffProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  if (!user) {
    return <Navigate to="/staff/login" replace />;
  }

  if (!isStaffOrAdmin) {
    // Nếu đã login nhưng không phải Staff, đá về trang chủ
    return <Navigate to="/" replace />;
  }

  // [MỚI] Nếu cần đổi mật khẩu và chưa ở trang change-password
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // [FIX] Render children (StaffLayout) thay vì Outlet
  return children;
};

export default StaffProtectedRoute;