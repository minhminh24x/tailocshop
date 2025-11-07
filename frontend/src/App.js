// src/App.js
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import React, { useEffect } from 'react'; // <-- THÊM useEffect

// Import pages
import HomePage from './pages/HomePage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import AdminDashboard from './pages/admin/AdminDashboard.js';
// Giả sử bạn đã có các trang này từ bước trước
import ItemsPage from './pages/ItemsPage.js'; 

// Import components
import WarningModal from './components/WarningModal.js';
import Header from './components/layout/Header.js';
import Footer from './components/layout/Footer.js';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute.js'; // <-- IMPORT ROUTE BẢO VỆ
import { useAuthStore } from './store/authStore.js'; // <-- IMPORT STORE

function App() {
  // --- THÊM PHẦN NÀY ---
  // Lấy hàm checkAuthStatus từ store
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    // Gọi hàm checkAuthStatus() 1 lần duy nhất khi App mount
    // để kiểm tra xem user đã đăng nhập từ phiên trước chưa
    checkAuthStatus();
  }, [checkAuthStatus]); // Dependency array
  // --- KẾT THÚC PHẦN THÊM ---

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" /* ... */ />
      <WarningModal />
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* --- SỬA LẠI CẤU TRÚC ROUTES --- */}
        <Routes>
          {/* === Public Routes (Ai cũng xem được) === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* (Các route public khác...) */}

          {/* === Admin Protected Routes (Chỉ Admin xem được) === */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Nếu sau này bạn có nhiều trang Admin, cứ đặt hết vào đây */}
            {/* <Route path="/admin/manage-items" element={<ManageItemsPage />} /> */}
            {/* <Route path="/admin/manage-users" element={<ManageUsersPage />} /> */}
          </Route>
          
          {/* === Not Found Route (Nếu gõ sai URL) === */}
          <Route path="*" element={
            <div className='text-center py-20'>
              <h1 className='text-5xl font-bold text-red-500'>404</h1>
              <p className='text-2xl mt-4'>Không tìm thấy trang</p>
            </div>
          } />
        </Routes>
        
      </main>

      <Footer />
    </div>
  );
}

export default App;