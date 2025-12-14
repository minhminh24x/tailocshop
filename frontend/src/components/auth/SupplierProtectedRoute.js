// File: frontend/src/components/auth/SupplierProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const SupplierProtectedRoute = () => {
  const { user } = useAuthStore();
  const isSupplier = user?.role === 'SUPPLIER';

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isSupplier) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SupplierProtectedRoute;