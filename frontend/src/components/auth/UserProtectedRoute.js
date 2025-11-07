// File: frontend/src/components/auth/UserProtectedRoute.js
import React from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function UserProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // 1. Nếu CHƯA đăng nhập, đá về trang /login
  if (!user) {
    // Gửi kèm vị trí hiện tại, để sau khi login có thể quay lại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Nếu đã đăng nhập, cho phép render các trang con
  return <Outlet />;
}