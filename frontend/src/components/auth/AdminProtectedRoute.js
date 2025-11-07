// src/components/auth/AdminProtectedRoute.js
import React from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function AdminProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const location = useLocation(); // Lưu lại vị trí đang cố vào

  // 1. Đang kiểm tra phiên đăng nhập (khi F5)? -> Hiển thị loading
  // (Tránh việc bị đá về /login ngay lập tức khi F5)
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  // 2. Kiểm tra xong, không có user (chưa đăng nhập)?
  // -> Chuyển về trang login.
  // state={{ from: location }} để sau khi đăng nhập, ta có thể quay lại trang admin
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Có user, nhưng KHÔNG phải ADMIN?
  // -> Đá về trang chủ
  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // 4. Vượt qua tất cả: Đã đăng nhập VÀ là ADMIN
  // -> Hiển thị nội dung được bảo vệ (chính là <AdminDashboard />)
  return <Outlet />;
}