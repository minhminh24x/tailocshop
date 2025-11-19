import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
// [SỬA LỖI] Không cần import fetchCart vì store tự động load
import { useCartStore } from './store/cartStore'; 
import { useCurrencyStore } from './store/currencyStore';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ItemsPage from './pages/ItemsPage';
import ItemDetailPage from './pages/ItemDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import UserProfilePage from './pages/UserProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import MyOrderDetailPage from './pages/MyOrderDetailPage';
import SupportPage from './pages/SupportPage';

// Auth Guards
import UserProtectedRoute from './components/auth/UserProtectedRoute';
import StaffProtectedRoute from './components/auth/StaffProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import SupplierProtectedRoute from './components/auth/SupplierProtectedRoute';

// Admin & Staff Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManageUsers from './pages/admin/manager/AdminManageUsers';
import AdminManageCategories from './pages/admin/manager/AdminManageCategories';
import AdminManageItems from './pages/admin/manager/AdminManageItems';
import AdminManageOrders from './pages/admin/manager/AdminManageOrders';
import AdminOrderDetailPage from './pages/admin/manager/AdminOrderDetailPage';
import AdminCustomerDetailPage from './pages/admin/manager/AdminCustomerDetailPage';
import AdminManageInventory from './pages/admin/manager/AdminManageInventory';
import AdminManageTimeSlots from './pages/admin/manager/AdminManageTimeSlots';
import AdminManageRates from './pages/admin/manager/AdminManageRates';
import AdminManageVipLevels from './pages/admin/manager/AdminManageVipLevels';
import AdminManageSubmissions from './pages/admin/manager/AdminManageSubmissions';
import AdminSubmissionDetailPage from './pages/admin/manager/AdminSubmissionDetailPage';

import StaffLayout from './pages/staff/StaffLayout';
import SupplierLayout from './pages/supplier/SupplierLayout';

function App() {
  const { checkAuthStatus } = useAuthStore();
  // [SỬA LỖI] Xóa bỏ dòng lấy fetchCart
  // const { fetchCart } = useCartStore(); 
  
  const { fetchRate } = useCurrencyStore();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
    // [SỬA LỖI] Xóa bỏ dòng gọi fetchCart()
    fetchRate();
  }, [checkAuthStatus, fetchRate]);

  // Kiểm tra xem có phải trang Admin/Staff/Supplier không để ẩn Header/Footer mặc định
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStaffRoute = location.pathname.startsWith('/staff');
  const isSupplierRoute = location.pathname.startsWith('/supplier');
  const isDashboard = isAdminRoute || isStaffRoute || isSupplierRoute;

  return (
    <div className="App min-h-screen text-gray-100 flex flex-col relative z-0">
      {/* Chỉ hiện Header khách hàng nếu KHÔNG phải trang dashboard */}
      {!isDashboard && <Header />}

      {/* pt-24 để đẩy nội dung xuống dưới Header */}
      <main className={`flex-grow ${!isDashboard ? 'pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto w-full' : ''}`}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/support" element={<SupportPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- CUSTOMER PROTECTED ROUTES --- */}
          <Route path="/cart" element={<UserProtectedRoute><CartPage /></UserProtectedRoute>} />
          <Route path="/checkout" element={<UserProtectedRoute><CheckoutPage /></UserProtectedRoute>} />
          <Route path="/profile" element={<UserProtectedRoute><UserProfilePage /></UserProtectedRoute>} />
          <Route path="/my-orders" element={<UserProtectedRoute><MyOrdersPage /></UserProtectedRoute>} />
          <Route path="/my-orders/:id" element={<UserProtectedRoute><MyOrderDetailPage /></UserProtectedRoute>} />

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminManageUsers />} />
            <Route path="users/:userId" element={<AdminCustomerDetailPage />} />
            <Route path="categories" element={<AdminManageCategories />} />
            <Route path="items" element={<AdminManageItems />} />
            <Route path="orders" element={<AdminManageOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
            <Route path="inventory" element={<AdminManageInventory />} />
            <Route path="time-slots" element={<AdminManageTimeSlots />} />
            <Route path="rates" element={<AdminManageRates />} />
            <Route path="vip-levels" element={<AdminManageVipLevels />} />
            <Route path="submissions" element={<AdminManageSubmissions />} />
            <Route path="submissions/:id" element={<AdminSubmissionDetailPage />} />
          </Route>

          {/* --- STAFF ROUTES --- */}
          <Route path="/staff" element={<StaffProtectedRoute><StaffLayout /></StaffProtectedRoute>}>
            <Route index element={<div className="p-6"><h1>Staff Dashboard</h1></div>} />
          </Route>

          {/* --- SUPPLIER ROUTES --- */}
          <Route path="/supplier" element={<SupplierProtectedRoute><SupplierLayout /></SupplierProtectedRoute>}>
             <Route index element={<div className="p-6"><h1>Supplier Dashboard</h1></div>} />
          </Route>

        </Routes>
      </main>

      {!isDashboard && <Footer />}
    </div>
  );
}

export default App;