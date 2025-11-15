// File: frontend/src/components/auth/SupplierProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const SupplierProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  const isSupplier = user?.role === 'SUPPLIER';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSupplier) {
    return <Navigate to="/" replace />;
  }
  
  // TODO: Thêm logic kiểm tra mustChangePassword ở đây
  
  return <Outlet />;
};

export default SupplierProtectedRoute;