// File: frontend/src/App.js

// [KHẮC PHỤC] Đảm bảo chỉ có MỘT dòng import từ 'react-router-dom'
import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import React, { useEffect } from 'react';

// Import pages
import HomePage from './pages/HomePage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import ItemsPage from './pages/ItemsPage.js';
import ItemDetailPage from './pages/ItemDetailPage.js';
import MyOrdersPage from './pages/MyOrdersPage.js';
import MyOrderDetailPage from './pages/MyOrderDetailPage.js';
import CartPage from './pages/CartPage.js';
import CheckoutPage from './pages/CheckoutPage.js'; 
// --- THÊM MỚI ---
import UserProfilePage from './pages/UserProfilePage.js'; // Trang hồ sơ
import SupportPage from './pages/SupportPage.js'; // Trang hỗ trợ
// --- KẾT THÚC THÊM MỚI ---

// Import components
import WarningModal from './components/WarningModal.js';
import Header from './components/layout/Header.js';
import Footer from './components/layout/Footer.js';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute.js';
import UserProtectedRoute from './components/auth/UserProtectedRoute.js';
import { useAuthStore } from './store/authStore.js';

// Import các component Admin
import AdminLayout from './pages/admin/AdminLayout.js';
import AdminDashboard from './pages/admin/AdminDashboard.js';
// Các trang quản lý trong Admin
import AdminManageOrders from './pages/admin/manager/AdminManageOrders.js';
import AdminManageItems from './pages/admin/manager/AdminManageItems.js';
import AdminManageCategories from './pages/admin/manager/AdminManageCategories.js';
import AdminManageInventory from './pages/admin/manager/AdminManageInventory.js';
import AdminManageUsers from './pages/admin/manager/AdminManageUsers.js';
import AdminOrderDetailPage from './pages/admin/manager/AdminOrderDetailPage.js';
import AdminManageTimeSlots from './pages/admin/manager/AdminManageTimeSlots.js'; 
import AdminManageVipLevels from './pages/admin/manager/AdminManageVipLevels.js';
import AdminManageRates from './pages/admin/manager/AdminManageRates.js';
import { useCurrencyStore } from './store/currencyStore.js';

function App() {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const fetchRate = useCurrencyStore((state) => state.fetchRate);

  useEffect(() => {
    checkAuthStatus();
    fetchRate();
  }, [checkAuthStatus, fetchRate]);

  if (isAuthLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex justify-center items-center text-white text-xl">
        Đang tải Tài Lộc Shop...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" />
      <WarningModal />

      <Routes>
        {/* === Public Routes (Layout chung) === */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="items" element={<ItemsPage />} />
          <Route path="item/:slug/:unit" element={<ItemDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="cart" element={<CartPage />} />
          
          {/* --- THÊM MỚI --- */}
          <Route path="support" element={<SupportPage />} />
          {/* --- KẾT THÚC THÊM MỚI --- */}

        </Route>

        {/* === User Protected Routes (Cần đăng nhập) === */}
        <Route element={<UserProtectedRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/my-orders/:id" element={<MyOrderDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            
            {/* --- THÊM MỚI --- */}
            <Route path="/profile" element={<UserProfilePage />} />
            {/* --- KẾT THÚC THÊM MỚI --- */}

          </Route>
        </Route>

        {/* === Admin Protected Routes (Layout riêng) === */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminManageOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="items" element={<AdminManageItems />} />
            <Route path="categories" element={<AdminManageCategories />} />
            <Route path="timeslots" element={<AdminManageTimeSlots />} />
            <Route path="vip-levels" element={<AdminManageVipLevels />} />
            <Route path="inventory" element={<AdminManageInventory />} />
            <Route path="rates" element={<AdminManageRates />} />
            <Route path="users" element={<AdminManageUsers />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* === Not Found Route === */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

// (Các component PublicLayout và NotFoundPage giữ nguyên như cũ)
const PublicLayout = () => (
  <>
    <Header />
    <main className="flex-grow container mx-auto px-4 py-8">
      <Outlet />
    </main>
    <Footer />
  </>
);

const NotFoundPage = () => (
  <div className="text-center py-40">
    <h1 className="text-5xl font-bold text-red-500">404</h1>
    <p className="text-2xl mt-4">Không tìm thấy trang</p>
    <Link
      to="/"
      className="mt-8 inline-block text-pink-400 hover:text-pink-300 text-lg"
    >
      &larr; Quay về Trang chủ
    </Link>
  </div>
);

export default App;