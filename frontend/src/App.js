// src/App.js
import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import AdminDashboard from './pages/AdminDashboard.js';

// [KHÔI PHỤC] Import useAuthStore
import Header from './components/layout/Header.js';
import Footer from './components/layout/Footer.js';
import { useAuthStore } from './store/authStore.js';
import ItemsPage from './pages/ItemsPage.js';
// [XÓA] Xóa 'shallow' vì chúng ta không dùng nữa
// import { shallow } from 'zustand/shallow';
import WarningModal from './components/WarningModal.js';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">

      <Toaster 
        position="top-right"
        toastOptions={{
          // Định nghĩa style chung
          className: '',
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          // Style cho thông báo thành công
          success: {
            duration: 2000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
      
      {/* Modal cảnh báo (sẽ tự động quản lý trạng thái) */}
      <WarningModal />

      {/* --- HEADER MỚI --- */}
      <Header />

      {/* main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/items" element={<ItemsPage />} /> {/* Route cho trang sản phẩm */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Bạn có thể thêm các route cho /contact, /about, /privacy nếu đã tạo */}
          <Route path="/contact" element={<div>Trang Liên Hệ</div>} />
          <Route path="/privacy" element={<div>Chính Sách Bảo Mật</div>} />
          <Route path="/about" element={<div>Về Chúng Tôi</div>} />
        </Routes>
      </main>

      {/* --- FOOTER MỚI --- */}
      <Footer />
    </div>
  );
}

export default App;