// File: frontend/src/components/auth/AdminProtectedRoute.js
import React from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function AdminProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  // [XÓA] isAuthLoading đã được xử lý ở App.js, không cần ở đây nữa
  // const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const location = useLocation(); 

  // [XÓA] Xóa phần kiểm tra isAuthLoading

  // 1. Không có user (chưa đăng nhập)?
  // -> Chuyển về trang login.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Có user, nhưng KHÔNG phải ADMIN?
  // -> Đá về trang chủ
  if (user.role !== 'ADMIN') {
    // (Có thể thêm một trang "Không có quyền truy cập" ở đây)
    return <Navigate to="/" replace />;
  }

  // 3. Vượt qua tất cả: Đã đăng nhập VÀ là ADMIN
  // -> Render <Outlet /> (Outlet này sẽ là <AdminLayout /> như định nghĩa trong App.js)
  return <Outlet />;
}